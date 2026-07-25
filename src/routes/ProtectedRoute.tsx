import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { UserRole } from '@/types'

interface ProtectedRouteProps {
  allowedRoles?: UserRole[]
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    switch (user.role) {
      case 'PATIENT':
        return <Navigate to="/patient" replace />
      case 'PHARMACY':
        return <Navigate to="/pharmacy" replace />
      case 'INSURANCE':
        return <Navigate to="/insurance" replace />
      case 'GOVERNMENT':
        return <Navigate to="/government" replace />
      case 'ADMIN':
        return <Navigate to="/admin" replace />
      default:
        return <Navigate to="/" replace />
    }
  }

  return <Outlet />
}
