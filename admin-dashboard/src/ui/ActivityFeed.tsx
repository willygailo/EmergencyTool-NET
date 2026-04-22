import { useState } from 'react';

interface Activity {
  id: string;
  type: 'emergency' | 'responder' | 'broadcast' | 'system';
  message: string;
  timestamp: string;
  icon: string;
  color: string;
}

const mockActivities: Activity[] = [
  { id: '1', type: 'emergency', message: 'New emergency reported in Poblacion', timestamp: '2 min ago', icon: '🚨', color: '#ef4444' },
  { id: '2', type: 'responder', message: 'Responder John Doe is now on duty', timestamp: '5 min ago', icon: '🚒', color: '#10b981' },
  { id: '3', type: 'broadcast', message: 'Barangay-wide alert sent to Mabini', timestamp: '12 min ago', icon: '📢', color: '#f59e0b' },
  { id: '4', type: 'system', message: 'System backup completed successfully', timestamp: '1 hour ago', icon: '✅', color: '#3b82f6' },
  { id: '5', type: 'emergency', message: 'Emergency #EMG-2024-0156 resolved', timestamp: '2 hours ago', icon: '✓', color: '#10b981' },
];

export const ActivityFeed = () => {
  const [activities] = useState<Activity[]>(mockActivities);
  const [filter, setFilter] = useState<string>('all');

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(a => a.type === filter);

  return (
    <div style={{ 
      background: 'white', 
      borderRadius: '8px', 
      border: '1px solid #e5e7eb',
      overflow: 'hidden'
    }}>
      <div style={{ 
        padding: '1rem', 
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>📋 Activity Feed</h3>
        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: '0.25rem 0.5rem',
            border: '1px solid #e5e7eb',
            borderRadius: '4px',
            fontSize: '0.75rem',
            cursor: 'pointer'
          }}
        >
          <option value="all">All</option>
          <option value="emergency">Emergencies</option>
          <option value="responder">Responders</option>
          <option value="broadcast">Broadcasts</option>
          <option value="system">System</option>
        </select>
      </div>

      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {filteredActivities.map((activity) => (
          <div
            key={activity.id}
            style={{
              padding: '0.75rem 1rem',
              borderBottom: '1px solid #f3f4f6',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-start',
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: `${activity.color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.875rem',
              flexShrink: 0,
            }}>
              {activity.icon}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#1f2937' }}>
                {activity.message}
              </p>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#9ca3af' }}>
                {activity.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '0.75rem', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
        <button style={{
          background: 'none',
          border: 'none',
          color: '#3b82f6',
          fontSize: '0.8125rem',
          cursor: 'pointer',
        }}>
          View All Activities →
        </button>
      </div>
    </div>
  );
};

export default ActivityFeed;