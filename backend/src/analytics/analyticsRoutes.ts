import { Router, Response } from 'express';
import { pool } from '../config/database';
import { getEmergencyTypeMeta } from '../emergency/emergencyCatalog';

const router = Router();

type DashboardEmergencyRow = {
  id: string;
  incident_code: string | null;
  type: string;
  status: string;
  address: string | null;
  latitude: string | number | null;
  longitude: string | number | null;
  created_at: string;
  first_name?: string | null;
  last_name?: string | null;
  barangay?: string | null;
};

type DashboardBroadcastRow = {
  id: string;
  title: string;
  barangay: string | null;
  type: string;
  priority: string;
  created_at: string;
};

const parseCount = (value: unknown) => Number.parseInt(String(value ?? '0'), 10) || 0;

const parseMinutes = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed * 10) / 10 : null;
};

const formatReporterName = (row: DashboardEmergencyRow) =>
  [row.first_name, row.last_name].filter(Boolean).join(' ').trim() || 'Unknown sender';

const formatAddress = (row: DashboardEmergencyRow) =>
  row.address || row.barangay || 'Location unavailable';

const formatRecentEmergency = (row: DashboardEmergencyRow) => {
  const meta = getEmergencyTypeMeta(row.type);
  const address = formatAddress(row);

  return {
    id: row.id,
    incidentCode: row.incident_code || row.id,
    title: `${meta.label} - ${address}`,
    type: row.type,
    typeLabel: meta.label,
    typeIcon: meta.icon,
    status: row.status,
    location: address,
    barangay: row.barangay || '',
    callerName: formatReporterName(row),
    createdAt: row.created_at,
  };
};

const buildEmergencyActivity = (row: DashboardEmergencyRow) => {
  const meta = getEmergencyTypeMeta(row.type);
  const address = formatAddress(row);

  return {
    id: `emergency-${row.id}`,
    type: 'emergency',
    message: `${formatReporterName(row)} reported ${meta.label} in ${address}`,
    timestamp: row.created_at,
    icon: meta.icon,
    color: meta.color,
  };
};

const buildBroadcastActivity = (row: DashboardBroadcastRow) => ({
  id: `broadcast-${row.id}`,
  type: 'broadcast',
  message: `${row.title} sent${row.barangay ? ` to ${row.barangay}` : ' to all barangays'}`,
  timestamp: row.created_at,
  icon: row.type === 'evacuation' ? '⚠️' : '📢',
  color: row.type === 'evacuation' ? '#dc2626' : row.priority === 'high' ? '#f59e0b' : '#2563eb',
});

const fetchDashboardOverview = async (limit: number) => {
  const [
    totalsResult,
    respondersResult,
    broadcastsResult,
    barangaysResult,
    byTypeResult,
    recentEmergenciesResult,
    recentBroadcastsResult,
  ] = await Promise.all([
    pool.query(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status IN ('pending', 'dispatched', 'arrived'))::int AS active,
        COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
        COUNT(*) FILTER (WHERE status = 'dispatched')::int AS dispatched,
        COUNT(*) FILTER (WHERE status = 'resolved')::int AS resolved,
        COUNT(*) FILTER (WHERE status = 'resolved' AND updated_at >= CURRENT_DATE)::int AS resolved_today,
        AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 60)
          FILTER (WHERE status = 'resolved' AND updated_at IS NOT NULL AND updated_at > created_at) AS avg_resolution_minutes
      FROM emergencies
    `),
    pool.query(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status <> 'offline')::int AS on_duty,
        COUNT(*) FILTER (WHERE status = 'available')::int AS available
      FROM responders
    `),
    pool.query(`
      SELECT COUNT(*)::int AS active
      FROM broadcasts
      WHERE expires_at IS NULL OR expires_at > NOW()
    `),
    pool.query(`
      SELECT COUNT(DISTINCT barangay)::int AS count
      FROM (
        SELECT NULLIF(TRIM(barangay), '') AS barangay FROM users
        UNION
        SELECT NULLIF(TRIM(barangay), '') AS barangay FROM broadcasts
      ) coverage
      WHERE barangay IS NOT NULL
    `),
    pool.query(`
      SELECT type, COUNT(*)::int AS count
      FROM emergencies
      GROUP BY type
      ORDER BY count DESC, type ASC
    `),
    pool.query<DashboardEmergencyRow>(
      `
        SELECT
          e.id,
          e.incident_code,
          e.type,
          e.status,
          e.address,
          e.latitude,
          e.longitude,
          e.created_at,
          u.first_name,
          u.last_name,
          u.barangay
        FROM emergencies e
        LEFT JOIN users u ON e.user_id = u.id
        ORDER BY e.created_at DESC
        LIMIT $1
      `,
      [limit]
    ),
    pool.query<DashboardBroadcastRow>(
      `
        SELECT id, title, barangay, type, priority, created_at
        FROM broadcasts
        ORDER BY created_at DESC
        LIMIT $1
      `,
      [limit]
    ),
  ]);

  const totals = totalsResult.rows[0] || {};
  const responders = respondersResult.rows[0] || {};
  const broadcasts = broadcastsResult.rows[0] || {};
  const barangays = barangaysResult.rows[0] || {};

  const recentEmergencies = recentEmergenciesResult.rows.map(formatRecentEmergency);
  const recentActivities = [
    ...recentEmergenciesResult.rows.map(buildEmergencyActivity),
    ...recentBroadcastsResult.rows.map(buildBroadcastActivity),
  ]
    .sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime())
    .slice(0, limit * 2);

  return {
    summary: {
      totalEmergencies: parseCount(totals.total),
      activeEmergencies: parseCount(totals.active),
      pendingDispatch: parseCount(totals.pending),
      dispatchedCases: parseCount(totals.dispatched),
      resolvedCases: parseCount(totals.resolved),
      resolvedToday: parseCount(totals.resolved_today),
      respondersOnDuty: parseCount(responders.on_duty),
      respondersAvailable: parseCount(responders.available),
      activeBroadcasts: parseCount(broadcasts.active),
      barangaysCovered: parseCount(barangays.count),
      averageResolutionMinutes: parseMinutes(totals.avg_resolution_minutes),
      systemStatus: 'online' as const,
    },
    byType: byTypeResult.rows.map((row) => ({
      type: row.type,
      count: parseCount((row as { count?: unknown }).count),
    })),
    recentEmergencies,
    recentActivities,
    serviceAreas: [
      'Columbio, Sultan Kudarat',
      'Koronadal, South Cotabato',
    ],
  };
};

router.get('/dashboard', async (req, res: Response) => {
  try {
    const requestedLimit = Number(req.query.limit);
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(Math.trunc(requestedLimit), 3), 12)
      : 6;

    res.json(await fetchDashboardOverview(limit));
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard analytics' });
  }
});

router.get('/stats', async (_req, res: Response) => {
  try {
    const overview = await fetchDashboardOverview(6);

    res.json({
      total: overview.summary.totalEmergencies,
      pending: overview.summary.pendingDispatch,
      dispatched: overview.summary.dispatchedCases,
      resolved: overview.summary.resolvedCases,
      active: overview.summary.activeEmergencies,
      resolvedToday: overview.summary.resolvedToday,
      respondersOnDuty: overview.summary.respondersOnDuty,
      activeBroadcasts: overview.summary.activeBroadcasts,
      barangaysCovered: overview.summary.barangaysCovered,
      averageResolutionMinutes: overview.summary.averageResolutionMinutes,
      byType: overview.byType,
    });
  } catch (error) {
    console.error('Stats analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

router.get('/emergency-types', async (_req, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT type, COUNT(*)::int AS count
      FROM emergencies
      GROUP BY type
      ORDER BY count DESC, type ASC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Emergency type analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch emergency type analytics' });
  }
});

router.get('/heatmap', async (_req, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT latitude, longitude, type FROM emergencies WHERE latitude IS NOT NULL AND longitude IS NOT NULL'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Heatmap analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch heatmap data' });
  }
});

router.get('/monthly-report', async (_req, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT
        DATE_TRUNC('month', created_at) AS month,
        type,
        COUNT(*)::int AS count
      FROM emergencies
      GROUP BY DATE_TRUNC('month', created_at), type
      ORDER BY month DESC, type ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Monthly report analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch monthly report' });
  }
});

router.get('/monthly-trend', async (_req, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS month,
        COUNT(*)::int AS total
      FROM emergencies
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Monthly trend analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch monthly trend' });
  }
});

router.get('/response-time', async (_req, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT
        type,
        ROUND(AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 60), 1) AS average_minutes,
        COUNT(*)::int AS resolved_count
      FROM emergencies
      WHERE status = 'resolved'
        AND updated_at IS NOT NULL
        AND updated_at > created_at
      GROUP BY type
      ORDER BY average_minutes ASC NULLS LAST, type ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Response time analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch response-time analytics' });
  }
});

export default router;
