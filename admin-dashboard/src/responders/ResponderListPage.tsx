import { useState } from 'react';
import { ExportMenu } from '../ui/ExportMenu';
import { exportService } from '../services/exportService';

interface Responder {
  id: string;
  name: string;
  agency: string;
  status: 'available' | 'on_duty' | 'off_duty' | 'busy';
  phone: string;
  barangay: string;
  lastActive: string;
}

export const ResponderListPage = () => {
  const [filter, setFilter] = useState('all');

  const responders: Responder[] = [
    { id: '1', name: 'John Doe', agency: 'BFP', status: 'on_duty', phone: '09123456789', barangay: 'Poblacion', lastActive: 'Active now' },
    { id: '2', name: 'Maria Santos', agency: 'RHU', status: 'available', phone: '09198765432', barangay: 'Mabini', lastActive: 'Active now' },
    { id: '3', name: 'Pedro Garcia', agency: 'PNP', status: 'busy', phone: '09155667788', barangay: 'Zone 4', lastActive: '5 min ago' },
    { id: '4', name: 'Ana Reyes', agency: 'CDRRMC', status: 'on_duty', phone: '09122334455', barangay: 'Cabad', lastActive: 'Active now' },
    { id: '5', name: 'Carlos Mendoza', agency: 'BFP', status: 'off_duty', phone: '09111222333', barangay: 'Poblacion', lastActive: '2 hours ago' },
  ];

  const filteredResponders = filter === 'all' 
    ? responders 
    : responders.filter(r => r.status === filter);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      available: '#10b981',
      on_duty: '#3b82f6',
      off_duty: '#6b7280',
      busy: '#f59e0b',
    };
    return colors[status] || '#6b7280';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      available: 'Available',
      on_duty: 'On Duty',
      off_duty: 'Off Duty',
      busy: 'Busy',
    };
    return labels[status] || status;
  };

  const exportData = exportService.exportResponders(responders);

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Responders</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <ExportMenu data={exportData} label="Export Responders" />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {['all', 'available', 'on_duty', 'busy', 'off_duty'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              background: filter === status ? '#3b82f6' : 'white',
              color: filter === status ? 'white' : '#374151',
              cursor: 'pointer',
              fontSize: '0.875rem',
              textTransform: 'capitalize',
            }}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Name</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Agency</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Phone</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Barangay</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Last Active</th>
            </tr>
          </thead>
          <tbody>
            {filteredResponders.map((responder) => (
              <tr key={responder.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '0.75rem 1rem', fontWeight: '500' }}>{responder.name}</td>
                <td style={{ padding: '0.75rem 1rem' }}>{responder.agency}</td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    background: `${getStatusColor(responder.status)}15`,
                    color: getStatusColor(responder.status),
                  }}>
                    {getStatusLabel(responder.status)}
                  </span>
                </td>
                <td style={{ padding: '0.75rem 1rem', color: '#6b7280' }}>{responder.phone}</td>
                <td style={{ padding: '0.75rem 1rem' }}>{responder.barangay}</td>
                <td style={{ padding: '0.75rem 1rem', color: '#6b7280', fontSize: '0.875rem' }}>{responder.lastActive}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '1rem', textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' }}>
        Showing {filteredResponders.length} of {responders.length} responders
      </div>
    </div>
  );
};

export default ResponderListPage;