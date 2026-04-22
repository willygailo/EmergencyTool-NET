import api from '../services/api';

export const familyApi = {
  getFamily: async () => {
    const { data } = await api.get('/family/circle');
    return data?.members || [];
  },
  addMember: async (member: { name: string; phone: string; relationship: string }) => {
    const { data } = await api.post('/family/members', member);
    return data;
  },
  removeMember: async (memberId: string) => {
    const { data } = await api.delete(`/family/members/${memberId}`);
    return data;
  },
  checkIn: async (memberId: string, status: 'safe' | 'unsafe' | 'unknown') => {
    const { data } = await api.post(`/family/circle/${memberId}/checkin`, { status });
    return data;
  },
  getStatus: async () => {
    const { data } = await api.get('/family/status');
    return data;
  },
};

export default familyApi;
