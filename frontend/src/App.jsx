import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/student/Dashboard';
import EquipmentManager from './pages/equipment/EquipmentManager';
import BookingApproval from './pages/staff/BookingApproval';
import BuildingRoomManager from './pages/equipment/BuildingRoomManager';
import QRCodeGenerator from './pages/equipment/QRCodeGenerator';
import NotificationCenter from './pages/staff/NotificationCenter';
import StatusTracker from './pages/equipment/StatusTracker';
import AnalyticsDashboard from './pages/staff/AnalyticsDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagementPanel from './pages/admin/UserManagementPanel';
import AuditLogViewer from './pages/admin/AuditLogViewer';
import StaffApprovalPanel from './pages/admin/StaffApprovalPanel';
import CEODashboard from './pages/ceo/CEODashboard';
import CostAnalysisPanel from './pages/reports/CostAnalysisPanel';
import LabComparisonPanel from './pages/reports/LabComparisonPanel';
import EquipmentRecommendations from './pages/equipment/EquipmentRecommendations';
import TrendAnalytics from './pages/reports/TrendAnalytics';
import MonthlyStatistics from './pages/reports/MonthlyStatistics';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/equipment" element={<EquipmentManager />} />
        <Route path="/approve-bookings" element={<BookingApproval />} />
        <Route path="/buildings" element={<BuildingRoomManager />} />
        <Route path="/qr-codes" element={<QRCodeGenerator />} />
        <Route path="/notifications" element={<NotificationCenter />} />
        <Route path="/status-tracking" element={<StatusTracker />} />
        <Route path="/analytics" element={<AnalyticsDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-users" element={<UserManagementPanel userId={sessionStorage.getItem('user_id')} />} />
        <Route path="/admin-audit" element={<AuditLogViewer />} />
        <Route path="/admin-approvals" element={<StaffApprovalPanel userId={sessionStorage.getItem('user_id')} />} />
        <Route path="/ceo-dashboard" element={<CEODashboard />} />
        <Route path="/ceo-cost-analysis" element={<CostAnalysisPanel />} />
        <Route path="/ceo-lab-comparison" element={<LabComparisonPanel />} />
        <Route path="/ceo-recommendations" element={<EquipmentRecommendations />} />
        <Route path="/ceo-trends" element={<TrendAnalytics />} />
        <Route path="/ceo-monthly" element={<MonthlyStatistics />} />
      </Routes>
    </Router>
  );
}

export default App;
