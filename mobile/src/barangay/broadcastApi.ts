import api from '../services/api';

export const broadcastApi = {
  getAlerts: async () => {
    const { data } = await api.get('/broadcasts/active');
    return data || [];
  },
  getAlertById: async (id: string) => {
    const { data } = await api.get('/broadcasts');
    return (data || []).find((item: any) => item.id === id) || null;
  },
  subscribeToBarangay: async (barangayId: string) => {
    return { subscribed: true, barangayId };
  },
  getEvacuationRoutes: async (barangayId: string) => {
    return [];
  },
};

export default broadcastApi;
