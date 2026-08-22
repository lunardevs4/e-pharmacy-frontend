import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { UserRole } from '@/types'

interface ProtectedRouteProps {
  allowedRoles?: UserRole[]
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isInitialising, user } = useAuthStore()

  // Session is still being restored from localStorage — don't redirect yet
  if (isInitialising) return null

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }


  if (allowedRoles && !allowedRoles.includes(user.role)) {
    switch (user.role) {
      case 'PATIENT':    return <Navigate to="/patient"     replace />
      case 'PHARMACY':
      case 'PHARMACY_OWNER':
      case 'PHARMACIST': return <Navigate to="/pharmacy"    replace />

      case 'GOVERNMENT': return <Navigate to="/government"  replace />
      case 'INSURANCE':  return <Navigate to="/insurance"   replace />
      case 'ADMIN':      return <Navigate to="/admin"       replace />
      default:           return <Navigate to="/"            replace />
    }
  }

  return <Outlet />
}
