import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export default function PublicRoute() {
  const { isAuthenticated, user } = useAuthStore()

  if (isAuthenticated && user) {
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
