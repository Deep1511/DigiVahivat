/**
 * src/App.jsx
 * DigiVahivat Web Application Main Router & Role Guards
 */
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PublicGatePassPage } from './pages/PublicGatePassPage';
import { LegalPage } from './pages/LegalPage';

// Layout
import { AppLayout } from './components/AppLayout';

// SuperAdmin Pages
import { SuperAdminDashboard } from './pages/superadmin/SuperAdminDashboard';
import { SocietiesManagement } from './pages/superadmin/SocietiesManagement';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { EventsManagement } from './pages/admin/EventsManagement';
import { CollectFalo } from './pages/admin/CollectFalo';
import { MaintenanceTracker } from './pages/admin/MaintenanceTracker';
import { ExpensesLedger } from './pages/admin/ExpensesLedger';
import { ResidentsRoster } from './pages/admin/ResidentsRoster';
import { GateConsole } from './pages/admin/GateConsole';
import { ComplaintsHelpdesk } from './pages/admin/ComplaintsHelpdesk';
import { NoticeBoardAdmin } from './pages/admin/NoticeBoardAdmin';
import { EmergencyConsole } from './pages/admin/EmergencyConsole';

// Resident Pages
import { ResidentDashboard } from './pages/resident/ResidentDashboard';
import { MyContributions } from './pages/resident/MyContributions';
import { MyVisitors } from './pages/resident/MyVisitors';
import { MemberComplaints } from './pages/resident/MemberComplaints';
import { ExpensesFeed } from './pages/resident/ExpensesFeed';
import { NoticeBoardResident } from './pages/resident/NoticeBoardResident';

// Guard Pages
import { GuardConsole } from './pages/guard/GuardConsole';

// Route Guard Component
const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-[#00AFEF] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to user's proper home portal
    if (user.role === 'SuperAdmin') return <Navigate to="/superadmin" replace />;
    if (user.role === 'Guard' || user.role === 'Gaurd') return <Navigate to="/guard" replace />;
    if (user.role === 'Admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/resident" replace />;
  }

  return children;
};

export default function App() {
  return (
    <Routes>
      {/* ─── Public Routes ────────────────────────────────────────── */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/pass/:id" element={<PublicGatePassPage />} />
      <Route path="/privacy" element={<LegalPage />} />
      <Route path="/terms" element={<LegalPage />} />
      <Route path="/support" element={<LegalPage />} />

      {/* ─── SuperAdmin Protected Routes ───────────────────────────── */}
      <Route
        path="/superadmin"
        element={
          <ProtectedRoute allowedRoles={['SuperAdmin']}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<SuperAdminDashboard />} />
        <Route path="societies" element={<SocietiesManagement />} />
      </Route>

      {/* ─── Admin Protected ERP Routes ───────────────────────────── */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin']}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="events" element={<EventsManagement />} />
        <Route path="collect" element={<CollectFalo />} />
        <Route path="maintenance" element={<MaintenanceTracker />} />
        <Route path="expenses" element={<ExpensesLedger />} />
        <Route path="residents" element={<ResidentsRoster />} />
        <Route path="visitors" element={<GateConsole />} />
        <Route path="complaints" element={<ComplaintsHelpdesk />} />
        <Route path="notices" element={<NoticeBoardAdmin />} />
        <Route path="sos" element={<EmergencyConsole />} />
      </Route>

      {/* ─── Resident Protected Routes ────────────────────────────── */}
      <Route
        path="/resident"
        element={
          <ProtectedRoute allowedRoles={['Resident', 'Admin', 'SuperAdmin']}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ResidentDashboard />} />
        <Route path="payments" element={<MyContributions />} />
        <Route path="visitors" element={<MyVisitors />} />
        <Route path="complaints" element={<MemberComplaints />} />
        <Route path="expenses" element={<ExpensesFeed />} />
        <Route path="notices" element={<NoticeBoardResident />} />
      </Route>

      {/* ─── Guard Protected Routes ───────────────────────────────── */}
      <Route
        path="/guard"
        element={
          <ProtectedRoute allowedRoles={['Guard', 'Gaurd', 'Admin', 'SuperAdmin']}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<GuardConsole />} />
        <Route path="sos" element={<EmergencyConsole />} />
        <Route path="notices" element={<NoticeBoardResident />} />
      </Route>

      {/* ─── Catch-All ────────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
