import React, { useState } from 'react'
import { DollarSign, CheckCircle2, Clock, Search } from 'lucide-react'

interface Payment {
  id: string
  pharmacy: string
  claimsCount: number
  totalAmount: number
  period: string
  status: 'Pending' | 'Processed' | 'Failed'
}

const MOCK: Payment[] = [
  { id: 'PAY-2026-001', pharmacy: 'Bralirwa Pharmacy',      claimsCount: 42, totalAmount: 1240000, period: 'Jul 2026', status: 'Processed' },
  { id: 'PAY-2026-002', pharmacy: 'CityMed Nyarugenge',     claimsCount: 28, totalAmount: 860000,  period: 'Jul 2026', status: 'Processed' },
  { id: 'PAY-2026-003', pharmacy: 'MedPlus Remera',         claimsCount: 35, totalAmount: 980000,  period: 'Jul 2026', status: 'Pending'   },
  { id: 'PAY-2026-004', pharmacy: 'HealthPoint Kicukiro',   claimsCount: 19, totalAmount: 540000,  period: 'Jul 2026', status: 'Pending'   },
  { id: 'PAY-2026-005', pharmacy: 'Gasabo Health Pharmacy', claimsCount: 11, totalAmount: 310000,  period: 'Jul 2026', status: 'Failed'    },
]

export default function InsurancePayments() {
  const [payments, setPayments] = useState<Payment[]>(MOCK)
  const [search, setSearch] = useState('')

  const process = (id: string) =>
    setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'Processed' } : p))

  const filtered = payments.filter(p =>
    p.pharmacy.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase())
  )

  const totalDisbursed = payments.filter(p => p.status === 'Processed').reduce((a, p) => a + p.totalAmount, 0)
  const totalPending   = payments.filter(p => p.status === 'Pending').reduce((a, p) => a + p.totalAmount, 0)

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Disbursed',  value: `RWF ${(totalDisbursed/1000000).toFixed(2)}M`, color: 'text-emerald-700', bg: 'bg-emerald-50', Icon: CheckCircle2 },
          { label: 'Awaiting Payment', value: `RWF ${(totalPending/1000000).toFixed(2)}M`,   color: 'text-amber-700',   bg: 'bg-amber-50',   Icon: Clock        },
          { label: 'Pharmacies Paid',  value: payments.filter(p => p.status === 'Processed').length, color: 'text-blue-700', bg: 'bg-blue-50', Icon: DollarSign },
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
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" aria-hidden="true" />
            <input type="search" aria-label="Search payments" placeholder="Search pharmacy or payment ID..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs" aria-label="Insurance payments">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                <th scope="col" className="px-5 py-3">Payment ID</th>
                <th scope="col" className="px-5 py-3">Pharmacy</th>
                <th scope="col" className="px-5 py-3 text-center">Claims</th>
                <th scope="col" className="px-5 py-3">Total Amount</th>
                <th scope="col" className="px-5 py-3">Period</th>
                <th scope="col" className="px-5 py-3">Status</th>
                <th scope="col" className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3 font-mono font-bold text-gray-900">{p.id}</td>
                  <td className="px-5 py-3 font-semibold text-gray-800">{p.pharmacy}</td>
                  <td className="px-5 py-3 text-center font-bold text-gray-900">{p.claimsCount}</td>
                  <td className="px-5 py-3 font-black text-gray-900">RWF {p.totalAmount.toLocaleString()}</td>
                  <td className="px-5 py-3 text-gray-500">{p.period}</td>
                  <td className="px-5 py-3">
                    {p.status === 'Processed' && <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">Processed</span>}
                    {p.status === 'Pending'   && <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">Pending</span>}
                    {p.status === 'Failed'    && <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">Failed</span>}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {p.status === 'Pending' && (
                      <button onClick={() => process(p.id)} aria-label={`Process payment ${p.id}`}
                        className="text-[10px] font-bold px-3 py-1 rounded border border-emerald-200 text-emerald-700 hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600">
                        Process
                      </button>
                    )}
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
