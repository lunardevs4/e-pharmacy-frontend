import React, { useState, useEffect, useMemo } from 'react'
import { FileText, Search, CheckCircle2, XCircle, Clock, AlertTriangle, Loader2, RefreshCw } from 'lucide-react'
import { insuranceApi, InsuranceClaim } from '@/services/insurance-api'
import { useAuthStore } from '@/store/authStore'

type ClaimStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID'

const STATUS_STYLE: Record<ClaimStatus, string> = {
  PENDING:  'text-amber-700 bg-amber-50 border-amber-200',
  APPROVED: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  REJECTED: 'text-red-700 bg-red-50 border-red-200',
  PAID:     'text-blue-700 bg-blue-50 border-blue-200',
}

export default function InsuranceClaims() {
  const { user } = useAuthStore()
  const [claims, setClaims] = useState<InsuranceClaim[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | ''>('')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const loadClaims = async () => {
    setIsLoading(true)
    setErrorMsg(null)
    try {
      const providers = await insuranceApi.getProviders()
      const insurer = user?.insuranceProvider || 'RSSB'
      const matchedProvider = providers.find(p => p.code === insurer || p.name === insurer)
      const insuranceId = matchedProvider?.id
      
      const response = await insuranceApi.getClaims({ insuranceId })
      const claimsArray = response?.data || []
      setClaims(claimsArray)
    } catch (error: any) {
      setErrorMsg(error?.message || 'Unable to load claims from backend.')
      setClaims([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadClaims()
  }, [])

  const triggerToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  const update = async (id: string, status: ClaimStatus) => {
    try {
      await insuranceApi.updateClaimStatus(id, { status })
      triggerToast(`Claim ${id} status updated to ${status}`)
      await loadClaims()
    } catch (error: any) {
      setErrorMsg(error?.message || 'Failed to update claim status.')
    }
  }

  const filtered = Array.isArray(claims) ? claims.filter(c => {
    const q = search.toLowerCase()
    return (c.claimNumber.toLowerCase().includes(q) || 
           c.pharmacy?.name?.toLowerCase().includes(q) || 
           c.medicine?.tradeName?.toLowerCase().includes(q)) &&
      (statusFilter ? c.status === statusFilter : true)
  }) : []

  const totals = useMemo(() => {
    const claimsArray = Array.isArray(claims) ? claims : []
    return {
      pending: claimsArray.filter(c => c.status === 'PENDING').length,
      approved: claimsArray.filter(c => c.status === 'APPROVED').length,
      paid:     claimsArray.filter(c => c.status === 'PAID').length,
      rejected: claimsArray.filter(c => c.status === 'REJECTED').length,
    }
  }, [claims])

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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" role="list" aria-label="Claims statistics">
        {[
          { label: 'Pending Review', value: totals.pending,  color: 'text-amber-700',   bg: 'bg-amber-50',   Icon: Clock        },
          { label: 'Approved',       value: totals.approved, color: 'text-emerald-700', bg: 'bg-emerald-50', Icon: CheckCircle2 },
          { label: 'Paid Out',       value: totals.paid,     color: 'text-blue-700',    bg: 'bg-blue-50',    Icon: FileText     },
          { label: 'Rejected',       value: totals.rejected, color: 'text-red-700',     bg: 'bg-red-50',     Icon: XCircle      },
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

      <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow max-w-sm">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" aria-hidden="true" />
            <input type="search" aria-label="Search claims" placeholder="Search claim, pharmacy, medicine..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold" />
          </div>
          <select aria-label="Filter by status" value={statusFilter} onChange={e => setStatusFilter(e.target.value as ClaimStatus | '')}
            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-700 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="PAID">Paid</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <button onClick={loadClaims} disabled={isLoading} className="flex items-center space-x-1.5 border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 font-bold px-3 py-2 rounded-lg text-xs transition-colors disabled:opacity-50">
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            <span>{isLoading ? 'Loading...' : 'Refresh'}</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs" aria-label="Insurance claims">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                <th scope="col" className="px-5 py-3">Claim ID</th>
                <th scope="col" className="px-5 py-3">Pharmacy</th>
                <th scope="col" className="px-5 py-3">Patient NID</th>
                <th scope="col" className="px-5 py-3">Medicine</th>
                <th scope="col" className="px-5 py-3">Total</th>
                <th scope="col" className="px-5 py-3">Insurer Pays</th>
                <th scope="col" className="px-5 py-3">Patient Pays</th>
                <th scope="col" className="px-5 py-3">Date</th>
                <th scope="col" className="px-5 py-3">Status</th>
                <th scope="col" className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {isLoading ? (
                <tr><td colSpan={10} className="text-center py-10 text-gray-400 text-xs">Loading claims...</td></tr>
              ) : filtered.map(c => (
                <tr key={c.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3 font-mono font-bold text-gray-900">{c.claimNumber}</td>
                  <td className="px-5 py-3 font-semibold text-gray-800">{c.pharmacy?.name || 'Pharmacy'}</td>
                  <td className="px-5 py-3 font-mono text-gray-500">{c.insuredPatientId}</td>
                  <td className="px-5 py-3">{c.medicineName || c.medicine?.tradeName || c.medicine?.genericName || 'Unknown Medicine'}</td>
                  <td className="px-5 py-3 font-black text-gray-900">RWF {c.totalAmount.toLocaleString()}</td>
                  <td className="px-5 py-3 text-emerald-700 font-bold">RWF {c.insuranceAmount.toLocaleString()}</td>
                  <td className="px-5 py-3 text-gray-700 font-semibold">RWF {c.patientAmount.toLocaleString()}</td>
                  <td className="px-5 py-3 font-mono text-gray-400">{new Date(c.claimedAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex text-[10px] font-bold border px-2 py-0.5 rounded ${STATUS_STYLE[c.status]}`}>{c.status}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end space-x-1.5">
                      {c.status === 'PENDING' && (
                        <>
                          <button onClick={() => update(c.id, 'APPROVED')} aria-label={`Approve claim ${c.id}`}
                            className="text-[10px] font-bold px-2 py-1 rounded border border-emerald-200 text-emerald-700 hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600">
                            Approve
                          </button>
                          <button onClick={() => update(c.id, 'REJECTED')} aria-label={`Reject claim ${c.id}`}
                            className="text-[10px] font-bold px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-400">
                            Reject
                          </button>
                        </>
                      )}
                      {c.status === 'APPROVED' && (
                        <button onClick={() => update(c.id, 'PAID')} aria-label={`Mark claim ${c.id} as paid`}
                          className="text-[10px] font-bold px-2 py-1 rounded border border-blue-200 text-blue-700 hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400">
                          Mark Paid
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && filtered.length === 0 && (
                <tr><td colSpan={10} className="text-center py-10 text-gray-400 text-xs">No claims match the current filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
