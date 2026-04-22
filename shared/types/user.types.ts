export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  barangay?: string;
  role: UserRole;
  createdAt: Date;
}

export type UserRole = 'user' | 'responder' | 'admin';

export interface UserProfile extends User {
  household?: Household;
  emergencyContacts: EmergencyContact[];
}

export interface Household {
  id: string;
  userId: string;
  address: string;
  members: number;
}

export interface EmergencyContact {
  id: string;
  userId: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export default User;