import { useState } from 'react';
import { exportService } from '../services/exportService';

interface Broadcast {
  id: string;
  title: string;
  message: string;
  barangay: string;
  type: 'alert' | 'info' | 'warning';
  status: 'sent' | 'draft' | 'scheduled';
  sentAt: string;
  recipients: number;
}

export const BroadcastPage = () => {
  const [selectedBarangay, setSelectedBarangay] = useState('all');
  const [showNewBroadcast, setShowNewBroadcast] = useState(false);

  const broadcasts: Broadcast[] = [
    { id: '1', title: 'Flash Flood Warning', message: 'Flash flooding expected in low-lying areas', barangay: 'All', type: 'warning', status: 'sent', sentAt: '2024-01-21 14:30', recipients: 2500 },
    { id: '2', title: 'Evacuation Order', message: 'Immediate evacuation for Zone 4 residents', barangay: 'Zone 4', type: 'alert', status: 'sent', sentAt: '2024-01-21 13:00', recipients: 450 },
    { id: '3', title: 'Medical Camp Schedule', message: 'Free medical checkups tomorrow', barangay: 'Poblacion', type: 'info', status: 'sent', sentAt: '2024-01-20 09:00', recipients: 320 },
    { id: '4', title: 'Storm Advisory', message: 'Heavy rain expected this afternoon', barangay: 'All', type: 'warning', status: 'scheduled', sentAt: '2024-01-22 08:00', recipients: 2500 },
  ];

  const filteredBroadcasts = selectedBarangay === 'all' 
    ? broadcasts 
    : broadcasts.filter(b => b.barangay === selectedBarangay || b.barangay === 'All');

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      alert: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
    };
    return colors[type] || '#6b7280';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      sent: '#10b981',
      draft: '#6b7280',
      scheduled: '#f59e0b',
    };
    return colors[status] || '#6b7280';
  };

  const handleExport = () => {
    const data = exportService.exportEmergencies(broadcasts.map(b => ({ ...b, location: { address: b.barangay } })));
    exportService.toCSV(data);
  };

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Broadcasts</h1>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0' }}>Send alerts and announcements to residents</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={handleExport}
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
            📥 Export
          </button>
          <button 
            onClick={() => setShowNewBroadcast(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            ➕ New Broadcast
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '1.25rem', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6', margin: 0 }}>{broadcasts.length}</p>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0' }}>Total Broadcasts</p>
        </div>
        <div style={{ padding: '1.25rem', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981', margin: 0 }}>{broadcasts.filter(b => b.status === 'sent').length}</p>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0' }}>Sent</p>
        </div>
        <div style={{ padding: '1.25rem', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b', margin: 0 }}>{broadcasts.filter(b => b.status === 'scheduled').length}</p>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0' }}>Scheduled</p>
        </div>
        <div style={{ padding: '1.25rem', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444', margin: 0 }}>{broadcasts.reduce((sum, b) => sum + b.recipients, 0).toLocaleString()}</p>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0' }}>Total Recipients</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {['all', 'All', 'Poblacion', 'Zone 4', 'Mabini'].map((barangay) => (
          <button
            key={barangay}
            onClick={() => setSelectedBarangay(barangay)}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              background: selectedBarangay === barangay ? '#3b82f6' : 'white',
              color: selectedBarangay === barangay ? 'white' : '#374151',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            {barangay}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
        {filteredBroadcasts.map((broadcast) => (
          <div 
            key={broadcast.id} 
            style={{ 
              padding: '1.25rem', 
              background: 'white', 
              borderRadius: '8px', 
              border: '1px solid #e5e7eb',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '4px', 
                  fontSize: '0.75rem', 
                  fontWeight: '500',
                  background: `${getTypeColor(broadcast.type)}15`,
                  color: getTypeColor(broadcast.type),
                  textTransform: 'uppercase'
                }}>
                  {broadcast.type}
                </span>
                <span style={{ fontSize: '0.8125rem', color: '#6b7280' }}>{broadcast.barangay}</span>
              </div>
              <span style={{ 
                padding: '0.25rem 0.5rem', 
                borderRadius: '4px', 
                fontSize: '0.75rem', 
                fontWeight: '500',
                background: `${getStatusColor(broadcast.status)}15`,
                color: getStatusColor(broadcast.status),
                textTransform: 'capitalize'
              }}>
                {broadcast.status}
              </span>
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: '0 0 0.5rem' }}>{broadcast.title}</h3>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.75rem' }}>{broadcast.message}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid #f3f4f6' }}>
              <span style={{ fontSize: '0.8125rem', color: '#6b7280' }}>📅 {broadcast.sentAt}</span>
              <span style={{ fontSize: '0.8125rem', color: '#6b7280' }}>👥 {broadcast.recipients.toLocaleString()} recipients</span>
            </div>
          </div>
        ))}
      </div>

      {showNewBroadcast && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            width: '500px',
            maxWidth: '90%',
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '0 0 1rem' }}>New Broadcast</h2>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Title</label>
              <input 
                type="text" 
                placeholder="Enter broadcast title"
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '0.9375rem',
                }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Message</label>
              <textarea 
                placeholder="Enter your message"
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '0.9375rem',
                  resize: 'vertical',
                }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Barangay</label>
              <select style={{
                width: '100%',
                padding: '0.625rem',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '0.9375rem',
              }}>
                <option value="all">All Barangays</option>
                <option value="poblacion">Poblacion</option>
                <option value="mabini">Mabini</option>
                <option value="zone4">Zone 4</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowNewBroadcast(false)}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                Cancel
              </button>
              <button 
                style={{
                  padding: '0.5rem 1rem',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Send Broadcast
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BroadcastPage;