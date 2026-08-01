import React, { useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import { FileText, Download, CheckCircle2, RefreshCw, BarChart2, MapPin, Package } from 'lucide-react'

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  ArcElement, RadialLinearScale, Title, Tooltip, Legend, Filler
)

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
const PROVINCES = ['Kigali City', 'Northern', 'Southern', 'Eastern', 'Western']

export default function GovernmentReports() {
  const [loadingReport, setLoadingReport] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const triggerToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  const handleDownload = (name: string) => {
    setLoadingReport(name)
    setTimeout(() => { setLoadingReport(null); triggerToast(`${name} generated successfully.`) }, 1500)
  }

  // ── Chart Data ────────────────────────────────────────────────────────────

  const nationalStockData = {
    labels: MONTHS,
    datasets: [{
      label: 'National Stock Coverage (%)',
      data: [91.2, 92.0, 91.5, 93.1, 94.0, 93.8, 94.2],
      borderColor: '#0f5132',
      backgroundColor: 'rgba(15,81,50,0.10)',
      borderWidth: 2.5,
      pointRadius: 4,
      pointBackgroundColor: '#0f5132',
      fill: true,
      tension: 0.4,
    }],
  }

  const pharmacyApprovals = {
    labels: MONTHS,
    datasets: [
      {
        label: 'Approved',
        data: [12, 8, 15, 10, 14, 9, 11],
        backgroundColor: 'rgba(15,81,50,0.70)',
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'Rejected',
        data: [2, 3, 1, 4, 2, 3, 2],
        backgroundColor: 'rgba(220,53,69,0.55)',
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  }

  const provinceStockData = {
    labels: PROVINCES,
    datasets: [{
      label: 'Avg Stock Coverage (%)',
      data: [95, 68, 82, 75, 78],
      backgroundColor: [
        'rgba(15,81,50,0.75)',
        'rgba(220,53,69,0.65)',
        'rgba(25,135,84,0.70)',
        'rgba(249,115,22,0.65)',
        'rgba(37,99,235,0.65)',
      ],
      borderRadius: 8,
      borderSkipped: false,
    }],
  }

  const shortageBreakdown = {
    labels: ['Antimalarials', 'Antibiotics', 'Antidiabetics', 'Vaccines', 'Analgesics'],
    datasets: [{
      data: [35, 25, 20, 12, 8],
      backgroundColor: ['#dc2626', '#d97706', '#7c3aed', '#0284c7', '#475569'],
      borderWidth: 2,
      borderColor: '#fff',
      hoverOffset: 8,
    }],
  }

  const baseOpts = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { ticks: { font: { size: 10 } }, grid: { color: 'rgba(0,0,0,0.05)' } },
      x: { ticks: { font: { size: 10 } }, grid: { display: false } },
    },
  }

  const lineOpts = {
    ...baseOpts,
    plugins: {
      ...baseOpts.plugins,
      tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.parsed.y}%` } }
    },
    scales: {
      y: { ...baseOpts.scales.y, min: 80, max: 100, ticks: { callback: (v: any) => `${v}%`, font: { size: 10 } } },
      x: baseOpts.scales.x,
    },
  }

  const barOpts = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const, labels: { font: { size: 10 }, boxWidth: 12 } },
    },
    scales: {
      y: { ticks: { font: { size: 10 } }, grid: { color: 'rgba(0,0,0,0.05)' } },
      x: { ticks: { font: { size: 10 } }, grid: { display: false } },
    },
  }

  const provinceBarOpts = {
    indexAxis: 'y' as const,
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.parsed.x}%` } }
    },
    scales: {
      x: { min: 0, max: 100, ticks: { callback: (v: any) => `${v}%`, font: { size: 10 } }, grid: { color: 'rgba(0,0,0,0.05)' } },
      y: { ticks: { font: { size: 10 } }, grid: { display: false } },
    },
  }

  const doughnutOpts = {
    responsive: true,
    cutout: '62%',
    plugins: {
      legend: { position: 'right' as const, labels: { font: { size: 10 }, boxWidth: 12 } },
      tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.label}: ${ctx.parsed}%` } }
    },
  }

  const reportsList = [
    { name: 'National Pharmacy Licensing Register', description: 'Complete directory of approved, pending, and suspended pharmacies in Rwanda.', type: 'CSV' },
    { name: 'Essential Drug Catalog & Classifications', description: 'Registered medicines including generic molecules, Rx status, and manufacturers.', type: 'PDF' },
    { name: 'National Stock Shortage Incidents Log', description: 'MOH shortage flags, critical supply gaps, and dispatch logs.', type: 'PDF' },
    { name: 'Quarterly Pharmaceutical Compliance Audit', description: 'Summary of compliance inspection audits, fail ratios, and enforcement logs.', type: 'CSV' },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 relative">

      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg shadow-xl text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* National stock trend */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
            <BarChart2 className="w-4 h-4 text-emerald-700" />
            <div>
              <h3 className="text-sm font-black text-gray-900">National Stock Coverage Trend</h3>
              <p className="text-[10px] text-gray-400">Jan – Jul 2026 (%)</p>
            </div>
          </div>
          <Line data={nationalStockData} options={lineOpts} />
        </div>

        {/* Pharmacy approvals */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
            <FileText className="w-4 h-4 text-emerald-700" />
            <div>
              <h3 className="text-sm font-black text-gray-900">Pharmacy Application Outcomes</h3>
              <p className="text-[10px] text-gray-400">Approved vs Rejected per month</p>
            </div>
          </div>
          <Bar data={pharmacyApprovals} options={barOpts} />
        </div>

        {/* Province stock bars */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
            <MapPin className="w-4 h-4 text-emerald-700" />
            <div>
              <h3 className="text-sm font-black text-gray-900">Province Stock Coverage</h3>
              <p className="text-[10px] text-gray-400">Average % of essential medicines available</p>
            </div>
          </div>
          <Bar data={provinceStockData} options={provinceBarOpts} />
        </div>

        {/* Shortage category breakdown */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
            <Package className="w-4 h-4 text-emerald-700" />
            <div>
              <h3 className="text-sm font-black text-gray-900">Shortage Incidents by Drug Type</h3>
              <p className="text-[10px] text-gray-400">Distribution of critical shortage flags</p>
            </div>
          </div>
          <div className="max-w-xs mx-auto">
            <Doughnut data={shortageBreakdown} options={doughnutOpts} />
          </div>
        </div>
      </div>

      {/* Report Downloads */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 pb-2 border-b border-gray-150">
          <FileText className="w-5 h-5 text-emerald-700" />
          <h2 className="text-sm font-black text-gray-900">Ministry of Health Reports Registry</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-gray-700">
          {reportsList.map((r, index) => (
            <div key={index} className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 flex flex-col justify-between hover:border-emerald-300 transition-colors gap-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-gray-900 font-bold text-sm block">{r.name}</span>
                  <span className="text-[9px] bg-slate-100 border border-gray-300 text-slate-600 px-1.5 py-0.5 rounded font-mono font-bold uppercase">{r.type}</span>
                </div>
                <p className="text-xs text-gray-500 font-medium leading-normal">{r.description}</p>
              </div>
              <button
                type="button"
                disabled={loadingReport !== null}
                onClick={() => handleDownload(r.name)}
                className="bg-health-primary hover:bg-health-secondary text-white font-bold py-2 rounded-lg text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-sm disabled:opacity-50"
              >
                {loadingReport === r.name ? (
                  <><RefreshCw className="w-3.5 h-3.5 animate-spin" /><span>Generating...</span></>
                ) : (
                  <><Download className="w-3.5 h-3.5" /><span>Download Report</span></>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
