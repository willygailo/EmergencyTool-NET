import { Pool } from 'pg';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  barangay?: string;
  role: 'user' | 'responder' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface Household {
  id: string;
  userId: string;
  address: string;
  members: number;
  createdAt: Date;
}

export interface EmergencyContact {
  id: string;
  userId: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
}

export const User = {
  tableName: 'users',
  columns: ['email', 'password_hash', 'first_name', 'last_name', 'phone', 'barangay', 'role'],
};

export const Household = {
  tableName: 'households',
  columns: ['user_id', 'address', 'members'],
};

export const EmergencyContact = {
  tableName: 'emergency_contacts',
  columns: ['user_id', 'name', 'phone', 'relationship', 'is_primary'],
};

export default { User, Household, EmergencyContact };