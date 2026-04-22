import api from './api';
import type { Broadcast } from '../shared/types/api.types';

export const broadcastService = {
  getAll: async (): Promise<Broadcast[]> => {
    const { data } = await api.get('/broadcasts');
    return data;
  },

  create: async (broadcast: Partial<Broadcast>): Promise<Broadcast> => {
    const { data } = await api.post('/broadcasts', broadcast);
    return data;
  },

  sendEvacuationAlert: async (barangayId: string, message: string): Promise<void> => {
    await api.post('/broadcasts/evacuation', { barangayId, message });
  },
};

export default broadcastService;