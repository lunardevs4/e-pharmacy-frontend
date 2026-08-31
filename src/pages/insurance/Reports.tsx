import React, { useState, useEffect } from 'react'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Title, Tooltip, Legend
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import '@/utils/chartTheme'
import { Download, RefreshCw, BarChart2, Loader2, AlertTriangle } from 'lucide-react'
import { insuranceApi, DashboardSummary } from '@/services/insurance-api'
import { useAuthStore } from '@/store/authStore'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

export default function InsuranceReports() {
  const { user } = useAuthStore()
  const insurer = user?.insuranceProvider || 'RSSB'
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const loadSummary = async () => {
    setIsLoading(true)
    setErrorMsg(null)
    try {
      const providers = await insuranceApi.getProviders()
      const matchedProvider = providers.find(p => p.code === insurer || p.name === insurer)
      const insuranceId = matchedProvider?.id
      
      const data = await insuranceApi.getDashboardSummary(insuranceId)
      setSummary(data)
    } catch (error: any) {
      setErrorMsg(error?.message || 'Unable to load report data from backend.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSummary()
  }, [])

  const download = (name: string) => {
    setLoading(name)
    setTimeout(() => { setLoading(null); setToast(`${name} exported.`); setTimeout(() => setToast(null), 3000) }, 1400)
  }

  const claimsVolumeData = {
    labels: ['Pending', 'Approved', 'Rejected', 'Paid'],
    datasets: [
      {
        label: 'Claims by Status',
        data: summary ? [
          summary.pendingClaims,
          summary.approvedClaims,
          summary.rejectedClaims,
          summary.paidClaims
        ] : [0, 0, 0, 0],
        backgroundColor: [
          'rgba(245, 158, 11, 0.75)',
          'rgba(16, 185, 129, 0.75)',
          'rgba(239, 68, 68, 0.55)',
          'rgba(59, 130, 246, 0.75)'
        ],
        borderRadius: 6,
        borderSkipped: false
      },
    ],
  }

  const payoutData = {
    labels: ['Pending', 'Approved', 'Rejected', 'Paid'],
    datasets: [{
      label: 'Amount by Status (RWF)',
      data: summary ? [
        summary.pendingClaimsAmount,
        summary.approvedClaimsAmount,
        summary.rejectedClaimsAmount,
        summary.paidClaimsAmount
      ] : [0, 0, 0, 0],
      backgroundColor: 'rgba(16,185,129,0.65)',
      borderRadius: 6,
      borderSkipped: false,
    }],
  }

  const statusDistributionData = {
    labels: ['Pending', 'Approved', 'Rejected', 'Paid'],
    datasets: [{
      data: summary ? [
        summary.pendingClaims,
        summary.approvedClaims,
        summary.rejectedClaims,
        summary.paidClaims
      ] : [0, 0, 0, 0],
      backgroundColor: ['#f59e0b', '#10b981', '#ef4444', '#3b82f6'],
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
    { name: `${insurer} Monthly Claims Summary`, type: 'PDF' },
    { name: `${insurer} Pharmacy Payout Register`, type: 'CSV' },
    { name: `${insurer} Rejection Analysis Report`, type: 'PDF' },
    { name: `${insurer} Insured Patient Coverage Audit`, type: 'CSV' },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 relative">
      {toast && (
        <div role="status" aria-live="polite" className="fixed top-20 right-6 z-50 bg-emerald-50 border border-emerald-200 text-emerald-805 px-4 py-3 rounded-lg shadow-xl text-xs font-bold">
          {toast}
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2 text-red-800 text-xs">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700">
          <BarChart2 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-black text-gray-900">{insurer} Analytics & Audit Reports</h1>
          <p className="text-xs text-gray-500">Visual payouts, claim volumes, status distributions, and downloadable accounting reports for {insurer}.</p>
        </div>
        <button onClick={loadSummary} disabled={isLoading} className="ml-auto flex items-center space-x-1.5 border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 font-bold px-3 py-2 rounded-lg text-xs transition-colors disabled:opacity-50">
          {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          <span>{isLoading ? 'Loading...' : 'Refresh'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div><h3 className="text-sm font-black text-gray-900">Claims Volume</h3><p className="text-[10px] text-gray-400">Claims by status</p></div>
          <Bar data={claimsVolumeData} options={barOpts} />
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div><h3 className="text-sm font-black text-gray-900">Claims Amount</h3><p className="text-[10px] text-gray-400">Total RWF by status</p></div>
          <Bar data={payoutData} options={{
            ...barOpts,
            plugins: { legend: { display: false } },
            scales: {
              y: { ticks: { callback: (v: any) => `${(v/1000000).toFixed(1)}M`, font: { size: 10 } }, grid: { color: 'rgba(0,0,0,0.05)' } },
              x: { ticks: { font: { size: 10 } }, grid: { display: false } },
            },
          }} />
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
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
