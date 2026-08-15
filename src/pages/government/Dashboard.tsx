import React, { useState, useEffect } from 'react'
import { Landmark, Users, Package, AlertTriangle, FileText, CheckCircle2, ChevronRight, Activity, TrendingUp, XCircle, MapPin, Clock } from 'lucide-react'
import { AuthApi } from '@/services/auth-api'

export default function GovernmentDashboard() {
  const [pharmacies, setPharmacies] = useState<any[]>([])
  const [summary, setSummary] = useState<GovernmentSummary | null>(null)
  const [lowStock, setLowStock] = useState<any[]>([])
  // const [reservationStats, setReservationStats] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  interface GovernmentSummary {
    totalPharmacies: number
    approvedPharmacies: number
    totalMedicines: number
    totalPatients: number
    totalReservations: number
    pendingReservations: number
  }

  const fetchDashboardData = async () => {
    setIsLoading(true)
    setErrorMsg(null)

    try {
      const results = await Promise.allSettled([
        AuthApi.getAllPharmacies(),
        AuthApi.getGovernmentSummary(),
        AuthApi.getGovernmentLowStock(10),
        AuthApi.getGovernmentReservationStats(),
      ])

      const [
        pharmacyResult,
        summaryResult,
        lowStockResult,
        reservationResult,
      ] = results

      // Pharmacies
      if (pharmacyResult.status === 'fulfilled') {
        setPharmacies(
          Array.isArray(pharmacyResult.value)
            ? pharmacyResult.value
            : []
        )
      } else {
        console.error(
          'Failed to load pharmacies:',
          pharmacyResult.reason
        )
        setPharmacies([])
      }

      // Summary
      if (summaryResult.status === 'fulfilled') {
        console.log('SUMMARY:', summaryResult.value)
        console.log(
          'SUMMARY INNER DATA:',
          (summaryResult.value as any)?.data
        )

        setSummary(
          (summaryResult.value as any)?.data ?? null
        )
      } else {
        console.error(
          'Failed to load government summary:',
          summaryResult.reason
        )
        setSummary(null)
      }

      // Low stock
      if (lowStockResult.status === 'fulfilled') {
        setLowStock(
          Array.isArray(lowStockResult.value)
            ? lowStockResult.value
            : []
        )
      } else {
        console.error(
          'Failed to load low stock:',
          lowStockResult.reason
        )
        setLowStock([])
      }

      // Reservation stats
      if (reservationResult.status === 'fulfilled') {
        console.log(
          'RESERVATION STATS:',
          reservationResult.value
        )
      } else {
        console.error(
          'Failed to load reservation stats:',
          reservationResult.reason
        )
      }

    } catch (err: any) {
      console.error(
        'Government dashboard error:',
        err
      )

      setErrorMsg(
        err.message ||
        'Failed to load dashboard metrics.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const totalCount = summary?.totalPharmacies ?? pharmacies.length
  const pendingCount = pharmacies.filter((p) => p.status === 'PENDING').length
  const approvedCount = summary?.approvedPharmacies ?? pharmacies.filter((p) => p.status === 'APPROVED').length
  const rejectedCount = pharmacies.filter((p) => p.status === 'REJECTED').length
  const recentRegistrations = [...pharmacies]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime())
    .slice(0, 4)

  const retailCount = pharmacies.filter((p) => p.category === 'Retail').length
  const wholesaleCount = pharmacies.filter((p) => p.category === 'Wholesale').length
  const hospitalCount = pharmacies.filter((p) => p.category === 'Hospital').length

  const provinceCounts: Record<string, number> = {}
  pharmacies.forEach((p) => {
    if (p.status === 'APPROVED' && p.province) {
      provinceCounts[p.province] = (provinceCounts[p.province] || 0) + 1
    }
  })

  const shortageItems = lowStock.slice(0, 4).map((item: any, index: number) => ({
    id: item.id || index + 1,
    drug: item.medicine?.name || item.medicineName || 'Medicine',
    region: item.pharmacy?.address || item.pharmacy?.name || 'National',
    stockLevel: `Low stock (${item.quantity ?? 0} units)`,
    severity: Number(item.quantity ?? 0) <= 0 ? 'HIGH' : 'MEDIUM',
  }))

  const renderSkeleton = () => {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-pulse">
        <div className="h-32 bg-gray-200 rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-48 bg-gray-200 rounded-xl" />
            <div className="h-48 bg-gray-200 rounded-xl" />
          </div>
          <div className="space-y-4">
            <div className="h-48 bg-gray-200 rounded-xl" />
            <div className="h-48 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) return renderSkeleton()

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2 text-red-800 text-xs">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 animate-pulse" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* MoH Rwanda Regulatory Header Banner */}
      <div className="bg-white text-gray-900 rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-center border border-gray-200 shadow-xs relative overflow-hidden gap-6">
        <div className="absolute right-0 top-0 w-48 h-48 bg-emerald-50/40 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-2 text-center sm:text-left flex-grow">
          <div className="flex justify-center sm:justify-start items-center space-x-2.5">
            <Landmark className="w-5 h-5 text-emerald-800" />
            <span className="text-[9px] tracking-widest font-black uppercase text-emerald-800 bg-emerald-50/80 px-2 py-0.5 rounded border border-emerald-200">MoH Regulator Portal</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-950">Ministry of Health Regulator Dashboard</h1>
          <p className="text-gray-500 text-xs max-w-xl leading-normal font-medium">
            National regulatory oversight of essential drug cataloguing, licensing verification, and district stock availability index tracking across Rwanda.
          </p>
        </div>

        <div className="flex-shrink-0 bg-emerald-50 border border-emerald-200/60 px-5 py-3.5 rounded-xl text-center">
          <span className="text-[9px] uppercase text-emerald-800 block font-black">Approved pharmacy coverage</span>
          <span className="text-2xl font-black block mt-0.5 text-emerald-955">{summary ? `${Math.round((summary.approvedPharmacies / Math.max(summary.totalPharmacies, 1)) * 100)}%` : '—'}</span>
          <span className="text-[9px] text-gray-450 block font-semibold">of registered pharmacies</span>
        </div>
      </div>

      {/* Statistics grids */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center space-x-3.5 shadow-xs">
          <div className="p-2.5 bg-emerald-50 text-health-primary rounded-lg">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] text-gray-400 block uppercase font-bold">Approved Stores</span>
            <span className="text-lg font-black text-gray-950">{approvedCount} total</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center space-x-3.5 shadow-xs">
          <div className="p-2.5 bg-amber-50 text-amber-700 rounded-lg">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] text-gray-400 block uppercase font-bold">Pending Applications</span>
            <span className="text-lg font-black text-gray-950">{pendingCount} pending</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center space-x-3.5 shadow-xs">
          <div className="p-2.5 bg-red-50 text-red-700 rounded-lg">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] text-gray-400 block uppercase font-bold">Rejected Applications</span>
            <span className="text-lg font-black text-red-650">{rejectedCount} apps</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center space-x-3.5 shadow-xs">
          <div className="p-2.5 bg-slate-50 text-slate-700 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] text-gray-400 block uppercase font-bold">Registered Patients</span>
            <span className="text-lg font-black text-gray-950">{summary?.totalPatients ?? 0}</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center space-x-3.5 shadow-xs">
          <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] text-gray-400 block uppercase font-bold">Active Medicines</span>
            <span className="text-lg font-black text-gray-950">{summary?.totalMedicines ?? 0}</span>
          </div>
        </div>
      </div>

      {/* Alert sections & charts splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Registrations Onboarding timeline */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-150">
              <h3 className="font-black text-gray-950 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-emerald-700" />
                <span>Recent Pharmacy Onboardings</span>
              </h3>
              <span className="text-[9px] text-gray-400 font-bold font-mono">Verify Application Logs</span>
            </div>

            {recentRegistrations.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-400">
                No pharmacy registration applications found.
              </div>
            ) : (
              <div className="divide-y divide-gray-100 text-xs font-semibold text-gray-700">
                {recentRegistrations.map((lic) => (
                  <div key={lic.id} className="py-3 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div className="space-y-1">
                      <span className="font-bold text-gray-955 block">{lic.name || lic.pharmacyName}</span>
                      <span className="text-[10px] text-gray-500 block font-medium">Pharmacist: {lic.managerName || 'Unknown'} • Registered on {new Date(lic.createdAt || lic.updatedAt || '').toLocaleDateString() || '—'}</span>
                    </div>

                    <div className="flex items-center space-x-2 self-end sm:self-center font-bold">
                      {lic.status === 'APPROVED' ? (
                        <span className="text-[9px] text-emerald-750 bg-emerald-50 border border-emerald-250 px-2 py-0.5 rounded uppercase">Approved</span>
                      ) : lic.status === 'PENDING' ? (
                        <span className="text-[9px] text-amber-750 bg-amber-50 border border-amber-250 px-2 py-0.5 rounded uppercase">Pending MOH Review</span>
                      ) : (
                        <span className="text-[9px] text-red-750 bg-red-50 border border-red-250 px-2 py-0.5 rounded uppercase">Rejected</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Critical stock levels shortage logs */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-150">
              <h3 className="font-black text-gray-950 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>MOH Critical Stock Shortage Alerts</span>
              </h3>
              <span className="text-[9px] bg-red-50 text-red-700 font-bold border border-red-200 px-2 py-0.5 rounded-full font-sans">Requires MOH Intervention</span>
            </div>

            <div className="divide-y divide-gray-100 text-xs">
              {shortageItems.map((s) => (
                <div key={s.id} className="py-3 flex justify-between items-center gap-4">
                  <div className="space-y-1">
                    <span className="font-bold text-gray-900 block">{s.drug}</span>
                    <span className="text-[10px] text-gray-500 block font-semibold">{s.region}</span>
                  </div>
                  <div className="text-right flex items-center space-x-2">
                    <span className="font-mono text-red-650 font-bold">{s.stockLevel}</span>
                    <span className={`text-[9px] font-black px-1.5 py-0.25 rounded ${s.severity === 'HIGH' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                      {s.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Analytics & Demands (1/3 width) */}
        <div className="space-y-6">
          {/* Province Distribution Table */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4 font-semibold text-xs text-gray-700">
            <div className="flex justify-between items-center pb-2 border-b border-gray-150">
              <h3 className="font-black text-gray-950 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-emerald-700" />
                <span>Province Distribution</span>
              </h3>
            </div>

            <div className="space-y-3 font-semibold text-gray-800">
              {['Kigali City', 'Eastern Province', 'Western Province', 'Northern Province', 'Southern Province'].map((prov) => {
                const count = provinceCounts[prov] || 0
                const percent = approvedCount > 0
                  ? (count / approvedCount) * 100
                  : 0
                return (
                  <div key={prov} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>{prov}</span>
                      <span>{count} store(s)</span>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-health-primary h-full rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* National Pharmacy Statistics */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-150">
              <h3 className="font-black text-gray-950 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                <Activity className="w-4 h-4 text-emerald-700" />
                <span>National Pharmacy Statistics</span>
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-gray-500 pt-2">
              <div className="flex items-center space-x-1.5 bg-gray-50 p-2 rounded-lg">
                <span className="w-2.5 h-2.5 bg-health-primary rounded-sm" />
                <div>
                  <span className="block text-[8px] text-gray-400">RETAIL</span>
                  <span className="text-xs text-gray-800 font-extrabold">{retailCount} stores</span>
                </div>
              </div>
              <div className="flex items-center space-x-1.5 bg-gray-50 p-2 rounded-lg">
                <span className="w-2.5 h-2.5 bg-blue-600 rounded-sm" />
                <div>
                  <span className="block text-[8px] text-gray-400">WHOLESALE</span>
                  <span className="text-xs text-gray-800 font-extrabold">{wholesaleCount} stores</span>
                </div>
              </div>
              <div className="flex items-center space-x-1.5 bg-gray-50 p-2 rounded-lg">
                <span className="w-2.5 h-2.5 bg-amber-500 rounded-sm" />
                <div>
                  <span className="block text-[8px] text-gray-400">HOSPITAL</span>
                  <span className="text-xs text-gray-800 font-extrabold">{hospitalCount} stores</span>
                </div>
              </div>
              <div className="flex items-center space-x-1.5 bg-gray-50 p-2 rounded-lg">
                <span className="w-2.5 h-2.5 bg-gray-400 rounded-sm" />
                <div>
                  <span className="block text-[8px] text-gray-400">TOTAL</span>
                  <span className="text-xs text-gray-800 font-extrabold">{summary?.totalPharmacies ?? totalCount} stores</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
