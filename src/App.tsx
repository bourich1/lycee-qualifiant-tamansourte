/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from './components/ui/sonner';

// Public Pages
import Home from './pages/public/Home';
import Announcements from './pages/public/Announcements';
import AITools from './pages/public/AITools';
import Login from './pages/public/Login';
import PublicCompetition from './pages/PublicCompetition';
import CyberTeamJoin from './pages/public/CyberTeamJoin';

// Dashboard Pages
import DashboardLayout from './components/layout/DashboardLayout';
import PublicLayout from './components/layout/PublicLayout';
import SuperAdminDashboard from './pages/dashboard/SuperAdminDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import StudentDashboard from './pages/dashboard/StudentDashboard';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  // Normalize role to handle legacy 'super-admin'
  const normalizedRole = user.role === 'super-admin' as any ? 'super_admin' : user.role;
  
  if (allowedRoles && !allowedRoles.includes(normalizedRole)) return <Navigate to="/" />;

  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/ai-tools" element={<AITools />} />
            <Route path="/login" element={<Login />} />
            <Route path="/ranking" element={<PublicCompetition />} />
          </Route>

          {/* Standalone Pages (no nav) */}
          <Route path="/cyber-team/join" element={<CyberTeamJoin />} />

          {/* Protected Dashboard Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="super-admin/*" element={<ProtectedRoute allowedRoles={['super_admin']}><SuperAdminDashboard /></ProtectedRoute>} />
            <Route path="admin/*" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="student/*" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
            
            {/* Redirect to appropriate dashboard based on role */}
            <Route index element={<DashboardRedirect />} />
          </Route>
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

const DashboardRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  
  const normalizedRole = user.role === 'super-admin' as any ? 'super_admin' : user.role;
  
  switch (normalizedRole) {
    case 'super_admin': return <Navigate to="/dashboard/super-admin" />;
    case 'admin': return <Navigate to="/dashboard/admin" />;
    case 'student': return <Navigate to="/dashboard/student" />;
    default: return <Navigate to="/" />;
  }
};
