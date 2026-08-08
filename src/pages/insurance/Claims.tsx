import React, { useState } from 'react'
import { FileText, Search, CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react'

type ClaimStatus = 'Pending' | 'Approved' | 'Rejected' | 'Paid'

interface Claim {
  id: string
  pharmacy: string
  patientNid: string
  medicine: string
  qty: number
  total: number
  insurancePays: number
  patientPays: number
  insurer: string
  submittedAt: string
  status: ClaimStatus
}

const MOCK: Claim[] = [
  { id: 'CLM-2026-001', pharmacy: 'Bralirwa Pharmacy',      patientNid: '1199580048123984', medicine: 'Artemether + Lumefantrine', qty: 1, total: 3500,  insurancePays: 2975, patientPays: 525,  insurer: 'RSSB',   submittedAt: '2026-08-01', status: 'Pending'  },
  { id: 'CLM-2026-002', pharmacy: 'CityMed Nyarugenge',     patientNid: '1199080037284729', medicine: 'Metformin 850mg',           qty: 2, total: 1920,  insurancePays: 1728, patientPays: 192,  insurer: 'RSSB',   submittedAt: '2026-08-01', status: 'Approved' },
  { id: 'CLM-2026-003', pharmacy: 'MedPlus Remera',         patientNid: '1199680018374829', medicine: 'Insulin Glargine',          qty: 1, total: 27000, insurancePays: 24300,patientPays: 2700, insurer: 'MMI',    submittedAt: '2026-07-31', status: 'Paid'     },
  { id: 'CLM-2026-004', pharmacy: 'HealthPoint Kicukiro',   patientNid: '1199380092384728', medicine: 'Amoxicillin 500mg',         qty: 2, total: 1600,  insurancePays: 1200, patientPays: 400,  insurer: 'SANLAM', submittedAt: '2026-07-31', status: 'Rejected' },
  { id: 'CLM-2026-005', pharmacy: 'Bralirwa Pharmacy',      patientNid: '1199880018374928', medicine: 'Atenolol 50mg',             qty: 1, total: 950,   insurancePays: 665,  patientPays: 285,  insurer: 'Radiant',submittedAt: '2026-07-30', status: 'Approved' },
  { id: 'CLM-2026-006', pharmacy: 'Gasabo Health Pharmacy', patientNid: '1198980028384920', medicine: 'Paracetamol 500mg',         qty: 4, total: 1200,  insurancePays: 1020, patientPays: 180,  insurer: 'RSSB',   submittedAt: '2026-07-30', status: 'Paid'     },
]

const STATUS_STYLE: Record<ClaimStatus, string> = {
  Pending:  'text-amber-700 bg-amber-50 border-amber-200',
  Approved: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  Rejected: 'text-red-700 bg-red-50 border-red-200',
  Paid:     'text-blue-700 bg-blue-50 border-blue-200',
}

export default function InsuranceClaims() {
  const [claims, setClaims] = useState<Claim[]>(MOCK)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | ''>('')

  const update = (id: string, status: ClaimStatus) =>
    setClaims(prev => prev.map(c => c.id === id ? { ...c, status } : c))

  const filtered = claims.filter(c => {
    const q = search.toLowerCase()
    return (c.id.toLowerCase().includes(q) || c.pharmacy.toLowerCase().includes(q) || c.medicine.toLowerCase().includes(q)) &&
      (statusFilter ? c.status === statusFilter : true)
  })

  const totals = {
    pending:  claims.filter(c => c.status === 'Pending').length,
    approved: claims.filter(c => c.status === 'Approved').length,
    paid:     claims.filter(c => c.status === 'Paid').length,
    rejected: claims.filter(c => c.status === 'Rejected').length,
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">

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
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Paid">Paid</option>
            <option value="Rejected">Rejected</option>
          </select>
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
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3 font-mono font-bold text-gray-900">{c.id}</td>
                  <td className="px-5 py-3 font-semibold text-gray-800">{c.pharmacy}</td>
                  <td className="px-5 py-3 font-mono text-gray-500">{c.patientNid}</td>
                  <td className="px-5 py-3">{c.medicine}</td>
                  <td className="px-5 py-3 font-black text-gray-900">RWF {c.total.toLocaleString()}</td>
                  <td className="px-5 py-3 text-emerald-700 font-bold">RWF {c.insurancePays.toLocaleString()}</td>
                  <td className="px-5 py-3 text-gray-700 font-semibold">RWF {c.patientPays.toLocaleString()}</td>
                  <td className="px-5 py-3 font-mono text-gray-400">{c.submittedAt}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex text-[10px] font-bold border px-2 py-0.5 rounded ${STATUS_STYLE[c.status]}`}>{c.status}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end space-x-1.5">
                      {c.status === 'Pending' && (
                        <>
                          <button onClick={() => update(c.id, 'Approved')} aria-label={`Approve claim ${c.id}`}
                            className="text-[10px] font-bold px-2 py-1 rounded border border-emerald-200 text-emerald-700 hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600">
                            Approve
                          </button>
                          <button onClick={() => update(c.id, 'Rejected')} aria-label={`Reject claim ${c.id}`}
                            className="text-[10px] font-bold px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-400">
                            Reject
                          </button>
                        </>
                      )}
                      {c.status === 'Approved' && (
                        <button onClick={() => update(c.id, 'Paid')} aria-label={`Mark claim ${c.id} as paid`}
                          className="text-[10px] font-bold px-2 py-1 rounded border border-blue-200 text-blue-700 hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400">
                          Mark Paid
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="text-center py-10 text-gray-400 text-xs">No claims match the current filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
