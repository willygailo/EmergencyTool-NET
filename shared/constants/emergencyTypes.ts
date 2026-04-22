import Emergency from '../types/emergency.types';

export const EMERGENCY_TYPES: Emergency.EmergencyType[] = [
  { id: 'fire', label: 'Fire', icon: '🔥', color: '#ef4444', agencies: ['BFP'] },
  { id: 'flood', label: 'Flood', icon: '🌊', color: '#3b82f6', agencies: ['OCD', 'MMO'] },
  { id: 'earthquake', label: 'Earthquake', icon: '🏚️', color: '#f59e0b', agencies: ['PHIVOLCS'] },
  { id: 'medical', label: 'Medical', icon: '🏥', color: '#22c55e', agencies: ['MDRRMO', 'BMHC'] },
  { id: 'crime', label: 'Crime', icon: '🚨', color: '#8b5cf6', agencies: ['PNP'] },
  { id: 'accident', label: 'Accident', icon: '💥', color: '#ec4899', agencies: ['MMDA', 'HWP'] },
  { id: 'missing', label: 'Missing Person', icon: '👤', color: '#06b6d4', agencies: ['PNP'] },
  { id: 'other', label: 'Other', icon: '⚠️', color: '#6b7280', agencies: ['MDRRMO'] },
];

export const EMERGENCY_STATUS: Record<string, string> = {
  PENDING: 'pending',
  DISPATCHED: 'dispatched',
  ARRIVED: 'arrived',
  RESOLVED: 'resolved',
  CANCELLED: 'cancelled',
};

export const EMERGENCY_PRIORITY = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  CRITICAL: 'critical',
};

export const AGENCY_CONTACTS = {
  BFP: { name: 'Bureau of Fire Protection', phone: '911', abbreviation: 'BFP' },
  PNP: { name: 'Philippine National Police', phone: '911', abbreviation: 'PNP' },
  MMDA: { name: 'Metropolitan Manila Development Authority', phone: '8842-6366', abbreviation: 'MMDA' },
  MDRRMO: { name: 'Municipal DRRM Office', phone: '911', abbreviation: 'MDRRMO' },
  OCD: { name: 'Office of Civil Defense', phone: '911', abbreviation: 'OCD' },
  BMHC: { name: 'Barangay Health Center', phone: '911', abbreviation: 'BMHC' },
  PHIVOLCS: { name: 'PHIVOLCS', phone: '0919-070-1234', abbreviation: 'PHIVOLCS' },
  HWP: { name: 'Highway Patrol Group', phone: '911', abbreviation: 'HWP' },
};

export const AGENCY_ROUTING_MATRIX: Record<string, string[]> = {
  fire: ['BFP'],
  flood: ['OCD', 'MMO'],
  earthquake: ['PHIVOLCS', 'OCD'],
  medical: ['MDRRMO', 'BMHC', 'HWP'],
  crime: ['PNP'],
  accident: ['MMDA', 'HWP', 'PNP'],
  missing: ['PNP', 'MDRRMO'],
  other: ['MDRRMO'],
};

export default EMERGENCY_TYPES;