interface EmergencyPin {
  id: string;
  lat: number;
  lng: number;
  type: string;
  status: string;
}

interface EmergencyPinLayerProps {
  emergencies: EmergencyPin[];
}

export const EmergencyPinLayer: React.FC<EmergencyPinLayerProps> = ({ emergencies }) => {
  const getPinColor = (type: string) => {
    const colors: Record<string, string> = {
      fire: '#ef4444',
      medical: '#3b82f6',
      disaster: '#f59e0b',
      crime: '#8b5cf6',
    };
    return colors[type] || '#6b7280';
  };

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
      {emergencies.map((emergency) => (
        <div
          key={emergency.id}
          style={{
            position: 'absolute',
            left: `${(emergency.lng - 124.83) * 10000 + 50}%`,
            top: `${(6.51 - emergency.lat) * 10000 + 50}%`,
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: getPinColor(emergency.type),
            border: '2px solid white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
          }}
        >
          ⚠️
        </div>
      ))}
    </div>
  );
};

export default EmergencyPinLayer;