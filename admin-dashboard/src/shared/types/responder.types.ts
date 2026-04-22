export interface Responder {
  id: string;
  name: string;
  phone: string;
  unit: string;
  agency: string;
  status: 'available' | 'deployed' | 'offline';
  location?: {
    lat: number;
    lng: number;
  };
}

export interface Assignment {
  id: string;
  responderId: string;
  emergencyId: string;
  assignedAt: string;
  status: 'pending' | 'accepted' | 'completed';
}