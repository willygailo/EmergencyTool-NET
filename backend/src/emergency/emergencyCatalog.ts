export interface EmergencyTypeMeta {
  id: string;
  label: string;
  icon: string;
  color: string;
  agencies: string[];
}

export const EMERGENCY_TYPES: EmergencyTypeMeta[] = [
  { id: 'fire', label: 'Sunog / Fire', icon: '🔥', color: '#ef4444', agencies: ['BFP'] },
  { id: 'flood', label: 'Baha / Flood', icon: '🌊', color: '#3b82f6', agencies: ['OCD', 'MDRRMO'] },
  { id: 'earthquake', label: 'Lindol / Earthquake', icon: '🏚️', color: '#f59e0b', agencies: ['PHIVOLCS', 'MDRRMO'] },
  { id: 'medical', label: 'Medical Emergency', icon: '🏥', color: '#22c55e', agencies: ['MDRRMO', 'BMHC'] },
  { id: 'accident', label: 'Accident', icon: '💥', color: '#ec4899', agencies: ['PNP', 'MDRRMO'] },
  { id: 'crime', label: 'General Crime', icon: '🚨', color: '#8b5cf6', agencies: ['PNP'] },
  { id: 'rape', label: 'Rape / Sexual Assault', icon: '🆘', color: '#dc2626', agencies: ['PNP', 'MDRRMO'] },
  { id: 'homicide', label: 'Patay / Homicide', icon: '☠️', color: '#7c2d12', agencies: ['PNP'] },
  { id: 'theft', label: 'Nakaw / Theft', icon: '👜', color: '#0f766e', agencies: ['PNP'] },
  { id: 'missing', label: 'Missing Person', icon: '👤', color: '#06b6d4', agencies: ['PNP', 'MDRRMO'] },
  { id: 'other', label: 'Other Emergency', icon: '⚠️', color: '#6b7280', agencies: ['MDRRMO'] },
];

export const AGENCY_ROUTING: Record<string, string[]> = Object.fromEntries(
  EMERGENCY_TYPES.map((type) => [type.id, type.agencies])
);

export const DEFAULT_EMERGENCY_TYPE: EmergencyTypeMeta = EMERGENCY_TYPES.find(
  (type) => type.id === 'other'
) as EmergencyTypeMeta;

export const getEmergencyTypeMeta = (typeId?: string | null) =>
  EMERGENCY_TYPES.find((type) => type.id === typeId) || DEFAULT_EMERGENCY_TYPE;
