import api from './api';

export const analyticsService = {
  getStats: async () => {
    const { data } = await api.get('/analytics/stats');
    return data;
  },

  getEmergencyTypes: async () => {
    const { data } = await api.get('/analytics/emergency-types');
    return data;
  },

  getMonthlyTrend: async () => {
    const { data } = await api.get('/analytics/monthly-trend');
    return data;
  },

  getResponseTime: async () => {
    const { data } = await api.get('/analytics/response-time');
    return data;
  },

  exportReport: async (type: string, format: string) => {
    const { data } = await api.get(`/analytics/export?type=${type}&format=${format}`);
    return data;
  },
};

export default analyticsService;