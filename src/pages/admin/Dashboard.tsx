import React from 'react'

export default function AdminDashboard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Administrator Dashboard</h1>
      <p className="text-gray-600">Access platform configurations, user registrations, role-based controls, and security audit logs.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="border border-gray-150 rounded-lg p-4 bg-gray-50">
          <h3 className="font-bold text-gray-800 text-sm">Total Active Users</h3>
          <p className="text-2xl font-extrabold text-health-primary mt-2">142,504</p>
          <span className="text-xs text-gray-500">Across all system roles</span>
        </div>
        <div className="border border-gray-150 rounded-lg p-4 bg-gray-50">
          <h3 className="font-bold text-gray-800 text-sm">System Status</h3>
          <p className="text-2xl font-extrabold text-health-primary mt-2">Optimal</p>
          <span className="text-xs text-gray-500">All APIs responding under 150ms</span>
        </div>
        <div className="border border-gray-150 rounded-lg p-4 bg-gray-50">
          <h3 className="font-bold text-gray-800 text-sm">Pending Verifications</h3>
          <p className="text-2xl font-extrabold text-orange-650 mt-2">14</p>
          <span className="text-xs text-gray-500">Pharmacies awaiting MoH check</span>
        </div>
      </div>
    </div>
  )
}
