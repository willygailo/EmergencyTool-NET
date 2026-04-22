export interface Hazard {
  id: string;
  type: string;
  location: {
    lat: number;
    lng: number;
  };
  description: string;
  votes: number;
  verified: boolean;
  reportedBy: string;
  createdAt: string;
}