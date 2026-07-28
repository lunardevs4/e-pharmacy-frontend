import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Bookmark, Link as LinkIcon, MapPin, Bell, CheckCircle2, Clock, Info, ShieldAlert, ArrowRight } from 'lucide-react'

export default function PatientDashboard() {
  const navigate = useNavigate()
  const [quickQuery, setQuickQuery] = useState('')

  // Trigger quick search and redirect to search medicine page
  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (quickQuery.trim()) {
      navigate('/patient/search', { state: { initialQuery: quickQuery } })
    } else {
      navigate('/patient/search')
    }
  }

  // Mock Recent Reservations (exactly as in the user's screenshot)
  const recentReservations = [
    { id: 'RES-2024-001', medicine: 'Artemether + Lumefantrine', pharmacy: 'Bralirwa Pharmacy', date: '2024-08-12', status: 'Ready for Pickup' },
    { id: 'RES-2024-002', medicine: 'Amoxicillin 500mg', pharmacy: 'CityMed Nyarugenge', date: '2024-08-12', status: 'Pending' },
    { id: 'RES-2024-003', medicine: 'Insulin Glargine', pharmacy: 'Bralirwa Pharmacy', date: '2024-08-11', status: 'Collected' },
    { id: 'RES-2024-004', medicine: 'Metformin 850mg', pharmacy: 'MedPlus Remera', date: '2024-08-11', status: 'Expired' }
  ]

  // Mock Reminders
  const reminders = [
    { id: 1, name: 'Artemether', details: '1 tablet • 08:00 AM', status: 'TAKEN' },
    { id: 2, name: 'Metformin', details: '1 tablet • 01:00 PM', status: 'TAKEN' },
    { id: 3, name: 'Atenolol', details: '1 tablet • 09:00 PM', status: 'PENDING' }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Ready for Pickup':
        return (
          <span className="inline-flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
            Ready for Pickup
          </span>
        )
      case 'Pending':
        return (
          <span className="inline-flex items-center text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
            Pending
          </span>
        )
      case 'Collected':
        return (
          <span className="inline-flex items-center text-[11px] font-bold text-slate-650 bg-slate-50 px-2.5 py-0.5 rounded border border-slate-200">
            Collected
          </span>
        )
      case 'Expired':
      default:
        return (
          <span className="inline-flex items-center text-[11px] font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded border border-red-200">
            Expired
          </span>
        )
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Quick Medicine Search Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-3.5">
        <h2 className="text-[10px] font-black text-slate-400 tracking-wider uppercase">Quick Medicine Search</h2>
        <form onSubmit={handleQuickSearch} className="flex gap-2.5">
          <input
            type="text"
            placeholder="Generic name, trade name or manufacturer..."
            value={quickQuery}
            onChange={(e) => setQuickQuery(e.target.value)}
            className="flex-grow pl-4 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white text-gray-950 text-xs font-semibold"
          />
          <button
            type="submit"
            className="bg-health-primary hover:bg-health-secondary text-white font-bold px-6 py-2 rounded-lg text-xs transition-colors flex items-center justify-center space-x-1"
          >
            <span>Search</span>
          </button>
        </form>
      </div>

      {/* Portal Metrics Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1 */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Active Reservations</span>
            <p className="text-3xl font-black text-gray-900 mt-1">3</p>
            <span className="text-[11px] text-gray-400 block font-medium">2 ready for pickup</span>
          </div>
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 flex-shrink-0">
            <Bookmark className="w-4 h-4" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Active Prescriptions</span>
            <p className="text-3xl font-black text-gray-900 mt-1">5</p>
            <span className="text-[11px] text-gray-400 block font-medium">2 expiring soon</span>
          </div>
          <div className="p-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 flex-shrink-0">
            <LinkIcon className="w-4 h-4" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Saved Pharmacies</span>
            <p className="text-3xl font-black text-gray-900 mt-1">8</p>
            <span className="text-[11px] text-gray-400 block font-medium">None</span>
          </div>
          <div className="p-2 bg-gray-50 text-gray-550 rounded-lg border border-gray-200 flex-shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Reminders Today</span>
            <p className="text-3xl font-black text-gray-900 mt-1">3</p>
            <span className="text-[11px] text-gray-400 block font-medium">Next: 2:00 PM</span>
          </div>
          <div className="p-2 bg-rose-50 text-rose-700 rounded-lg border border-rose-100 flex-shrink-0">
            <Bell className="w-4 h-4" />
          </div>
        </div>

      </div>

      {/* Split Table & checklists layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Reservations Table (2/3 width) */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="text-sm font-black text-gray-900">Recent Reservations</h3>
              <Link to="/patient/reservations" className="text-xs font-bold text-health-primary hover:underline flex items-center">
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            {/* Table contents */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-gray-150">
                <thead>
                  <tr className="text-[10px] font-black text-slate-450 uppercase tracking-wider">
                    <th className="py-2.5">Reservation ID</th>
                    <th className="py-2.5">Medicine</th>
                    <th className="py-2.5">Pharmacy</th>
                    <th className="py-2.5">Date</th>
                    <th className="py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {recentReservations.map((res) => (
                    <tr key={res.id} className="hover:bg-gray-50/50">
                      <td className="py-3 font-semibold text-gray-900">{res.id}</td>
                      <td className="py-3 font-bold text-gray-950">{res.medicine}</td>
                      <td className="py-3">{res.pharmacy}</td>
                      <td className="py-3 text-gray-500">{res.date}</td>
                      <td className="py-3">{getStatusBadge(res.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Reminders & Warning container (1/3 width) */}
        <div className="space-y-4 lg:col-span-1 flex flex-col justify-between">
          
          {/* Today's Reminders checklist */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-gray-900 pb-2 border-b border-gray-100">Today's Reminders</h3>
            
            <div className="space-y-3.5">
              {reminders.map((rem) => (
                <div key={rem.id} className="flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-2.5">
                    <span className={`w-2 h-2 rounded-full inline-block ${rem.status === 'TAKEN' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <div>
                      <span className="font-bold text-gray-900 block">{rem.name}</span>
                      <span className="text-[10px] text-gray-400 font-bold block mt-0.5">{rem.details}</span>
                    </div>
                  </div>
                  {rem.status === 'TAKEN' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <Clock className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Blue Warning Dialog box */}
          <div className="bg-blue-50/60 border border-blue-200 text-blue-800 rounded-xl p-4 flex items-start space-x-3 text-xs">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="leading-normal">
              This platform is for medicine reservation and pickup only. Medicines are collected in person at the pharmacy.
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
