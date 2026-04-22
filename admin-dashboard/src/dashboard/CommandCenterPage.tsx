import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QuickActions } from '../ui/QuickActions';
import { ActivityFeed } from '../ui/ActivityFeed';
import { exportService } from '../services/exportService';

interface Emergency {
  id: string;
  title: string;
  type: string;
  status: string;
  location: string;
  createdAt: string;
}

export const CommandCenterPage = () => {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [emergencies] = useState<Emergency[]>([
    { id: '1', title: 'Fire Incident - Poblacion', type: 'fire', status: 'in_progress', location: 'Poblacion, Koronadal', createdAt: new Date().toISOString() },
    { id: '2', title: 'Medical Emergency - Mabini', type: 'medical', status: 'pending', location: 'Mabini, Koronadal', createdAt: new Date().toISOString() },
    { id: '3', title: 'Flooding - Zone 4', type: 'disaster', status: 'acknowledged', location: 'Zone 4, Koronadal', createdAt: new Date().toISOString() },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const stats = {
    activeEmergencies: emergencies.filter(e => e.status !== 'resolved').length,
    respondersOnDuty: 12,
    barangaysCovered: 20,
    resolvedToday: 5,
    pendingDispatch: 3,
    avgResponseTime: '8 min',
  };

  const statCards = [
    { label: 'Active Emergencies', value: stats.activeEmergencies, icon: '🚨', color: '#ef4444', bg: '#fef2f2' },
    { label: 'Responders On Duty', value: stats.respondersOnDuty, icon: '🚒', color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Pending Dispatch', value: stats.pendingDispatch, icon: '⏳', color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Resolved Today', value: stats.resolvedToday, icon: '✅', color: '#10b981', bg: '#ecfdf5' },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: '#f59e0b',
      acknowledged: '#3b82f6',
      in_progress: '#8b5cf6',
      resolved: '#10b981',
    };
    return colors[status] || '#6b7280';
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      fire: '🔥',
      medical: '🏥',
      disaster: '🌊',
      crime: '🚨',
    };
    return icons[type] || '⚠️';
  };

  const handleExportData = () => {
    const data = exportService.exportAnalytics(stats);
    exportService.toCSV(data);
  };

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Command Center</h1>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0' }}>
            Last updated: {lastUpdate.toLocaleTimeString()} | System Status: 🟢 Online
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => setLastUpdate(new Date())}
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
            onClick={handleExportData}
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

      <div style={{ marginBottom: '1.5rem' }}>
        <QuickActions />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {statCards.map((stat, index) => (
          <div 
            key={index}
            style={{ 
              padding: '1.25rem', 
              background: 'white', 
              borderRadius: '8px', 
              border: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
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
        <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>Live Map</h2>
            <Link to="/live-map" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '0.875rem' }}>View Full Map →</Link>
          </div>
          <div style={{ height: '300px', background: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: '#6b7280' }}>🗺️ Interactive Map - Click to view live responders and emergencies</p>
          </div>
        </div>

        <ActivityFeed />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '1rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Quick Stats</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Barangays Covered</span>
              <span style={{ fontWeight: '600' }}>{stats.barangaysCovered}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Avg Response Time</span>
              <span style={{ fontWeight: '600', color: '#10b981' }}>{stats.avgResponseTime}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>System Uptime</span>
              <span style={{ fontWeight: '600', color: '#3b82f6' }}>99.9%</span>
            </div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '1rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Recent Emergencies</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {emergencies.map((emergency) => (
              <div key={emergency.id} style={{ padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.25rem' }}>{getTypeIcon(emergency.type)}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: '600', margin: 0, fontSize: '0.9375rem' }}>{emergency.title}</p>
                  <p style={{ fontSize: '0.8125rem', color: '#6b7280', margin: '0.25rem 0 0' }}>{emergency.location}</p>
                </div>
                <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '9999px', background: `${getStatusColor(emergency.status)}15`, color: getStatusColor(emergency.status), fontWeight: '500' }}>
                  {emergency.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
          <Link to="/emergencies" style={{ display: 'block', marginTop: '1rem', textAlign: 'center', color: '#3b82f6', textDecoration: 'none', fontSize: '0.875rem' }}>
            View All Emergencies →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CommandCenterPage;