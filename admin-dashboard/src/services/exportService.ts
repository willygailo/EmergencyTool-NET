import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export interface ExportData {
  headers: string[];
  rows: (string | number)[][];
  fileName: string;
}

export const exportService = {
  toCSV: (data: ExportData) => {
    const csvContent = data.headers.join(',') + '\n' + 
      data.rows.map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${data.fileName}.csv`);
  },

  toExcel: (data: ExportData) => {
    const worksheet = XLSX.utils.aoa_to_sheet([data.headers, ...data.rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${data.fileName}.xlsx`);
  },

  toJSON: (data: ExportData) => {
    const jsonData = data.rows.map(row => {
      const obj: Record<string, string | number> = {};
      data.headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });
    
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    saveAs(blob, `${data.fileName}.json`);
  },

  exportEmergencies: (emergencies: any[]) => {
    const data: ExportData = {
      headers: ['ID', 'Title', 'Type', 'Status', 'Location', 'Caller', 'Phone', 'Created At'],
      rows: emergencies.map(e => [
        e.id,
        e.title,
        e.type,
        e.status,
        e.location?.address || '',
        e.caller?.name || '',
        e.caller?.phone || '',
        e.createdAt || ''
      ]),
      fileName: `emergencies_${new Date().toISOString().split('T')[0]}`
    };
    return data;
  },

  exportResponders: (responders: any[]) => {
    const data: ExportData = {
      headers: ['ID', 'Name', 'Agency', 'Status', 'Phone', 'Barangay', 'Last Active'],
      rows: responders.map(r => [
        r.id,
        r.name,
        r.agency,
        r.status,
        r.phone,
        r.barangay || '',
        r.lastActive || ''
      ]),
      fileName: `responders_${new Date().toISOString().split('T')[0]}`
    };
    return data;
  },

  exportAnalytics: (analytics: any) => {
    const data: ExportData = {
      headers: ['Metric', 'Value'],
      rows: [
        ['Total Emergencies', analytics.totalEmergencies || 0],
        ['Resolved Today', analytics.resolvedToday || 0],
        ['Active Cases', analytics.activeEmergencies || 0],
        ['Average Response Time', analytics.avgResponseTime || 'N/A'],
        ['Total Responders', analytics.respondersOnDuty || 0]
      ],
      fileName: `analytics_${new Date().toISOString().split('T')[0]}`
    };
    return data;
  }
};

export default exportService;