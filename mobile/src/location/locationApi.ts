import api from '../services/api';

export const locationApi = {
  shareLocation: async (latitude: number, longitude: number, accuracy: number) => {
    const { data } = await api.post('/location/share', { latitude, longitude, accuracy });
    return data;
  },
  getMyLocations: async () => {
    const { data } = await api.get('/location/history');
    return data;
  },
  generateShareableLink: async () => {
    const { data } = await api.post('/location/shareable-link');
    return data;
  },
  getShareableLocation: async (linkId: string) => {
    const { data } = await api.get(`/location/shared/${linkId}`);
    return data;
  },
};

export default locationApi;
