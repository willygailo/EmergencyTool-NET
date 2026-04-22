import { useEffect, useState, type CSSProperties } from 'react';
import api from '../services/api';
import type { User } from '../shared/types/user.types';
import websocketService from '../services/websocketService';

export const UserManagementPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadUsers = async () => {
      try {
        setLoading(true);
        setError('');
        const { data } = await api.get<User[]>('/users');

        if (isMounted) {
          setUsers(data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.response?.data?.error || 'Failed to load users');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const socket = websocketService.connect(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000');
    socket.emit('join:admin');

    const upsertUser = (incomingUser: User) => {
      setUsers((currentUsers) => {
        const normalizedIncoming = {
          ...incomingUser,
          name:
            incomingUser.name ||
            `${incomingUser.firstName || ''} ${incomingUser.lastName || ''}`.trim() ||
            incomingUser.email,
          passwordStatus: incomingUser.passwordStatus || 'Secured',
        };

        const existingIndex = currentUsers.findIndex((user) => user.id === normalizedIncoming.id);
        if (existingIndex === -1) {
          return [normalizedIncoming, ...currentUsers];
        }

        const updatedUsers = [...currentUsers];
        updatedUsers[existingIndex] = { ...updatedUsers[existingIndex], ...normalizedIncoming };
        return updatedUsers;
      });
    };

    socket.on('user:login', upsertUser);

    return () => {
      socket.off('user:login', upsertUser);
      websocketService.disconnect();
    };
  }, []);

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>User Management</h1>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Registered mobile users are saved in the backend and listed here for admin review.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={cardStyle}>
          <p style={labelStyle}>Total Users</p>
          <p style={valueStyle}>{users.length}</p>
        </div>
        <div style={cardStyle}>
          <p style={labelStyle}>With Phone</p>
          <p style={valueStyle}>{users.filter((user) => !!user.phone).length}</p>
        </div>
        <div style={cardStyle}>
          <p style={labelStyle}>Latest Signup</p>
          <p style={valueStyleSmall}>
            {users[0]?.createdAt ? new Date(users[0].createdAt).toLocaleDateString() : 'No data'}
          </p>
        </div>
      </div>

      <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
        <div
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Registered Accounts</h2>
            <p style={{ margin: '0.35rem 0 0', color: '#6b7280', fontSize: '0.875rem' }}>
              Passwords stay securely hashed in the backend and are not exposed in admin tools.
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '1.5rem', color: '#6b7280' }}>Loading users...</div>
        ) : error ? (
          <div style={{ padding: '1.5rem', color: '#b91c1c', background: '#fef2f2' }}>{error}</div>
        ) : users.length === 0 ? (
          <div style={{ padding: '1.5rem', color: '#6b7280' }}>No registered users found yet.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                  {['Name', 'Email', 'Phone', 'Barangay', 'Role', 'Password', 'Created', 'Last Login'].map((heading) => (
                    <th
                      key={heading}
                      style={{
                        padding: '0.875rem 1rem',
                        fontSize: '0.8rem',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        color: '#64748b',
                        borderBottom: '1px solid #e5e7eb',
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={cellStyle}>
                      <div style={{ fontWeight: 600, color: '#111827' }}>{user.name || 'Unnamed user'}</div>
                      <div style={{ color: '#6b7280', fontSize: '0.8125rem' }}>ID: {user.id.slice(0, 8)}</div>
                    </td>
                    <td style={cellStyle}>{user.email}</td>
                    <td style={cellStyle}>{user.phone || 'Not provided'}</td>
                    <td style={cellStyle}>{user.barangay || 'Not provided'}</td>
                    <td style={cellStyle}>
                      <span
                        style={{
                          display: 'inline-flex',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '999px',
                          background: '#eff6ff',
                          color: '#1d4ed8',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'capitalize',
                        }}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td style={cellStyle}>{user.passwordStatus || 'Secured'}</td>
                    <td style={cellStyle}>
                      {user.createdAt ? new Date(user.createdAt).toLocaleString() : 'Unknown'}
                    </td>
                    <td style={cellStyle}>
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const cardStyle: CSSProperties = {
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '14px',
  padding: '1rem 1.25rem',
  boxShadow: '0 8px 30px rgba(15, 23, 42, 0.04)',
};

const labelStyle: CSSProperties = {
  margin: 0,
  fontSize: '0.8rem',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: '#64748b',
};

const valueStyle: CSSProperties = {
  margin: '0.5rem 0 0',
  fontSize: '1.8rem',
  fontWeight: 800,
  color: '#111827',
};

const valueStyleSmall: CSSProperties = {
  margin: '0.5rem 0 0',
  fontSize: '1rem',
  fontWeight: 700,
  color: '#111827',
};

const cellStyle: CSSProperties = {
  padding: '0.95rem 1rem',
  fontSize: '0.9rem',
  color: '#374151',
  verticalAlign: 'top',
};

export default UserManagementPage;
