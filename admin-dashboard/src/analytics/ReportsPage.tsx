import { useState } from 'react';
import { Link } from 'react-router-dom';
import { exportService, type ExportData } from '../services/exportService';
import { QuickActions } from '../ui/QuickActions';

interface ReportData {
  id: string;
  title: string;
  type: string;
  date: string;
  status: string;
}

export const ReportsPage = () => {
  const [reportType, setReportType] = useState('all');

  const reports: ReportData[] = [
    { id: '1', title: 'Monthly Emergency Summary - January 2024', type: 'summary', date: '2024-01-31', status: 'completed' },
    { id: '2', title: 'Response Time Analysis - Q4 2023', type: 'analytics', date: '2023-12-31', status: 'completed' },
    { id: '3', title: 'Barangay Performance Report', type: 'barangay', date: '2024-01-15', status: 'completed' },
    { id: '4', title: 'Responder Activity Log', type: 'responder', date: '2024-01-20', status: 'completed' },
    { id: '5', title: 'Disaster Risk Assessment', type: 'risk', date: '2024-01-10', status: 'completed' },
  ];

  const filteredReports = reportType === 'all' 
    ? reports 
    : reports.filter(r => r.type === reportType);

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      summary: '📊',
      analytics: '📈',
      barangay: '🏘️',
      responder: '🚒',
      risk: '⚠️',
    };
    return icons[type] || '📄';
  };

  const handleExportAll = () => {
    const data: ExportData = {
      headers: ['ID', 'Title', 'Type', 'Date', 'Status'],
      rows: reports.map(r => [r.id, r.title, r.type, r.date, r.status]),
      fileName: `reports_${new Date().toISOString().split('T')[0]}`
    };
    exportService.toCSV(data);
  };

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Reports</h1>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0' }}>Generate and export emergency reports</p>
        </div>
        <button 
          onClick={handleExportAll}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}
        >
          📥 Export All Reports
        </button>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <QuickActions />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '1.25rem', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6', margin: 0 }}>{reports.length}</p>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0' }}>Total Reports</p>
        </div>
        <div style={{ padding: '1.25rem', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981', margin: 0 }}>{reports.filter(r => r.status === 'completed').length}</p>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0' }}>Completed</p>
        </div>
        <Link to="/reports/statistics" style={{ padding: '1.25rem', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', textAlign: 'center', textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b', margin: 0 }}>📊</p>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0' }}>Statistics</p>
        </Link>
        <Link to="/reports/barangay" style={{ padding: '1.25rem', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', textAlign: 'center', textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6', margin: 0 }}>🏘️</p>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0' }}>Barangay Data</p>
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {['all', 'summary', 'analytics', 'barangay', 'responder', 'risk'].map((type) => (
          <button
            key={type}
            onClick={() => setReportType(type)}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              background: reportType === type ? '#3b82f6' : 'white',
              color: reportType === type ? 'white' : '#374151',
              cursor: 'pointer',
              fontSize: '0.875rem',
              textTransform: 'capitalize',
            }}
          >
            {type}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {filteredReports.map((report) => (
          <div 
            key={report.id} 
            style={{ 
              padding: '1.25rem', 
              background: 'white', 
              borderRadius: '8px', 
              border: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>
              {getTypeIcon(report.type)}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: '600', margin: 0 }}>{report.title}</h3>
              <p style={{ fontSize: '0.8125rem', color: '#6b7280', margin: '0.25rem 0 0' }}>{report.date}</p>
            </div>
            <button 
              style={{
                padding: '0.375rem 0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                background: 'white',
                color: '#374151',
                cursor: 'pointer',
                fontSize: '0.8125rem'
              }}
            >
              ⬇️
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '1rem', textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' }}>
        Showing {filteredReports.length} of {reports.length} reports
      </div>
    </div>
  );
};

export default ReportsPage;