import React, { useEffect, useMemo, useState } from 'react'
import { AuthApi } from '@/services/auth-api'
import { useAuthStore } from '@/store/authStore'
import { Shield } from 'lucide-react'

const FALLBACK_CLAIMS = [
  { id: 'CLM-2026-001', pharmacy: { name: 'Bralirwa Pharmacy' }, patientNid: '1199580048123984', drug: 'Artemether + Lumefantrine', total: 3500,  insurancePay: 2975, patientPay: 525,  insurer: 'RSSB', status: 'PENDING' },
  { id: 'CLM-2026-002', pharmacy: { name: 'CityMed Nyarugenge' }, patientNid: '1199080037284729', drug: 'Metformin 850mg',           total: 1920,  insurancePay: 1728, patientPay: 192,  insurer: 'RSSB', status: 'APPROVED' },
  { id: 'CLM-2026-003', pharmacy: { name: 'MedPlus Remera' },         patientNid: '1199680018374829', drug: 'Insulin Glargine',          total: 27000, insurancePay: 24300, patientPay: 2700, insurer: 'MMI', status: 'APPROVED' },
  { id: 'CLM-2026-004', pharmacy: { name: 'HealthPoint Kicukiro' },   patientNid: '1199380092384728', drug: 'Amoxicillin 500mg',         total: 1600,  insurancePay: 1200, patientPay: 400,  insurer: 'SANLAM', status: 'REJECTED' },
  { id: 'CLM-2026-005', pharmacy: { name: 'Bralirwa Pharmacy' },      patientNid: '1199880018374928', drug: 'Atenolol 50mg',             total: 950,   insurancePay: 665,  patientPay: 285,  insurer: 'Radiant', status: 'APPROVED' },
  { id: 'CLM-2026-006', pharmacy: { name: 'Gasabo Health Pharmacy' }, patientNid: '1198980028384920', drug: 'Paracetamol 500mg',         total: 1200, insurancePay: 1020, patientPay: 180, insurer: 'RSSB', status: 'APPROVED' },
  { id: 'CLM-2026-007', pharmacy: { name: 'Kigali National Pharmacy' }, patientNid: '1199580048123984', drug: 'Coartem 20/120mg',       total: 4500,  insurancePay: 3825, patientPay: 675,  insurer: 'RSSB', status: 'PENDING' },
  { id: 'CLM-2026-008', pharmacy: { name: 'CityMed Gikondo' },        patientNid: '1199080037284729', drug: 'Atorvastatin 20mg',        total: 12000, insurancePay: 10800, patientPay: 1200, insurer: 'MMI', status: 'PENDING' },
  { id: 'CLM-2026-009', pharmacy: { name: 'Rubavu Health Center' },   patientNid: '1199680018374829', drug: 'Ciprofloxacin 500mg',       total: 3200,  insurancePay: 2880, patientPay: 320,  insurer: 'MMI', status: 'PENDING' },
]

export default function InsuranceDashboard() {
  const { user } = useAuthStore()
  const insurer = user?.insuranceProvider || 'RSSB'
  const [claims, setClaims] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      setErrorMsg(null)
      try {
        const report = await AuthApi.getInsuranceReport().catch(() => null)
        if ((report as any)?.claims?.length) {
          const normalized = (report as any).claims.map((c: any) => ({
            ...c,
            insurer: c.insurer || c.insuranceProvider || 'RSSB'
          }))
          setClaims(normalized)
        } else {
          setClaims(FALLBACK_CLAIMS)
        }
      } catch (err: any) {
        setClaims(FALLBACK_CLAIMS)
        setErrorMsg('Unable to reach live API server. Running in offline demo mode.')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredClaims = useMemo(() => {
    return claims.filter((item) => {
      const itemInsurer = item.insurer || item.insuranceProvider || ''
      return itemInsurer.toUpperCase() === insurer.toUpperCase()
    })
  }, [claims, insurer])

  const summary = useMemo(() => {
    const totalCount = filteredClaims.length
    const approved = filteredClaims.filter((item) => {
      const status = String(item.status || '').toUpperCase()
      return status === 'APPROVED' || status === 'PAID'
    }).length
    const pending = filteredClaims.filter((item) => String(item.status || '').toUpperCase() === 'PENDING').length
    const totalDisbursed = filteredClaims.reduce((sum, item) => sum + Number(item.insurancePay || item.insurancePays || 0), 0)
    
    return { totalCount, approved, pending, totalDisbursed }
  }, [filteredClaims])

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
          <span className="text-2xl font-black text-gray-900 block mt-2">{isLoading ? '—' : summary.totalCount}</span>
          <span className="text-xs text-emerald-700 mt-1 font-semibold block">Live claims count</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs text-gray-400 font-bold block uppercase">Average Approval Rate</span>
          <span className="text-2xl font-black text-health-primary block mt-2">
            {summary.totalCount ? `${Math.round((summary.approved / summary.totalCount) * 100)}%` : '—'}
          </span>
          <span className="text-xs text-emerald-700 mt-1 font-semibold block">Approval ratio</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs text-gray-400 font-bold block uppercase">Pending Claims</span>
          <span className="text-2xl font-black text-orange-600 block mt-2">{summary.pending}</span>
          <span className="text-xs text-gray-550 mt-1 block">Awaiting audit review</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs text-gray-400 font-bold block uppercase">Total Disbursed</span>
          <span className="text-2xl font-black text-gray-900 block mt-2">
            {isLoading ? '—' : `RWF ${summary.totalDisbursed.toLocaleString()}`}
          </span>
          <span className="text-xs text-gray-550 mt-1 block">Insurer portion paid</span>
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
                <th className="px-6 py-3">Claim ID</th>
                <th className="px-6 py-3">Pharmacy</th>
                <th className="px-6 py-3">Patient NID</th>
                <th className="px-6 py-3">Drug</th>
                <th className="px-6 py-3">Total Cost</th>
                <th className="px-6 py-3">Insurer Split</th>
                <th className="px-6 py-3">Patient Split</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150">
              {filteredClaims.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500">
                    No insurance claims data is available yet for {insurer}.
                  </td>
                </tr>
              ) : filteredClaims.map((claim, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 font-medium">
                  <td className="px-6 py-4 font-bold text-gray-900">{claim.id || `CLM-${idx + 1}`}</td>
                  <td className="px-6 py-4 font-semibold text-gray-800">{claim.pharmacy?.name || claim.pharmacy || 'Pharmacy'}</td>
                  <td className="px-6 py-4 font-mono text-xs">{claim.patientNid || claim.patient?.nid || '—'}</td>
                  <td className="px-6 py-4">{claim.drug || claim.medicine?.name || 'Medication'}</td>
                  <td className="px-6 py-4 font-bold">RWF {Number(claim.total || 0).toLocaleString()}</td>
                  <td className="px-6 py-4 text-emerald-800 font-extrabold">RWF {Number(claim.insurancePay || claim.insurancePays || 0).toLocaleString()}</td>
                  <td className="px-6 py-4 text-gray-500 font-semibold">RWF {Number(claim.patientPay || claim.patientPays || 0).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded border uppercase tracking-wider ${
                      String(claim.status || '').toUpperCase() === 'APPROVED' || String(claim.status || '').toUpperCase() === 'PAID'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : String(claim.status || '').toUpperCase() === 'REJECTED'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
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
