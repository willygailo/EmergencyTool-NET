import { useState } from 'react';
import { EmergencyTypeChart } from './EmergencyTypeChart';
import { ResponseTimeChart } from './ResponseTimeChart';
import { MonthlyDisasterReport } from './MonthlyDisasterReport';
import { ExportButton } from './ExportButton';

export const DisasterStatisticsPage = () => {
  const [dateRange, setDateRange] = useState('month');

  const stats = {
    totalEmergencies: 156,
    fire: 45,
    medical: 38,
    disaster: 52,
    crime: 21,
    avgResponseTime: '12 mins',
  };

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Disaster Statistics</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            style={{ padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '6px' }}
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <ExportButton />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ padding: '1.5rem', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Total</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalEmergencies}</p>
        </div>
        <div style={{ padding: '1.5rem', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>🔥 Fire</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>{stats.fire}</p>
        </div>
        <div style={{ padding: '1.5rem', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>🏥 Medical</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>{stats.medical}</p>
        </div>
        <div style={{ padding: '1.5rem', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>🌊 Disaster</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{stats.disaster}</p>
        </div>
        <div style={{ padding: '1.5rem', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>⏱️ Avg Response</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>{stats.avgResponseTime}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Emergency Types Distribution</h2>
          <EmergencyTypeChart />
        </div>
        <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Response Time Trend</h2>
          <ResponseTimeChart />
        </div>
      </div>

      <div style={{ marginTop: '1.5rem', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Monthly Disaster Report</h2>
        <MonthlyDisasterReport />
      </div>
    </div>
  );
};

export default DisasterStatisticsPage;