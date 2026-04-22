import type { Emergency } from '../shared/types/emergency.types';
import { getEmergencyStatusMeta, getEmergencyTypeMeta } from '../shared/constants/emergencyTypes';

interface EmergencyCardProps {
  emergency: Emergency;
  onClick?: () => void;
}

export const EmergencyCard: React.FC<EmergencyCardProps> = ({ emergency, onClick }) => {
  const statusMeta = getEmergencyStatusMeta(emergency.status);
  const typeMeta = getEmergencyTypeMeta(emergency.type);

  return (
    <div 
      onClick={onClick}
      style={{ 
        padding: '1rem', 
        border: '1px solid #e5e7eb', 
        borderRadius: '8px', 
        cursor: onClick ? 'pointer' : 'default',
        background: 'white',
        transition: 'box-shadow 0.2s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '1.5rem' }}>{emergency.typeIcon || typeMeta.icon}</span>
        <span style={{ 
          display: 'inline-block', 
          padding: '0.25rem 0.5rem', 
          borderRadius: '9999px', 
          fontSize: '0.75rem',
          fontWeight: '600',
          background: `${statusMeta.color}20`, 
          color: statusMeta.color 
        }}>
          {statusMeta.label}
        </span>
      </div>
      <h3 style={{ fontWeight: '600', fontSize: '1rem', marginBottom: '0.5rem' }}>{emergency.title}</h3>
      <p style={{ fontSize: '0.8125rem', color: typeMeta.color, fontWeight: '600', marginBottom: '0.5rem' }}>
        {emergency.typeLabel}
      </p>
      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem' }}>{emergency.location.address}</p>
      <p style={{ fontSize: '0.8125rem', color: '#4b5563', marginBottom: '0.75rem' }}>
        {emergency.photoUrl ? '📷 Photo' : ''}{emergency.photoUrl && emergency.videoUrl ? ' • ' : ''}{emergency.videoUrl ? '🎥 Video' : 'No media yet'}
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#9ca3af' }}>
        <span>{emergency.caller.name}</span>
        <span>{new Date(emergency.createdAt).toLocaleString()}</span>
      </div>
    </div>
  );
};

export default EmergencyCard;
