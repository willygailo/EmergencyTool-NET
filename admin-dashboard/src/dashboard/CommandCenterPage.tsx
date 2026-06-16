import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { QuickActions } from '../ui/QuickActions';
import { ActivityFeed } from '../ui/ActivityFeed';
import { exportService } from '../services/exportService';
import analyticsService from '../services/analyticsService';
import websocketService from '../services/websocketService';
import type { DashboardOverview } from '../shared/types/dashboard.types';

const statusColors: Record<string, string> = {
  pending: '#f59e0b',
  dispatched: '#2563eb',
  arrived: '#7c3aed',
  resolved: '#10b981',
  cancelled: '#6b7280',
};

// const projectHighlights = [
//   'One-tap panic alerts',
//   'Offline and SMS fallback',
//   'AI first-aid guidance',
//   'Family safety check-ins',
//   '72-hour data retention',
//   'No background tracking',
// ];

const emptyOverview: DashboardOverview = {
  summary: {
    totalEmergencies: 0,
    activeEmergencies: 0,
    pendingDispatch: 0,
    dispatchedCases: 0,
    resolvedCases: 0,
    resolvedToday: 0,
    respondersOnDuty: 0,
    respondersAvailable: 0,
    activeBroadcasts: 0,
    barangaysCovered: 0,
    averageResolutionMinutes: null,
    systemStatus: 'online',
  },
  byType: [],
  recentEmergencies: [],
  recentActivities: [],
  serviceAreas: [],
};

const formatStatusLabel = (status: string) => status.replace(/_/g, ' ');

export const CommandCenterPage = () => {
  const [overview, setOverview] = useState<DashboardOverview>(emptyOverview);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const loadOverview = useCallback(async (showLoader = false) => {
    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError('');

    try {
      const data = await analyticsService.getDashboardOverview(6);
      setOverview(data);
      setLastUpdate(new Date());
    } catch (loadError: any) {
      setError(loadError?.response?.data?.error || 'Failed to load command center data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadOverview(true);

    const interval = window.setInterval(() => {
      void loadOverview(false);
    }, 30000);

    return () => {
      window.clearInterval(interval);
    };
  }, [loadOverview]);

  useEffect(() => {
    const socket = websocketService.connect(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000');
    socket.emit('join:admin');

    const refreshFromSocket = () => {
      void loadOverview(false);
    };

    socket.on('newEmergency', refreshFromSocket);
    socket.on('emergencyUpdate', refreshFromSocket);
    socket.on('emergency:new', refreshFromSocket);
    socket.on('emergency:update', refreshFromSocket);
    socket.on('broadcast:new', refreshFromSocket);

    return () => {
      socket.off('newEmergency', refreshFromSocket);
      socket.off('emergencyUpdate', refreshFromSocket);
      socket.off('emergency:new', refreshFromSocket);
      socket.off('emergency:update', refreshFromSocket);
      socket.off('broadcast:new', refreshFromSocket);
      websocketService.disconnect();
    };
  }, [loadOverview]);

  const { summary, recentEmergencies, recentActivities, byType, serviceAreas } = overview;

  const statCards = useMemo(
    () => [
      { label: 'Active Emergencies', value: summary.activeEmergencies, icon: '🚨', color: '#ef4444', bg: '#fef2f2' },
      { label: 'Responders On Duty', value: summary.respondersOnDuty, icon: '🚒', color: '#2563eb', bg: '#eff6ff' },
      { label: 'Pending Dispatch', value: summary.pendingDispatch, icon: '⏳', color: '#f59e0b', bg: '#fffbeb' },
      { label: 'Resolved Today', value: summary.resolvedToday, icon: '✅', color: '#10b981', bg: '#ecfdf5' },
    ],
    [summary]
  );

  const topTypesLabel = byType.length > 0
    ? byType.slice(0, 3).map((item) => `${item.type} (${item.count})`).join(' • ')
    : 'No incident type data yet';

  const exportAnalytics = () => {
    const data = exportService.exportAnalytics({
      totalEmergencies: summary.totalEmergencies,
      activeEmergencies: summary.activeEmergencies,
      resolvedToday: summary.resolvedToday,
      respondersOnDuty: summary.respondersOnDuty,
      avgResponseTime: summary.averageResolutionMinutes ? `${summary.averageResolutionMinutes} min` : 'N/A',
    });

    exportService.toCSV(data);
  };

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Command Center</h1>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0' }}>
            Last updated: {lastUpdate.toLocaleTimeString()} | System Status: 🟢 {summary.systemStatus}
            {refreshing ? ' | Refreshing live data...' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => void loadOverview(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              color: '#374151'
            }}
          >
            🔄 Refresh
          </button>
          <button
            onClick={exportAnalytics}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            📥 Export
          </button>
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: '1rem', padding: '0.875rem 1rem', borderRadius: '12px', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}

      <div
        style={{
          marginBottom: '1.5rem',
          padding: '1.5rem',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #991b1b 0%, #7f1d1d 35%, #0f172a 100%)',
          color: 'white',
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '1rem',
        }}
      >

      </div>
      <div style={{ marginBottom: '1.5rem' }}>
        <QuickActions />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {statCards.map((stat) => (
          <div
            key={stat.label}
            style={{
              padding: '1.25rem',
              background: 'white',
              borderRadius: '14px',
              border: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: stat.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>
              {stat.icon}
            </div>
            <div>
              <p style={{ color: '#6b7280', fontSize: '0.8125rem', margin: 0 }}>{stat.label}</p>
              <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: stat.color, margin: 0 }}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>Operational Snapshot</h2>
            <Link to="/live-map" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.875rem' }}>View Full Map →</Link>
          </div>

          {loading ? (
            <div style={{ height: '300px', background: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
              Loading dashboard overview...
            </div>
          ) : (
            <div
              style={{
                minHeight: '300px',
                borderRadius: '16px',
                background: 'linear-gradient(180deg, #eff6ff 0%, #f8fafc 100%)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                    Coverage
                  </p>
                  <h3 style={{ margin: '0.35rem 0 0', fontSize: '1.3rem', color: '#0f172a' }}>
                    {serviceAreas.length > 0 ? serviceAreas.join(' • ') : 'Community coverage still being configured'}
                  </h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Top incident mix</p>
                  <p style={{ margin: '0.35rem 0 0', fontWeight: 600, color: '#0f172a' }}>{topTypesLabel}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.75rem' }}>
                <div style={{ padding: '1rem', borderRadius: '12px', background: 'white', border: '1px solid #dbeafe' }}>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.8125rem' }}>Total Reports</p>
                  <p style={{ margin: '0.35rem 0 0', fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>{summary.totalEmergencies}</p>
                </div>
                <div style={{ padding: '1rem', borderRadius: '12px', background: 'white', border: '1px solid #dbeafe' }}>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.8125rem' }}>Active Broadcasts</p>
                  <p style={{ margin: '0.35rem 0 0', fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>{summary.activeBroadcasts}</p>
                </div>
                <div style={{ padding: '1rem', borderRadius: '12px', background: 'white', border: '1px solid #dbeafe' }}>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.8125rem' }}>Barangays Covered</p>
                  <p style={{ margin: '0.35rem 0 0', fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>{summary.barangaysCovered}</p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', color: '#334155', fontSize: '0.9rem' }}>
                <span>Available responders: <strong>{summary.respondersAvailable}</strong></span>
                <span>Average resolution time: <strong>{summary.averageResolutionMinutes ? `${summary.averageResolutionMinutes} min` : 'N/A'}</strong></span>
                <span>Privacy policy: <strong>72-hour location retention</strong></span>
              </div>
            </div>
          )}
        </div>

        <ActivityFeed activities={recentActivities} loading={loading} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '1rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Quick Stats</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Dispatched Cases</span>
              <span style={{ fontWeight: '600' }}>{summary.dispatchedCases}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Resolved Cases</span>
              <span style={{ fontWeight: '600', color: '#10b981' }}>{summary.resolvedCases}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Average Resolution</span>
              <span style={{ fontWeight: '600', color: '#2563eb' }}>
                {summary.averageResolutionMinutes ? `${summary.averageResolutionMinutes} min` : 'N/A'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
              <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Data Privacy Window</span>
              <span style={{ fontWeight: '600', color: '#0f172a' }}>72 hours</span>
            </div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '1rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Recent Emergencies</h2>
          {loading ? (
            <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Loading recent emergencies...</div>
          ) : recentEmergencies.length === 0 ? (
            <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>No emergency reports found yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentEmergencies.map((emergency) => (
                <div key={emergency.id} style={{ padding: '0.85rem', border: '1px solid #e5e7eb', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.4rem' }}>{emergency.typeIcon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '600', margin: 0, fontSize: '0.9375rem' }}>{emergency.title}</p>
                    <p style={{ fontSize: '0.8125rem', color: '#6b7280', margin: '0.25rem 0 0' }}>
                      {emergency.callerName} • {emergency.location} • {new Date(emergency.createdAt).toLocaleString('en-PH')}
                    </p>
                  </div>
                  <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '9999px', background: `${statusColors[emergency.status] || '#6b7280'}15`, color: statusColors[emergency.status] || '#6b7280', fontWeight: '500' }}>
                    {formatStatusLabel(emergency.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
          <Link to="/emergencies" style={{ display: 'block', marginTop: '1rem', textAlign: 'center', color: '#2563eb', textDecoration: 'none', fontSize: '0.875rem' }}>
            View All Emergencies →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CommandCenterPage;
