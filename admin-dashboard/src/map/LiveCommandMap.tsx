import { useState } from 'react';
import { EmergencyPinLayer } from './EmergencyPinLayer';
import { ResponderPinLayer } from './ResponderPinLayer';

interface EmergencyPin {
  id: string;
  lat: number;
  lng: number;
  type: string;
  status: string;
}

interface ResponderPin {
  id: string;
  lat: number;
  lng: number;
  name: string;
  status: string;
}

export const LiveCommandMap = () => {
  const [center] = useState<[number, number]>([6.5014, 124.8372]);
  const [zoom] = useState(14);
  const [emergencies] = useState<EmergencyPin[]>([
    { id: '1', lat: 6.5014, lng: 124.8372, type: 'fire', status: 'in_progress' },
    { id: '2', lat: 6.5021, lng: 124.8391, type: 'medical', status: 'pending' },
    { id: '3', lat: 6.4987, lng: 124.8412, type: 'disaster', status: 'acknowledged' },
  ]);
  const [responders] = useState<ResponderPin[]>([
    { id: '1', lat: 6.5005, lng: 124.8380, name: 'Engine 1 - BFP', status: 'en_route' },
    { id: '2', lat: 6.5030, lng: 124.8365, name: 'Ambulance 1 - MDRRMO', status: 'available' },
    { id: '3', lat: 6.4998, lng: 124.8405, name: 'Patrol Car - PNP', status: 'on_scene' },
  ]);

  return (
    <div style={{ width: '100%', height: '100%', background: '#e5e5e5', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ fontSize: '4rem' }}>🗺️</div>
        <p style={{ color: '#6b7280' }}>Interactive Map Loading...</p>
        <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Center: {center[0]}, {center[1]} | Zoom: {zoom}</p>
        
        <div style={{ marginTop: '1rem', display: 'flex', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
            <span style={{ fontSize: '0.875rem' }}>Emergencies: {emergencies.length}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#3b82f6' }} />
            <span style={{ fontSize: '0.875rem' }}>Responders: {responders.length}</span>
          </div>
        </div>
      </div>
      
      <EmergencyPinLayer emergencies={emergencies} />
      <ResponderPinLayer responders={responders} />
    </div>
  );
};

export default LiveCommandMap;