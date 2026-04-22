export const STATUS_CODES = {
  EMERGENCY: {
    PENDING: 'pending',
    ACKNOWLEDGED: 'acknowledged',
    IN_PROGRESS: 'in_progress',
    RESOLVED: 'resolved',
  },
  RESPONDER: {
    AVAILABLE: 'available',
    DEPLOYED: 'deployed',
    OFFLINE: 'offline',
  },
  FAMILY: {
    SAFE: 'safe',
    UNSAFE: 'unsafe',
    UNKNOWN: 'unknown',
  },
  ASSIGNMENT: {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    COMPLETED: 'completed',
  },
} as const;