import api from './api';
import type { Location } from '../shared/types/location.types';

export const locationService = {
  getAll: async (): Promise<Location[]> => {
    const { data } = await api.get('/locations');
    return data;
  },

  getById: async (id: string): Promise<Location> => {
    const { data } = await api.get(`/locations/${id}`);
    return data;
  },

  update: async (id: string, location: Partial<Location>): Promise<Location> => {
    const { data } = await api.put(`/locations/${id}`, location);
    return data;
  },
};

export default locationService;