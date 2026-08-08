import React, { useState } from 'react'
import { Users, Search, Shield } from 'lucide-react'

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

const MOCK: PolicyHolder[] = [
  { id: 'POL-001', name: 'Marie Uwimana',         nid: '1199580048123984', phone: '+250 788 123 456', insurer: 'RSSB',    policyId: 'RSSB-2024-00112', coverage: 85, activeClaims: 1, status: 'Active'    },
  { id: 'POL-002', name: 'Jean-Pierre Nkurunziza', nid: '1199380092384728', phone: '+250 788 234 567', insurer: 'MMI',     policyId: 'MMI-2025-00892',  coverage: 90, activeClaims: 0, status: 'Active'    },
  { id: 'POL-003', name: 'Aline Mukamana',         nid: '1199680018374829', phone: '+250 788 345 678', insurer: 'RSSB',    policyId: 'RSSB-2023-00784', coverage: 85, activeClaims: 2, status: 'Active'    },
  { id: 'POL-004', name: 'Emmanuel Habimana',      nid: '1199080037284729', phone: '+250 788 456 789', insurer: 'SANLAM',  policyId: 'SAL-2024-00341',  coverage: 75, activeClaims: 0, status: 'Inactive'  },
  { id: 'POL-005', name: 'Clarisse Ingabire',      nid: '1199880018374928', phone: '+250 788 567 890', insurer: 'Radiant', policyId: 'RAD-2026-00021',  coverage: 70, activeClaims: 0, status: 'Active'    },
  { id: 'POL-006', name: 'Robert Uwera',           nid: '1198980028384920', phone: '+250 788 678 901', insurer: 'RSSB',    policyId: 'RSSB-2022-00223', coverage: 85, activeClaims: 1, status: 'Suspended' },
]

const STATUS_STYLE: Record<string, string> = {
  Active:    'text-emerald-700 bg-emerald-50 border-emerald-200',
  Inactive:  'text-gray-500 bg-gray-100 border-gray-200',
  Suspended: 'text-red-700 bg-red-50 border-red-200',
}

export default function InsurancePatients() {
  const [search, setSearch] = useState('')
  const [insurerFilter, setInsurerFilter] = useState('')

  const filtered = MOCK.filter(p => {
    const q = search.toLowerCase()
    return (p.name.toLowerCase().includes(q) || p.nid.includes(q) || p.policyId.toLowerCase().includes(q)) &&
      (insurerFilter ? p.insurer === insurerFilter : true)
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">

      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center space-x-2">
        <Users className="w-5 h-5 text-emerald-700" aria-hidden="true" />
        <div>
          <h1 className="text-xl font-black text-gray-900">Patients & Policyholders</h1>
          <p className="text-xs text-gray-500">List of insured citizens. Manage policies and verify health insurance ID status.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow max-w-sm">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" aria-hidden="true" />
            <input type="search" aria-label="Search policyholders" placeholder="Search name, NID, or policy ID..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold" />
          </div>
          <select aria-label="Filter by insurer" value={insurerFilter} onChange={e => setInsurerFilter(e.target.value)}
            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-700 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="">All Insurers</option>
            <option value="RSSB">RSSB</option>
            <option value="MMI">MMI</option>
            <option value="SANLAM">SANLAM</option>
            <option value="Radiant">Radiant</option>
          </select>
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
              {filtered.map(p => (
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
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-10 text-gray-400 text-xs">No policyholders match the current filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
