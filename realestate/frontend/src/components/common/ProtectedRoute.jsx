import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="auth-loading">
        <div className="loading-spinner"></div>
        <p>Checking authorization...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    // If not authenticated, redirect to home with return path
    // The Login modal can then handle showing itself
    return <Navigate to="/" state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // If role not allowed, redirect to home
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
