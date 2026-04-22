import { LiveCommandMap } from '../map/LiveCommandMap';
import { MapControls } from '../map/MapControls';
import { ColorCodedLegend } from '../map/ColorCodedLegend';

export const LiveMapPage = () => {
  return (
    <div style={{ height: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '1rem 1.5rem', background: 'white', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Live Map</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <ColorCodedLegend />
        </div>
      </div>
      <div style={{ flex: 1, position: 'relative' }}>
        <LiveCommandMap />
        <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10 }}>
          <MapControls />
        </div>
      </div>
    </div>
  );
};

export default LiveMapPage;