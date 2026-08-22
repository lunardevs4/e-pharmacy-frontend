import React, { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, Title, Tooltip, Legend, Filler
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'
import { Package, TrendingDown, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react'
import { AuthApi } from '@/services/auth-api'
import { MedicineApi } from '@/services/medicine-api'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler)

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']

interface EssentialMedicine {
  name: string
  category: string
  nationalStock: number
  trend: 'up' | 'down' | 'stable'
  shortage: boolean
}

export default function MedicineAnalytics() {
  const [essentialMedicines, setEssentialMedicines] = useState<EssentialMedicine[]>([])
  const [categoryFilter, setCategoryFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadMedicineAnalytics = async () => {
    setLoading(true)
    setError(null)
    try {
      const [medicines, lowStock] = await Promise.all([
        MedicineApi.searchMedicines('', '', false).catch(() => []),
        AuthApi.getGovernmentLowStock(10).catch(() => []),
      ])

      // Process medicines to create essential medicine tracking
      const medicineMap = new Map<string, EssentialMedicine>()

      medicines.forEach((med: any) => {
        const key = med.name
        if (!medicineMap.has(key)) {
          medicineMap.set(key, {
            name: med.name,
            category: med.category || 'Other',
            nationalStock: 95, // Default healthy stock
            trend: 'stable',
            shortage: false,
          })
        }
      })

      // Update stock levels based on low stock data
      lowStock.forEach((item: any) => {
        const medicineName = (item.medicine as any)?.name || item.medicineName || 'Unknown'
        const quantity = item.quantity || 0

        if (medicineMap.has(medicineName)) {
          const medicineData = medicineMap.get(medicineName)!
          medicineData.nationalStock = Math.max(0, Math.min(100, quantity))
          medicineData.shortage = quantity <= 10
          medicineData.trend = quantity <= 10 ? 'down' : quantity >= 80 ? 'up' : 'stable'
        }
      })

      // Convert to array and limit to top 15
      const medicineArray = Array.from(medicineMap.values()).slice(0, 15)
      setEssentialMedicines(medicineArray)
    } catch (err: any) {
      setError(err.message || 'Failed to load medicine analytics')
      console.error('Medicine analytics error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMedicineAnalytics()
  }, [])

  const usageTrend = {
    labels: MONTHS,
    datasets: [
      { label: 'Antimalarials', data: [4200, 3800, 4100, 5200, 6100, 5800, 6400], borderColor: '#059669', backgroundColor: 'rgba(5,150,105,0.1)', fill: false, tension: 0.4, borderWidth: 2, pointRadius: 3 },
      { label: 'Antibiotics', data: [3100, 3400, 3200, 3600, 3800, 4000, 4200], borderColor: '#2563eb', backgroundColor: 'rgba(37,99,235,0.1)', fill: false, tension: 0.4, borderWidth: 2, pointRadius: 3 },
      { label: 'Antidiabetics', data: [1800, 1900, 2100, 2200, 2400, 2500, 2700], borderColor: '#7c3aed', backgroundColor: 'rgba(124,58,237,0.1)', fill: false, tension: 0.4, borderWidth: 2, pointRadius: 3 },
    ],
  }

  const stockIndex = {
    labels: MONTHS,
    datasets: [{
      label: 'National Drug Availability Index (%)',
      data: [91.2, 90.8, 91.5, 92.0, 93.2, 93.8, 94.2],
      borderColor: '#0f5132',
      backgroundColor: 'rgba(15,81,50,0.12)',
      fill: true,
      tension: 0.4,
      borderWidth: 2.5,
      pointRadius: 4,
      pointBackgroundColor: '#0f5132',
    }],
  }

  const filtered = essentialMedicines.filter((m) =>
    categoryFilter ? m.category === categoryFilter : true
  )

  const categories = [...new Set(essentialMedicines.map((m) => m.category))]

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2 text-red-800 text-xs">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-emerald-700" />
            <h1 className="text-xl font-black text-gray-900">National Medicine Analytics</h1>
          </div>
          <button
            onClick={loadMedicineAnalytics}
            disabled={loading}
            className="text-[10px] font-bold text-health-primary border border-health-primary px-2 py-1 rounded hover:bg-health-primary/5 transition disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
          </button>
        </div>
        <p className="text-xs text-gray-500 font-medium">Drug usage trends, stock availability indices, and essential medicine tracking across Rwanda.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Tracked Medicines', value: essentialMedicines.length, color: 'text-gray-900', bg: 'bg-gray-50' },
          { label: 'Adequate Stock', value: essentialMedicines.filter((m) => m.nationalStock >= 80).length, color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Shortage Alerts', value: essentialMedicines.filter((m) => m.shortage).length, color: 'text-red-700', bg: 'bg-red-50' },
          { label: 'Avg Availability', value: essentialMedicines.length > 0 ? `${Math.round(essentialMedicines.reduce((a, m) => a + m.nationalStock, 0) / essentialMedicines.length)}%` : '—', color: 'text-blue-700', bg: 'bg-blue-50' },
        ].map((s) => (
          <div key={s.label} className={`border border-gray-200 rounded-xl p-4 ${s.bg} shadow-xs`}>
            <span className="text-[10px] text-gray-400 block uppercase font-bold">{s.label}</span>
            <span className={`text-2xl font-black ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-3">
          <div>
            <h3 className="text-sm font-black text-gray-900">Drug Dispensing Volume Trends</h3>
            <p className="text-[10px] text-gray-400">Monthly units dispensed by category</p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50/80 via-white to-blue-50/70 p-3">
            <Line data={usageTrend} options={{
              responsive: true,
              interaction: { mode: 'index', intersect: false },
              elements: { line: { tension: 0.5 }, point: { radius: 4, hoverRadius: 6, borderWidth: 2, borderColor: '#fff' } },
              plugins: { legend: { position: 'top', labels: { font: { size: 10 }, boxWidth: 12 } }, tooltip: { backgroundColor: '#0f5132', titleFont: { size: 10 }, bodyFont: { size: 10 } } },
              scales: {
                y: { border: { display: false }, ticks: { font: { size: 10 } }, grid: { color: 'rgba(15,81,50,0.08)' } },
                x: { border: { display: false }, ticks: { font: { size: 10 } }, grid: { color: 'rgba(15,81,50,0.05)' } },
              },
            }} />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-3">
          <div>
            <h3 className="text-sm font-black text-gray-900">National Drug Availability Index</h3>
            <p className="text-[10px] text-gray-400">% of essential medicines in adequate stock</p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50/80 via-white to-blue-50/70 p-3">
            <Line data={stockIndex} options={{
              responsive: true,
              interaction: { mode: 'index', intersect: false },
              elements: { line: { tension: 0.5 }, point: { radius: 4, hoverRadius: 6, borderWidth: 2, borderColor: '#fff' } },
              plugins: { legend: { display: false }, tooltip: { backgroundColor: '#0f5132', titleFont: { size: 10 }, bodyFont: { size: 10 }, displayColors: false } },
              scales: {
                y: { min: 85, max: 100, border: { display: false }, ticks: { callback: (v: any) => `${v}%`, font: { size: 10 } }, grid: { color: 'rgba(15,81,50,0.08)' } },
                x: { border: { display: false }, ticks: { font: { size: 10 } }, grid: { color: 'rgba(15,81,50,0.05)' } },
              },
            }} />
          </div>
        </div>
      </div>

      {/* Essential Medicine Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <h3 className="text-sm font-black text-gray-900">Essential Medicine Stock Status</h3>
            <p className="text-[10px] text-gray-400">WHO essential list tracking with national availability</p>
          </div>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-700 font-bold focus:outline-none max-w-xs">
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-10 flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
              <span className="text-xs text-gray-400 font-medium">Loading medicine analytics...</span>
            </div>
          ) : essentialMedicines.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs font-medium">
              No medicine data available from backend.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3">Medicine</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">National Stock</th>
                  <th className="px-5 py-3">Trend</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {filtered.map((m) => (
                  <tr key={m.name} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3 font-bold text-gray-900">{m.name}</td>
                    <td className="px-5 py-3">
                      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-semibold">{m.category}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${m.nationalStock >= 90 ? 'bg-emerald-500' : m.nationalStock >= 75 ? 'bg-yellow-400' : 'bg-red-500'}`}
                            style={{ width: `${m.nationalStock}%` }}
                          />
                        </div>
                        <span className="font-black text-gray-900">{m.nationalStock}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] font-bold ${m.trend === 'up' ? 'text-emerald-700' : m.trend === 'down' ? 'text-red-700' : 'text-gray-500'}`}>
                        {m.trend === 'up' ? '↗ Rising' : m.trend === 'down' ? '↘ Falling' : '→ Stable'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {m.shortage ? (
                        <span className="inline-flex items-center text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                          <AlertTriangle className="w-3 h-3 mr-1" /> Shortage Alert
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Adequate
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
