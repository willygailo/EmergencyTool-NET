import api from '../services/api';

export const emergencyApi = {
  getTypes: async () => {
    const { data } = await api.get('/emergency/types');
    return data;
  },
  report: async (emergency: {
    type: string;
    description?: string;
    latitude: number;
    longitude: number;
    address?: string;
    photoUri?: string;
    photoName?: string;
    photoType?: string;
    videoUri?: string;
    videoName?: string;
    videoType?: string;
  }) => {
    const formData = new FormData();
    formData.append('type', emergency.type);
    if (emergency.description) formData.append('description', emergency.description);
    formData.append('latitude', emergency.latitude.toString());
    formData.append('longitude', emergency.longitude.toString());
    if (emergency.address) formData.append('address', emergency.address);
    if (emergency.photoUri) {
      formData.append('photo', {
        uri: emergency.photoUri,
        type: emergency.photoType || 'image/jpeg',
        name: emergency.photoName || 'emergency_photo.jpg',
      } as any);
    }
    if (emergency.videoUri) {
      formData.append('video', {
        uri: emergency.videoUri,
        type: emergency.videoType || 'video/mp4',
        name: emergency.videoName || 'emergency_video.mp4',
      } as any);
    }
    const { data } = await api.post('/emergency/reports', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  getActive: async () => {
    const { data } = await api.get('/emergency/reports/active');
    return data;
  },
  getHistory: async () => {
    const { data } = await api.get('/emergency/reports');
    return data;
  },
  getById: async (id: string) => {
    const { data } = await api.get(`/emergency/reports/${id}`);
    return data;
  },
  cancel: async (id: string) => {
    const { data } = await api.put(`/emergency/reports/${id}/status`, { status: 'cancelled' });
    return data;
  },
  getResponderLocation: async (emergencyId: string) => {
    const report = await emergencyApi.getById(emergencyId);
    return report?.responder || null;
  },
};

export default emergencyApi;
