import { useEffect, useMemo, useState } from 'react';
import { EmergencyCard } from './EmergencyCard';
import { EmergencyDetailPanel } from './EmergencyDetailPanel';
import { ExportMenu } from '../ui/ExportMenu';
import { exportService } from '../services/exportService';
import emergencyService, { normalizeEmergency } from '../services/emergencyService';
import type { Emergency } from '../shared/types/emergency.types';
import websocketService from '../services/websocketService';

type FilterValue = 'all' | 'pending' | 'active' | 'resolved';

export const EmergencyListPage = () => {
  const [selectedEmergency, setSelectedEmergency] = useState<Emergency | null>(null);
  const [filter, setFilter] = useState<FilterValue>('all');
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const loadEmergencies = async () => {
      setLoading(true);
      setError('');
      try {
        const items = await emergencyService.getAll();
        setEmergencies(items);
      } catch (loadError: any) {
        setError(loadError?.response?.data?.error || 'Failed to load emergency reports.');
      } finally {
        setLoading(false);
      }
    };

    loadEmergencies();
  }, []);

  useEffect(() => {
    const socket = websocketService.connect(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000');
    socket.emit('join:admin');

    const upsertEmergency = (payload: unknown) => {
      const nextEmergency = normalizeEmergency(payload as Emergency);
      setEmergencies((current) => {
        const existingIndex = current.findIndex((item) => item.id === nextEmergency.id);
        if (existingIndex === -1) {
          return [nextEmergency, ...current];
        }

        const updated = [...current];
        updated[existingIndex] = nextEmergency;
        return updated.sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
      });
      setSelectedEmergency((current) => (current?.id === nextEmergency.id ? nextEmergency : current));
    };

    socket.on('newEmergency', upsertEmergency);
    socket.on('emergencyUpdate', upsertEmergency);
    socket.on('emergency:new', upsertEmergency);
    socket.on('emergency:update', upsertEmergency);

    return () => {
      socket.off('newEmergency', upsertEmergency);
      socket.off('emergencyUpdate', upsertEmergency);
      socket.off('emergency:new', upsertEmergency);
      socket.off('emergency:update', upsertEmergency);
      websocketService.disconnect();
    };
  }, []);

  const filteredEmergencies = useMemo(() => {
    if (filter === 'all') {
      return emergencies;
    }

    if (filter === 'active') {
      return emergencies.filter((item) => ['pending', 'dispatched', 'arrived'].includes(item.status));
    }

    return emergencies.filter((item) => item.status === filter);
  }, [emergencies, filter]);

  const exportData = exportService.exportEmergencies(filteredEmergencies);

  const handleUpdateStatus = async (status: Emergency['status']) => {
    if (!selectedEmergency) {
      return;
    }

    setUpdatingStatus(true);
    setError('');
    try {
      const updated = await emergencyService.updateStatus(selectedEmergency.id, status);
      setEmergencies((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setSelectedEmergency(updated);
    } catch (updateError: any) {
      setError(updateError?.response?.data?.error || 'Failed to update emergency status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Emergency Reports</h1>
          <p style={{ margin: '0.25rem 0 0', color: '#6b7280', fontSize: '0.875rem' }}>
            Live reports from mobile users with sender, date, location, photo, and video evidence.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.25rem', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '0.25rem', background: 'white' }}>
            <button onClick={() => setFilter('all')} style={{ padding: '0.375rem 0.75rem', border: 'none', borderRadius: '4px', background: filter === 'all' ? '#111827' : 'transparent', color: filter === 'all' ? 'white' : '#374151', cursor: 'pointer', fontSize: '0.8125rem' }}>All</button>
            <button onClick={() => setFilter('pending')} style={{ padding: '0.375rem 0.75rem', border: 'none', borderRadius: '4px', background: filter === 'pending' ? '#f59e0b' : 'transparent', color: filter === 'pending' ? 'white' : '#374151', cursor: 'pointer', fontSize: '0.8125rem' }}>Pending</button>
            <button onClick={() => setFilter('active')} style={{ padding: '0.375rem 0.75rem', border: 'none', borderRadius: '4px', background: filter === 'active' ? '#2563eb' : 'transparent', color: filter === 'active' ? 'white' : '#374151', cursor: 'pointer', fontSize: '0.8125rem' }}>Active</button>
            <button onClick={() => setFilter('resolved')} style={{ padding: '0.375rem 0.75rem', border: 'none', borderRadius: '4px', background: filter === 'resolved' ? '#10b981' : 'transparent', color: filter === 'resolved' ? 'white' : '#374151', cursor: 'pointer', fontSize: '0.8125rem' }}>Resolved</button>
          </div>
          <ExportMenu data={exportData} />
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: '1rem', padding: '0.875rem 1rem', borderRadius: '8px', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '2rem', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', color: '#6b7280' }}>
          Loading emergency reports...
        </div>
      ) : filteredEmergencies.length === 0 ? (
        <div style={{ padding: '2rem', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', color: '#6b7280' }}>
          No emergency reports found for this filter.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {filteredEmergencies.map((emergency) => (
            <EmergencyCard key={emergency.id} emergency={emergency} onClick={() => setSelectedEmergency(emergency)} />
          ))}
        </div>
      )}

      {selectedEmergency && (
        <EmergencyDetailPanel
          emergency={selectedEmergency}
          updating={updatingStatus}
          onUpdateStatus={handleUpdateStatus}
          onClose={() => setSelectedEmergency(null)}
        />
      )}
    </div>
  );
};

export default EmergencyListPage;
