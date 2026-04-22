const hotspots = [
  { barangay: 'Poblacion', severity: 'high', incidents: 18, lastAlert: '10 mins ago' },
  { barangay: 'Zone 4', severity: 'high', incidents: 14, lastAlert: '22 mins ago' },
  { barangay: 'Mabini', severity: 'medium', incidents: 9, lastAlert: '1 hour ago' },
  { barangay: 'Cabad', severity: 'low', incidents: 4, lastAlert: '3 hours ago' },
];

const getSeverityColor = (severity: string) => {
  const colors: Record<string, string> = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#10b981',
  };
  return colors[severity] || '#6b7280';
};

export const HeatMapPage = () => {
  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem' }}>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>High Risk Zones</p>
          <p style={{ margin: '0.25rem 0 0', fontSize: '1.75rem', fontWeight: 700, color: '#ef4444' }}>2</p>
        </div>
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem' }}>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>Total Incidents (24h)</p>
          <p style={{ margin: '0.25rem 0 0', fontSize: '1.75rem', fontWeight: 700, color: '#3b82f6' }}>45</p>
        </div>
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem' }}>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>Avg Response Time</p>
          <p style={{ margin: '0.25rem 0 0', fontSize: '1.75rem', fontWeight: 700, color: '#10b981' }}>9 min</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem' }}>
          <h2 style={{ margin: '0 0 0.75rem', fontSize: '1.125rem' }}>Incident Density Map</h2>
          <div
            style={{
              height: '420px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              background:
                'radial-gradient(circle at 26% 30%, rgba(239,68,68,.45) 0 14%, transparent 15%), radial-gradient(circle at 48% 45%, rgba(245,158,11,.4) 0 15%, transparent 16%), radial-gradient(circle at 68% 33%, rgba(239,68,68,.5) 0 12%, transparent 13%), radial-gradient(circle at 58% 70%, rgba(16,185,129,.35) 0 10%, transparent 11%), linear-gradient(180deg, #f8fafc, #eef2ff)',
              position: 'relative',
            }}
          >
            <div style={{ position: 'absolute', right: '0.75rem', top: '0.75rem', background: 'white', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '0.5rem', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                High
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.3rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
                Medium
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.3rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                Low
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem' }}>
          <h2 style={{ margin: '0 0 0.75rem', fontSize: '1.125rem' }}>Hotspot List</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {hotspots.map((zone) => (
              <div key={zone.barangay} style={{ border: '1px solid #f1f5f9', borderRadius: '8px', padding: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ margin: 0, fontWeight: 600 }}>{zone.barangay}</p>
                  <span
                    style={{
                      background: `${getSeverityColor(zone.severity)}20`,
                      color: getSeverityColor(zone.severity),
                      padding: '0.2rem 0.5rem',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'capitalize',
                    }}
                  >
                    {zone.severity}
                  </span>
                </div>
                <p style={{ margin: '0.45rem 0 0', fontSize: '0.875rem', color: '#334155' }}>{zone.incidents} incidents</p>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>Last alert: {zone.lastAlert}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatMapPage;
