import React, { useState, useMemo, useEffect } from 'react'
import { DollarSign, CheckCircle2, Clock, Search, Loader2, RefreshCw, AlertTriangle } from 'lucide-react'
import { insuranceApi, InsuranceClaim } from '@/services/insurance-api'
import { useAuthStore } from '@/store/authStore'

interface OutstandingPayment {
  pharmacyId: string
  pharmacyName: string
  claimsCount: number
  totalAmount: number
  insuranceId: string
}

export default function InsurancePayments() {
  const { user } = useAuthStore()
  const [outstandingPayments, setOutstandingPayments] = useState<OutstandingPayment[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const loadOutstandingPayments = async () => {
    setIsLoading(true)
    setErrorMsg(null)
    try {
      const response = await insuranceApi.getOutstandingPayments()
      const paymentsArray = Array.isArray(response) ? response : (response || [])
      setOutstandingPayments(paymentsArray)
    } catch (error: any) {
      setErrorMsg(error?.message || 'Unable to load outstanding payments from backend.')
      setOutstandingPayments([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadOutstandingPayments()
  }, [])

  const processBatch = async (pharmacyId: string) => {
    try {
      const pharmacyPayments = outstandingPayments.filter(p => p.pharmacyId === pharmacyId)
      const claimIds = pharmacyPayments.map(p => p.pharmacyId) // This would need actual claim IDs from API
      await insuranceApi.batchPayClaims({ claimIds })
      setToastMsg(`Payment processed for pharmacy ${pharmacyId}`)
      setTimeout(() => setToastMsg(null), 3000)
      await loadOutstandingPayments()
    } catch (error: any) {
      setErrorMsg(error?.message || 'Failed to process payment.')
    }
  }

  const filtered = outstandingPayments.filter(p =>
    p.pharmacyName.toLowerCase().includes(search.toLowerCase()) || 
    p.pharmacyId.toLowerCase().includes(search.toLowerCase())
  )

  const totals = useMemo(() => {
    const totalDisbursed = 0 // Would come from paid claims API
    const totalPending = outstandingPayments.reduce((a, p) => a + p.totalAmount, 0)
    const pharmaciesPending = outstandingPayments.length

    return { totalDisbursed, totalPending, pharmaciesPending }
  }, [outstandingPayments])

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

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Disbursed',  value: `RWF ${(totals.totalDisbursed/1000000).toFixed(2)}M`, color: 'text-emerald-700', bg: 'bg-emerald-50', Icon: CheckCircle2 },
          { label: 'Awaiting Payment', value: `RWF ${(totals.totalPending/1000000).toFixed(2)}M`,   color: 'text-amber-700',   bg: 'bg-amber-50',   Icon: Clock        },
          { label: 'Pharmacies Pending',  value: totals.pharmaciesPending, color: 'text-blue-700', bg: 'bg-blue-50', Icon: DollarSign },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center space-x-3 shadow-xs">
            <div className={`p-2.5 rounded-lg ${s.bg}`} aria-hidden="true"><s.Icon className={`w-5 h-5 ${s.color}`} /></div>
            <div>
              <span className="text-[10px] text-gray-400 block uppercase font-bold">{s.label}</span>
              <span className={`text-xl font-black ${s.color}`}>{s.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-3">
          <div className="relative flex-grow max-w-sm">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" aria-hidden="true" />
            <input type="search" aria-label="Search payments" placeholder="Search pharmacy..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold" />
          </div>
          <button onClick={loadOutstandingPayments} disabled={isLoading} className="flex items-center space-x-1.5 border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 font-bold px-3 py-2 rounded-lg text-xs transition-colors disabled:opacity-50">
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            <span>{isLoading ? 'Loading...' : 'Refresh'}</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs" aria-label="Insurance payments">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                <th scope="col" className="px-5 py-3">Pharmacy</th>
                <th scope="col" className="px-5 py-3 text-center">Claims</th>
                <th scope="col" className="px-5 py-3">Total Amount</th>
                <th scope="col" className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {isLoading ? (
                <tr><td colSpan={4} className="text-center py-10 text-gray-400 text-xs">Loading payments...</td></tr>
              ) : filtered.map(p => (
                <tr key={p.pharmacyId} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3 font-semibold text-gray-800">{p.pharmacyName}</td>
                  <td className="px-5 py-3 text-center font-bold text-gray-900">{p.claimsCount}</td>
                  <td className="px-5 py-3 font-black text-gray-900">RWF {p.totalAmount.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => processBatch(p.pharmacyId)} aria-label={`Process payment for ${p.pharmacyName}`}
                      className="text-[10px] font-bold px-3 py-1 rounded border border-emerald-200 text-emerald-700 hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600">
                      Process
                    </button>
                  </td>
                </tr>
              ))}
              {!isLoading && filtered.length === 0 && (
                <tr><td colSpan={4} className="text-center py-10 text-gray-400 text-xs">No outstanding payments found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
