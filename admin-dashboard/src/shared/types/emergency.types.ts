export interface Emergency {
  id: string;
  incidentCode: string;
  title: string;
  description: string;
  type: string;
  typeLabel: string;
  typeIcon: string;
  typeColor: string;
  status: 'pending' | 'dispatched' | 'arrived' | 'resolved' | 'cancelled';
  location: {
    lat: number | null;
    lng: number | null;
    address: string;
  };
  caller: {
    id?: string | null;
    name: string;
    phone: string;
    email?: string;
    barangay?: string;
  };
  agencies: string[];
  photoUrl?: string | null;
  videoUrl?: string | null;
  aiAnalysis?: {
    priority: 'low' | 'medium' | 'high' | 'critical';
    summary: string;
    recommendedActions: string[];
    resourceNeeds: string[];
    hasImmediateHazard: boolean;
  } | null;
  createdAt: string;
  updatedAt: string;
}
