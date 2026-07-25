import React from 'react'

export default function GovernmentDashboard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Ministry of Health Analytics Dashboard</h1>
      <p className="text-gray-600">National-level overview of drug distribution, pharmacy registrations, and public health metrics.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="border border-gray-150 rounded-lg p-4 bg-gray-50">
          <h3 className="font-bold text-gray-800 text-sm">Active Pharmacies</h3>
          <p className="text-2xl font-extrabold text-health-primary mt-2">1,847</p>
          <span className="text-xs text-gray-500">Fully licensed & verified</span>
        </div>
        <div className="border border-gray-150 rounded-lg p-4 bg-gray-50">
          <h3 className="font-bold text-gray-800 text-sm">National Availability Index</h3>
          <p className="text-2xl font-extrabold text-health-primary mt-2">94.2%</p>
          <span className="text-xs text-gray-500">Key essential medicines</span>
        </div>
        <div className="border border-gray-150 rounded-lg p-4 bg-gray-50">
          <h3 className="font-bold text-gray-800 text-sm">Reported Drug Shortages</h3>
          <p className="text-2xl font-extrabold text-red-600 mt-2">3</p>
          <span className="text-xs text-gray-500">Requires central intervention</span>
        </div>
      </div>
    </div>
  )
}
