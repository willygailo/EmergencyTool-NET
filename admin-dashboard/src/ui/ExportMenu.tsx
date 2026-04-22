import { useState } from 'react';
import { exportService, type ExportData } from '../services/exportService';

interface ExportMenuProps {
  data: ExportData;
  label?: string;
}

export const ExportMenu = ({ data, label = 'Export' }: ExportMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = (format: 'csv' | 'excel' | 'json') => {
    switch (format) {
      case 'csv':
        exportService.toCSV(data);
        break;
      case 'excel':
        exportService.toExcel(data);
        break;
      case 'json':
        exportService.toJSON(data);
        break;
    }
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
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
          fontWeight: '500',
        }}
      >
        📥 {label}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '0.25rem',
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            zIndex: 50,
            minWidth: '120px',
          }}
        >
          <button
            onClick={() => handleExport('csv')}
            style={{
              display: 'block',
              width: '100%',
              padding: '0.625rem 1rem',
              background: 'none',
              border: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f3f4f6')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
          >
            📄 CSV
          </button>
          <button
            onClick={() => handleExport('excel')}
            style={{
              display: 'block',
              width: '100%',
              padding: '0.625rem 1rem',
              background: 'none',
              border: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f3f4f6')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
          >
            📊 Excel
          </button>
          <button
            onClick={() => handleExport('json')}
            style={{
              display: 'block',
              width: '100%',
              padding: '0.625rem 1rem',
              background: 'none',
              border: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f3f4f6')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
          >
            📋 JSON
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportMenu;