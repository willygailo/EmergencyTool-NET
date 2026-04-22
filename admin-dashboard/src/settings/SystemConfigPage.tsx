export const SystemConfigPage = () => {
  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>System Configuration</h1>
      <div style={{ display: 'grid', gap: '1rem' }}>
        <div style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
          <h2 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Configuration</h2>
          <p style={{ color: '#6b7280' }}>System settings and preferences</p>
        </div>
      </div>
    </div>
  );
};

export default SystemConfigPage;