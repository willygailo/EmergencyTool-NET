import fs from 'fs/promises';
import type { Request, Response } from 'express';
import type { Server as SocketIOServer } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../config/database';
import { AGENCY_ROUTING, EMERGENCY_TYPES, getEmergencyTypeMeta } from './emergencyCatalog';
import { ensureBrowserCompatibleVideo } from './mediaTranscoder';

type UploadedFileMap = {
  [fieldname: string]: Express.Multer.File[];
};

type EmergencyRow = {
  id: string;
  incident_code: string;
  type: string;
  latitude: string | number | null;
  longitude: string | number | null;
  description: string | null;
  address: string | null;
  user_id: string | null;
  responder_id: string | null;
  photo_url: string | null;
  video_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  email?: string | null;
  barangay?: string | null;
  household_address?: string | null;
  members?: number | null;
  has_pwd?: boolean | null;
  has_senior?: boolean | null;
  has_pregnant?: boolean | null;
};

const EMERGENCY_REPORT_SELECT = `
  SELECT
    e.*,
    u.first_name,
    u.last_name,
    u.phone,
    u.email,
    u.barangay,
    h.address AS household_address,
    h.members,
    h.has_pwd,
    h.has_senior,
    h.has_pregnant
  FROM emergencies e
  LEFT JOIN users u ON e.user_id = u.id
  LEFT JOIN LATERAL (
    SELECT
      address,
      members,
      has_pwd,
      has_senior,
      has_pregnant
    FROM households
    WHERE user_id = e.user_id
    ORDER BY created_at DESC
    LIMIT 1
  ) h ON TRUE
`;

const toNumber = (value: string | number | null | undefined) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toPublicMediaUrl = (mediaPath?: string | null) => {
  if (!mediaPath) {
    return null;
  }

  if (/^https?:\/\//i.test(mediaPath)) {
    return mediaPath;
  }

  const normalizedPath = mediaPath.startsWith('/') ? mediaPath : `/${mediaPath}`;
  return normalizedPath;
};

const formatReporterName = (row: EmergencyRow) => {
  const fullName = [row.first_name, row.last_name].filter(Boolean).join(' ').trim();
  return fullName || row.email || 'Unknown Sender';
};

const formatAddress = (row: EmergencyRow) =>
  row.address || row.household_address || row.barangay || 'Location unavailable';

const normalizeEmergency = (row: EmergencyRow) => {
  const typeMeta = getEmergencyTypeMeta(row.type);
  const latitude = toNumber(row.latitude);
  const longitude = toNumber(row.longitude);
  const address = formatAddress(row);
  const title = `${typeMeta.label} - ${address}`;

  return {
    id: row.id,
    incidentCode: row.incident_code,
    title,
    description: row.description || '',
    type: row.type,
    typeLabel: typeMeta.label,
    typeIcon: typeMeta.icon,
    typeColor: typeMeta.color,
    status: row.status,
    location: {
      lat: latitude,
      lng: longitude,
      address,
    },
    latitude,
    longitude,
    address,
    caller: {
      id: row.user_id,
      name: formatReporterName(row),
      phone: row.phone || '',
      email: row.email || '',
      barangay: row.barangay || '',
    },
    agencies: AGENCY_ROUTING[row.type] || ['MDRRMO'],
    photoUrl: toPublicMediaUrl(row.photo_url),
    videoUrl: toPublicMediaUrl(row.video_url),
    reporterId: row.user_id,
    responderId: row.responder_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    household: row.household_address || row.members != null || row.has_pwd != null || row.has_senior != null || row.has_pregnant != null
      ? {
          address: row.household_address || '',
          members: row.members ?? null,
          hasPwd: row.has_pwd ?? false,
          hasSenior: row.has_senior ?? false,
          hasPregnant: row.has_pregnant ?? false,
        }
      : null,
  };
};

const fetchEmergencyById = async (id: string) => {
  const result = await pool.query<EmergencyRow>(
    `${EMERGENCY_REPORT_SELECT} WHERE e.id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return normalizeEmergency(result.rows[0]);
};

const emitEmergencyEvent = (req: Request, eventName: 'newEmergency' | 'emergencyUpdate', payload: unknown) => {
  const io = req.app.get('io') as SocketIOServer | undefined;
  if (!io) {
    return;
  }

  io.to('admin').emit(eventName, payload);

  if (eventName === 'newEmergency') {
    io.to('admin').emit('emergency:new', payload);

    const emergency = payload as any;
    const reporterName = emergency?.caller?.name || 'Unknown sender';
    const typeLabel = emergency?.typeLabel || emergency?.type || 'Emergency';
    const hasPhoto = Boolean(emergency?.photoUrl);
    const hasVideo = Boolean(emergency?.videoUrl);
    const notificationPayload = {
      id: emergency?.id,
      type: 'report',
      reporterName,
      typeLabel,
      incidentCode: emergency?.incidentCode || emergency?.id,
      createdAt: emergency?.createdAt || new Date().toISOString(),
      hasPhoto,
      hasVideo,
      message: `${reporterName} sent a ${typeLabel} report`,
    };

    io.emit('report:public', notificationPayload);
    io.to('admin').emit('notification:new', notificationPayload);
    io.to('admin').emit('report:admin', {
      notification: notificationPayload,
      report: emergency,
    });
  }

  if (eventName === 'emergencyUpdate') {
    io.to('admin').emit('emergency:update', payload);
  }
};

const parsePositiveInt = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const getUploadedFiles = (req: Request) => ((req.files as UploadedFileMap | undefined) || {});

const cleanupUploadedFiles = async (files: Express.Multer.File[]) => {
  await Promise.allSettled(files.map((file) => fs.unlink(file.path)));
};

export const emergencyController = {
  createReport: async (req: Request, res: Response) => {
    const files = getUploadedFiles(req);
    const uploadedFiles = [...(files.photo || []), ...(files.video || [])];

    try {
      const { type, latitude, longitude, description, address } = req.body;
      const userId = (req as any).user?.userId;
      const parsedLatitude = toNumber(latitude);
      const parsedLongitude = toNumber(longitude);

      if (!type || parsedLatitude === null || parsedLongitude === null) {
        await cleanupUploadedFiles(uploadedFiles);
        return res.status(400).json({ error: 'Type, latitude, and longitude are required.' });
      }

      const photo = files.photo?.[0];
      const video = files.video?.[0];
      const id = uuidv4();
      const incidentCode = `EMG-${Date.now().toString(36).toUpperCase()}`;

      if (video) {
        await ensureBrowserCompatibleVideo(video.path);
      }

      await pool.query(
        `INSERT INTO emergencies (
          id,
          incident_code,
          type,
          latitude,
          longitude,
          description,
          address,
          user_id,
          photo_url,
          video_url,
          status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          id,
          incidentCode,
          type,
          parsedLatitude,
          parsedLongitude,
          typeof description === 'string' && description.trim() ? description.trim() : null,
          typeof address === 'string' && address.trim() ? address.trim() : null,
          userId,
          photo ? `/uploads/emergencies/${photo.filename}` : null,
          video ? `/uploads/emergencies/${video.filename}` : null,
          'pending',
        ]
      );

      const report = await fetchEmergencyById(id);
      const agencies = AGENCY_ROUTING[type] || ['MDRRMO'];
      console.log(`Routing emergency to: ${agencies.join(', ')}`);

      if (!report) {
        return res.status(500).json({ error: 'Emergency was created but could not be loaded.' });
      }

      emitEmergencyEvent(req, 'newEmergency', report);
      return res.status(201).json(report);
    } catch (error) {
      await cleanupUploadedFiles(uploadedFiles);
      console.error('Create report error:', error);
      return res.status(500).json({ error: 'Failed to create emergency report.' });
    }
  },

  getReports: async (req: Request, res: Response) => {
    try {
      const { status, type, limit = 100, offset = 0 } = req.query;
      const params: Array<string | number> = [];
      const conditions: string[] = [];

      if (typeof status === 'string' && status) {
        params.push(status);
        conditions.push(`e.status = $${params.length}`);
      }

      if (typeof type === 'string' && type) {
        params.push(type);
        conditions.push(`e.type = $${params.length}`);
      }

      const query = `
        ${EMERGENCY_REPORT_SELECT}
        ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}
        ORDER BY e.created_at DESC
        LIMIT $${params.length + 1}
        OFFSET $${params.length + 2}
      `;

      params.push(parsePositiveInt(limit, 100), parsePositiveInt(offset, 0));

      const result = await pool.query<EmergencyRow>(query, params);
      res.json(result.rows.map((row) => normalizeEmergency(row)));
    } catch (error) {
      console.error('Fetch reports error:', error);
      res.status(500).json({ error: 'Failed to fetch reports.' });
    }
  },

  getActiveReports: async (req: Request, res: Response) => {
    try {
      const result = await pool.query<EmergencyRow>(
        `${EMERGENCY_REPORT_SELECT}
         WHERE e.status IN ('pending', 'dispatched', 'arrived')
         ORDER BY e.created_at DESC`
      );

      res.json(result.rows.map((row) => normalizeEmergency(row)));
    } catch (error) {
      console.error('Fetch active reports error:', error);
      res.status(500).json({ error: 'Failed to fetch active reports.' });
    }
  },

  getReportById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const report = await fetchEmergencyById(id);

      if (!report) {
        return res.status(404).json({ error: 'Report not found.' });
      }

      return res.json(report);
    } catch (error) {
      console.error('Fetch report error:', error);
      return res.status(500).json({ error: 'Failed to fetch report.' });
    }
  },

  updateStatus: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = ['pending', 'dispatched', 'arrived', 'resolved', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status.' });
      }

      const updateResult = await pool.query(
        'UPDATE emergencies SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id',
        [status, id]
      );

      if (updateResult.rows.length === 0) {
        return res.status(404).json({ error: 'Report not found.' });
      }

      const report = await fetchEmergencyById(id);
      if (!report) {
        return res.status(404).json({ error: 'Report not found.' });
      }

      emitEmergencyEvent(req, 'emergencyUpdate', report);
      return res.json(report);
    } catch (error) {
      console.error('Update status error:', error);
      return res.status(500).json({ error: 'Failed to update status.' });
    }
  },

  assignResponder: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { responderId } = req.body;

      const result = await pool.query(
        `UPDATE emergencies
         SET responder_id = $1, status = $2, updated_at = NOW()
         WHERE id = $3
         RETURNING id`,
        [responderId, 'dispatched', id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Report not found.' });
      }

      const report = await fetchEmergencyById(id);
      if (!report) {
        return res.status(404).json({ error: 'Report not found.' });
      }

      emitEmergencyEvent(req, 'emergencyUpdate', report);
      return res.json(report);
    } catch (error) {
      console.error('Assign responder error:', error);
      return res.status(500).json({ error: 'Failed to assign responder.' });
    }
  },

  getReportHistory: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await pool.query<EmergencyRow>(
        `${EMERGENCY_REPORT_SELECT}
         WHERE e.user_id = (
           SELECT user_id
           FROM emergencies
           WHERE id = $1
         )
         ORDER BY e.created_at DESC`,
        [id]
      );

      res.json(result.rows.map((row) => normalizeEmergency(row)));
    } catch (error) {
      console.error('Fetch report history error:', error);
      res.status(500).json({ error: 'Failed to fetch history.' });
    }
  },

  getEmergencyTypes: async (_req: Request, res: Response) => {
    res.json(EMERGENCY_TYPES);
  },
};

export default emergencyController;
