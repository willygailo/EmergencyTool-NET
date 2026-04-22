export interface Family {
  id: string;
  ownerId: string;
  members: FamilyMember[];
}

export interface FamilyMember {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  status: 'safe' | 'unsafe' | 'unknown';
  lastCheckIn?: string;
}