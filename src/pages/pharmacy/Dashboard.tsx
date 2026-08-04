import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bookmark, Box, Users, TrendingUp, CheckCircle, XCircle, ChevronRight, Activity, AlertTriangle } from 'lucide-react'

export default function PharmacyDashboard() {
  // Eric Mugisha's pharmacy profile states (mock data matching screenshot)
  const [reservations, setReservations] = useState([
    { id: 'RES-2024-001', patient: 'Marie Uwimana', medicine: 'Artemether + Lumefantrine', date: '2024-08-12', insurance: true, status: 'Ready for Pickup' },
    { id: 'RES-2024-002', patient: 'Jean-Pierre Nkurunziza', medicine: 'Amoxicillin 500mg', date: '2024-08-12', insurance: false, status: 'Pending' },
    { id: 'RES-2024-003', patient: 'Aline Mukamana', medicine: 'Insulin Glargine', date: '2024-08-11', insurance: true, status: 'Collected' },
    { id: 'RES-2024-004', patient: 'Emmanuel Habimana', medicine: 'Metformin 850mg', date: '2024-08-11', insurance: true, status: 'Expired' },
    { id: 'RES-2024-005', patient: 'Clarisse Ingabire', medicine: 'Paracetamol 500mg', date: '2024-08-10', insurance: false, status: 'Collected' }
  ])

  // Handles state changes for confirming or marking ready from dashboard actions
  const handleConfirmReservation = (id: string) => {
    setReservations((prev) => 
      prev.map((r) => r.id === id ? { ...r, status: 'Collected' } : r)
    )
  }

  const handleMarkReady = (id: string) => {
    setReservations((prev) => 
      prev.map((r) => r.id === id ? { ...r, status: 'Ready for Pickup' } : r)
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Top Banner Information Block */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center">
            EM
          </div>
          <div className="text-xs space-y-0.5">
            <p className="text-gray-500">Logged in as <span className="font-bold text-gray-900">Eric Mugisha</span></p>
            <p className="text-gray-500">Role <span className="font-bold text-gray-900">Pharmacy Manager</span></p>
          </div>
        </div>
        <div className="h-px md:h-8 w-full md:w-px bg-gray-200" />
        <div className="text-xs">
          <p className="text-gray-500">Pharmacy <span className="font-bold text-emerald-800">Bralirwa Pharmacy, Gasabo</span></p>
        </div>
      </div>

      {/* Quick Metrics Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1 */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Today's Reservations</span>
            <p className="text-3xl font-black text-gray-900 mt-1">42</p>
            <span className="text-[11px] text-gray-400 block font-medium">8 ready for pickup</span>
            <span className="text-[10px] font-black text-emerald-600 block pt-1">↗ 8% vs last month</span>
          </div>
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 flex-shrink-0">
            <Bookmark className="w-4 h-4" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Total SKUs</span>
            <p className="text-3xl font-black text-gray-900 mt-1">1,284</p>
            <span className="text-[11px] text-gray-400 block font-medium">12 low stock • 3 expired</span>
          </div>
          <div className="p-2 bg-gray-50 text-gray-600 rounded-lg border border-gray-205 flex-shrink-0">
            <Box className="w-4 h-4" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Patients (Month)</span>
            <p className="text-3xl font-black text-gray-900 mt-1">3,420</p>
            <span className="text-[10px] font-black text-emerald-600 block pt-1">↗ 15% vs last month</span>
          </div>
          <div className="p-2 bg-gray-50 text-gray-650 rounded-lg border border-gray-205 flex-shrink-0">
            <Users className="w-4 h-4" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Monthly Revenue</span>
            <p className="text-2xl font-black text-gray-900 mt-1">RWF 6.2M</p>
            <span className="text-[10px] font-black text-emerald-600 block pt-1">↗ 6.9% vs last month</span>
          </div>
          <div className="p-2 bg-gray-50 text-gray-650 rounded-lg border border-gray-205 flex-shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

      </div>

      {/* Main Split Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column blocks (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recent Reservations Table card */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <h3 className="text-sm font-black text-gray-900">Recent Reservations</h3>
                <Link to="/pharmacy/reservations" className="text-xs font-bold text-health-primary hover:underline flex items-center">
                  <span>View all</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-gray-150" aria-label="Recent reservations">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-450 uppercase tracking-wider">
                      <th scope="col" className="py-2.5">ID</th>
                      <th scope="col" className="py-2.5">Patient</th>
                      <th scope="col" className="py-2.5">Medicine</th>
                      <th scope="col" className="py-2.5">Date</th>
                      <th scope="col" className="py-2.5 text-center">Insur.</th>
                      <th scope="col" className="py-2.5">Status</th>
                      <th scope="col" className="py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                    {reservations.map((res) => (
                      <tr key={res.id} className="hover:bg-gray-50/50">
                        <td className="py-3 font-semibold text-gray-950">{res.id}</td>
                        <td className="py-3 font-bold text-gray-900">{res.patient}</td>
                        <td className="py-3">{res.medicine}</td>
                        <td className="py-3 text-gray-500">{res.date}</td>
                        <td className="py-3 text-center">
                          {res.insurance ? (
                            <CheckCircle className="w-4 h-4 text-emerald-600 inline-block" aria-label="Insurance accepted" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-300 inline-block" aria-label="No insurance" />
                          )}
                        </td>
                        <td className="py-3">
                          {res.status === 'Ready for Pickup' && (
                            <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Ready for Pickup
                            </span>
                          )}
                          {res.status === 'Pending' && (
                            <span className="inline-flex items-center text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              Pending
                            </span>
                          )}
                          {res.status === 'Collected' && (
                            <span className="inline-flex items-center text-[10px] font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                              Collected
                            </span>
                          )}
                          {res.status === 'Expired' && (
                            <span className="inline-flex items-center text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                              Expired
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          {res.status === 'Ready for Pickup' && (
                            <button
                              type="button"
                              onClick={() => handleConfirmReservation(res.id)}
                              aria-label={`Confirm collection for reservation ${res.id}`}
                              className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold px-3 py-1 rounded text-[10px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
                            >
                              Confirm
                            </button>
                          )}
                          {res.status === 'Pending' && (
                            <button
                              type="button"
                              onClick={() => handleMarkReady(res.id)}
                              aria-label={`Mark reservation ${res.id} as ready for pickup`}
                              className="bg-health-primary hover:bg-health-secondary text-white font-bold px-3 py-1 rounded text-[10px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400"
                            >
                              Mark Ready
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Recent Staff Activity logs card */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-105">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-black text-gray-900">Recent Staff Activity</h3>
              </div>
              <Link to="/pharmacy/settings" className="text-xs font-bold text-health-primary hover:underline">
                View full audit trail
              </Link>
            </div>

            <div className="space-y-3 font-medium text-xs text-gray-600">
              <div className="flex items-center space-x-3.5">
                <span className="text-gray-400 font-mono">08:30</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <p>🟢 <span className="font-bold text-gray-900">Alice</span> added 200 units of Amoxicillin 500mg</p>
              </div>
              <div className="flex items-center space-x-3.5">
                <span className="text-gray-400 font-mono">09:05</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <p>🟢 <span className="font-bold text-gray-900">Eric</span> confirmed Reservation RES-2024-001</p>
              </div>
              <div className="flex items-center space-x-3.5">
                <span className="text-gray-400 font-mono">09:40</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <p>🟢 <span className="font-bold text-gray-900">Diane</span> processed payment for Reservation RES-2024-003</p>
              </div>
              <div className="flex items-center space-x-3.5">
                <span className="text-gray-400 font-mono">10:15</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <p>🟢 <span className="font-bold text-gray-900">Patrick</span> updated Paracetamol stock (+500 units)</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column blocks (1/3 width) */}
        <div className="space-y-6">
          
          {/* Revenue line chart widget */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-3.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Revenue (7 Mo.)</span>
            
            <div className="pt-2">
              <svg viewBox="0 0 100 35" className="w-full h-14">
                <defs>
                  <linearGradient id="chart-rev-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,28 Q15,26 30,22 T60,20 T90,14 T100,12"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M0,28 Q15,26 30,22 T60,20 T90,14 T100,12 L100,35 L0,35 Z"
                  fill="url(#chart-rev-grad)"
                />
              </svg>
            </div>

            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 pt-1">
              <span>Jan</span>
              <span className="text-gray-900 text-xs font-black">RWF 6.2M</span>
              <span>Jul</span>
            </div>
          </div>

          {/* Donut chart by category */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">By Category</span>
            
            <div className="flex items-center justify-between gap-4">
              {/* HTML Conic Gradient circular donut chart preview */}
              <div className="relative w-24 h-24 rounded-full flex items-center justify-center shadow-inner flex-shrink-0" style={{ background: 'conic-gradient(#059669 0% 28%, #2563eb 28% 50%, #d97706 50% 68%, #dc2626 68% 82%, #475569 82% 100%)' }}>
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[9px] font-black text-gray-500 shadow-xs" />
              </div>

              <div className="space-y-1.5 text-[10px] font-bold text-gray-500 flex-grow pl-2">
                <div className="flex justify-between items-center">
                  <span className="flex items-center">
                    <span className="w-2.5 h-2.5 bg-emerald-600 rounded-full mr-1.5 inline-block" />
                    Antimalarial
                  </span>
                  <span className="text-gray-900">28%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center">
                    <span className="w-2.5 h-2.5 bg-blue-600 rounded-full mr-1.5 inline-block" />
                    Antibiotics
                  </span>
                  <span className="text-gray-900">22%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center">
                    <span className="w-2.5 h-2.5 bg-amber-600 rounded-full mr-1.5 inline-block" />
                    Analgesics
                  </span>
                  <span className="text-gray-900">18%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center">
                    <span className="w-2.5 h-2.5 bg-red-600 rounded-full mr-1.5 inline-block" />
                    Antidiabetics
                  </span>
                  <span className="text-gray-900">14%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stock reorder warnings alerts card */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 text-rose-700">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-wider">Stock Alerts</span>
            </div>

            <div className="space-y-2.5 text-xs font-bold">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Amoxicillin</span>
                <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 font-black">156</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Metformin</span>
                <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 font-black">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Oral Rehydration Salts</span>
                <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 font-black">78</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Insulin</span>
                <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 font-black">34</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
