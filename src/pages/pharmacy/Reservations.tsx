import React, { useState } from 'react'
import { ClipboardList, Search, CheckCircle2, XCircle, Clock, Shield } from 'lucide-react'

type ResStatus = 'Pending' | 'Ready for Pickup' | 'Collected' | 'Expired' | 'Cancelled'

interface Reservation {
  id: string
  patient: string
  nationalId: string
  medicine: string
  qty: number
  date: string
  pickupDeadline: string
  insurance: boolean
  insurer?: string
  patientPays: number
  status: ResStatus
  prescriptionRequired: boolean
}

const MOCK: Reservation[] = [
  { id: 'RES-2026-001', patient: 'Marie Uwimana',        nationalId: '1199580048123984', medicine: 'Artemether + Lumefantrine', qty: 1, date: '2026-08-01', pickupDeadline: '2026-08-03', insurance: true,  insurer: 'RSSB', patientPays: 700,   status: 'Ready for Pickup',  prescriptionRequired: true  },
  { id: 'RES-2026-002', patient: 'Jean-Pierre Nkurunziza',nationalId: '1199380092384728', medicine: 'Amoxicillin 500mg',         qty: 2, date: '2026-08-01', pickupDeadline: '2026-08-03', insurance: false,           patientPays: 1600,  status: 'Pending',            prescriptionRequired: true  },
  { id: 'RES-2026-003', patient: 'Aline Mukamana',        nationalId: '1199680018374829', medicine: 'Insulin Glargine',          qty: 1, date: '2026-07-31', pickupDeadline: '2026-08-02', insurance: true,  insurer: 'MMI', patientPays: 2700,  status: 'Collected',          prescriptionRequired: true  },
  { id: 'RES-2026-004', patient: 'Emmanuel Habimana',     nationalId: '1199080037284729', medicine: 'Metformin 850mg',           qty: 2, date: '2026-07-31', pickupDeadline: '2026-08-02', insurance: true,  insurer: 'RSSB', patientPays: 230,   status: 'Expired',            prescriptionRequired: false },
  { id: 'RES-2026-005', patient: 'Clarisse Ingabire',     nationalId: '1199880018374928', medicine: 'Paracetamol 500mg',         qty: 3, date: '2026-07-30', pickupDeadline: '2026-08-01', insurance: false,           patientPays: 900,   status: 'Collected',          prescriptionRequired: false },
  { id: 'RES-2026-006', patient: 'Robert Uwera',          nationalId: '1198980028384920', medicine: 'Atenolol 50mg',             qty: 1, date: '2026-08-01', pickupDeadline: '2026-08-04', insurance: true,  insurer: 'SANLAM', patientPays: 238, status: 'Pending',            prescriptionRequired: true  },
]

const STATUS_STYLES: Record<ResStatus, string> = {
  'Ready for Pickup': 'text-emerald-700 bg-emerald-50 border-emerald-200',
  'Pending':          'text-amber-700 bg-amber-50 border-amber-200',
  'Collected':        'text-slate-600 bg-slate-50 border-slate-200',
  'Expired':          'text-red-700 bg-red-50 border-red-200',
  'Cancelled':        'text-gray-500 bg-gray-100 border-gray-200',
}

export default function PharmacyReservations() {
  const [reservations, setReservations] = useState<Reservation[]>(MOCK)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ResStatus | ''>('')

  const markReady = (id: string) =>
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'Ready for Pickup' } : r))
  const confirm = (id: string) =>
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'Collected' } : r))
  const cancel = (id: string) =>
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'Cancelled' } : r))

  const filtered = reservations.filter(r => {
    const q = search.toLowerCase()
    const matchSearch = r.patient.toLowerCase().includes(q) || r.id.toLowerCase().includes(q) || r.medicine.toLowerCase().includes(q)
    const matchStatus = statusFilter ? r.status === statusFilter : true
    return matchSearch && matchStatus
  })

  const counts = {
    pending: reservations.filter(r => r.status === 'Pending').length,
    ready: reservations.filter(r => r.status === 'Ready for Pickup').length,
    collected: reservations.filter(r => r.status === 'Collected').length,
    expired: reservations.filter(r => r.status === 'Expired').length,
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">

      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-gray-900">Incoming Reservations</h1>
          <p className="text-xs text-gray-500 mt-1">Fulfill prescription pickups and verify national IDs.</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" role="list" aria-label="Reservation statistics">
        {[
          { label: 'Pending',          value: counts.pending,   color: 'text-amber-700',   bg: 'bg-amber-50',   Icon: Clock        },
          { label: 'Ready for Pickup', value: counts.ready,     color: 'text-emerald-700', bg: 'bg-emerald-50', Icon: CheckCircle2 },
          { label: 'Collected',        value: counts.collected, color: 'text-slate-700',   bg: 'bg-slate-50',   Icon: ClipboardList},
          { label: 'Expired',          value: counts.expired,   color: 'text-red-700',     bg: 'bg-red-50',     Icon: XCircle      },
        ].map(s => (
          <div key={s.label} role="listitem" className="bg-white border border-gray-200 rounded-xl p-4 flex items-center space-x-3 shadow-xs">
            <div className={`p-2.5 rounded-lg ${s.bg}`} aria-hidden="true"><s.Icon className={`w-5 h-5 ${s.color}`} /></div>
            <div>
              <span className="text-[10px] text-gray-400 block uppercase font-bold">{s.label}</span>
              <span className={`text-xl font-black ${s.color}`}>{s.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow max-w-sm">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" aria-hidden="true" />
            <input
              type="search"
              aria-label="Search reservations"
              placeholder="Search patient, ID, or medicine..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
            />
          </div>
          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as ResStatus | '')}
            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-700 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Ready for Pickup">Ready for Pickup</option>
            <option value="Collected">Collected</option>
            <option value="Expired">Expired</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs" aria-label="Reservations list">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                <th scope="col" className="px-5 py-3">Ref ID</th>
                <th scope="col" className="px-5 py-3">Patient</th>
                <th scope="col" className="px-5 py-3">Medicine</th>
                <th scope="col" className="px-5 py-3 text-center">Qty</th>
                <th scope="col" className="px-5 py-3">Insurance</th>
                <th scope="col" className="px-5 py-3">Patient Pays</th>
                <th scope="col" className="px-5 py-3">Pickup By</th>
                <th scope="col" className="px-5 py-3">Status</th>
                <th scope="col" className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3 font-mono font-bold text-gray-900">{r.id}</td>
                  <td className="px-5 py-3">
                    <span className="font-bold text-gray-900 block">{r.patient}</span>
                    <span className="text-[10px] text-gray-400 font-mono">{r.nationalId}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="font-semibold text-gray-800 block">{r.medicine}</span>
                    {r.prescriptionRequired && (
                      <span className="text-[9px] text-red-700 font-bold">Rx Required</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-center font-bold text-gray-900">{r.qty}</td>
                  <td className="px-5 py-3">
                    {r.insurance
                      ? <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-700"><Shield className="w-3 h-3" aria-hidden="true" /><span>{r.insurer}</span></span>
                      : <span className="text-[10px] text-gray-400 font-semibold">Private</span>
                    }
                  </td>
                  <td className="px-5 py-3 font-black text-gray-900">RWF {r.patientPays.toLocaleString()}</td>
                  <td className="px-5 py-3 font-mono text-gray-500">{r.pickupDeadline}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex text-[10px] font-bold border px-2 py-0.5 rounded ${STATUS_STYLES[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end space-x-1.5">
                      {r.status === 'Pending' && (
                        <button
                          onClick={() => markReady(r.id)}
                          aria-label={`Mark ${r.id} ready for pickup`}
                          className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-health-primary hover:bg-health-secondary text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400"
                        >
                          Mark Ready
                        </button>
                      )}
                      {r.status === 'Ready for Pickup' && (
                        <button
                          onClick={() => confirm(r.id)}
                          aria-label={`Confirm pickup for ${r.id}`}
                          className="text-[10px] font-bold px-2.5 py-1 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
                        >
                          Confirm Pickup
                        </button>
                      )}
                      {(r.status === 'Pending' || r.status === 'Ready for Pickup') && (
                        <button
                          onClick={() => cancel(r.id)}
                          aria-label={`Cancel reservation ${r.id}`}
                          className="text-[10px] font-bold px-2.5 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-400"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="text-center py-10 text-gray-400 text-xs">No reservations match the current filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
