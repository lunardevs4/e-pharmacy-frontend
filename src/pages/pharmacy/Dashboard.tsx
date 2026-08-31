import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { MedicineApi } from '@/services/medicine-api'
import { PharmacyApi } from '@/services/pharmacy-api'
import { 
  Bookmark, Box, Users, TrendingUp, ChevronRight, Activity, 
  AlertTriangle, CheckCircle, XCircle, Loader2, ArrowRight, Clock,
  FileText, ShieldCheck, MapPin, Building
} from 'lucide-react'

interface PharmacyDashboardReservation {
  id: string
  patientId: string
  patient: string
  medicine: string
  date: string
  createdAt: string
  insurance: boolean
  status: string
}

interface PharmacyDashboardAuditLog {
  id: string
  createdAt: string
  action: string
  entityType: string
  user?: { firstName?: string; lastName?: string; email?: string }
}

export default function PharmacyDashboard() {
  const { user } = useAuthStore()
  const [reservations, setReservations] = useState<PharmacyDashboardReservation[]>([])
  const [inventory, setInventory] = useState<any[]>([])
  const [auditLogs, setAuditLogs] = useState<PharmacyDashboardAuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      setErrorMsg(null)
      try {
        const pharmacyId = user?.pharmacy?.id || user?.pharmacyId
        if (!pharmacyId) {
          throw new Error('No pharmacy is linked to your account yet.')
        }

        const [data, pharmacyAuditLogs] = await Promise.all([
          MedicineApi.getPharmacyDashboardData(pharmacyId),
          PharmacyApi.getAuditLogs(pharmacyId, 5),
        ])
        const mappedReservations = (data.reservations || []).map((item: any) => ({
          id: item.id,
          patientId: item.patientId || '',
          patient: item.patientName || 'Patient',
          medicine: item.medicineName || 'Medication',
          date: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—',
          createdAt: item.createdAt || '',
          insurance: Boolean(item.insuranceProvider || item.insuranceId),
          status: String(item.status || '').toUpperCase(),
        }))

        setReservations(mappedReservations)
        setInventory(data.inventory || [])
        setAuditLogs(pharmacyAuditLogs || [])
      } catch (err: any) {
        console.error(err)
        setErrorMsg(err.message || 'Unable to load pharmacy dashboard data.')
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.pharmacy?.id || user?.pharmacyId) {
      loadData()
    } else {
      setIsLoading(false)
    }
  }, [user?.pharmacy?.id, user?.pharmacyId])

  const summary = useMemo(() => {
    const now = new Date()
    const isToday = (date: string) => {
      if (!date) return false
      const value = new Date(date)
      return value.getFullYear() === now.getFullYear() &&
        value.getMonth() === now.getMonth() &&
        value.getDate() === now.getDate()
    }
    const isThisMonth = (date: string) => {
      if (!date) return false
      const value = new Date(date)
      return value.getFullYear() === now.getFullYear() && value.getMonth() === now.getMonth()
    }
    const todayReservations = reservations.filter((res) => isToday(res.createdAt))
    const monthPatients = new Set(
      reservations.filter((res) => isThisMonth(res.createdAt)).map((res) => res.patientId).filter(Boolean),
    )
    const pending = reservations.filter((res) => res.status === 'PENDING').length
    const ready = reservations.filter((res) => res.status === 'CONFIRMED').length
    const collected = reservations.filter((res) => res.status === 'COLLECTED').length
    const lowStock = inventory.filter((item) => Number(item.quantity) < 10).length
    const totalInventory = inventory.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
    const inventoryValue = inventory.reduce(
      (sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0),
      0,
    )
    return { todayReservations, monthPatients, pending, ready, collected, lowStock, totalInventory, inventoryValue }
  }, [inventory, reservations])

  const updateReservation = async (reservationId: string, status: string) => {
    const pharmacyId = user?.pharmacy?.id || user?.pharmacyId
    if (!pharmacyId) return
    try {
      await PharmacyApi.updateReservationStatus(pharmacyId, reservationId, status)
      setReservations((current) => current.map((reservation) =>
        reservation.id === reservationId ? { ...reservation, status } : reservation,
      ))
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to update reservation status.')
    }
  }

  const reservationStatusLabel = (status: string) => ({
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    COLLECTED: 'Collected',
    CANCELLED: 'Cancelled',
  }[status] || status || 'Unknown')

  return (
    <div className="relative min-h-screen pb-16">
      
      <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto transition-all duration-300">

        {errorMsg && (
          <div role="alert" className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm font-semibold text-red-800">
            {errorMsg}
          </div>
        )}
        

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-xs flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[9px] sm:text-[10px] font-bold tracking-wider text-slate-400 uppercase">Today's Reservations</span>
              <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">{isLoading ? '—' : summary.todayReservations.length}</p>
              <span className="text-[10px] sm:text-[11px] text-gray-400 block font-medium">{summary.ready} confirmed reservation{summary.ready === 1 ? '' : 's'}</span>
            </div>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 flex-shrink-0">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-xs flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[9px] sm:text-[10px] font-bold tracking-wider text-slate-400 uppercase">Total Units</span>
              <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">{isLoading ? '—' : summary.totalInventory}</p>
              <span className="text-[10px] sm:text-[11px] text-gray-400 block font-medium">{summary.lowStock} low stock</span>
            </div>
            <div className="p-2 bg-gray-50 text-gray-600 rounded-lg border border-gray-205 flex-shrink-0">
              <Box className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-xs flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[9px] sm:text-[10px] font-bold tracking-wider text-slate-400 uppercase">Patients (Month)</span>
              <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">{isLoading ? '—' : summary.monthPatients.size}</p>
              <span className="text-[9px] sm:text-[10px] font-black text-emerald-600 block pt-1">Unique patients this month</span>
            </div>
            <div className="p-2 bg-gray-50 text-gray-650 rounded-lg border border-gray-205 flex-shrink-0">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-xs flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[9px] sm:text-[10px] font-bold tracking-wider text-slate-400 uppercase">Inventory Value</span>
              <p className="text-xl sm:text-2xl font-black text-gray-900 mt-1">{isLoading ? '—' : `${summary.inventoryValue.toLocaleString()} RWF`}</p>
              <span className="text-[9px] sm:text-[10px] font-black text-emerald-600 block pt-1">Based on current stock and prices</span>
            </div>
            <div className="p-2 bg-gray-50 text-gray-650 rounded-lg border border-gray-205 flex-shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <h3 className="text-xs sm:text-sm font-black text-gray-900">Recent Reservations</h3>
                  <Link to="/pharmacy/reservations" className="text-[10px] sm:text-xs font-bold text-health-primary hover:underline flex items-center">
                    <span>View all</span>
                    <ChevronRight className="w-3 h-3.5 sm:w-3.5 sm:h-3.5 ml-0.5" />
                  </Link>
                </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[10px] sm:text-xs divide-y divide-gray-150">
                  <thead>
                    <tr className="text-[9px] sm:text-[10px] font-black text-slate-450 uppercase tracking-wider">
                      <th className="py-2 px-1 sm:px-2.5">Patient</th>
                      <th className="py-2 px-1 sm:px-2.5">Medicine</th>
                      <th className="py-2 px-1 sm:px-2.5">Date</th>
                      <th className="py-2 px-1 sm:px-2.5 text-center">Insur.</th>
                      <th className="py-2 px-1 sm:px-2.5">Status</th>
                      <th className="py-2 px-1 sm:px-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                    {isLoading && (
                      <tr><td colSpan={6} className="py-6 sm:py-8 text-center text-gray-400">Loading reservations…</td></tr>
                    )}
                    {!isLoading && reservations.length === 0 && (
                      <tr><td colSpan={7} className="py-6 sm:py-8 text-center text-gray-400">No reservations found.</td></tr>
                    )}
                    {!isLoading && reservations.map((res) => (
                      <tr key={res.id} className="hover:bg-gray-50/50">
                        <td className="py-3 font-bold text-gray-900">{res.patient}</td>
                        <td className="py-3">{res.medicine}</td>
                        <td className="py-3 text-gray-500">{res.date}</td>
                        <td className="py-3 text-center">
                          {res.insurance ? (
                            <CheckCircle className="w-4 h-4 text-emerald-600 inline-block" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-300 inline-block" />
                          )}
                        </td>
                        <td className="py-3">
                          {res.status === 'CONFIRMED' && (
                            <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.25 rounded border border-emerald-200">
                              {reservationStatusLabel(res.status)}
                            </span>
                          )}
                          {res.status === 'PENDING' && (
                            <span className="inline-flex items-center text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.25 rounded border border-amber-200">
                              {reservationStatusLabel(res.status)}
                            </span>
                          )}
                          {res.status === 'COLLECTED' && (
                            <span className="inline-flex items-center text-[10px] font-bold text-slate-650 bg-slate-50 px-2 py-0.25 rounded border border-slate-200">
                              {reservationStatusLabel(res.status)}
                            </span>
                          )}
                          {res.status === 'CANCELLED' && (
                            <span className="inline-flex items-center text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.25 rounded border border-red-200">
                              {reservationStatusLabel(res.status)}
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          {res.status === 'CONFIRMED' && (
                            <button
                              type="button"
                              onClick={() => updateReservation(res.id, 'COLLECTED')}
                              aria-label={`Confirm collection for reservation ${res.id}`}
                              className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold px-3 py-1 rounded text-[10px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
                            >
                              Confirm
                            </button>
                          )}
                          {res.status === 'PENDING' && (
                            <button
                              type="button"
                              onClick={() => updateReservation(res.id, 'CONFIRMED')}
                              aria-label={`Mark reservation ${res.id} ready for pickup`}
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

            <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-gray-105">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-emerald-700" />
                  <h3 className="text-xs sm:text-sm font-black text-gray-900">Recent Staff Activity</h3>
                </div>
              </div>
              <div className="space-y-3 font-medium text-[10px] sm:text-xs text-gray-600">
                {auditLogs.length === 0 ? (
                  <p className="text-gray-400">No staff activity recorded.</p>
                ) : auditLogs.map((log) => (
                  <div key={log.id} className="flex items-center space-x-3.5">
                    <span className="text-gray-400 font-mono whitespace-nowrap">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <p><span className="font-bold text-gray-900">{[log.user?.firstName, log.user?.lastName].filter(Boolean).join(' ') || log.user?.email || 'System'}</span> {log.action.toLowerCase()} {log.entityType.toLowerCase()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-3.5">
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Reservation Status</span>
              <div className="space-y-2 pt-2 text-[10px] sm:text-xs">
                {[['Pending', summary.pending, 'bg-amber-400'], ['Confirmed', summary.ready, 'bg-emerald-500'], ['Collected', summary.collected, 'bg-slate-500']].map(([label, count, color]) => (
                  <div key={label as string} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-gray-600"><span className={`w-2 h-2 rounded-full ${color}`} />{label}</span>
                    <span className="font-black text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
