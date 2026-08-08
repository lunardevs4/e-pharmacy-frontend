import React, { useEffect, useMemo, useState } from 'react'
import { AuthApi } from '@/services/auth-api'

export default function InsuranceDashboard() {
  const [claims, setClaims] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      setErrorMsg(null)
      try {
        const report = await AuthApi.getInsuranceReport().catch(() => null)
        if (report?.claims?.length) {
          setClaims(report.claims)
        } else {
          setClaims([])
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Unable to load insurance claims data.')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const summary = useMemo(() => {
    const approved = claims.filter((item) => String(item.status).toUpperCase() === 'APPROVED').length
    const pending = claims.filter((item) => String(item.status).toUpperCase() === 'PENDING').length
    return { approved, pending }
  }, [claims])

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs text-gray-500 font-semibold block uppercase">Total Claims Processed</span>
          <span className="text-2xl font-black text-gray-900 block mt-2">{isLoading ? '—' : claims.length}</span>
          <span className="text-xs text-emerald-700 mt-1 font-semibold block">Live claims count</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs text-gray-500 font-semibold block uppercase">Average Approval Rate</span>
          <span className="text-2xl font-black text-health-primary block mt-2">{claims.length ? `${Math.round((summary.approved / claims.length) * 100)}%` : '—'}</span>
          <span className="text-xs text-emerald-700 mt-1 font-semibold block">Approval ratio</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs text-gray-500 font-semibold block uppercase">Pending Claims</span>
          <span className="text-2xl font-black text-orange-600 block mt-2">{summary.pending}</span>
          <span className="text-xs text-gray-500 mt-1 block">Awaiting review</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs text-gray-500 font-semibold block uppercase">Total Disbursed</span>
          <span className="text-2xl font-black text-gray-900 block mt-2">{claims.length ? `RWF ${claims.reduce((sum, item) => sum + Number(item.totalCost || item.total || 0), 0).toLocaleString()}` : '—'}</span>
          <span className="text-xs text-gray-500 mt-1 block">Estimated claims value</span>
        </div>
      </div>

      {/* Claims Table / Dashboard section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Claims Review Queue</h2>
            <p className="text-xs text-gray-500">Live insurance split & contribution tables</p>
          </div>
          <span className="text-xs font-semibold px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full">
            RSSB Co-Pay Active
          </span>
        </div>

        {errorMsg && <div className="px-6 py-3 text-sm text-red-600">{errorMsg}</div>}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-100 text-xs font-semibold text-gray-650 uppercase border-b border-gray-200">
              <tr>
                <th className="px-6 py-3">Claim ID</th>
                <th className="px-6 py-3">Pharmacy</th>
                <th className="px-6 py-3">Patient NID</th>
                <th className="px-6 py-3">Drug</th>
                <th className="px-6 py-3">Total Cost</th>
                <th className="px-6 py-3">Insurance Split</th>
                <th className="px-6 py-3">Patient Split</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150">
              {claims.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500">
                    No insurance claims data is available yet from the backend.
                  </td>
                </tr>
              ) : claims.map((claim, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-bold text-gray-900">{claim.id || `CLM-${idx + 1}`}</td>
                  <td className="px-6 py-4 font-semibold text-gray-800">{claim.pharmacy?.name || claim.pharmacy || 'Pharmacy'}</td>
                  <td className="px-6 py-4 font-mono text-xs">{claim.patientNid || claim.patient?.nid || '—'}</td>
                  <td className="px-6 py-4">{claim.drug || claim.medicine?.name || 'Medication'}</td>
                  <td className="px-6 py-4 font-bold">{claim.total ? `RWF ${claim.total}` : '—'}</td>
                  <td className="px-6 py-4 text-emerald-800 font-semibold">{claim.insurancePay ? `RWF ${claim.insurancePay}` : '—'}</td>
                  <td className="px-6 py-4 text-gray-650 font-semibold">{claim.patientPay ? `RWF ${claim.patientPay}` : '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${
                      String(claim.status || '').toUpperCase() === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-850'
                    }`}>
                      {claim.status || 'PENDING'}
                    </span>
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
