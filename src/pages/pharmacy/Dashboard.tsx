import React from 'react'

export default function PharmacyDashboard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Pharmacy Dashboard</h1>
      <p className="text-gray-600">Overview of pharmacy stock, active claims, and daily reservations to fulfill.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="border border-gray-150 rounded-lg p-4 bg-gray-50">
          <h3 className="font-bold text-gray-800 text-sm">Reservations Pending</h3>
          <p className="text-2xl font-extrabold text-health-primary mt-2">12</p>
          <span className="text-xs text-gray-500">Awaiting customer collection</span>
        </div>
        <div className="border border-gray-150 rounded-lg p-4 bg-gray-50">
          <h3 className="font-bold text-gray-800 text-sm">Claims Submitted</h3>
          <p className="text-2xl font-extrabold text-health-primary mt-2">45</p>
          <span className="text-xs text-gray-500">Pending approval by RSSB/MMI</span>
        </div>
        <div className="border border-gray-150 rounded-lg p-4 bg-gray-50">
          <h3 className="font-bold text-gray-800 text-sm">Low Stock Items</h3>
          <p className="text-2xl font-extrabold text-orange-650 mt-2">4</p>
          <span className="text-xs text-gray-500">Critical reorder status</span>
        </div>
      </div>
    </div>
  )
}
