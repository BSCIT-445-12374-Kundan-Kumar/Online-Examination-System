// frontend/src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';

// Pages
import Index from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOTP from './pages/VerifyOTP';
import StudentDashboard from './pages/StudentDashboard';
import ExamsList from './pages/ExamsList';
import TakeExam from './pages/TakeExam';
import Result from './pages/Result';
import MyResults from './pages/MyResults';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageExams from './pages/admin/ManageExams';
import ManageUsers from './pages/admin/ManageUsers';
import AllResults from './pages/admin/AllResults';
import Report from './pages/admin/Report';
import Feedback from './pages/Feedback';
import Help from './pages/Help';
import ManageHelp from './pages/admin/ManageHelp';
import ManageFeedback from './pages/admin/ManageFeedback';

import './index.css';

// ================= PROTECTED =================
function ProtectedLayout({ children, adminOnly = false }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  if (!adminOnly && user.role === 'admin') return <Navigate to="/admin" replace />;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}

// ================= ADMIN =================
function AdminLayout({ children }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}

// ================= PUBLIC =================
function PublicRoute({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  return children;
}

// ================= ROUTES =================
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/verify-otp" element={<VerifyOTP />} />

      {/* Student */}
      <Route path="/dashboard" element={<ProtectedLayout><StudentDashboard /></ProtectedLayout>} />
      <Route path="/exams" element={<ProtectedLayout><ExamsList /></ProtectedLayout>} />
      <Route path="/exam/:id" element={<ProtectedLayout><TakeExam /></ProtectedLayout>} />
      <Route path="/result/:id" element={<ProtectedLayout><Result /></ProtectedLayout>} />
      <Route path="/my-results" element={<ProtectedLayout><MyResults /></ProtectedLayout>} />
      <Route path="/feedback" element={<ProtectedLayout><Feedback /></ProtectedLayout>} />
      <Route path="/help" element={<ProtectedLayout><Help /></ProtectedLayout>} />

      {/* Admin */}
      <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
      <Route path="/admin/exams" element={<AdminLayout><ManageExams /></AdminLayout>} />
      <Route path="/admin/users" element={<AdminLayout><ManageUsers /></AdminLayout>} />
      <Route path="/admin/results" element={<AdminLayout><AllResults /></AdminLayout>} />
      <Route path="/admin/result/:id" element={<AdminLayout><Result /></AdminLayout>} />
      <Route path="/admin/report" element={<AdminLayout><Report /></AdminLayout>} />
      <Route path="/admin/help" element={<AdminLayout><ManageHelp /></AdminLayout>} />
      <Route path="/admin/feedback" element={<AdminLayout><ManageFeedback /></AdminLayout>} />

      {/* Catch */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// MAIN 
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}