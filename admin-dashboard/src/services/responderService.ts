import api from './api';
import type { Responder } from '../shared/types/responder.types';

export const responderService = {
  getAll: async (): Promise<Responder[]> => {
    const { data } = await api.get('/responders');
    return data;
  },

  getById: async (id: string): Promise<Responder> => {
    const { data } = await api.get(`/responders/${id}`);
    return data;
  },

  create: async (responder: Partial<Responder>): Promise<Responder> => {
    const { data } = await api.post('/responders', responder);
    return data;
  },

  update: async (id: string, responder: Partial<Responder>): Promise<Responder> => {
    const { data } = await api.put(`/responders/${id}`, responder);
    return data;
  },

  assign: async (responderId: string, emergencyId: string): Promise<void> => {
    await api.post(`/responders/${responderId}/assign`, { emergencyId });
  },
};

export default responderService;