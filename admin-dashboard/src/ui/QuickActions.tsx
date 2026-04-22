import { Link } from 'react-router-dom';

interface QuickAction {
  icon: string;
  label: string;
  path: string;
  color: string;
}

const actions: QuickAction[] = [
  { icon: '🚨', label: 'New Emergency', path: '/emergencies', color: '#ef4444' },
  { icon: '📢', label: 'Broadcast', path: '/broadcasts', color: '#f59e0b' },
  { icon: '🚒', label: 'Dispatch', path: '/responders/assignment', color: '#3b82f6' },
  { icon: '⚠️', label: 'Evacuation', path: '/broadcasts/evacuation', color: '#8b5cf6' },
  { icon: '📍', label: 'Track', path: '/responders/tracking', color: '#10b981' },
  { icon: '📈', label: 'Reports', path: '/reports', color: '#06b6d4' },
];

export const QuickActions = () => {
  return (
    <div style={{ 
      display: 'flex', 
      gap: '0.5rem', 
      padding: '1rem',
      background: 'white',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      flexWrap: 'wrap'
    }}>
      {actions.map((action) => (
        <Link
          key={action.path}
          to={action.path}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.5rem 0.75rem',
            background: `${action.color}10`,
            border: `1px solid ${action.color}30`,
            borderRadius: '6px',
            textDecoration: 'none',
            color: action.color,
            fontSize: '0.8125rem',
            fontWeight: '500',
            transition: 'all 0.2s',
          }}
        >
          <span style={{ fontSize: '1rem' }}>{action.icon}</span>
          <span>{action.label}</span>
        </Link>
      ))}
    </div>
  );
};

export default QuickActions;