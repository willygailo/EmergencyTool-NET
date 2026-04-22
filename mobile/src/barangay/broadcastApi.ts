import api from '../services/api';

export interface BroadcastAlert {
  id: string;
  title: string;
  message: string;
  barangay: string | null;
  type: 'alert' | 'warning' | 'info' | 'evacuation';
  priority: string;
  createdAt: string;
  expiresAt: string | null;
  targetAll: boolean;
}

const normalizeAlertType = (value: unknown): BroadcastAlert['type'] => {
  const normalizedValue = String(value || 'alert').toLowerCase();

  if (
    normalizedValue === 'alert' ||
    normalizedValue === 'warning' ||
    normalizedValue === 'info' ||
    normalizedValue === 'evacuation'
  ) {
    return normalizedValue;
  }

  return 'alert';
};

const normalizeAlert = (alert: any): BroadcastAlert => ({
  id: String(alert?.id || ''),
  title: String(alert?.title || 'Untitled alert'),
  message: String(alert?.message || ''),
  barangay: alert?.barangay ? String(alert.barangay) : null,
  type: normalizeAlertType(alert?.type),
  priority: String(alert?.priority || 'normal'),
  createdAt: String(alert?.createdAt || alert?.created_at || new Date().toISOString()),
  expiresAt: alert?.expiresAt || alert?.expires_at || null,
  targetAll: Boolean(alert?.targetAll ?? alert?.target_all ?? !alert?.barangay),
});

export const broadcastApi = {
  getAlerts: async (barangay?: string | null): Promise<BroadcastAlert[]> => {
    const normalizedBarangay = barangay?.trim();
    const { data } = await api.get('/broadcasts/active', {
      params: normalizedBarangay ? { barangay: normalizedBarangay } : undefined,
    });

    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .map(normalizeAlert)
      .filter((item) => item.id)
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
  },
  getAlertById: async (id: string, barangay?: string | null): Promise<BroadcastAlert | null> => {
    const normalizedBarangay = barangay?.trim();
    const { data } = await api.get('/broadcasts', {
      params: normalizedBarangay ? { barangay: normalizedBarangay } : undefined,
    });

    if (!Array.isArray(data)) {
      return null;
    }

    return data.map(normalizeAlert).find((item) => item.id === id) || null;
  },
  subscribeToBarangay: async (barangayId: string) => {
    return { subscribed: true, barangayId };
  },
  getEvacuationRoutes: async (_barangayId: string) => {
    return [];
  },
};

export default broadcastApi;
