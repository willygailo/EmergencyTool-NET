import { useState } from 'react';
import { useAppDispatch } from '../hooks/useRedux';
import { setCredentials } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import type { User } from '../shared/types/user.types';

export const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const normalizeDashboardUser = (user: any, fallbackEmail: string): User => {
    const firstName = user?.firstName || user?.first_name || '';
    const lastName = user?.lastName || user?.last_name || '';
    const nameFromParts = `${firstName} ${lastName}`.trim();

    return {
      id: user?.id || 'unknown',
      name: user?.name || nameFromParts || fallbackEmail,
      email: user?.email || fallbackEmail,
      role: user?.role || 'user',
      phone: user?.phone || '',
      barangay: user?.barangay || '',
      firstName,
      lastName,
      createdAt: user?.createdAt || user?.created_at || undefined,
      updatedAt: user?.updatedAt || user?.updated_at || undefined,
      lastLoginAt: user?.lastLoginAt || user?.last_login_at || undefined,
      passwordStatus: user?.passwordStatus || 'Secured',
    };
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const normalizedUser = normalizeDashboardUser(data?.user, email);
      const allowedRoles = ['admin', 'barangay_admin', 'responder'];

      if (!allowedRoles.includes(normalizedUser.role)) {
        setError('This account has no admin dashboard access.');
        return;
      }

      dispatch(setCredentials({ user: normalizedUser, token: data.token }));
      localStorage.setItem('token', data.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' 
    }}>
      <div style={{ 
        background: 'white', 
        padding: '2.5rem', 
        borderRadius: '12px', 
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', 
        width: '100%', 
        maxWidth: '420px' 
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444', marginBottom: '0.5rem' }}>
            🚨 EmergencyTool-NET
          </h1>
          <p style={{ color: '#6b7280' }}>Admin Dashboard Login</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@emergencytool.com"
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                border: '1px solid #d1d5db', 
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                border: '1px solid #d1d5db', 
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {error && (
            <div style={{ 
              padding: '0.75rem', 
              background: '#fef2f2', 
              border: '1px solid #fecaca', 
              borderRadius: '8px', 
              color: '#dc2626',
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '0.875rem', 
              background: loading ? '#9ca3af' : '#ef4444', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: loading ? 'not-allowed' : 'pointer', 
              fontSize: '1rem', 
              fontWeight: '600',
              transition: 'background 0.2s'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Use your real admin account credentials.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
