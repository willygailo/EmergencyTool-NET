import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Sidebar } from './layout/Sidebar';
import { TopBar } from './layout/TopBar';

import { LoginPage } from './auth/LoginPage';

import { CommandCenterPage } from './dashboard/CommandCenterPage';
import { LiveMapPage } from './dashboard/LiveMapPage';
import { HeatMapPage } from './dashboard/HeatMapPage';

import { EmergencyListPage } from './emergencies/EmergencyListPage';
import { EmergencyDetailPage } from './emergencies/EmergencyDetailPage';
import { IncidentHistoryPage } from './emergencies/IncidentHistoryPage';

import { ResponderListPage } from './responders/ResponderListPage';
import { ResponderTrackingPage } from './responders/ResponderTrackingPage';
import { AssignmentPage } from './responders/AssignmentPage';

import { BroadcastPage } from './barangay/BroadcastPage';
import { EvacuationAlertPage } from './barangay/EvacuationAlertPage';

import { ReportsPage } from './analytics/ReportsPage';
import { DisasterStatisticsPage } from './analytics/DisasterStatisticsPage';
import { BarangayAnalyticsPage } from './analytics/BarangayAnalyticsPage';

import { AdminSettingsPage } from './settings/AdminSettingsPage';
import { UserManagementPage } from './settings/UserManagementPage';
import { BarangayContactsPage } from './settings/BarangayContactsPage';
import { SystemConfigPage } from './settings/SystemConfigPage';

import { useAppSelector } from './hooks/useRedux';

const Layout = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <TopBar />
        <main style={{ flex: 1, background: '#f3f4f6', overflow: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function AppRoutes() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        <Route path="dashboard" element={<CommandCenterPage />} />
        <Route path="live-map" element={<LiveMapPage />} />
        <Route path="heat-map" element={<HeatMapPage />} />
        
        <Route path="emergencies" element={<EmergencyListPage />} />
        <Route path="emergencies/:id" element={<EmergencyDetailPage />} />
        <Route path="incidents" element={<IncidentHistoryPage />} />
        
        <Route path="responders" element={<ResponderListPage />} />
        <Route path="responders/tracking" element={<ResponderTrackingPage />} />
        <Route path="responders/assignment" element={<AssignmentPage />} />
        
        <Route path="broadcasts" element={<BroadcastPage />} />
        <Route path="broadcasts/evacuation" element={<EvacuationAlertPage />} />
        
        <Route path="reports" element={<ReportsPage />} />
        <Route path="reports/statistics" element={<DisasterStatisticsPage />} />
        <Route path="reports/barangay" element={<BarangayAnalyticsPage />} />
        
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="settings/users" element={<UserManagementPage />} />
        <Route path="settings/contacts" element={<BarangayContactsPage />} />
        <Route path="settings/config" element={<SystemConfigPage />} />
      </Route>
      
      <Route path="/login" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

const App = () => {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;