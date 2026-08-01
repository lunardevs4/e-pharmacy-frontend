import React, { useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import { TrendingUp, DollarSign, Package, Users, Download } from 'lucide-react'

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  ArcElement, Title, Tooltip, Legend, Filler
)

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']

export default function PharmacyReports() {
  // ── Monthly Revenue ───────────────────────────────────────────────────────
  const revenueData = {
    labels: MONTHS,
    datasets: [
      {
        label: 'Revenue (RWF)',
        data: [4200000, 4850000, 5100000, 5300000, 5700000, 5900000, 6200000],
        borderColor: '#0f5132',
        backgroundColor: 'rgba(15,81,50,0.10)',
        borderWidth: 2.5,
        pointRadius: 4,
        pointBackgroundColor: '#0f5132',
        fill: true,
        tension: 0.4,
      },
    ],
  }

  // ── Monthly Dispensing Volume ─────────────────────────────────────────────
  const volumeData = {
    labels: MONTHS,
    datasets: [
      {
        label: 'Reservations Fulfilled',
        data: [820, 940, 1050, 1120, 1300, 1390, 1480],
        backgroundColor: 'rgba(15,81,50,0.70)',
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'Walk-in Dispensings',
        data: [310, 360, 390, 420, 480, 510, 550],
        backgroundColor: 'rgba(25,135,84,0.45)',
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  }

  // ── Sales by Drug Category ────────────────────────────────────────────────
  const categoryData = {
    labels: ['Antimalarials', 'Antibiotics', 'Analgesics', 'Antidiabetics', 'Antihypertensives', 'Other'],
    datasets: [
      {
        data: [28, 22, 18, 14, 11, 7],
        backgroundColor: [
          '#059669', '#2563eb', '#d97706', '#dc2626', '#7c3aed', '#475569'
        ],
        borderWidth: 2,
        borderColor: '#fff',
        hoverOffset: 8,
      },
    ],
  }

  // ── Insurance vs OOP ─────────────────────────────────────────────────────
  const insuranceData = {
    labels: MONTHS,
    datasets: [
      {
        label: 'Insurance Covered',
        data: [2800000, 3200000, 3400000, 3600000, 3900000, 4000000, 4300000],
        backgroundColor: 'rgba(37,99,235,0.70)',
        borderRadius: 6,
        borderSkipped: false,
        stack: 'revenue',
      },
      {
        label: 'Patient Out-of-Pocket',
        data: [1400000, 1650000, 1700000, 1700000, 1800000, 1900000, 1900000],
        backgroundColor: 'rgba(15,81,50,0.60)',
        borderRadius: 6,
        borderSkipped: false,
        stack: 'revenue',
      },
    ],
  }

  const lineOpts = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => ` RWF ${ctx.parsed.y.toLocaleString()}`
        }
      }
    },
    scales: {
      y: {
        ticks: { callback: (v: any) => `${(v / 1000000).toFixed(1)}M`, font: { size: 10 } },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
      x: { ticks: { font: { size: 10 } }, grid: { display: false } }
    },
  }

  const barOpts = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const, labels: { font: { size: 10 }, boxWidth: 12 } },
    },
    scales: {
      y: { ticks: { font: { size: 10 } }, grid: { color: 'rgba(0,0,0,0.05)' } },
      x: { ticks: { font: { size: 10 } }, grid: { display: false } }
    },
  }

  const stackedBarOpts = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const, labels: { font: { size: 10 }, boxWidth: 12 } },
      tooltip: {
        callbacks: {
          label: (ctx: any) => ` RWF ${ctx.parsed.y.toLocaleString()}`
        }
      }
    },
    scales: {
      x: { stacked: true, ticks: { font: { size: 10 } }, grid: { display: false } },
      y: { stacked: true, ticks: { callback: (v: any) => `${(v / 1000000).toFixed(1)}M`, font: { size: 10 } }, grid: { color: 'rgba(0,0,0,0.05)' } }
    },
  }

  const doughnutOpts = {
    responsive: true,
    cutout: '62%',
    plugins: {
      legend: { position: 'right' as const, labels: { font: { size: 10 }, boxWidth: 12 } },
      tooltip: {
        callbacks: {
          label: (ctx: any) => ` ${ctx.label}: ${ctx.parsed}%`
        }
      }
    },
  }

  const summaryCards = [
    { label: 'Total Revenue (Jul)', value: 'RWF 6.2M', sub: '↗ +5.1% vs Jun', icon: DollarSign, color: 'text-emerald-700', bg: 'bg-emerald-50' },
    { label: 'Dispensings (Jul)', value: '2,030', sub: '↗ +6.5% vs Jun', icon: Package, color: 'text-blue-700', bg: 'bg-blue-50' },
    { label: 'Insurance Claims', value: '1,248', sub: '96.2% approval rate', icon: Users, color: 'text-purple-700', bg: 'bg-purple-50' },
    { label: 'Avg Daily Revenue', value: 'RWF 200K', sub: 'Based on 31 working days', icon: TrendingUp, color: 'text-amber-700', bg: 'bg-amber-50' },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryCards.map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 flex items-start justify-between shadow-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{s.label}</span>
              <p className="text-xl font-black text-gray-900">{s.value}</p>
              <span className="text-[11px] text-emerald-600 font-semibold block">{s.sub}</span>
            </div>
            <div className={`p-2.5 rounded-lg ${s.bg} flex-shrink-0`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Row 1: Revenue + Volume */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-gray-900">Monthly Revenue Trend</h3>
              <p className="text-[10px] text-gray-400 font-medium">Jan – Jul 2026</p>
            </div>
            <button className="border border-gray-200 text-gray-500 hover:text-health-primary px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center space-x-1 transition-colors">
              <Download className="w-3 h-3" />
              <span>Export</span>
            </button>
          </div>
          <Line data={revenueData} options={lineOpts} />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-gray-900">Dispensing Volume</h3>
              <p className="text-[10px] text-gray-400 font-medium">Reservations vs Walk-ins</p>
            </div>
            <button className="border border-gray-200 text-gray-500 hover:text-health-primary px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center space-x-1 transition-colors">
              <Download className="w-3 h-3" />
              <span>Export</span>
            </button>
          </div>
          <Bar data={volumeData} options={barOpts} />
        </div>
      </div>

      {/* Row 2: Category split + Insurance breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-3">
          <div>
            <h3 className="text-sm font-black text-gray-900">Sales by Drug Category</h3>
            <p className="text-[10px] text-gray-400 font-medium">% of total revenue (Jul 2026)</p>
          </div>
          <div className="max-w-sm mx-auto">
            <Doughnut data={categoryData} options={doughnutOpts} />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-gray-900">Insurance vs Out-of-Pocket</h3>
              <p className="text-[10px] text-gray-400 font-medium">Monthly split breakdown</p>
            </div>
            <button className="border border-gray-200 text-gray-500 hover:text-health-primary px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center space-x-1 transition-colors">
              <Download className="w-3 h-3" />
              <span>Export</span>
            </button>
          </div>
          <Bar data={insuranceData} options={stackedBarOpts} />
        </div>
      </div>

      {/* Top medicines table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-black text-gray-900">Top Selling Medicines</h3>
            <p className="text-[10px] text-gray-400 font-medium">July 2026 — by units dispensed</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3">#</th>
                <th className="px-5 py-3">Medicine</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Units Sold</th>
                <th className="px-5 py-3">Revenue</th>
                <th className="px-5 py-3">Insurance %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {[
                { rank: 1, name: 'Artemether + Lumefantrine', cat: 'Antimalarials', units: 542, rev: 'RWF 1.9M', ins: '87%' },
                { rank: 2, name: 'Amoxicillin 500mg', cat: 'Antibiotics', units: 480, rev: 'RWF 384K', ins: '72%' },
                { rank: 3, name: 'Paracetamol 500mg', cat: 'Analgesics', units: 390, rev: 'RWF 117K', ins: '55%' },
                { rank: 4, name: 'Metformin 850mg', cat: 'Antidiabetics', units: 310, rev: 'RWF 372K', ins: '91%' },
                { rank: 5, name: 'Insulin Glargine', cat: 'Antidiabetics', units: 158, rev: 'RWF 4.3M', ins: '96%' },
              ].map((row) => (
                <tr key={row.rank} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3 font-black text-gray-400">{row.rank}</td>
                  <td className="px-5 py-3 font-bold text-gray-900">{row.name}</td>
                  <td className="px-5 py-3">
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-semibold">{row.cat}</span>
                  </td>
                  <td className="px-5 py-3 font-black text-gray-900">{row.units.toLocaleString()}</td>
                  <td className="px-5 py-3 font-bold text-health-primary">{row.rev}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: row.ins }} />
                      </div>
                      <span className="font-bold text-emerald-700">{row.ins}</span>
                    </div>
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
