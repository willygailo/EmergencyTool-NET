import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import websocketService from '../services/websocketService';
import api from '../services/api';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Command Center',
  '/live-map': 'Live Map',
  '/heat-map': 'Heat Map',
  '/emergencies': 'Emergencies',
  '/incidents': 'Incident History',
  '/responders': 'Responders',
  '/responders/tracking': 'Responder Tracking',
  '/responders/assignment': 'Assignment',
  '/broadcasts': 'Broadcasts',
  '/broadcasts/evacuation': 'Evacuation Alert',
  '/reports': 'Reports',
  '/reports/statistics': 'Disaster Statistics',
  '/reports/barangay': 'Barangay Analytics',
  '/settings': 'Settings',
  '/settings/users': 'User Management',
  '/settings/contacts': 'Barangay Contacts',
  '/settings/config': 'System Configuration',
};

export const TopBar = () => {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    message: string;
    timeLabel: string;
    createdAt: string;
    hasPhoto?: boolean;
    hasVideo?: boolean;
  }>>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const showNotificationsRef = useRef(showNotifications);

  const currentPage = pageTitles[location.pathname] || 'Dashboard';
  const currentTime = new Date().toLocaleString('en-PH', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit', 
    minute: '2-digit' 
  });

  useEffect(() => {
    showNotificationsRef.current = showNotifications;
  }, [showNotifications]);

  useEffect(() => {
    let isMounted = true;
    const socket = websocketService.connect(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000');
    socket.emit('join:admin');

    const buildTimeLabel = (createdAt?: string) => {
      if (!createdAt) {
        return 'Just now';
      }
      return new Date(createdAt).toLocaleString('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    const toNotification = (payload: any) => {
      const createdAt = payload?.createdAt || new Date().toISOString();
      const reporterName = payload?.reporterName || payload?.caller?.name || 'Unknown sender';
      const typeLabel = payload?.typeLabel || payload?.type || 'Emergency';
      const message = payload?.message || `${reporterName} sent a ${typeLabel} report`;
      const id = payload?.id || `${createdAt}-${reporterName}`;

      return {
        id: String(id),
        message,
        timeLabel: buildTimeLabel(createdAt),
        createdAt,
        hasPhoto: Boolean(payload?.hasPhoto || payload?.photoUrl),
        hasVideo: Boolean(payload?.hasVideo || payload?.videoUrl),
      };
    };

    const pushNotification = (payload: any) => {
      const nextNotification = toNotification(payload);
      let isDuplicate = false;

      setNotifications((current) => {
        isDuplicate = current.some((item) => item.id === nextNotification.id);
        const withoutDuplicate = current.filter((item) => item.id !== nextNotification.id);
        return [nextNotification, ...withoutDuplicate].slice(0, 20);
      });

      if (!isDuplicate && !showNotificationsRef.current) {
        setUnreadCount((current) => current + 1);
      }
    };

    const loadRecentNotifications = async () => {
      try {
        const { data } = await api.get('/emergency/reports?limit=8');
        if (!isMounted || !Array.isArray(data)) {
          return;
        }

        const initialNotifications = data.map((item: any) => toNotification(item));
        setNotifications(initialNotifications.slice(0, 8));
      } catch {
        // Ignore initial notification load errors to keep the top bar resilient.
      }
    };

    loadRecentNotifications();

    socket.on('notification:new', pushNotification);
    socket.on('report:public', pushNotification);
    socket.on('newEmergency', pushNotification);
    socket.on('emergency:new', pushNotification);

    return () => {
      isMounted = false;
      socket.off('notification:new', pushNotification);
      socket.off('report:public', pushNotification);
      socket.off('newEmergency', pushNotification);
      socket.off('emergency:new', pushNotification);
      websocketService.disconnect();
    };
  }, []);

  const bellCountLabel = useMemo(() => {
    if (unreadCount <= 0) {
      return '';
    }
    return unreadCount > 9 ? '9+' : String(unreadCount);
  }, [unreadCount]);

  const toggleNotifications = () => {
    setShowNotifications((current) => {
      const next = !current;
      if (next) {
        setUnreadCount(0);
      }
      return next;
    });
  };

  return (
    <header style={{ 
      height: '64px', 
      background: 'white', 
      borderBottom: '1px solid #e5e7eb', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      padding: '0 1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>
          {currentPage}
        </h2>
        <span style={{ fontSize: '0.875rem', color: '#6b7280', padding: '0.25rem 0.75rem', background: '#f3f4f6', borderRadius: '9999px' }}>
          {currentTime}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ position: 'relative' }}>
          <button 
            onClick={toggleNotifications}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              fontSize: '1.25rem',
              padding: '0.5rem',
              position: 'relative'
            }}
          >
            🔔
            {unreadCount > 0 && (
              <span style={{ 
                position: 'absolute', 
                top: '-2px', 
                right: '-2px', 
                minWidth: '16px',
                height: '16px', 
                background: '#ef4444', 
                borderRadius: '999px',
                color: '#fff',
                fontSize: '0.625rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 4px',
              }}>
                {bellCountLabel}
              </span>
            )}
          </button>

          {showNotifications && (
            <div style={{ 
              position: 'absolute', 
              top: '100%', 
              right: 0, 
              width: '320px', 
              background: 'white', 
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
              border: '1px solid #e5e7eb',
              zIndex: 100,
              marginTop: '0.5rem'
            }}>
              <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                <h3 style={{ fontWeight: '600', color: '#1f2937' }}>Notifications</h3>
              </div>
              <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      style={{ 
                        padding: '0.75rem 1rem', 
                        borderBottom: '1px solid #f3f4f6',
                        cursor: 'pointer'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#f9fafb'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                    >
                      <p style={{ fontSize: '0.875rem', color: '#1f2937', marginBottom: '0.25rem' }}>
                        {notif.message}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#9ca3af' }}>
                        <span>{notif.timeLabel}</span>
                        {notif.hasPhoto && <span style={{ color: '#1d4ed8', fontWeight: 600 }}>PHOTO</span>}
                        {notif.hasVideo && <span style={{ color: '#7c3aed', fontWeight: 600 }}>VIDEO</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div style={{ padding: '0.75rem', textAlign: 'center', borderTop: '1px solid #e5e7eb' }}>
                <button style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.875rem' }}>
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        <button style={{ 
          background: '#3b82f6', 
          border: 'none', 
          padding: '0.5rem 1rem', 
          borderRadius: '6px', 
          color: 'white',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span>➕</span> New Emergency
        </button>
      </div>
    </header>
  );
};

export default TopBar;
