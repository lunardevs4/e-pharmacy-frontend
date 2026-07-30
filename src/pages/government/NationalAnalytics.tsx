import React, { useState } from 'react'
import { Activity, MapPin, AlertCircle, BarChart2, ShieldAlert, FileClock } from 'lucide-react'

export default function NationalAnalytics() {
  const [districtAlerts] = useState([
    { id: 1, district: 'Musanze', province: 'Northern Province', activePharmacies: 42, activeReservations: 312, shortageMeds: ['Coartem', 'Amoxicillin'], status: 'Critical Shortage' },
    { id: 2, district: 'Rubavu', province: 'Western Province', activePharmacies: 51, activeReservations: 240, shortageMeds: ['Metformin'], status: 'Limited Supply' },
    { id: 3, district: 'Bugesera', province: 'Eastern Province', activePharmacies: 33, activeReservations: 180, shortageMeds: ['Amoxicillin'], status: 'Critical Shortage' },
    { id: 4, district: 'Gasabo', province: 'Kigali City', activePharmacies: 128, activeReservations: 1420, shortageMeds: [], status: 'Optimal' },
    { id: 5, district: 'Nyarugenge', province: 'Kigali City', activePharmacies: 96, activeReservations: 980, shortageMeds: [], status: 'Optimal' }
  ])

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Alert Section Banner */}
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex items-start space-x-3 text-xs shadow-xs">
        <ShieldAlert className="w-5 h-5 text-red-650 flex-shrink-0 mt-0.5" />
        <div className="leading-normal">
          <span className="font-bold">National Shortage Warning:</span> Essential drug supply index in Northern Province has dropped below 85% safety limits. District medical dispatch operations are notified.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: Shortage tables (2/3 width) */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-150">
            <div className="flex items-center space-x-2">
              <BarChart2 className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-black text-gray-900">District Stock Level monitoring</h3>
            </div>
            <span className="text-xs text-slate-500 font-bold">5 Monitored Districts</span>
          </div>

          {/* District Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-gray-150">
              <thead>
                <tr className="text-[10px] font-black text-slate-450 uppercase tracking-wider">
                  <th className="py-2.5">District</th>
                  <th className="py-2.5">Province</th>
                  <th className="py-2.5 text-center">Active Stores</th>
                  <th className="py-2.5 text-center">Active Res.</th>
                  <th className="py-2.5">Shortage Drugs</th>
                  <th className="py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {districtAlerts.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50/50">
                    <td className="py-3 font-bold text-gray-950">{d.district}</td>
                    <td className="py-3 text-gray-550">{d.province}</td>
                    <td className="py-3 text-center">{d.activePharmacies}</td>
                    <td className="py-3 text-center text-emerald-800 font-bold">{d.activeReservations}</td>
                    <td className="py-3">
                      {d.shortageMeds.length > 0 ? (
                        <span className="text-[9px] font-black text-red-750 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                          {d.shortageMeds.join(', ')}
                        </span>
                      ) : (
                        <span className="text-[9px] text-gray-400 font-medium">None</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      {d.status === 'Optimal' ? (
                        <span className="inline-flex items-center text-[9px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-250">
                          Optimal
                        </span>
                      ) : d.status === 'Limited Supply' ? (
                        <span className="inline-flex items-center text-[9px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-250">
                          Limited
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[9px] font-black text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          Shortage
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Maps details (1/3 width) */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-150">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-black text-gray-900">National Shortage Map</h3>
            </div>
          </div>

          <div className="w-full h-48 bg-gray-50 border border-gray-250 rounded-xl flex items-center justify-center relative overflow-hidden">
            {/* Mock map interface */}
            <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-xs flex items-center justify-center">
              <span className="text-[10px] text-gray-400 font-black uppercase bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm">Interactive GPS Overlay</span>
            </div>
            
            {/* Shortage dots */}
            <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-red-600 rounded-full animate-ping" />
            <div className="absolute top-1/4 left-1/3 w-2.5 h-2.5 bg-red-600 rounded-full" />
            <div className="absolute bottom-1/3 right-1/4 w-3.5 h-3.5 bg-amber-500 rounded-full animate-pulse" />
          </div>

          <div className="space-y-2 text-xs font-semibold text-gray-600">
            <div className="flex items-center justify-between">
              <span>National Safety Limit</span>
              <span className="font-bold text-gray-900">85% threshold</span>
            </div>
            <div className="flex items-center justify-between border-t border-gray-100 pt-2">
              <span>MOH Dispatch Lead</span>
              <span className="font-bold text-health-primary">Dr. Eric Habimana</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
