import React, { useState, useEffect } from 'react'
import { Users, Search, Shield, Loader2, RefreshCw, AlertTriangle } from 'lucide-react'
import { AuthApi } from '@/services/auth-api'
import { useAuthStore } from '@/store/authStore'

interface PolicyHolder {
  id: string
  name: string
  nid: string
  phone: string
  insurer: string
  policyId: string
  coverage: number
  activeClaims: number
  status: 'Active' | 'Inactive' | 'Suspended'
}

const FALLBACK: PolicyHolder[] = [
  { id: 'POL-001', name: 'Marie Uwimana',         nid: '1199580048123984', phone: '+250 788 123 456', insurer: 'RSSB',    policyId: 'RSSB-2024-00112', coverage: 85, activeClaims: 1, status: 'Active'    },
  { id: 'POL-002', name: 'Jean-Pierre Nkurunziza', nid: '1199380092384728', phone: '+250 788 234 567', insurer: 'MMI',     policyId: 'MMI-2025-00892',  coverage: 90, activeClaims: 0, status: 'Active'    },
  { id: 'POL-003', name: 'Aline Mukamana',         nid: '1199680018374829', phone: '+250 788 345 678', insurer: 'RSSB',    policyId: 'RSSB-2023-00784', coverage: 85, activeClaims: 2, status: 'Active'    },
  { id: 'POL-004', name: 'Emmanuel Habimana',      nid: '1199080037284729', phone: '+250 788 456 789', insurer: 'SANLAM',  policyId: 'SAL-2024-00341',  coverage: 75, activeClaims: 0, status: 'Inactive'  },
  { id: 'POL-005', name: 'Clarisse Ingabire',      nid: '1199880018374928', phone: '+250 788 567 890', insurer: 'Radiant', policyId: 'RAD-2026-00021',  coverage: 70, activeClaims: 0, status: 'Active'    },
  { id: 'POL-006', name: 'Robert Uwera',           nid: '1198980028384920', phone: '+250 788 678 901', insurer: 'RSSB',    policyId: 'RSSB-2022-00223', coverage: 85, activeClaims: 1, status: 'Suspended' },
  { id: 'POL-007', name: 'Jean-Paul Mutabazi',     nid: '1199180028374829', phone: '+250 788 789 012', insurer: 'MMI',     policyId: 'MMI-2024-00234',  coverage: 90, activeClaims: 1, status: 'Active'    },
  { id: 'POL-008', name: 'Divine Uwera',           nid: '1199480038472918', phone: '+250 788 890 123', insurer: 'MMI',     policyId: 'MMI-2023-00123',  coverage: 90, activeClaims: 0, status: 'Active'    },
]

const STATUS_STYLE: Record<string, string> = {
  Active:    'text-emerald-700 bg-emerald-50 border-emerald-200',
  Inactive:  'text-gray-500 bg-gray-100 border-gray-200',
  Suspended: 'text-red-700 bg-red-50 border-red-200',
}

const normalizePolicyHolder = (item: any): PolicyHolder => {
  const user = item.user || item.patient?.user || {}
  return {
    id: item.id || item.policyId || `POL-${Math.random().toString(36).substr(2, 8)}`,
    name: [user.firstName, user.lastName].filter(Boolean).join(' ') || item.name || 'Policyholder',
    nid: user.nid || item.nid || '—',
    phone: user.phone || item.phone || '—',
    insurer: item.insurer || item.insuranceProvider || 'Unknown',
    policyId: item.policyId || item.id || '—',
    coverage: Number(item.coverage || 0),
    activeClaims: Number(item.activeClaims || 0),
    status: user.isActive === false ? 'Inactive' : item.status === 'SUSPENDED' ? 'Suspended' : 'Active',
  }
}

export default function InsurancePatients() {
  const { user } = useAuthStore()
  const insurer = user?.insuranceProvider || 'RSSB'
  const [patients, setPatients] = useState<PolicyHolder[]>(FALLBACK)
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const loadPatients = async () => {
    setIsLoading(true)
    setErrorMsg(null)
    try {
      const data = await AuthApi.getInsurancePatients()
      if (data.length > 0) {
        setPatients(data.map(normalizePolicyHolder))
      }
    } catch (error: any) {
      console.warn('Using fallback patients data due to error:', error)
      setErrorMsg(error?.message || 'Unable to load patients from backend. Using fallback data.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPatients()
  }, [])

  const filtered = patients.filter(p => {
    const q = search.toLowerCase()
    const pInsurer = p.insurer || ''
    return pInsurer.toUpperCase() === insurer.toUpperCase() &&
      (p.name.toLowerCase().includes(q) || p.nid.includes(q) || p.policyId.toLowerCase().includes(q))
  })

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
          <div className="bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-xs text-gray-600 font-extrabold flex items-center gap-1.5 shadow-xs">
            <span>Insurer:</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
              insurer === 'MMI' ? 'bg-emerald-100 text-emerald-900 border border-emerald-250' : 'bg-blue-100 text-blue-900 border border-blue-250'
            }`}>{insurer}</span>
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
                        {p.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <span className="font-bold text-gray-900">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-mono text-gray-500">{p.nid}</td>
                  <td className="px-5 py-3 text-gray-600">{p.phone}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center space-x-1 font-bold text-gray-700">
                      <Shield className="w-3 h-3 text-emerald-600" aria-hidden="true" />
                      <span>{p.insurer}</span>
                    </span>
                  </td>
                  <td className="px-5 py-3 font-mono text-gray-700">{p.policyId}</td>
                  <td className="px-5 py-3 text-center font-black text-emerald-700">{p.coverage}%</td>
                  <td className="px-5 py-3 text-center font-black text-gray-900">{p.activeClaims}</td>
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
