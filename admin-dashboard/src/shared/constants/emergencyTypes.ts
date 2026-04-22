export const EMERGENCY_TYPES = [
  { id: 'fire', label: 'Sunog / Fire', icon: '🔥', color: '#ef4444' },
  { id: 'flood', label: 'Baha / Flood', icon: '🌊', color: '#3b82f6' },
  { id: 'earthquake', label: 'Lindol / Earthquake', icon: '🏚️', color: '#f59e0b' },
  { id: 'medical', label: 'Medical Emergency', icon: '🏥', color: '#22c55e' },
  { id: 'accident', label: 'Accident', icon: '💥', color: '#ec4899' },
  { id: 'crime', label: 'General Crime', icon: '🚨', color: '#8b5cf6' },
  { id: 'rape', label: 'Rape / Sexual Assault', icon: '🆘', color: '#dc2626' },
  { id: 'homicide', label: 'Patay / Homicide', icon: '☠️', color: '#7c2d12' },
  { id: 'theft', label: 'Nakaw / Theft', icon: '👜', color: '#0f766e' },
  { id: 'missing', label: 'Missing Person', icon: '👤', color: '#06b6d4' },
  { id: 'other', label: 'Other Emergency', icon: '⚠️', color: '#6b7280' },
] as const;

export const EMERGENCY_STATUSES = [
  { id: 'pending', label: 'Pending', color: '#f59e0b' },
  { id: 'dispatched', label: 'Dispatched', color: '#2563eb' },
  { id: 'arrived', label: 'Arrived', color: '#8b5cf6' },
  { id: 'resolved', label: 'Resolved', color: '#10b981' },
  { id: 'cancelled', label: 'Cancelled', color: '#6b7280' },
] as const;

export const getEmergencyTypeMeta = (typeId?: string | null) =>
  EMERGENCY_TYPES.find((type) => type.id === typeId) || EMERGENCY_TYPES[EMERGENCY_TYPES.length - 1];

export const getEmergencyStatusMeta = (statusId?: string | null) =>
  EMERGENCY_STATUSES.find((status) => status.id === statusId) || EMERGENCY_STATUSES[0];
