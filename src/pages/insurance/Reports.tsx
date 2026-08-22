import React from 'react'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Title, Tooltip, Legend
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import { Download, RefreshCw, BarChart2 } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']

export default function InsuranceReports() {
  const { user } = useAuthStore()
  const insurer = user?.insuranceProvider || 'RSSB'
  const isMMI = insurer === 'MMI'

  const [loading, setLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const download = (name: string) => {
    setLoading(name)
    setTimeout(() => { setLoading(null); setToast(`${name} exported.`); setTimeout(() => setToast(null), 3000) }, 1400)
  }

  const claimsVolumeData = {
    labels: MONTHS,
    datasets: [
      {
        label: 'Approved Claims',
        data: isMMI ? [45, 52, 58, 65, 70, 78, 85] : [142, 165, 178, 190, 210, 225, 248],
        backgroundColor: 'rgba(15,81,50,0.75)',
        borderRadius: 6,
        borderSkipped: false
      },
      {
        label: 'Rejected Claims',
        data: isMMI ? [4, 3, 5, 2, 4, 3, 2] : [12,  9,  14,  11,  8,  10,   7],
        backgroundColor: 'rgba(220,53,69,0.55)',
        borderRadius: 6,
        borderSkipped: false
      },
    ],
  }

  const payoutData = {
    labels: MONTHS,
    datasets: [{
      label: 'Total Payout (RWF)',
      data: isMMI 
        ? [1100000, 1300000, 1400000, 1600000, 1700000, 1900000, 2100000]
        : [3200000, 3700000, 4000000, 4200000, 4600000, 4800000, 5100000],
      backgroundColor: isMMI ? 'rgba(16,185,129,0.65)' : 'rgba(37,99,235,0.65)',
      borderRadius: 6,
      borderSkipped: false,
    }],
  }

  const statusDistributionData = {
    labels: ['Approved', 'Paid', 'Pending', 'Rejected'],
    datasets: [{
      data: isMMI ? [60, 25, 10, 5] : [50, 30, 15, 5],
      backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
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
    { name: `${insurer} Monthly Claims Summary — Jul 2026`, type: 'PDF' },
    { name: `${insurer} Pharmacy Payout Register — Jul 2026`, type: 'CSV' },
    { name: `${insurer} Rejection Analysis Report`,           type: 'PDF' },
    { name: `${insurer} Insured Patient Coverage Audit`,      type: 'CSV' },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 relative">
      {toast && (
        <div role="status" aria-live="polite" className="fixed top-20 right-6 z-50 bg-emerald-50 border border-emerald-200 text-emerald-805 px-4 py-3 rounded-lg shadow-xl text-xs font-bold">
          {toast}
        </div>
      )}

      {/* Header card */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-3">
        <div className={`p-2.5 rounded-lg ${isMMI ? 'bg-[#e8f5e9] text-[#2d6a4f]' : 'bg-[#eff6ff] text-[#3b82f6]'}`}>
          <BarChart2 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-black text-gray-900">{insurer} Analytics & Audit Reports</h1>
          <p className="text-xs text-gray-500">Visual payouts, claim volumes, status distributions, and downloadable accounting reports for {insurer}.</p>
        </div>
      </div>

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
          <div><h3 className="text-sm font-black text-gray-900">Claims Status Distribution</h3><p className="text-[10px] text-gray-400">% share of claims by status</p></div>
          <Doughnut data={statusDistributionData} options={{ responsive: true, cutout: '62%', plugins: { legend: { position: 'bottom', labels: { font: { size: 10 }, boxWidth: 12 } } } }} />
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
