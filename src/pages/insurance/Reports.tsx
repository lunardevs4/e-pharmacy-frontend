import React from 'react'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Title, Tooltip, Legend
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import { Download, RefreshCw, BarChart2 } from 'lucide-react'
import { useState } from 'react'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']

export default function InsuranceReports() {
  const [loading, setLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const download = (name: string) => {
    setLoading(name)
    setTimeout(() => { setLoading(null); setToast(`${name} exported.`); setTimeout(() => setToast(null), 3000) }, 1400)
  }

  const claimsVolumeData = {
    labels: MONTHS,
    datasets: [
      { label: 'Approved Claims', data: [142, 165, 178, 190, 210, 225, 248], backgroundColor: 'rgba(15,81,50,0.75)', borderRadius: 6, borderSkipped: false },
      { label: 'Rejected Claims', data: [12,  9,  14,  11,  8,  10,   7],  backgroundColor: 'rgba(220,53,69,0.55)', borderRadius: 6, borderSkipped: false },
    ],
  }

  const payoutData = {
    labels: MONTHS,
    datasets: [{
      label: 'Total Payout (RWF)',
      data: [3200000, 3700000, 4000000, 4200000, 4600000, 4800000, 5100000],
      backgroundColor: 'rgba(37,99,235,0.65)',
      borderRadius: 6,
      borderSkipped: false,
    }],
  }

  const insurerShareData = {
    labels: ['RSSB', 'MMI', 'SANLAM', 'Radiant'],
    datasets: [{
      data: [58, 22, 12, 8],
      backgroundColor: ['#059669', '#2563eb', '#d97706', '#7c3aed'],
      borderWidth: 2, borderColor: '#fff', hoverOffset: 8,
    }],
  }

  const barOpts = {
    responsive: true,
    plugins: { legend: { position: 'top' as const, labels: { font: { size: 10 }, boxWidth: 12 } } },
    scales: {
      y: { ticks: { font: { size: 10 } }, grid: { color: 'rgba(0,0,0,0.05)' } },
      x: { ticks: { font: { size: 10 } }, grid: { display: false } },
    },
  }

  const reports = [
    { name: 'Monthly Claims Summary — Jul 2026', type: 'PDF' },
    { name: 'Pharmacy Payout Register — Jul 2026', type: 'CSV' },
    { name: 'Rejection Analysis Report',           type: 'PDF' },
    { name: 'Insured Patient Coverage Audit',      type: 'CSV' },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 relative">
      {toast && (
        <div role="status" aria-live="polite" className="fixed top-20 right-6 z-50 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg shadow-xl text-xs font-bold">
          {toast}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-3">
          <div><h3 className="text-sm font-black text-gray-900">Claims Volume</h3><p className="text-[10px] text-gray-400">Approved vs Rejected</p></div>
          <Bar data={claimsVolumeData} options={barOpts} />
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-3">
          <div><h3 className="text-sm font-black text-gray-900">Monthly Payout</h3><p className="text-[10px] text-gray-400">Total RWF disbursed</p></div>
          <Bar data={payoutData} options={{
            ...barOpts,
            plugins: { legend: { display: false } },
            scales: {
              y: { ticks: { callback: (v: any) => `${(v/1000000).toFixed(1)}M`, font: { size: 10 } }, grid: { color: 'rgba(0,0,0,0.05)' } },
              x: { ticks: { font: { size: 10 } }, grid: { display: false } },
            },
          }} />
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-3">
          <div><h3 className="text-sm font-black text-gray-900">Share by Insurer</h3><p className="text-[10px] text-gray-400">% of total claims</p></div>
          <Doughnut data={insurerShareData} options={{ responsive: true, cutout: '62%', plugins: { legend: { position: 'bottom', labels: { font: { size: 10 }, boxWidth: 12 } } } }} />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
          <BarChart2 className="w-4 h-4 text-emerald-700" aria-hidden="true" />
          <h2 className="text-sm font-black text-gray-900">Downloadable Reports</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map(r => (
            <div key={r.name} className="border border-gray-200 rounded-xl p-4 bg-gray-50 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-gray-900">{r.name}</p>
                <span className="text-[9px] font-mono text-gray-400">{r.type}</span>
              </div>
              <button onClick={() => download(r.name)} disabled={loading !== null} aria-label={`Download ${r.name}`}
                className="flex items-center space-x-1 border border-gray-300 bg-white text-gray-600 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600">
                {loading === r.name
                  ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /><span>Generating...</span></>
                  : <><Download className="w-3.5 h-3.5" aria-hidden="true" /><span>Export</span></>
                }
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
