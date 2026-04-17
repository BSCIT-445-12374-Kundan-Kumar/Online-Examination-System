// frontend/src/components/Sidebar.js
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const studentLinks = [
  { path: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { path: '/exams', icon: '📋', label: 'Exams' },
  { path: '/my-results', icon: '📊', label: 'My Results' },
  { path: '/feedback', icon: '💬', label: 'Feedback' },
  { path: '/help', icon: '🆘', label: 'Help' },
];

const adminLinks = [
  { path: '/admin', icon: '🏠', label: 'Dashboard' },
  { path: '/admin/exams', icon: '📋', label: 'Manage Exams' },
  { path: '/admin/users', icon: '👥', label: 'Users' },
  { path: '/admin/results', icon: '📊', label: 'All Results' },
  { path: '/admin/report', icon: '📈', label: 'Download Result' },
  { path: '/admin/help', icon: '🆘', label: 'Help Requests' },
  { path: '/admin/feedback', icon: '💬', label: 'Feedback' },
];

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const links = isAdmin ? adminLinks : studentLinks;

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <h1><span>Online Examination</span></h1>
      </div>
      <nav className="sidebar-nav">
        {links.map(link => (
          <button key={link.path} className={`nav-item ${location.pathname === link.path ? 'active' : ''}`}
            onClick={() => navigate(link.path)}>
            <span className="icon">{link.icon}</span>
            {link.label}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="user-chip">
          <div className="avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role}</div>
          </div>
          <button className="logout-btn" onClick={() => { logout(); navigate('/Index'); }} title="Logout">⏻</button>
        </div>
      </div>
    </div>
  );
}
