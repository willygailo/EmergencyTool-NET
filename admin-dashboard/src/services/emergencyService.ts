import api from './api';
import { getEmergencyTypeMeta } from '../shared/constants/emergencyTypes';
import type { Emergency } from '../shared/types/emergency.types';
import { resolveMediaUrl } from './mediaUrl';

type ApiEmergency = {
  id: string;
  incidentCode?: string;
  title?: string;
  description?: string;
  type: string;
  typeLabel?: string;
  typeIcon?: string;
  typeColor?: string;
  status: Emergency['status'];
  location?: {
    lat?: number | null;
    lng?: number | null;
    address?: string;
  };
  latitude?: number | null;
  longitude?: number | null;
  address?: string;
  caller?: {
    id?: string | null;
    name?: string;
    phone?: string;
    email?: string;
    barangay?: string;
  };
  agencies?: string[];
  photoUrl?: string | null;
  videoUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export const normalizeEmergency = (record: ApiEmergency): Emergency => {
  const typeMeta = getEmergencyTypeMeta(record.type);
  const address = record.location?.address || record.address || 'Location unavailable';
  const callerName = record.caller?.name || 'Unknown Sender';

  return {
    id: record.id,
    incidentCode: record.incidentCode || record.id,
    title: record.title || `${typeMeta.label} - ${address}`,
    description: record.description || 'No additional details provided.',
    type: record.type,
    typeLabel: record.typeLabel || typeMeta.label,
    typeIcon: record.typeIcon || typeMeta.icon,
    typeColor: record.typeColor || typeMeta.color,
    status: record.status,
    location: {
      lat: record.location?.lat ?? record.latitude ?? null,
      lng: record.location?.lng ?? record.longitude ?? null,
      address,
    },
    caller: {
      id: record.caller?.id || null,
      name: callerName,
      phone: record.caller?.phone || 'No phone provided',
      email: record.caller?.email || '',
      barangay: record.caller?.barangay || '',
    },
    agencies: record.agencies || [],
    photoUrl: resolveMediaUrl(record.photoUrl),
    videoUrl: resolveMediaUrl(record.videoUrl),
    createdAt: record.createdAt || new Date().toISOString(),
    updatedAt: record.updatedAt || record.createdAt || new Date().toISOString(),
  };
};

export const emergencyService = {
  getAll: async (): Promise<Emergency[]> => {
    const { data } = await api.get('/emergency/reports');
    return Array.isArray(data) ? data.map(normalizeEmergency) : [];
  },

  getById: async (id: string): Promise<Emergency> => {
    const { data } = await api.get(`/emergency/reports/${id}`);
    return normalizeEmergency(data);
  },

  updateStatus: async (id: string, status: Emergency['status']): Promise<Emergency> => {
    const { data } = await api.put(`/emergency/reports/${id}/status`, { status });
    return normalizeEmergency(data);
  },
};

export default emergencyService;
