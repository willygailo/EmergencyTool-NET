import { useState } from 'react';
import toast from 'react-hot-toast';

export const AdminSettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'system', label: 'System', icon: '🖥️' },
  ];

  return (
    <div style={{ padding: '1.5rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Settings</h1>

      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <div style={{ width: '220px', flexShrink: 0 }}>
          <nav style={{ background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '0.5rem' }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: activeTab === tab.id ? '#eff6ff' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: activeTab === tab.id ? '500' : '400',
                  color: activeTab === tab.id ? '#3b82f6' : '#374151',
                  textAlign: 'left',
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div style={{ flex: 1 }}>
          {activeTab === 'general' && (
            <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '600', margin: '0 0 1.5rem' }}>General Settings</h2>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Organization Name</label>
                <input 
                  type="text" 
                  defaultValue="EmergencyTool - Koronadal City"
                  style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: '0.625rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '0.9375rem',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Time Zone</label>
                <select 
                  style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: '0.625rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '0.9375rem',
                  }}
                >
                  <option>Asia/Manila (PHT)</option>
                  <option>UTC</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Date Format</label>
                <select 
                  style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: '0.625rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '0.9375rem',
                  }}
                >
                  <option>MM/DD/YYYY</option>
                  <option>DD/MM/YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
              </div>

              <button 
                onClick={() => toast.success('Settings saved successfully!')}
                style={{
                  padding: '0.625rem 1.25rem',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Save Changes
              </button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '600', margin: '0 0 1.5rem' }}>Notification Settings</h2>
              
              {[
                { label: 'New Emergency Alerts', description: 'Get notified when new emergencies are reported' },
                { label: 'Responder Status Changes', description: 'Updates on responder availability' },
                { label: 'System Alerts', description: 'Important system notifications and warnings' },
                { label: 'Daily Summary', description: 'Receive daily incident summary via email' },
              ].map((item, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid #f3f4f6' }}>
                  <div>
                    <p style={{ fontWeight: '500', margin: 0 }}>{item.label}</p>
                    <p style={{ fontSize: '0.8125rem', color: '#6b7280', margin: '0.25rem 0 0' }}>{item.description}</p>
                  </div>
                  <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '24px' }}>
                    <input type="checkbox" defaultChecked style={{ opacity: 0, width: 0, height: 0 }} />
                    <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, background: '#3b82f6', borderRadius: '24px', transition: '0.3s' }}></span>
                  </label>
                </div>
              ))}

              <button 
                onClick={() => toast.success('Preferences updated!')}
                style={{
                  marginTop: '1rem',
                  padding: '0.625rem 1.25rem',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Save Preferences
              </button>
            </div>
          )}

          {activeTab === 'security' && (
            <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '600', margin: '0 0 1.5rem' }}>Security Settings</h2>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Two-Factor Authentication</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '24px' }}>
                    <input type="checkbox" defaultChecked style={{ opacity: 0, width: 0, height: 0 }} />
                    <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, background: '#3b82f6', borderRadius: '24px', transition: '0.3s' }}></span>
                  </label>
                  <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Enabled</span>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Session Timeout</label>
                <select 
                  style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: '0.625rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '0.9375rem',
                  }}
                >
                  <option>30 minutes</option>
                  <option>1 hour</option>
                  <option>2 hours</option>
                  <option>4 hours</option>
                </select>
              </div>

              <button 
                onClick={() => toast.success('Security settings updated!')}
                style={{
                  padding: '0.625rem 1.25rem',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Update Security Settings
              </button>
            </div>
          )}

          {activeTab === 'system' && (
            <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '600', margin: '0 0 1.5rem' }}>System Information</h2>
              
              <div style={{ display: 'grid', gap: '1rem' }}>
                {[
                  { label: 'Version', value: '1.0.0' },
                  { label: 'API Status', value: '🟢 Online' },
                  { label: 'Database', value: '🟢 Connected' },
                  { label: 'Last Backup', value: '2024-01-21 00:00' },
                  { label: 'Uptime', value: '99.9%' },
                ].map((item, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f9fafb', borderRadius: '6px' }}>
                    <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>{item.label}</span>
                    <span style={{ fontWeight: '500', fontSize: '0.875rem' }}>{item.value}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => toast.success('Cache cleared successfully!')}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  🔄 Clear Cache
                </button>
                <button 
                  onClick={() => toast.success('System data cleared!')}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  🗑️ Clear Data
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;