import React from 'react'

export default function PatientDashboard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Patient Dashboard</h1>
      <p className="text-gray-600">Welcome to your patient portal dashboard. Access search, track reservations, and view medication history.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="border border-gray-150 rounded-lg p-4 bg-gray-50">
          <h3 className="font-bold text-gray-800 text-sm">Active Reservations</h3>
          <p className="text-2xl font-extrabold text-health-primary mt-2">2</p>
          <span className="text-xs text-gray-500">Pick up ready at Bralirwa Pharmacy</span>
        </div>
        <div className="border border-gray-150 rounded-lg p-4 bg-gray-50">
          <h3 className="font-bold text-gray-800 text-sm">National ID Linked</h3>
          <p className="text-base font-semibold mt-2 text-gray-700">1 1995 8 0123456 7 89</p>
          <span className="text-xs text-emerald-700 font-medium">Verified under MoH Rwanda</span>
        </div>
        <div className="border border-gray-150 rounded-lg p-4 bg-gray-50">
          <h3 className="font-bold text-gray-800 text-sm">Insurance Scheme</h3>
          <p className="text-base font-semibold mt-2 text-gray-700">Mutuelle de Santé (RSSB)</p>
          <span className="text-xs text-emerald-700 font-medium">Active (90% Co-Pay)</span>
        </div>
      </div>
    </div>
  )
}
