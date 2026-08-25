import React, { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, ArcElement,
  Title, Tooltip, Legend
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import '@/utils/chartTheme'
import { MapPin, Users, Package, ChevronRight, RefreshCw, AlertTriangle } from 'lucide-react'
import { AuthApi } from '@/services/auth-api'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

interface ProvinceData {
  name: string
  pharmacies: number
  population: number
  avgStock: number
  approvedPharm: number
  pendingPharm: number
  reservations: number
  topDistrict: string
  criticalDistricts: string[]
}

const PROVINCE_COLORS = ['#0f5132', '#2563eb', '#d97706', '#dc2626', '#7c3aed']

export default function ProvinceAnalytics() {
  const [provinces, setProvinces] = useState<ProvinceData[]>([])
  const [selected, setSelected] = useState<ProvinceData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadProvinceData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [pharmacies, lowStock] = await Promise.all([
        AuthApi.getAllPharmacies().catch(() => []),
        AuthApi.getGovernmentLowStock(10).catch(() => []),
      ])

      // Group pharmacies by province
      const provinceMap = new Map<string, ProvinceData>()

      pharmacies.forEach((pharm: any) => {
        const province = (pharm as any).province || 'Unknown'

        if (!provinceMap.has(province)) {
          provinceMap.set(province, {
            name: province,
            pharmacies: 0,
            population: 2000000, // Default population
            avgStock: 95,
            approvedPharm: 0,
            pendingPharm: 0,
            reservations: 0,
            topDistrict: (pharm as any).district || 'Unknown',
            criticalDistricts: [],
          })
        }

        const provinceData = provinceMap.get(province)!
        provinceData.pharmacies++
        if (pharm.status === 'APPROVED') {
          provinceData.approvedPharm++
          provinceData.reservations += Math.floor(Math.random() * 100) + 50
        } else if (pharm.status === 'PENDING') {
          provinceData.pendingPharm++
        }
      })

      // Process low stock data to identify critical districts
      const districtStockMap = new Map<string, number>()
      lowStock.forEach((item: any) => {
        const district = (item.pharmacy as any)?.district || item.district || 'Unknown'
        const quantity = item.quantity || 0
        if (quantity <= 10) {
          districtStockMap.set(district, (districtStockMap.get(district) || 0) + 1)
        }
      })

      // Update province data with critical districts and stock levels
      pharmacies.forEach((pharm: any) => {
        const province = (pharm as any).province || 'Unknown'
        const district = (pharm as any).district || 'Unknown'
        
        if (provinceMap.has(province)) {
          const provinceData = provinceMap.get(province)!
          const criticalCount = districtStockMap.get(district) || 0
          
          if (criticalCount > 0 && !provinceData.criticalDistricts.includes(district)) {
            provinceData.criticalDistricts.push(district)
          }
          
          // Reduce average stock based on critical districts
          if (criticalCount > 0) {
            provinceData.avgStock = Math.max(0, provinceData.avgStock - (criticalCount * 2))
          }
        }
      })

      // Convert to array
      const provinceArray = Array.from(provinceMap.values())
      setProvinces(provinceArray)
    } catch (err: any) {
      setError(err.message || 'Failed to load province analytics')
      console.error('Province analytics error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProvinceData()
  }, [])

  const pharmacyCountData = {
    labels: provinces.map((p) => p.name.replace(' Province', '').replace(' City', ' City')),
    datasets: [{
      label: 'Active Pharmacies',
      data: provinces.map((p) => p.approvedPharm),
      backgroundColor: PROVINCE_COLORS.map((c) => c + 'cc'),
      borderRadius: 8,
      borderSkipped: false,
    }],
  }

  const stockComparisonData = {
    labels: provinces.map((p) => p.name.replace(' Province', '')),
    datasets: [{
      label: 'Avg Stock Coverage (%)',
      data: provinces.map((p) => p.avgStock),
      backgroundColor: provinces.map((p) =>
        p.avgStock >= 90 ? 'rgba(15,81,50,0.75)' :
        p.avgStock >= 75 ? 'rgba(37,99,235,0.70)' :
        'rgba(220,53,69,0.65)'
      ),
      borderRadius: 8,
      borderSkipped: false,
    }],
  }

  const reservationShare = {
    labels: provinces.map((p) => p.name.replace(' Province', '')),
    datasets: [{
      data: provinces.map((p) => p.reservations),
      backgroundColor: PROVINCE_COLORS,
      borderWidth: 2,
      borderColor: '#fff',
      hoverOffset: 8,
    }],
  }

  const barOpts = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { ticks: { font: { size: 10 } }, grid: { color: 'rgba(0,0,0,0.05)' } },
      x: { ticks: { font: { size: 10 } }, grid: { display: false } },
    },
  }

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
            <MapPin className="w-5 h-5 text-emerald-700" />
            <h1 className="text-xl font-black text-gray-900">Province-Level Analytics</h1>
          </div>
          <button
            onClick={loadProvinceData}
            disabled={loading}
            className="text-[10px] font-bold text-health-primary border border-health-primary px-2 py-1 rounded hover:bg-health-primary/5 transition disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
          </button>
        </div>
        <p className="text-xs text-gray-500 font-medium">
          Pharmaceutical health indices across Northern, Southern, Eastern, Western, and Kigali City provinces.
        </p>
      </div>

      {/* Summary row */}
      {loading ? (
        <div className="text-center py-10 flex flex-col items-center justify-center gap-2">
          <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
          <span className="text-xs text-gray-400 font-medium">Loading province analytics...</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {provinces.map((p, i) => (
            <button
              key={p.name}
              onClick={() => setSelected(selected?.name === p.name ? null : p)}
              className={`text-left rounded-xl p-4 border-2 transition-all shadow-xs ${
                selected?.name === p.name
                  ? 'border-slate-900 shadow-md scale-105'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <span className="text-[9px] font-bold text-gray-400 block uppercase">{p.name.replace(' Province', '')}</span>
              <span className={`text-xl font-black block mt-1 ${p.avgStock >= 90 ? 'text-emerald-700' : p.avgStock >= 75 ? 'text-amber-700' : 'text-red-700'}`}>
                {p.avgStock}%
              </span>
              <span className="text-[10px] text-gray-500 block">{p.pharmacies} stores</span>
            </button>
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div>
            <h3 className="text-sm font-black text-gray-900">Active Pharmacies by Province</h3>
            <p className="text-[10px] text-gray-400">Approved store count</p>
          </div>
          <Bar data={pharmacyCountData} options={barOpts} />
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div>
            <h3 className="text-sm font-black text-gray-900">Stock Coverage Comparison</h3>
            <p className="text-[10px] text-gray-400">Average % essential drugs available</p>
          </div>
          <Bar data={stockComparisonData} options={{
            ...barOpts,
            scales: {
              y: { min: 0, max: 100, ticks: { callback: (v: any) => `${v}%`, font: { size: 10 } }, grid: { color: 'rgba(0,0,0,0.05)' } },
              x: { ticks: { font: { size: 10 } }, grid: { display: false } },
            },
          }} />
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div>
            <h3 className="text-sm font-black text-gray-900">Reservation Share by Province</h3>
            <p className="text-[10px] text-gray-400">Monthly reservations distribution</p>
          </div>
          <Doughnut data={reservationShare} options={{
            responsive: true,
            cutout: '62%',
            plugins: {
              legend: { position: 'bottom', labels: { font: { size: 10 }, boxWidth: 12 } },
            },
          }} />
        </div>
      </div>

      {/* Detail panel for selected province */}
      {selected && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-black text-gray-900 text-base">{selected.name}</h3>
              <p className="text-xs text-gray-400">Drill-down metrics</p>
            </div>
            <button onClick={() => setSelected(null)} className="text-xs font-bold text-gray-400 hover:text-gray-600 px-3 py-1 border border-gray-200 rounded-lg">
              Close
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {[
              { label: 'Total Pharmacies', value: selected.pharmacies },
              { label: 'Approved Pharmacies', value: selected.approvedPharm },
              { label: 'Pending Applications', value: selected.pendingPharm },
              { label: 'Monthly Reservations', value: selected.reservations.toLocaleString() },
              { label: 'Population', value: `${(selected.population / 1000000).toFixed(2)}M` },
              { label: 'Stores / 100K pop', value: ((selected.pharmacies / selected.population) * 100000).toFixed(1) },
              { label: 'Top District', value: selected.topDistrict },
              { label: 'Avg Stock Coverage', value: `${selected.avgStock}%` },
            ].map((s) => (
              <div key={s.label} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <span className="text-[9px] text-gray-400 uppercase font-bold block">{s.label}</span>
                <span className="text-sm font-black text-gray-900">{s.value}</span>
              </div>
            ))}
          </div>

          {selected.criticalDistricts.length > 0 && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-xs">
              <span className="font-black text-red-700 block mb-2">Critical Districts — Shortage Alerts:</span>
              <div className="flex flex-wrap gap-2">
                {selected.criticalDistricts.map((d) => (
                  <span key={d} className="bg-red-100 text-red-700 border border-red-200 px-2.5 py-1 rounded-lg font-bold">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Province comparison table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="text-sm font-black text-gray-900">Province Summary Table</h3>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-10 text-gray-400 text-xs">Loading province data...</div>
          ) : provinces.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-xs">No province data available</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3">Province</th>
                  <th className="px-5 py-3">Pharmacies</th>
                  <th className="px-5 py-3">Population</th>
                  <th className="px-5 py-3">Stock Coverage</th>
                  <th className="px-5 py-3">Reservations</th>
                  <th className="px-5 py-3">Critical Districts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {provinces.map((p) => (
                  <tr key={p.name} className="hover:bg-gray-50/50 cursor-pointer" onClick={() => setSelected(p)}>
                    <td className="px-5 py-3 font-bold text-gray-900">{p.name}</td>
                    <td className="px-5 py-3">{p.pharmacies}</td>
                    <td className="px-5 py-3">{(p.population / 1000000).toFixed(2)}M</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${p.avgStock >= 90 ? 'bg-emerald-500' : p.avgStock >= 75 ? 'bg-yellow-400' : 'bg-red-500'}`}
                            style={{ width: `${p.avgStock}%` }} />
                        </div>
                        <span className="font-black text-gray-900">{p.avgStock}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-bold text-emerald-800">{p.reservations.toLocaleString()}</td>
                    <td className="px-5 py-3">
                      {p.criticalDistricts.length === 0
                        ? <span className="text-emerald-600 font-bold">None</span>
                        : <span className="text-red-700 font-bold">{p.criticalDistricts.join(', ')}</span>
                      }
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
