import api from '../services/api';

export const hazardApi = {
  getHazards: async (latitude?: number, longitude?: number, radius?: number) => {
    const params = new URLSearchParams();
    if (latitude) params.append('latitude', latitude.toString());
    if (longitude) params.append('longitude', longitude.toString());
    if (radius) params.append('radius', radius.toString());
    const { data } = await api.get(`/hazard?${params}`);
    return data;
  },
  reportHazard: async (hazard: {
    type: string;
    description: string;
    latitude: number;
    longitude: number;
    photoUri?: string;
  }) => {
    const { data } = await api.post('/hazard', {
      type: hazard.type,
      description: hazard.description,
      latitude: hazard.latitude,
      longitude: hazard.longitude,
    });
    return data;
  },
  voteHazard: async (hazardId: string) => {
    const { data } = await api.post(`/hazard/${hazardId}/vote`);
    return data;
  },
};

export default hazardApi;
