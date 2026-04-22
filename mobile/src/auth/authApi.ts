import axios from 'axios';
import { API_BASE_URL } from '../services/apiConfig';
import {
  clearSessionToken,
  getRememberedCredentials,
  getSessionToken,
  saveRememberedCredentials,
  saveSessionToken,
} from './authStorage';

const authAxios = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

authAxios.interceptors.request.use(async (config) => {
  const token = await getSessionToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

authAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await clearSessionToken();
    }
    return Promise.reject(error);
  }
);

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const normalizePhone = (phone?: string) => {
  if (!phone) {
    return '';
  }

  return phone.trim().replace(/[^\d+]/g, '');
};

export const authApi = {
  login: async (email: string, password: string) => {
    const normalizedEmail = normalizeEmail(email);
    const { data } = await authAxios.post('/auth/login', { email: normalizedEmail, password });
    if (data.token) await saveSessionToken(data.token);
    await saveRememberedCredentials({ email: normalizedEmail, password });
    return data;
  },
  register: async (userData: { email: string; password: string; firstName: string; lastName: string; phone?: string; barangay?: string }) => {
    const payload = {
      ...userData,
      email: normalizeEmail(userData.email),
      phone: normalizePhone(userData.phone),
      barangay: userData.barangay?.trim() || '',
      firstName: userData.firstName.trim(),
      lastName: userData.lastName.trim(),
    };

    const { data } = await authAxios.post('/auth/register', payload);
    if (data.token) await saveSessionToken(data.token);
    await saveRememberedCredentials({ email: payload.email, password: payload.password });
    return data;
  },
  logout: async () => {
    try {
      await authAxios.post('/auth/logout');
    } catch (e) {
      // ignore
    }
    await clearSessionToken();
  },
  getProfile: async () => {
    const { data } = await authAxios.get('/auth/profile');
    return data;
  },
  updateProfile: async (updates: any) => {
    const { data } = await authAxios.put('/auth/profile', updates);
    return data;
  },
  changePassword: async (currentPassword: string, newPassword: string) => {
    const { data } = await authAxios.post('/auth/change-password', { currentPassword, newPassword });
    return data;
  },
  forgotPassword: async (email: string) => {
    const { data } = await authAxios.post('/auth/forgot-password', { email });
    return data;
  },
  resetPassword: async (token: string, newPassword: string) => {
    const { data } = await authAxios.post('/auth/reset-password', { token, newPassword });
    return data;
  },
  getStoredToken: getSessionToken,
  getRememberedCredentials,
  clearSessionToken,
};

export default authAxios;
