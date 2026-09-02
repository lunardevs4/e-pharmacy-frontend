import React, { useEffect, useMemo, useState } from 'react'
import { insuranceApi, DashboardSummary } from '@/services/insurance-api'
import { useAuthStore } from '@/store/authStore'
import { useLanguageStore } from '@/store/languageStore'
import { Shield } from 'lucide-react'

export default function InsuranceDashboard() {
  const { t, formatStatus } = useLanguageStore()
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const { user } = useAuthStore()
  const insurer = user?.insuranceProvider || 'RSSB'

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      setErrorMsg(null)
      try {
        const providers = await insuranceApi.getProviders()
        const matchedProvider = providers.find(p => p.code === insurer || p.name === insurer)
        const insuranceId = matchedProvider?.id

        const data = await insuranceApi.getDashboardSummary(insuranceId)
        setSummary(data)
      } catch (err: any) {
        setErrorMsg(err.message || 'Unable to load insurance dashboard data.')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [insurer])

  const approvalRate = useMemo(() => {
    if (!summary || summary.totalClaims === 0) return 0
    return Math.round((summary.approvedClaims / summary.totalClaims) * 100)
  }, [summary])

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className={`p-2 sm:p-2.5 rounded-lg ${insurer === 'MMI' ? 'bg-[#e8f5e9] text-[#2d6a4f]' : 'bg-[#eff6ff] text-[#3b82f6]'}`}>
          <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="flex-grow">
          <h1 className="text-lg sm:text-xl font-black text-gray-900">
            {t('insurance.dash.title', { insurer })}
          </h1>
          <p className="text-[10px] sm:text-xs text-gray-550">
            {t('insurance.dash.subtitle', { name: insurer === 'MMI' ? 'Military Medical Insurance' : 'Rwanda Social Security Board' })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[10px] sm:text-xs text-gray-400 font-bold block uppercase">
            {t('insurance.dash.totalClaims')}
          </span>
          <span className="text-xl sm:text-2xl font-black text-gray-900 block mt-2">{isLoading ? '—' : summary?.totalClaims || 0}</span>
          <span className="text-[10px] sm:text-xs text-emerald-700 mt-1 font-semibold block">
            {t('insurance.dash.liveClaimsCount')}
          </span>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[10px] sm:text-xs text-gray-400 font-bold block uppercase">
            {t('insurance.dash.approvalRate')}
          </span>
          <span className="text-xl sm:text-2xl font-black text-health-primary block mt-2">{isLoading ? '—' : `${approvalRate}%`}</span>
          <span className="text-[10px] sm:text-xs text-emerald-700 mt-1 font-semibold block">
            {t('insurance.dash.approvalRatio')}
          </span>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[10px] sm:text-xs text-gray-400 font-bold block uppercase">
            {t('insurance.dash.pendingClaims')}
          </span>
          <span className="text-xl sm:text-2xl font-black text-orange-600 block mt-2">{isLoading ? '—' : summary?.pendingClaims || 0}</span>
          <span className="text-[10px] sm:text-xs text-gray-550 mt-1 block">
            {t('insurance.dash.awaitingAudit')}
          </span>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[10px] sm:text-xs text-gray-400 font-bold block uppercase">
            {t('insurance.dash.totalDisbursed')}
          </span>
          <span className="text-xl sm:text-2xl font-black text-gray-900 block mt-2">
            {isLoading ? '—' : `${summary?.paidClaimsAmount?.toLocaleString() || 0} ${t('common.rwf')}`}
          </span>
          <span className="text-[10px] sm:text-xs text-gray-550 mt-1 block">
            {t('insurance.dash.insurerPortionPaid')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[10px] sm:text-xs text-gray-500 font-semibold block uppercase">
            {t('insurance.dash.totalPatients')}
          </span>
          <span className="text-xl sm:text-2xl font-black text-gray-900 block mt-2">{isLoading ? '—' : summary?.totalPatients || 0}</span>
          <span className="text-[10px] sm:text-xs text-gray-500 mt-1 block">
            {t('insurance.dash.registeredInsured')}
          </span>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[10px] sm:text-xs text-gray-500 font-semibold block uppercase">
            {t('insurance.dash.activeAgreements')}
          </span>
          <span className="text-xl sm:text-2xl font-black text-gray-900 block mt-2">{isLoading ? '—' : summary?.totalAgreements || 0}</span>
          <span className="text-[10px] sm:text-xs text-gray-500 mt-1 block">
            {t('insurance.dash.pharmacyPartnerships')}
          </span>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[10px] sm:text-xs text-gray-500 font-semibold block uppercase">
            {t('insurance.dash.medicineTariffs')}
          </span>
          <span className="text-xl sm:text-2xl font-black text-gray-900 block mt-2">{isLoading ? '—' : summary?.totalTariffs || 0}</span>
          <span className="text-[10px] sm:text-xs text-gray-500 mt-1 block">
            {t('insurance.dash.coveredMedicines')}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-gray-50/50">
          <div>
            <h2 className="font-bold text-gray-900 text-xs sm:text-sm">{t('insurance.dash.claimsQueue')}</h2>
            <p className="text-[10px] sm:text-xs text-gray-500">{t('insurance.dash.claimsQueueDesc')}</p>
          </div>
          <span className={`text-[9px] sm:text-[10px] font-black px-2 sm:px-2.5 py-1 rounded border uppercase tracking-wider ${insurer === 'MMI'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-250'
              : 'bg-blue-50 text-blue-800 border-blue-250'
            }`}>
            {insurer} Co-Pay Active
          </span>
        </div>

        {errorMsg && <div className="px-4 sm:px-6 py-2 sm:py-2.5 text-[10px] sm:text-xs text-amber-800 bg-amber-50 border-b border-amber-150 font-bold">{errorMsg}</div>}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[10px] sm:text-xs text-gray-700">
            <thead className="bg-gray-100 text-[9px] sm:text-[10px] font-black text-slate-500 uppercase border-b border-gray-200">
              <tr>
                <th className="px-3 sm:px-6 py-2 sm:py-3">Claim #</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3">{t('common.pharmacy')}</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3">{t('common.medicine')}</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3">{t('common.total')}</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3">{t('common.insurancePortion')}</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3">{t('common.copay')}</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3">{t('common.status')}</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3">{t('common.date')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-3 sm:px-6 py-6 sm:py-8 text-center text-[10px] sm:text-sm text-gray-500">
                    {t('common.loading')}
                  </td>
                </tr>
              ) : !summary?.recentClaims || summary.recentClaims.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 sm:px-6 py-6 sm:py-8 text-center text-[10px] sm:text-sm text-gray-500">
                    {t('common.noData')}
                  </td>
                </tr>
              ) : summary.recentClaims.map((claim) => (
                <tr key={claim.id} className="hover:bg-gray-50/50 font-medium">
                  <td className="px-3 sm:px-6 py-3 sm:py-4 font-bold text-gray-900">{claim.claimNumber}</td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 font-semibold text-gray-800">{claim.pharmacy?.name || 'Pharmacy'}</td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">{claim.medicineName || claim.medicine?.tradeName || claim.medicine?.genericName || 'Unknown Medicine'}</td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 font-bold">{claim.totalAmount.toLocaleString()} {t('common.rwf')}</td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-emerald-800 font-extrabold">{claim.insuranceAmount.toLocaleString()} {t('common.rwf')}</td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-500 font-semibold">{claim.patientAmount.toLocaleString()} {t('common.rwf')}</td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <span className={`inline-block text-[9px] sm:text-[10px] font-bold px-2 sm:px-2.5 py-0.5 rounded border uppercase tracking-wider ${claim.status === 'APPROVED' || claim.status === 'PAID'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : claim.status === 'REJECTED'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                      {formatStatus(claim.status)}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs text-gray-500">
                    {new Date(claim.claimedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
