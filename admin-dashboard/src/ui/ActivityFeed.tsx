import { useState } from 'react';
import type { DashboardActivityItem } from '../shared/types/dashboard.types';

interface ActivityFeedProps {
  activities?: DashboardActivityItem[];
  loading?: boolean;
}

const formatTimestamp = (timestamp: string) =>
  new Date(timestamp).toLocaleString('en-PH', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export const ActivityFeed = ({ activities = [], loading = false }: ActivityFeedProps) => {
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
          <option value="broadcast">Broadcasts</option>
          <option value="system">System</option>
        </select>
      </div>

      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
            Loading recent activity...
          </div>
        ) : filteredActivities.length === 0 ? (
          <div style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
            No activity available yet.
          </div>
        ) : (
          filteredActivities.map((activity) => (
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
                  {formatTimestamp(activity.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
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
