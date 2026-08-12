import React, { useState, useEffect } from 'react'
import { ClipboardList, Search, CheckCircle2, XCircle, Clock, Shield, RefreshCw, AlertTriangle } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { PharmacyApi } from '@/services/pharmacy-api'

type ResStatus = 'PENDING' | 'READY' | 'COLLECTED' | 'EXPIRED' | 'CANCELLED'

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

const FALLBACK: Reservation[] = [
  { id: 'RES-2026-001', patient: 'Marie Uwimana',        nationalId: '1199580048123984', medicine: 'Artemether + Lumefantrine', qty: 1, date: '2026-08-01', pickupDeadline: '2026-08-03', insurance: true,  insurer: 'RSSB', patientPays: 700,   status: 'READY',  prescriptionRequired: true  },
  { id: 'RES-2026-002', patient: 'Jean-Pierre Nkurunziza',nationalId: '1199380092384728', medicine: 'Amoxicillin 500mg',         qty: 2, date: '2026-08-01', pickupDeadline: '2026-08-03', insurance: false,           patientPays: 1600,  status: 'PENDING',            prescriptionRequired: true  },
  { id: 'RES-2026-003', patient: 'Aline Mukamana',        nationalId: '1199680018374829', medicine: 'Insulin Glargine',          qty: 1, date: '2026-07-31', pickupDeadline: '2026-08-02', insurance: true,  insurer: 'MMI', patientPays: 2700,  status: 'COLLECTED',          prescriptionRequired: true  },
  { id: 'RES-2026-004', patient: 'Emmanuel Habimana',     nationalId: '1199080037284729', medicine: 'Metformin 850mg',           qty: 2, date: '2026-07-31', pickupDeadline: '2026-08-02', insurance: true,  insurer: 'RSSB', patientPays: 230,   status: 'EXPIRED',            prescriptionRequired: false },
  { id: 'RES-2026-005', patient: 'Clarisse Ingabire',     nationalId: '1199880018374928', medicine: 'Paracetamol 500mg',         qty: 3, date: '2026-07-30', pickupDeadline: '2026-08-01', insurance: false,           patientPays: 900,   status: 'COLLECTED',          prescriptionRequired: false },
  { id: 'RES-2026-006', patient: 'Robert Uwera',          nationalId: '1198980028384920', medicine: 'Atenolol 50mg',             qty: 1, date: '2026-08-01', pickupDeadline: '2026-08-04', insurance: true,  insurer: 'SANLAM', patientPays: 238, status: 'PENDING',            prescriptionRequired: true  },
]

const STATUS_STYLES: Record<ResStatus, string> = {
  'READY':      'text-emerald-700 bg-emerald-50 border-emerald-200',
  'PENDING':    'text-amber-700 bg-amber-50 border-amber-200',
  'COLLECTED':  'text-slate-600 bg-slate-50 border-slate-200',
  'EXPIRED':    'text-red-700 bg-red-50 border-red-200',
  'CANCELLED':  'text-gray-500 bg-gray-100 border-gray-200',
}

const normalizeReservation = (item: any): Reservation => {
  const statusStr = String(item.status || 'PENDING').toUpperCase()
  let status: ResStatus = 'PENDING'
  if (statusStr.includes('READY')) status = 'READY'
  else if (statusStr.includes('COLLECT')) status = 'COLLECTED'
  else if (statusStr.includes('EXPIR')) status = 'EXPIRED'
  else if (statusStr.includes('CANCEL')) status = 'CANCELLED'

  const patient = item.patient || {}
  const user = patient.user || {}
  const medicine = item.medicine || {}

  return {
    id: item.id || `RES-${Math.random().toString(36).substr(2, 8)}`,
    patient: [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Patient',
    nationalId: user.nid || '—',
    medicine: medicine.name || 'Medication',
    qty: Number(item.quantity || 1),
    date: item.createdAt ? new Date(item.createdAt).toISOString().split('T')[0] : '—',
    pickupDeadline: item.pickupDeadline || '—',
    insurance: !!(item.insuranceProvider || item.insuranceId),
    insurer: item.insuranceProvider || item.insuranceId || undefined,
    patientPays: Number(item.patientPays || 0),
    status,
    prescriptionRequired: medicine.prescriptionRequired || false,
  }
}

export default function PharmacyReservations() {
  const { user } = useAuthStore()
  const [reservations, setReservations] = useState<Reservation[]>(FALLBACK)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ResStatus | ''>('')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const triggerToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  const loadReservations = async () => {
    const pharmacyId = user?.pharmacy?.id || user?.pharmacyId
    if (!pharmacyId) return

    setIsLoading(true)
    setErrorMsg(null)
    try {
      const data = await PharmacyApi.getReservations(pharmacyId)
      if (data.length > 0) {
        setReservations(data.map(normalizeReservation))
      }
    } catch (error: any) {
      console.warn('Using fallback reservations data due to error:', error)
      setErrorMsg(error?.message || 'Unable to load reservations from backend. Using fallback data.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadReservations()
  }, [user?.pharmacy?.id, user?.pharmacyId])

  const markReady = async (id: string) => {
    try {
      await PharmacyApi.updateReservationStatusSimple(id, 'READY')
      triggerToast(`Reservation ${id} marked as ready for pickup`)
      await loadReservations()
    } catch (error: any) {
      setErrorMsg(error?.message || 'Failed to update reservation status')
    }
  }

  const confirm = async (id: string) => {
    try {
      await PharmacyApi.updateReservationStatusSimple(id, 'COLLECTED')
      triggerToast(`Reservation ${id} confirmed as collected`)
      await loadReservations()
    } catch (error: any) {
      setErrorMsg(error?.message || 'Failed to update reservation status')
    }
  }

  const cancel = async (id: string) => {
    try {
      await PharmacyApi.updateReservationStatusSimple(id, 'CANCELLED')
      triggerToast(`Reservation ${id} cancelled`)
      await loadReservations()
    } catch (error: any) {
      setErrorMsg(error?.message || 'Failed to cancel reservation')
    }
  }

  const filtered = reservations.filter(r => {
    const q = search.toLowerCase()
    const matchSearch = r.patient.toLowerCase().includes(q) || r.id.toLowerCase().includes(q) || r.medicine.toLowerCase().includes(q)
    const matchStatus = statusFilter ? r.status === statusFilter : true
    return matchSearch && matchStatus
  })

  const counts = {
    pending: reservations.filter(r => r.status === 'PENDING').length,
    ready: reservations.filter(r => r.status === 'READY').length,
    collected: reservations.filter(r => r.status === 'COLLECTED').length,
    expired: reservations.filter(r => r.status === 'EXPIRED').length,
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">

      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg shadow-xl text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2 text-red-800 text-xs">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-gray-900">Incoming Reservations</h1>
          <p className="text-xs text-gray-500 mt-1">Fulfill prescription pickups and verify national IDs.</p>
        </div>
        <button onClick={loadReservations} disabled={isLoading} className="flex items-center space-x-1.5 border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 font-bold px-3 py-2 rounded-lg text-xs transition-colors disabled:opacity-50">
          {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          <span>{isLoading ? 'Loading...' : 'Refresh'}</span>
        </button>
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
            <option value="PENDING">Pending</option>
            <option value="READY">Ready for Pickup</option>
            <option value="COLLECTED">Collected</option>
            <option value="EXPIRED">Expired</option>
            <option value="CANCELLED">Cancelled</option>
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
              {isLoading ? (
                <tr><td colSpan={9} className="text-center py-10 text-gray-400 text-xs">Loading reservations...</td></tr>
              ) : filtered.map(r => (
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
                      {r.status === 'READY' ? 'Ready for Pickup' : r.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end space-x-1.5">
                      {r.status === 'PENDING' && (
                        <button
                          onClick={() => markReady(r.id)}
                          aria-label={`Mark ${r.id} ready for pickup`}
                          className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-health-primary hover:bg-health-secondary text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400"
                        >
                          Mark Ready
                        </button>
                      )}
                      {r.status === 'READY' && (
                        <button
                          onClick={() => confirm(r.id)}
                          aria-label={`Confirm pickup for ${r.id}`}
                          className="text-[10px] font-bold px-2.5 py-1 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
                        >
                          Confirm Pickup
                        </button>
                      )}
                      {(r.status === 'PENDING' || r.status === 'READY') && (
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
              {!isLoading && filtered.length === 0 && (
                <tr><td colSpan={9} className="text-center py-10 text-gray-400 text-xs">No reservations match the current filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
