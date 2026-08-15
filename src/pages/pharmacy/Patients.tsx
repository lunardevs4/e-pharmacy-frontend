import React, { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { PharmacyApi } from '@/services/pharmacy-api'
import { Users, Search, ChevronRight } from 'lucide-react'

interface PatientRecord {
  id: string
  name: string
  email: string
  phone: string
  nationalId: string
  activeReservations: number
  totalClaims: number
}

export default function PharmacyPatients() {
  const [searchVal, setSearchVal] = useState('')
  const { user } = useAuthStore()
  const [patients, setPatients] = useState<PatientRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const pharmacyId = user?.pharmacy?.id || user?.pharmacyId
    if (!pharmacyId) return
    PharmacyApi.getReservations(pharmacyId).then((reservations: any[]) => {
      const grouped = new Map<string, PatientRecord>()
      reservations.forEach((reservation) => {
        const patient = reservation.patient || {}
        const account = patient.user || {}
        const id = patient.id || account.id || reservation.patientId
        if (!id) return
        const current = grouped.get(id) || {
          id, name: [account.firstName, account.lastName].filter(Boolean).join(' ') || 'Patient',
          email: account.email || '—', phone: account.phone || '—', nationalId: account.nid || '—',
          activeReservations: 0, totalClaims: 0,
        }
        current.totalClaims += 1
        if (!['CANCELLED', 'COLLECTED', 'EXPIRED'].includes(String(reservation.status).toUpperCase())) current.activeReservations += 1
        grouped.set(id, current)
      })
      setPatients([...grouped.values()])
    }).catch((err) => setError(err.message || 'Unable to load patients.'))
      .finally(() => setLoading(false))
  }, [user?.pharmacy?.id, user?.pharmacyId])

  const filteredPatients = patients.filter((p) => 
    p.name.toLowerCase().includes(searchVal.toLowerCase()) ||
    p.email.toLowerCase().includes(searchVal.toLowerCase()) ||
    p.nationalId.includes(searchVal)
  )

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Patient Search console card */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-gray-150">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-black text-gray-900">Registered Pharmacy Clients</h3>
          </div>
          <span className="text-xs text-slate-500 font-bold">{filteredPatients.length} Total Patients</span>
        </div>

        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search patient name or email..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-semibold"
          />
        </div>

        {/* Patients Table Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-gray-150">
            <thead>
              <tr className="text-[10px] font-black text-slate-450 uppercase tracking-wider">
                <th className="py-2.5">Name</th>
                <th className="py-2.5">Email</th>
                <th className="py-2.5">Phone</th>
                <th className="py-2.5 text-center">Active Res.</th>
                <th className="py-2.5 text-center">Total Claims</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {loading ? <tr><td colSpan={5} className="py-8 text-center">Loading patients…</td></tr> : error ? <tr><td colSpan={5} className="py-8 text-center text-red-600">{error}</td></tr> : filteredPatients.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50">
                  <td className="py-3 font-bold text-gray-950 flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-650">
                      {p.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                    </span>
                    <span>{p.name}</span>
                  </td>
                  <td className="py-3 text-gray-600">{p.email}</td>
                  <td className="py-3">{p.phone}</td>
                  <td className="py-3 text-center text-emerald-800 font-bold">{p.activeReservations}</td>
                  <td className="py-3 text-center text-gray-550 font-bold">{p.totalClaims}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
