import React, { useState, useEffect } from 'react'
import { Landmark, Users, Package, AlertTriangle, FileText, CheckCircle2, ChevronRight, Activity, TrendingUp, XCircle, MapPin, Clock } from 'lucide-react'
import { AuthApi } from '@/services/auth-api'
import { useLanguageStore } from '@/store/languageStore'

function SemiCircularGauge({ value }: { value: number }) {
  const percentage = Math.max(0, Math.min(100, Math.round(value)))

  return (
    <div
      className="relative w-32 h-20 mx-auto"
      role="img"
      aria-label={`${percentage}% approved pharmacy coverage`}
    >
      <svg viewBox="0 0 120 72" className="w-full h-full overflow-visible" aria-hidden="true">
        <path
          d="M 14 62 A 46 46 0 0 1 106 62"
          pathLength="100"
          fill="none"
          stroke="#d1d5db"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="M 14 62 A 46 46 0 0 1 106 62"
          pathLength="100"
          fill="none"
          stroke="var(--color-health-primary)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray="100"
          strokeDashoffset={100 - percentage}
          className="transition-all duration-500"
        />
      </svg>
      <span className="absolute inset-x-0 bottom-0 text-center text-2xl font-black tracking-tight text-gray-900">
        {percentage}%
      </span>
    </div>
  )
}

export default function GovernmentDashboard() {
  const { t, formatStatus } = useLanguageStore()
  const [pharmacies, setPharmacies] = useState<any[]>([])
  const [summary, setSummary] = useState<GovernmentSummary | null>(null)
  const [lowStock, setLowStock] = useState<any[]>([])
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

      if (summaryResult.status === 'fulfilled') {
        console.log('SUMMARY:', summaryResult.value)
        console.log(
          'SUMMARY INNER DATA:',
          (summaryResult.value as any)?.data
        )

        setSummary(
          (summaryResult.value as any)?.data ?? summaryResult.value ?? null
        )
      } else {
        console.error(
          'Failed to load government summary:',
          summaryResult.reason
        )
        setSummary(null)
      }

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
  const approvedCoverage = Math.round((approvedCount / Math.max(totalCount, 1)) * 100)
  const rejectedCount = pharmacies.filter((p) => p.status === 'REJECTED').length
  const recentRegistrations = [...pharmacies]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime())
    .slice(0, 4)

  const retailCount = pharmacies.filter((p) => p.category === 'Retail').length
  const wholesaleCount = pharmacies.filter((p) => p.category === 'Wholesale').length
  const hospitalCount = pharmacies.filter((p) => p.category === 'Hospital').length

  const provinceCounts: Record<string, number> = {}
  const normalizeProvince = (value: unknown) => {
    const province = String(value || '').trim().toLowerCase()

    if (province.includes('kigali')) return 'Kigali City'
    if (province.includes('eastern') || province === 'east') return 'Eastern Province'
    if (province.includes('western') || province === 'west') return 'Western Province'
    if (province.includes('northern') || province === 'north') return 'Northern Province'
    if (province.includes('southern') || province === 'south') return 'Southern Province'

    return String(value || '').trim()
  }
  pharmacies.forEach((p) => {
    const status = String(p.status || '').trim().toUpperCase()
    const province = normalizeProvince(p.province)
    if (status === 'APPROVED' && province) {
      provinceCounts[province] = (provinceCounts[province] || 0) + 1
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
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-16">
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2 text-red-800 text-xs">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 animate-pulse" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="bg-white text-gray-900 rounded-xl p-4 sm:p-6 md:p-8 flex flex-col sm:flex-row justify-between items-center border border-gray-200 shadow-xs relative overflow-hidden gap-4 sm:gap-6">
        <div className="absolute right-0 top-0 w-48 h-48 bg-emerald-50/40 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-2 text-center sm:text-left flex-grow">
          <div className="flex justify-center sm:justify-start items-center space-x-2.5">
            <Landmark className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-800" />
            <span className="text-[8px] sm:text-[9px] tracking-widest font-black uppercase text-emerald-800 bg-emerald-50/80 px-2 py-0.5 rounded border border-emerald-200">
              {t('role.government.portal')}
            </span>
          </div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-black text-gray-950">
            {t('government.dash.title')}
          </h1>
          <p className="text-gray-500 text-[10px] sm:text-xs max-w-xl leading-normal font-medium">
            {t('government.dash.subtitle')}
          </p>
        </div>

        <div className="flex-shrink-0 bg-emerald-50 border border-emerald-200/60 px-4 sm:px-5 py-3 sm:py-4 rounded-xl text-center min-w-[160px] sm:min-w-[180px]">
          <span className="text-[8px] sm:text-[9px] uppercase text-emerald-800 block font-black">
            {t('government.dash.approvedCoverage')}
          </span>
          <SemiCircularGauge value={approvedCoverage} />
          <span className="text-[8px] sm:text-[9px] text-gray-450 block font-semibold">
            {t('government.dash.totalPharmacies')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 flex items-center space-x-2.5 sm:space-x-3.5 shadow-xs">
          <div className="p-2 sm:p-2.5 bg-emerald-50 text-health-primary rounded-lg">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <span className="text-[8px] sm:text-[9px] text-gray-400 block uppercase font-bold">
              {t('government.dash.approvedPharmacies')}
            </span>
            <span className="text-base sm:text-lg font-black text-gray-950">{approvedCount} {t('common.total')}</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 flex items-center space-x-2.5 sm:space-x-3.5 shadow-xs">
          <div className="p-2 sm:p-2.5 bg-amber-50 text-amber-700 rounded-lg">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <span className="text-[8px] sm:text-[9px] text-gray-400 block uppercase font-bold">
              {t('government.dash.pendingInspection')}
            </span>
            <span className="text-base sm:text-lg font-black text-gray-950">{pendingCount} {formatStatus('PENDING')}</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 flex items-center space-x-2.5 sm:space-x-3.5 shadow-xs">
          <div className="p-2 sm:p-2.5 bg-red-50 text-red-700 rounded-lg">
            <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <span className="text-[8px] sm:text-[9px] text-gray-400 block uppercase font-bold">
              {t('status.rejected')}
            </span>
            <span className="text-base sm:text-lg font-black text-red-650">{rejectedCount}</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 flex items-center space-x-2.5 sm:space-x-3.5 shadow-xs">
          <div className="p-2 sm:p-2.5 bg-slate-50 text-slate-700 rounded-lg">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <span className="text-[8px] sm:text-[9px] text-gray-400 block uppercase font-bold">
              {t('government.dash.registeredPatients')}
            </span>
            <span className="text-base sm:text-lg font-black text-gray-950">{summary?.totalPatients ?? 0}</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 flex items-center space-x-2.5 sm:space-x-3.5 shadow-xs">
          <div className="p-2 sm:p-2.5 bg-blue-50 text-blue-700 rounded-lg">
            <Package className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <span className="text-[8px] sm:text-[9px] text-gray-400 block uppercase font-bold">
              {t('government.dash.essentialMeds')}
            </span>
            <span className="text-base sm:text-lg font-black text-gray-950">{summary?.totalMedicines ?? 0}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-2 border-b border-gray-150 gap-2">
              <h3 className="font-black text-gray-950 text-[10px] sm:text-xs uppercase tracking-wider flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700" />
                <span>{t('government.dash.recentAccreditations')}</span>
              </h3>
              <span className="text-[8px] sm:text-[9px] text-gray-400 font-bold font-mono">{t('government.dash.viewRegistry')}</span>
            </div>

            {recentRegistrations.length === 0 ? (
              <div className="text-center py-4 sm:py-6 text-[10px] sm:text-xs text-gray-400">
                {t('common.noData')}
              </div>
            ) : (
              <div className="divide-y divide-gray-100 text-[10px] sm:text-xs font-semibold text-gray-700">
                {recentRegistrations.map((lic) => (
                  <div key={lic.id} className="py-3 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div className="space-y-1">
                      <span className="font-bold text-gray-955 block">{lic.name || lic.pharmacyName}</span>
                      <span className="text-[10px] text-gray-500 block font-medium">Pharmacist: {lic.managerName || 'Unknown'} • {new Date(lic.createdAt || lic.updatedAt || '').toLocaleDateString() || '—'}</span>
                    </div>

                    <div className="flex items-center space-x-2 self-end sm:self-center font-bold">
                      <span className={`text-[9px] px-2 py-0.5 rounded border uppercase ${
                        lic.status === 'APPROVED'
                          ? 'text-emerald-750 bg-emerald-50 border-emerald-250'
                          : lic.status === 'PENDING'
                          ? 'text-amber-750 bg-amber-50 border-amber-250'
                          : 'text-red-750 bg-red-50 border-red-250'
                      }`}>
                        {formatStatus(lic.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-2 border-b border-gray-150 gap-2">
              <h3 className="font-black text-gray-950 text-[10px] sm:text-xs uppercase tracking-wider flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600" />
                <span>{t('government.dash.lowStockNational')}</span>
              </h3>
            </div>

            <div className="divide-y divide-gray-100 text-[10px] sm:text-xs">
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

        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4 font-semibold text-[10px] sm:text-xs text-gray-700">
            <div className="flex justify-between items-center pb-2 border-b border-gray-150">
              <h3 className="font-black text-gray-950 text-[10px] sm:text-xs uppercase tracking-wider flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700" />
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

          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-150">
              <h3 className="font-black text-gray-950 text-[10px] sm:text-xs uppercase tracking-wider flex items-center space-x-1.5">
                <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700" />
                <span>National Pharmacy Statistics</span>
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[9px] sm:text-[10px] font-bold text-gray-500 pt-2">
              <div className="flex items-center space-x-1.5 bg-gray-50 p-2 rounded-lg">
                <span className="w-2.5 h-2.5 bg-health-primary rounded-sm" />
                <div>
                  <span className="block text-[8px] text-gray-400">RETAIL</span>
                  <span className="text-xs text-gray-800 font-extrabold">{retailCount}</span>
                </div>
              </div>
              <div className="flex items-center space-x-1.5 bg-gray-50 p-2 rounded-lg">
                <span className="w-2.5 h-2.5 bg-blue-600 rounded-sm" />
                <div>
                  <span className="block text-[8px] text-gray-400">WHOLESALE</span>
                  <span className="text-xs text-gray-800 font-extrabold">{wholesaleCount}</span>
                </div>
              </div>
              <div className="flex items-center space-x-1.5 bg-gray-50 p-2 rounded-lg">
                <span className="w-2.5 h-2.5 bg-amber-500 rounded-sm" />
                <div>
                  <span className="block text-[8px] text-gray-400">HOSPITAL</span>
                  <span className="text-xs text-gray-800 font-extrabold">{hospitalCount}</span>
                </div>
              </div>
              <div className="flex items-center space-x-1.5 bg-gray-50 p-2 rounded-lg">
                <span className="w-2.5 h-2.5 bg-gray-400 rounded-sm" />
                <div>
                  <span className="block text-[8px] text-gray-400">TOTAL</span>
                  <span className="text-xs text-gray-800 font-extrabold">{summary?.totalPharmacies ?? totalCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
