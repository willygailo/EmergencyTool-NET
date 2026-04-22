export interface Emergency {
  id: string;
  type: string;
  latitude: number;
  longitude: number;
  description?: string;
  userId?: string;
  responderId?: string;
  videoUrl?: string;
  status: EmergencyStatus;
  priority: EmergencyPriority;
  createdAt: Date;
  updatedAt: Date;
}

export type EmergencyStatus = 'pending' | 'dispatched' | 'arrived' | 'resolved' | 'cancelled';
export type EmergencyPriority = 'low' | 'normal' | 'high' | 'critical';

export interface EmergencyType {
  id: string;
  label: string;
  icon: string;
  color: string;
  agencies: string[];
}

export interface EmergencyReport extends Partial<Emergency> {
  type: string;
  latitude: number;
  longitude: number;
  description?: string;
  videoUri?: string;
}

export default Emergency;