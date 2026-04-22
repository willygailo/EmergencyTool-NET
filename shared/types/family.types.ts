export interface Family {
  id: string;
  userId: string;
  name: string;
  members: FamilyMember[];
  createdAt: Date;
}

export interface FamilyMember {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status: SafetyStatus;
  lastCheckIn?: Date;
}

export type SafetyStatus = 'safe' | 'checking' | 'unknown';

export interface FamilyCircle {
  family: Family;
  checkInStatus: CheckInStatus;
  alertEnabled: boolean;
}

export type CheckInStatus = 'all_safe' | 'pending' | 'missing';

export default Family;