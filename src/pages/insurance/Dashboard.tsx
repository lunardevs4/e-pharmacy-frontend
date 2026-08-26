import React, { useEffect, useMemo, useState } from 'react'
import { insuranceApi, DashboardSummary } from '@/services/insurance-api'
import { useAuthStore } from '@/store/authStore'
import { Shield } from 'lucide-react'

export default function InsuranceDashboard() {
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
        // Get insurance provider ID from user
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
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
        <div className={`p-2.5 rounded-lg ${insurer === 'MMI' ? 'bg-[#e8f5e9] text-[#2d6a4f]' : 'bg-[#eff6ff] text-[#3b82f6]'}`}>
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-black text-gray-900">{insurer} Executive Dashboard</h1>
          <p className="text-xs text-gray-550">Overview of active claims, payouts, and billing audits for {insurer === 'MMI' ? 'Military Medical Insurance' : 'Rwanda Social Security Board'}.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs text-gray-400 font-bold block uppercase">Total Claims Processed</span>
          <span className="text-2xl font-black text-gray-900 block mt-2">{isLoading ? '—' : summary?.totalClaims || 0}</span>
          <span className="text-xs text-emerald-700 mt-1 font-semibold block">Live claims count</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs text-gray-400 font-bold block uppercase">Average Approval Rate</span>
          <span className="text-2xl font-black text-health-primary block mt-2">{isLoading ? '—' : `${approvalRate}%`}</span>
          <span className="text-xs text-emerald-700 mt-1 font-semibold block">Approval ratio</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs text-gray-400 font-bold block uppercase">Pending Claims</span>
          <span className="text-2xl font-black text-orange-600 block mt-2">{isLoading ? '—' : summary?.pendingClaims || 0}</span>
          <span className="text-xs text-gray-550 mt-1 block">Awaiting audit review</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs text-gray-400 font-bold block uppercase">Total Disbursed</span>
          <span className="text-2xl font-black text-gray-900 block mt-2">
            {isLoading ? '—' : `RWF ${summary?.paidClaimsAmount?.toLocaleString() || 0}`}
          </span>
          <span className="text-xs text-gray-550 mt-1 block">Insurer portion paid</span>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs text-gray-500 font-semibold block uppercase">Total Patients</span>
          <span className="text-2xl font-black text-gray-900 block mt-2">{isLoading ? '—' : summary?.totalPatients || 0}</span>
          <span className="text-xs text-gray-500 mt-1 block">Registered insured patients</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs text-gray-500 font-semibold block uppercase">Active Agreements</span>
          <span className="text-2xl font-black text-gray-900 block mt-2">{isLoading ? '—' : summary?.totalAgreements || 0}</span>
          <span className="text-xs text-gray-500 mt-1 block">Pharmacy partnerships</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs text-gray-500 font-semibold block uppercase">Medicine Tariffs</span>
          <span className="text-2xl font-black text-gray-900 block mt-2">{isLoading ? '—' : summary?.totalTariffs || 0}</span>
          <span className="text-xs text-gray-500 mt-1 block">Covered medicines</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="font-bold text-gray-900 text-sm">{insurer} Claims Queue</h2>
            <p className="text-xs text-gray-500">Live insurance split & contribution tables</p>
          </div>
          <span className={`text-[10px] font-black px-2.5 py-1 rounded border uppercase tracking-wider ${
            insurer === 'MMI'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-250'
              : 'bg-blue-50 text-blue-800 border-blue-250'
          }`}>
            {insurer} Co-Pay Active
          </span>
        </div>

        {errorMsg && <div className="px-6 py-2.5 text-xs text-amber-800 bg-amber-50 border-b border-amber-150 font-bold">{errorMsg}</div>}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-100 text-[10px] font-black text-slate-500 uppercase border-b border-gray-200">
              <tr>
                <th className="px-6 py-3">Claim #</th>
                <th className="px-6 py-3">Pharmacy</th>
                <th className="px-6 py-3">Medicine</th>
                <th className="px-6 py-3">Total Amount</th>
                <th className="px-6 py-3">Insurance Pays</th>
                <th className="px-6 py-3">Patient Pays</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500">
                    Loading claims data...
                  </td>
                </tr>
              ) : !summary?.recentClaims || summary.recentClaims.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500">
                    No insurance claims data is available yet for {insurer}.
                  </td>
                </tr>
              ) : summary.recentClaims.map((claim) => (
                <tr key={claim.id} className="hover:bg-gray-50/50 font-medium">
                  <td className="px-6 py-4 font-bold text-gray-900">{claim.claimNumber}</td>
                  <td className="px-6 py-4 font-semibold text-gray-800">{claim.pharmacy?.name || 'Pharmacy'}</td>
                  <td className="px-6 py-4">{claim.medicineName || claim.medicine?.tradeName || claim.medicine?.genericName || 'Unknown Medicine'}</td>
                  <td className="px-6 py-4 font-bold">RWF {claim.totalAmount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-emerald-800 font-extrabold">RWF {claim.insuranceAmount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-gray-500 font-semibold">RWF {claim.patientAmount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded border uppercase tracking-wider ${
                      claim.status === 'APPROVED' || claim.status === 'PAID'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : claim.status === 'REJECTED'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {claim.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
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
