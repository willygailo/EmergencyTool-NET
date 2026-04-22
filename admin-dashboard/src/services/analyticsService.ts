import api from './api';
import type { DashboardOverview } from '../shared/types/dashboard.types';

export const analyticsService = {
  getStats: async () => {
    const { data } = await api.get('/analytics/stats');
    return data;
  },

  getDashboardOverview: async (limit = 6): Promise<DashboardOverview> => {
    const { data } = await api.get(`/analytics/dashboard?limit=${limit}`);
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
