import type { Emergency } from '../shared/types/emergency.types';
import { getEmergencyStatusMeta, getEmergencyTypeMeta } from '../shared/constants/emergencyTypes';

interface EmergencyDetailPanelProps {
  emergency: Emergency | null;
  onUpdateStatus?: (status: Emergency['status']) => void;
  updating?: boolean;
  onClose: () => void;
}

export const EmergencyDetailPanel: React.FC<EmergencyDetailPanelProps> = ({ emergency, onUpdateStatus, updating, onClose }) => {
  if (!emergency) return null;

  const statusMeta = getEmergencyStatusMeta(emergency.status);
  const typeMeta = getEmergencyTypeMeta(emergency.type);
  const nextStatus =
    emergency.status === 'pending'
      ? 'dispatched'
      : emergency.status === 'dispatched'
        ? 'arrived'
        : null;

  return (
    <div style={{ position: 'fixed', right: 0, top: 0, width: '400px', height: '100vh', background: 'white', borderLeft: '1px solid #e5e7eb', padding: '1.5rem', overflowY: 'auto', zIndex: 40 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Emergency Details</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Type</p>
          <p style={{ fontWeight: '600' }}>{emergency.typeIcon || typeMeta.icon} {emergency.typeLabel || typeMeta.label}</p>
        </div>

        <div>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Status</p>
          <span style={{ display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '9999px', background: `${statusMeta.color}20`, color: statusMeta.color, fontWeight: '600' }}>
            {statusMeta.label.toUpperCase()}
          </span>
        </div>

        <div>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Location</p>
          <p style={{ fontWeight: '600' }}>{emergency.location.address}</p>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{emergency.location.lat}, {emergency.location.lng}</p>
        </div>

        <div>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Caller</p>
          <p style={{ fontWeight: '600' }}>{emergency.caller.name}</p>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{emergency.caller.phone}</p>
          {emergency.caller.email && <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{emergency.caller.email}</p>}
        </div>

        <div>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Description</p>
          <p>{emergency.description}</p>
        </div>

        <div>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Reported</p>
          <p>{new Date(emergency.createdAt).toLocaleString()}</p>
        </div>

        {emergency.photoUrl && (
          <div>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Photo Evidence</p>
            <img src={emergency.photoUrl} alt={emergency.title} style={{ width: '100%', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
          </div>
        )}

        {emergency.videoUrl && (
          <div>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Video Evidence</p>
            <video src={emergency.videoUrl} controls style={{ width: '100%', borderRadius: '8px' }} />
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          {nextStatus && (
            <button
              onClick={() => onUpdateStatus?.(nextStatus)}
              disabled={updating}
              style={{ flex: 1, padding: '0.75rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: updating ? 'not-allowed' : 'pointer', fontWeight: '600', opacity: updating ? 0.7 : 1 }}
            >
              {updating ? 'Updating...' : nextStatus === 'dispatched' ? 'Mark Dispatched' : 'Mark Arrived'}
            </button>
          )}
          {emergency.status !== 'resolved' && emergency.status !== 'cancelled' && (
            <button
              onClick={() => onUpdateStatus?.('resolved')}
              disabled={updating}
              style={{ padding: '0.75rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: updating ? 'not-allowed' : 'pointer', opacity: updating ? 0.7 : 1 }}
            >
              ✓ Resolve
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmergencyDetailPanel;
