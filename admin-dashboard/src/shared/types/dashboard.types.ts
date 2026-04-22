export interface DashboardSummary {
  totalEmergencies: number;
  activeEmergencies: number;
  pendingDispatch: number;
  dispatchedCases: number;
  resolvedCases: number;
  resolvedToday: number;
  respondersOnDuty: number;
  respondersAvailable: number;
  activeBroadcasts: number;
  barangaysCovered: number;
  averageResolutionMinutes: number | null;
  systemStatus: 'online';
}

export interface DashboardTypeBreakdown {
  type: string;
  count: number;
}

export interface DashboardRecentEmergency {
  id: string;
  incidentCode: string;
  title: string;
  type: string;
  typeLabel: string;
  typeIcon: string;
  status: string;
  location: string;
  barangay: string;
  callerName: string;
  createdAt: string;
}

export interface DashboardActivityItem {
  id: string;
  type: 'emergency' | 'broadcast' | 'system';
  message: string;
  timestamp: string;
  icon: string;
  color: string;
}

export interface DashboardOverview {
  summary: DashboardSummary;
  byType: DashboardTypeBreakdown[];
  recentEmergencies: DashboardRecentEmergency[];
  recentActivities: DashboardActivityItem[];
  serviceAreas: string[];
}
