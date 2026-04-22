export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'barangay' | 'barangay_admin' | 'responder' | 'user';
  phone?: string;
  barangay?: string;
  barangayId?: string;
  firstName?: string;
  lastName?: string;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
  passwordStatus?: string;
}
