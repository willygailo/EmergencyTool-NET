import api from '../services/api';

export interface HouseholdPayload {
  address: string;
  members: number;
  hasPwd: boolean;
  hasSenior: boolean;
  hasPregnant: boolean;
}

export interface HouseholdRecord {
  id?: string;
  userId?: string;
  address: string;
  members: number;
  hasPwd: boolean;
  hasSenior: boolean;
  hasPregnant: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

const normalizeHousehold = (record: any): HouseholdRecord | null => {
  if (!record) {
    return null;
  }

  return {
    id: record.id,
    userId: record.userId || record.user_id,
    address: record.address || '',
    members: Number(record.members || 1),
    hasPwd: Boolean(record.hasPwd ?? record.has_pwd),
    hasSenior: Boolean(record.hasSenior ?? record.has_senior),
    hasPregnant: Boolean(record.hasPregnant ?? record.has_pregnant),
    createdAt: record.createdAt || record.created_at || null,
    updatedAt: record.updatedAt || record.updated_at || null,
  };
};

export const householdApi = {
  getHousehold: async () => {
    const { data } = await api.get('/users/household');
    return normalizeHousehold(data);
  },
  updateHousehold: async (payload: HouseholdPayload) => {
    const { data } = await api.put('/users/household', payload);
    return normalizeHousehold(data);
  },
};

export default householdApi;
