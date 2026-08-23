import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { MedicineApi } from '@/services/medicine-api'
import { AuthApi } from '@/services/auth-api'
import { PharmacyApi } from '@/services/pharmacy-api'
import LocationSelector from '@/components/LocationSelector'
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
  const { user, updateProfile } = useAuthStore()
  const [reservations, setReservations] = useState<PharmacyDashboardReservation[]>([])
  const [inventory, setInventory] = useState<any[]>([])
  const [auditLogs, setAuditLogs] = useState<PharmacyDashboardAuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Status/Approval state
  const isApproved = user?.pharmacy?.status === 'APPROVED'
  const needsRegistration = user?.pharmacy?.licenseNumber === 'PENDING' || user?.pharmacy?.address === 'Pending Address'

  // Company Details Form States
  const [pharmacyName, setPharmacyName] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [category, setCategory] = useState('')
  const [ownershipType, setOwnershipType] = useState('')
  
  // Location States
  const [province, setProvince] = useState('')
  const [district, setDistrict] = useState('')
  const [sector, setSector] = useState('')
  const [cell, setCell] = useState('')
  const [village, setVillage] = useState('')
  const [streetAddress, setStreetAddress] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)

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

    if (isApproved && (user?.pharmacy?.id || user?.pharmacyId)) {
      loadData()
    } else {
      setIsLoading(false)
    }
  }, [user?.pharmacy?.id, user?.pharmacyId, isApproved])

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

  const handleRegisterCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!pharmacyName.trim() || pharmacyName.trim().length < 3) {
      setFormError('Pharmacy Name is required (minimum 3 characters).')
      return
    }
    if (!licenseNumber.trim()) {
      setFormError('MOH Operating License Number is required.')
      return
    }
    if (!category) {
      setFormError('Please select a pharmacy category.')
      return
    }
    if (!ownershipType) {
      setFormError('Please select ownership style.')
      return
    }
    if (!province || !district || !sector || !cell || !village) {
      setFormError('Please complete all administrative location fields.')
      return
    }

    setIsSubmitting(true)
    const formattedAddress = [province, district, sector, cell, village, streetAddress.trim()].filter(Boolean).join(', ')

    try {
      const pharmacyId = user?.pharmacy?.id
      if (!pharmacyId) throw new Error('No pharmacy reference found in your account.')

      await AuthApi.updatePharmacy(pharmacyId, {
        name: pharmacyName,
        address: formattedAddress,
        licenseNumber,
        category,
        ownershipType,
        province,
        district
      })

      setFormSuccess('Pharmacy details updated successfully and submitted for MoH review!')
      
      // Update local Zustand auth store with the new pharmacy info
      if (user) {
        updateProfile({
          pharmacy: {
            ...user.pharmacy,
            name: pharmacyName,
            address: formattedAddress,
            licenseNumber,
            category,
            ownershipType,
            province,
            district,
            status: 'PENDING'
          }
        })
      }
    } catch (err: any) {
      setFormError(err.message || 'Submission failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCheckStatus = async () => {
    setStatusLoading(true)
    setFormError(null)
    try {
      const latestUser = await AuthApi.getProfile(user?.email || '')
      updateProfile(latestUser)
      setFormSuccess('Dashboard status refreshed successfully!')
      setTimeout(() => setFormSuccess(null), 3000)
    } catch (err: any) {
      setFormError('Failed to refresh status. Please try again.')
    } finally {
      setStatusLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen pb-16">
      
      {/* 
        Blur and Grayscale Filter Backdrop container 
        Greys out and disables the entire underlying dashboard if the pharmacy is not approved
      */}
      <div className={`space-y-6 max-w-7xl mx-auto transition-all duration-300 ${
        !isApproved ? 'filter blur-xs grayscale opacity-35 pointer-events-none select-none' : ''
      }`}>

        {errorMsg && (
          <div role="alert" className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm font-semibold text-red-800">
            {errorMsg}
          </div>
        )}
        

        {/* Quick Metrics Statistics Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Today's Reservations</span>
              <p className="text-3xl font-black text-gray-900 mt-1">{isLoading ? '—' : summary.todayReservations.length}</p>
              <span className="text-[11px] text-gray-400 block font-medium">{summary.ready} confirmed reservation{summary.ready === 1 ? '' : 's'}</span>
            </div>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 flex-shrink-0">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Total Units</span>
              <p className="text-3xl font-black text-gray-900 mt-1">{isLoading ? '—' : summary.totalInventory}</p>
              <span className="text-[11px] text-gray-400 block font-medium">{summary.lowStock} low stock</span>
            </div>
            <div className="p-2 bg-gray-50 text-gray-600 rounded-lg border border-gray-205 flex-shrink-0">
              <Box className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Patients (Month)</span>
              <p className="text-3xl font-black text-gray-900 mt-1">{isLoading ? '—' : summary.monthPatients.size}</p>
              <span className="text-[10px] font-black text-emerald-600 block pt-1">Unique patients this month</span>
            </div>
            <div className="p-2 bg-gray-50 text-gray-650 rounded-lg border border-gray-205 flex-shrink-0">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Inventory Value</span>
              <p className="text-2xl font-black text-gray-900 mt-1">{isLoading ? '—' : `${summary.inventoryValue.toLocaleString()} RWF`}</p>
              <span className="text-[10px] font-black text-emerald-600 block pt-1">Based on current stock and prices</span>
            </div>
            <div className="p-2 bg-gray-50 text-gray-650 rounded-lg border border-gray-205 flex-shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Main Split Section Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
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
                <table className="w-full text-left text-xs divide-y divide-gray-150">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-450 uppercase tracking-wider">
                      <th className="py-2.5">Patient</th>
                      <th className="py-2.5">Medicine</th>
                      <th className="py-2.5">Date</th>
                      <th className="py-2.5 text-center">Insur.</th>
                      <th className="py-2.5">Status</th>
                      <th className="py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                    {isLoading && (
                      <tr><td colSpan={6} className="py-8 text-center text-gray-400">Loading reservations…</td></tr>
                    )}
                    {!isLoading && reservations.length === 0 && (
                      <tr><td colSpan={7} className="py-8 text-center text-gray-400">No reservations found.</td></tr>
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

            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-gray-105">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-emerald-700" />
                  <h3 className="text-sm font-black text-gray-900">Recent Staff Activity</h3>
                </div>
              </div>
              <div className="space-y-3 font-medium text-xs text-gray-600">
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

          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-3.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Reservation Status</span>
              <div className="space-y-2 pt-2 text-xs">
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

      {/* 
        Interactive overlay blocks shown ONLY if the pharmacy is not approved.
        Positions a beautiful activation form or MoH pending card at the center of the viewport
      */}
      {!isApproved && (
        <div className="absolute inset-0 flex items-start justify-center bg-slate-900/10 backdrop-blur-xs z-50 p-6 overflow-y-auto">
          {needsRegistration ? (
            
            /* Company details registration form */
            <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-5 my-8">
              <div className="flex items-center space-x-3 pb-3 border-b border-gray-150">
                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 flex-shrink-0">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-gray-900">Activate Your Pharmacy Store</h2>
                  <p className="text-xs text-gray-500 font-medium">Please enter your company registration details for MOH authorization.</p>
                </div>
              </div>

              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2 text-red-800 text-xs">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span className="font-semibold">{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="bg-emerald-50 border border-emerald-250 rounded-lg p-3 flex items-start space-x-2 text-emerald-805 text-xs">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span className="font-semibold">{formSuccess}</span>
                </div>
              )}

              <form onSubmit={handleRegisterCompany} className="space-y-4 text-xs font-bold text-gray-700">
                <div>
                  <label className="block text-gray-500 uppercase tracking-wider mb-1">Pharmacy Name</label>
                  <input
                    type="text"
                    required
                    value={pharmacyName}
                    onChange={(e) => setPharmacyName(e.target.value)}
                    className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 font-bold"
                    placeholder="e.g. Nyarugenge Pharmacy Plaza"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-500 uppercase tracking-wider mb-1">MOH Operating Licence Number</label>
                    <input
                      type="text"
                      required
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 font-mono font-bold"
                      placeholder="e.g. LIC-KIG-82038"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-500 uppercase tracking-wider mb-1">Pharmacy Category</label>
                    <select
                      required
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 font-bold"
                    >
                      <option value="">Select...</option>
                      <option value="Retail">Retail Pharmacy</option>
                      <option value="Wholesale">Wholesale Pharmacy</option>
                      <option value="Hospital">Hospital Pharmacy</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-500 uppercase tracking-wider mb-1">Pharmacy Ownership Style</label>
                  <select
                    required
                    value={ownershipType}
                    onChange={(e) => setOwnershipType(e.target.value)}
                    className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 font-bold"
                  >
                    <option value="">Select...</option>
                    <option value="Sole Proprietorship">Sole Proprietorship</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Corporation">Corporation / LLC</option>
                  </select>
                </div>

                {/* Location selector fields */}
                <div className="border-t border-gray-150 pt-3 space-y-3.5">
                  <span className="block text-[10px] tracking-wider text-slate-400 uppercase font-black">Store Location Details</span>
                  
                  <LocationSelector
                    onLocationChange={(location) => {
                      setProvince(location.province)
                      setDistrict(location.district)
                      setSector(location.sector)
                      setCell(location.cell)
                      setVillage(location.village)
                    }}
                    initialLocation={{
                      province: (user?.pharmacy as any)?.province,
                      district: (user?.pharmacy as any)?.district,
                      sector: (user?.pharmacy as any)?.sector,
                      cell: (user?.pharmacy as any)?.cell,
                      village: (user?.pharmacy as any)?.village,
                    }}
                    disabled={isSubmitting}
                    required={true}
                  />

                  <div>
                    <label className="block text-gray-500 uppercase tracking-wider mb-1">Street / Landmark Address (Optional)</label>
                    <input
                      type="text"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-xs text-gray-900 font-bold"
                      placeholder="e.g. KN 27 St, Opp. Nyarugenge Market"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-health-primary hover:bg-health-secondary disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      <span>Submitting details...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit for MOH Approval</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            
            /* Waiting for government approval card */
            <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-6 my-8 text-center">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full border border-amber-250 flex items-center justify-center animate-pulse">
                  <Clock className="w-8 h-8" />
                </div>
                <h2 className="text-base font-black text-gray-900">Application Pending MOH Review</h2>
                <p className="text-xs text-gray-500 font-medium max-w-xs mx-auto">
                  Your pharmacy registry application has been successfully submitted. Ministry of Health officers are reviewing your operating licence and details. Access will be unlocked once approved.
                </p>
              </div>

              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 text-red-800 text-xs text-left">
                  <span className="font-semibold block text-center">{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="bg-emerald-50 border border-emerald-250 rounded-lg p-2.5 text-emerald-805 text-xs text-left">
                  <span className="font-semibold block text-center">{formSuccess}</span>
                </div>
              )}

              {/* Submitted Details Review Card */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-left text-xs font-semibold text-gray-600 space-y-2">
                <span className="block text-[10px] tracking-wider text-slate-400 uppercase font-black mb-1 border-b border-gray-200 pb-1">
                  Submitted Company Profile
                </span>
                <div className="flex justify-between items-center">
                  <span>Store Name:</span>
                  <span className="text-gray-900 font-bold">{user?.pharmacy?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Category:</span>
                  <span className="text-gray-900 font-bold">{user?.pharmacy?.category || 'Retail'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Ownership Type:</span>
                  <span className="text-gray-900 font-bold">{user?.pharmacy?.ownershipType || 'Sole Proprietorship'}</span>
                </div>
                <div className="pt-1 border-t border-gray-150 flex items-start space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-500 text-[11px] font-medium leading-tight">{user?.pharmacy?.address}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleCheckStatus}
                  disabled={statusLoading}
                  className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-xs font-bold text-white bg-health-primary hover:bg-health-secondary disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {statusLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                      <span>Checking Approval Status...</span>
                    </>
                  ) : (
                    <span>Refresh Approval Status</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  )
}
