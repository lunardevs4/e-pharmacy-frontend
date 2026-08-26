import React, { useState, useEffect } from 'react'
import { Users, Search, Shield, Loader2, RefreshCw, AlertTriangle } from 'lucide-react'
import { insuranceApi, InsuredPatient } from '@/services/insurance-api'
import { useAuthStore } from '@/store/authStore'

const STATUS_STYLE: Record<string, string> = {
  ACTIVE:    'text-emerald-700 bg-emerald-50 border-emerald-200',
  INACTIVE:  'text-gray-500 bg-gray-100 border-gray-200',
  SUSPENDED: 'text-red-700 bg-red-50 border-red-200',
}

export default function InsurancePatients() {
  const { user } = useAuthStore()
  const [patients, setPatients] = useState<InsuredPatient[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const loadPatients = async () => {
    setIsLoading(true)
    setErrorMsg(null)
    try {
      // Get insurance provider ID from user
      const providers = await insuranceApi.getProviders()
      const insurer = user?.insuranceProvider || 'RSSB'
      const matchedProvider = providers.find(p => p.code === insurer || p.name === insurer)
      const insuranceId = matchedProvider?.id
      
      const response = await insuranceApi.getPatients({ insuranceId })
      // The API returns { data: InsuredPatient[], meta: any }
      const patientsArray = Array.isArray(response?.data) ? response.data : []
      setPatients(patientsArray)
    } catch (error: any) {
      setErrorMsg(error?.message || 'Unable to load patients from backend.')
      setPatients([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPatients()
  }, [])

  const filtered = Array.isArray(patients) ? patients.filter(p => {
    const q = search.toLowerCase()
    return (p.fullName.toLowerCase().includes(q) || 
           p.nationalId.includes(q) || 
           p.policyNumber.toLowerCase().includes(q))
  }) : []

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2 text-red-800 text-xs">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center space-x-2">
        <Users className="w-5 h-5 text-emerald-700" aria-hidden="true" />
        <div>
          <h1 className="text-xl font-black text-gray-900">Patients & Policyholders</h1>
          <p className="text-xs text-gray-500">List of insured citizens. Manage policies and verify health insurance ID status.</p>
        </div>
        <button onClick={loadPatients} disabled={isLoading} className="ml-auto flex items-center space-x-1.5 border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 font-bold px-3 py-2 rounded-lg text-xs transition-colors disabled:opacity-50">
          {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          <span>{isLoading ? 'Loading...' : 'Refresh'}</span>
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow max-w-sm">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" aria-hidden="true" />
            <input type="search" aria-label="Search policyholders" placeholder="Search name, NID, or policy ID..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs" aria-label="Insured policyholders">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                <th scope="col" className="px-5 py-3">Patient</th>
                <th scope="col" className="px-5 py-3">National ID</th>
                <th scope="col" className="px-5 py-3">Phone</th>
                <th scope="col" className="px-5 py-3">Insurer</th>
                <th scope="col" className="px-5 py-3">Policy ID</th>
                <th scope="col" className="px-5 py-3 text-center">Coverage</th>
                <th scope="col" className="px-5 py-3 text-center">Active Claims</th>
                <th scope="col" className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {isLoading ? (
                <tr><td colSpan={8} className="text-center py-10 text-gray-400 text-xs">Loading patients...</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center space-x-2">
                      <div aria-hidden="true" className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-600 flex-shrink-0">
                        {p.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                      </div>
                      <span className="font-bold text-gray-900">{p.fullName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-mono text-gray-500">{p.nationalId}</td>
                  <td className="px-5 py-3 text-gray-600">{p.phone || '—'}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center space-x-1 font-bold text-gray-700">
                      <Shield className="w-3 h-3 text-emerald-600" aria-hidden="true" />
                      <span>{p.insurance?.name || 'Unknown'}</span>
                    </span>
                  </td>
                  <td className="px-5 py-3 font-mono text-gray-700">{p.policyNumber}</td>
                  <td className="px-5 py-3 text-center font-black text-emerald-700">{p.coveragePercentage || 0}%</td>
                  <td className="px-5 py-3 text-center font-black text-gray-900">{p.claims?.length || 0}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex text-[10px] font-bold border px-2 py-0.5 rounded ${STATUS_STYLE[p.status]}`}>{p.status}</span>
                  </td>
                </tr>
              ))}
              {!isLoading && filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-10 text-gray-400 text-xs">No policyholders match the current filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
