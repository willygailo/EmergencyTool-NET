interface ResponderPin {
  id: string;
  lat: number;
  lng: number;
  name: string;
  status: string;
}

interface ResponderPinLayerProps {
  responders: ResponderPin[];
}

export const ResponderPinLayer: React.FC<ResponderPinLayerProps> = ({ responders }) => {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      available: '#10b981',
      en_route: '#3b82f6',
      on_scene: '#f59e0b',
      offline: '#6b7280',
    };
    return colors[status] || '#6b7280';
  };

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
      {responders.map((responder) => (
        <div
          key={responder.id}
          style={{
            position: 'absolute',
            left: `${(responder.lng - 124.83) * 10000 + 50}%`,
            top: `${(6.51 - responder.lat) * 10000 + 50}%`,
            width: 20,
            height: 20,
            borderRadius: '4px',
            background: getStatusColor(responder.status),
            border: '2px solid white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.625rem',
          }}
          title={`${responder.name} - ${responder.status}`}
        >
          🚒
        </div>
      ))}
    </div>
  );
};

export default ResponderPinLayer;