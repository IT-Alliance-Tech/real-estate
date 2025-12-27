// AdminDashboardRoute.jsx
import React from 'react';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import AdminDashboard from './AdminDashboard';
import './AdminLogin.css';

const AdminDashboardRoute = () => {
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#f8f9fa'
      }}>
        <div className="admin-loading-spinner"></div>
        <p>Verifying admin access...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = '/system/admin/secure-access-portal-2025';
    return null;
  }

  return <AdminDashboard />;
};

export default AdminDashboardRoute;
