export const EMERGENCY_TYPES = [
  { id: 'fire', label: 'Sunog / Fire', icon: '🔥', color: '#ef4444', agencies: ['BFP'] },
  { id: 'flood', label: 'Baha / Flood', icon: '🌊', color: '#3b82f6', agencies: ['OCD', 'MDRRMO'] },
  { id: 'earthquake', label: 'Lindol / Earthquake', icon: '🏚️', color: '#f59e0b', agencies: ['PHIVOLCS', 'MDRRMO'] },
  { id: 'medical', label: 'Medical Emergency', icon: '🏥', color: '#22c55e', agencies: ['MDRRMO', 'BMHC'] },
  { id: 'accident', label: 'Accident', icon: '💥', color: '#ec4899', agencies: ['PNP', 'MDRRMO'] },
  { id: 'crime', label: 'General Crime', icon: '🚨', color: '#8b5cf6', agencies: ['PNP'] },
  { id: 'rape', label: 'Rape / Sexual Assault', icon: '🆘', color: '#dc2626', agencies: ['PNP', 'MDRRMO'] },
  { id: 'homicide', label: 'Patay / Homicide', icon: '☠️', color: '#7c2d12', agencies: ['PNP'] },
  { id: 'theft', label: 'Nakaw / Theft', icon: '👜', color: '#0f766e', agencies: ['PNP'] },
  { id: 'missing', label: 'Missing Person', icon: '👤', color: '#06b6d4', agencies: ['PNP'] },
  { id: 'other', label: 'Other', icon: '⚠️', color: '#6b7280', agencies: ['MDRRMO'] },
];

export const getEmergencyTypeById = (typeId?: string | null) =>
  EMERGENCY_TYPES.find((type) => type.id === typeId) || EMERGENCY_TYPES[EMERGENCY_TYPES.length - 1];

export const AGENCY_CONTACTS = {
  BFP: { name: 'Bureau of Fire Protection', phone: '911' },
  PNP: { name: 'Philippine National Police', phone: '911' },
  MMDA: { name: 'Metropolitan Manila Development Authority', phone: '8842-6366' },
  MDRRMO: { name: 'Municipal DRRM Office', phone: '911' },
  OCD: { name: 'Office of Civil Defense', phone: '911' },
  BMHC: { name: 'Barangay Health Center', phone: '911' },
  PHIVOLCS: { name: 'PHIVOLCS', phone: '0919-070-1234' },
};

export const EMERGENCY_STATUS = {
  PENDING: 'pending',
  DISPATCHED: 'dispatched',
  ARRIVED: 'arrived',
  RESOLVED: 'resolved',
  CANCELLED: 'cancelled',
};

export default EMERGENCY_TYPES;
