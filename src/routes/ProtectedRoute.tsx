import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { UserRole } from '@/types'

interface ProtectedRouteProps {
  allowedRoles?: UserRole[]
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isInitialising, user } = useAuthStore()

  if (isInitialising) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="flex items-center space-x-3 bg-white px-6 py-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-gray-700">Verifying session...</span>
        </div>
      </div>
    )
  }

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
