import { NavLink, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { logout } from '../store/authSlice';

const menuItems = [
  { path: '/dashboard', label: 'Command Center', icon: '📊' },
  { path: '/live-map', label: 'Live Map', icon: '🗺️' },
  { path: '/heat-map', label: 'Heat Map', icon: '🔥' },
  { path: '/emergencies', label: 'Emergencies', icon: '🚨' },
  { path: '/incidents', label: 'Incident History', icon: '📋' },
  { path: '/responders', label: 'Responders', icon: '🚒' },
  { path: '/responders/tracking', label: 'Responder Tracking', icon: '📍' },
  { path: '/responders/assignment', label: 'Assignment', icon: '📝' },
  { path: '/broadcasts', label: 'Broadcasts', icon: '📢' },
  { path: '/broadcasts/evacuation', label: 'Evacuation Alert', icon: '⚠️' },
  { path: '/reports', label: 'Reports', icon: '📈' },
  { path: '/reports/statistics', label: 'Statistics', icon: '📊' },
  { path: '/reports/barangay', label: 'Barangay Analytics', icon: '🏘️' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
  { path: '/settings/users', label: 'User Management', icon: '👥' },
  { path: '/settings/contacts', label: 'Barangay Contacts', icon: '📞' },
  { path: '/settings/config', label: 'System Config', icon: '🔧' },
];

export const Sidebar = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div style={{ 
      width: '260px', 
      background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)', 
      color: 'white', 
      minHeight: '100vh', 
      padding: '1.5rem 1rem',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ marginBottom: '2rem', padding: '0.5rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#ef4444', marginBottom: '0.25rem' }}>
          🚨 EmergencyTool
        </h1>
        <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Admin Dashboard</p>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.625rem 0.75rem',
              borderRadius: '6px',
              textDecoration: 'none',
              color: isActive ? 'white' : '#94a3b8',
              background: isActive ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
              fontSize: '0.875rem',
              fontWeight: isActive ? '500' : '400',
              borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
            })}
          >
            <span style={{ fontSize: '1rem' }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ borderTop: '1px solid #334155', paddingTop: '1rem', marginTop: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{ 
            width: '36px', 
            height: '36px', 
            borderRadius: '50%', 
            background: '#3b82f6', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '0.875rem'
          }}>
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.875rem', fontWeight: '500' }}>{user?.name || 'Admin'}</p>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{user?.role || 'Administrator'}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          style={{ 
            width: '100%', 
            padding: '0.625rem', 
            background: 'rgba(239, 68, 68, 0.1)', 
            border: 'none', 
            borderRadius: '6px', 
            color: '#ef4444',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;