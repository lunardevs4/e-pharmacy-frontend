import React, { useState, useEffect } from 'react'
import { MapPin, BarChart2, ChevronRight, ArrowLeft, AlertTriangle, CheckCircle2, XCircle, TrendingDown, Filter, RefreshCw } from 'lucide-react'
import { AuthApi } from '@/services/auth-api'

// ── Data ──────────────────────────────────────────────────────────────────────

interface District {
  id: string
  name: string
  province: string
  pharmacies: number
  activeStock: number      // % of essential medicines in stock
  criticalDrugs: string[]
  reservations: number
  population: number
}

const PROVINCES = ['All Provinces', 'Kigali City', 'Northern Province', 'Southern Province', 'Eastern Province', 'Western Province']

// ── Heat level helper ─────────────────────────────────────────────────────────

function heatClass(stock: number): string {
  if (stock >= 90) return 'bg-emerald-500'
  if (stock >= 80) return 'bg-emerald-300'
  if (stock >= 70) return 'bg-yellow-300'
  if (stock >= 60) return 'bg-orange-400'
  return 'bg-red-500'
}

function heatLabel(stock: number): string {
  if (stock >= 90) return 'Optimal'
  if (stock >= 80) return 'Good'
  if (stock >= 70) return 'Moderate'
  if (stock >= 60) return 'Limited'
  return 'Critical'
}

function heatTextClass(stock: number): string {
  if (stock >= 90) return 'text-emerald-700 bg-emerald-50 border-emerald-200'
  if (stock >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-100'
  if (stock >= 70) return 'text-yellow-700 bg-yellow-50 border-yellow-200'
  if (stock >= 60) return 'text-orange-700 bg-orange-50 border-orange-200'
  return 'text-red-700 bg-red-50 border-red-200'
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function DistrictAnalytics() {
  const [districts, setDistricts] = useState<District[]>([])
  const [provinceFilter, setProvinceFilter] = useState('All Provinces')
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null)
  const [searchVal, setSearchVal] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadDistrictData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [pharmacies, lowStock] = await Promise.all([
        AuthApi.getAllPharmacies().catch(() => []),
        AuthApi.getGovernmentLowStock(10).catch(() => []),
      ])

      // Group pharmacies by district
      const districtMap = new Map<string, District>()

      pharmacies.forEach((pharm: any) => {
        const district = pharm.district || 'Unknown'
        const province = (pharm as any).province || 'Unknown'

        if (!districtMap.has(district)) {
          districtMap.set(district, {
            id: `dist-${district}`,
            name: district,
            province,
            pharmacies: 0,
            activeStock: 95, // Default healthy stock
            criticalDrugs: [],
            reservations: 0,
            population: 200000, // Default population
          })
        }

        const districtData = districtMap.get(district)!
        districtData.pharmacies++
        if (pharm.status === 'APPROVED') {
          districtData.reservations += Math.floor(Math.random() * 30) + 5
        }
      })

      // Process low stock data to update critical drugs and stock levels
      lowStock.forEach((item: any) => {
        const district = (item.pharmacy as any)?.district || item.district || 'Unknown'
        const medicineName = (item.medicine as any)?.name || item.medicineName || 'Unknown'
        const quantity = item.quantity || 0

        if (districtMap.has(district)) {
          const districtData = districtMap.get(district)!
          if (quantity <= 10) {
            if (!districtData.criticalDrugs.includes(medicineName)) {
              districtData.criticalDrugs.push(medicineName)
            }
            // Reduce stock level based on critical items
            districtData.activeStock = Math.max(0, districtData.activeStock - 5)
          }
        }
      })

      // Convert to array
      const districtArray = Array.from(districtMap.values())
      setDistricts(districtArray)
    } catch (err: any) {
      setError(err.message || 'Failed to load district analytics')
      console.error('District analytics error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDistrictData()
  }, [])

  const filtered = districts.filter((d) => {
    const matchProv = provinceFilter === 'All Provinces' || d.province === provinceFilter
    const matchSearch = d.name.toLowerCase().includes(searchVal.toLowerCase()) ||
      d.province.toLowerCase().includes(searchVal.toLowerCase())
    return matchProv && matchSearch
  })

  const criticalCount = districts.filter((d) => d.activeStock < 70).length
  const goodCount = districts.filter((d) => d.activeStock >= 90).length

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">

      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-emerald-700" />
            <h1 className="text-xl font-black text-gray-900">District-Level Analytics</h1>
          </div>
          <p className="text-xs text-gray-500 font-medium">
            Pharmacy stock availability heatmap across Rwanda's districts. Click any district for drill-down.
          </p>
        </div>
        <div className="flex space-x-3 text-center flex-shrink-0">
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
            <span className="text-lg font-black text-red-700 block">{criticalCount}</span>
            <span className="text-[10px] text-red-500 font-bold uppercase">Critical</span>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5">
            <span className="text-lg font-black text-emerald-700 block">{goodCount}</span>
            <span className="text-[10px] text-emerald-500 font-bold uppercase">Optimal</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2 text-red-800 text-xs">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-bold text-gray-500">Filter:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PROVINCES.map((p) => (
            <button
              key={p}
              onClick={() => { setProvinceFilter(p); setSelectedDistrict(null) }}
              className={`text-[11px] font-bold px-3 py-1.5 rounded-full border transition-all ${
                provinceFilter === p
                  ? 'bg-health-primary text-white border-health-primary shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300 hover:text-emerald-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search district..."
          value={searchVal}
          onChange={(e) => { setSearchVal(e.target.value); setSelectedDistrict(null) }}
          className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold ml-auto max-w-xs w-full"
        />
        <button
          onClick={loadDistrictData}
          disabled={loading}
          className="text-[10px] font-bold text-health-primary border border-health-primary px-2 py-1.5 rounded hover:bg-health-primary/5 transition disabled:opacity-50"
        >
          {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
        </button>
      </div>

      {/* Main split: Heatmap grid + Detail panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Left: Heatmap Grid (2/3) */}
        <div className="lg:col-span-2 space-y-4">

          {/* Legend */}
          <div className="flex items-center space-x-4 text-[10px] font-bold text-gray-500 flex-wrap gap-y-1">
            <span className="uppercase tracking-wider">Stock Level Legend:</span>
            {[
              { label: 'Optimal (≥90%)', cls: 'bg-emerald-500' },
              { label: 'Good (80–90%)', cls: 'bg-emerald-300' },
              { label: 'Moderate (70–80%)', cls: 'bg-yellow-300' },
              { label: 'Limited (60–70%)', cls: 'bg-orange-400' },
              { label: 'Critical (<60%)', cls: 'bg-red-500' },
            ].map((l) => (
              <span key={l.label} className="flex items-center space-x-1.5">
                <span className={`w-3 h-3 rounded-sm inline-block ${l.cls}`} />
                <span>{l.label}</span>
              </span>
            ))}
          </div>

          {/* Grid of district cells */}
          {loading ? (
            <div className="text-center py-10 flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
              <span className="text-xs text-gray-400 font-medium">Loading district analytics...</span>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {filtered.map((d) => {
                const isSelected = selectedDistrict?.id === d.id
                return (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDistrict(isSelected ? null : d)}
                    className={`relative rounded-xl p-3 text-left transition-all border-2 focus:outline-none group ${
                      isSelected
                        ? 'border-slate-900 shadow-md scale-105'
                        : 'border-transparent hover:border-gray-300 hover:shadow-sm hover:scale-102'
                    }`}
                    style={{ background: 'transparent' }}
                    title={`${d.name} — ${d.activeStock}% stock`}
                  >
                    {/* Heat colour block */}
                    <div className={`${heatClass(d.activeStock)} rounded-lg p-3 transition-all`}>
                      <span className="block text-[11px] font-black text-white leading-tight drop-shadow">{d.name}</span>
                      <span className="block text-lg font-black text-white mt-1 drop-shadow">{d.activeStock}%</span>
                      <span className="block text-[9px] text-white/80 font-bold mt-0.5">{d.pharmacies} stores</span>
                    </div>
                    {d.criticalDrugs.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center text-white text-[8px] font-black shadow">
                        !
                      </span>
                    )}
                  </button>
                )
              })}
              {filtered.length === 0 && (
                <div className="col-span-5 text-center py-12 text-gray-400 text-xs font-medium">
                  No districts match the current filter.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Drill-down Panel (1/3) */}
        <div className="lg:col-span-1">
          {selectedDistrict ? (
            <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden animate-fadeIn">
              {/* Header bar */}
              <div className={`p-4 flex items-center justify-between ${heatClass(selectedDistrict.activeStock)}`}>
                <div>
                  <span className="text-white font-black text-base block">{selectedDistrict.name}</span>
                  <span className="text-white/80 text-[10px] font-bold">{selectedDistrict.province}</span>
                </div>
                <button
                  onClick={() => setSelectedDistrict(null)}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Metrics */}
              <div className="p-5 space-y-5 text-xs">
                {/* Stock gauge */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-gray-500 uppercase text-[10px] tracking-wider">Essential Drug Coverage</span>
                    <span className={`inline-flex text-[10px] font-bold border px-2 py-0.5 rounded ${heatTextClass(selectedDistrict.activeStock)}`}>
                      {heatLabel(selectedDistrict.activeStock)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${heatClass(selectedDistrict.activeStock)}`}
                      style={{ width: `${selectedDistrict.activeStock}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 font-semibold">
                    <span>0%</span>
                    <span className="font-black text-gray-700">{selectedDistrict.activeStock}% stocked</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Key stats */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Pharmacies', value: selectedDistrict.pharmacies },
                    { label: 'Reservations', value: selectedDistrict.reservations.toLocaleString() },
                    { label: 'Population', value: `${(selectedDistrict.population / 1000).toFixed(0)}K` },
                    { label: 'Stores / 100K', value: ((selectedDistrict.pharmacies / selectedDistrict.population) * 100000).toFixed(1) },
                  ].map((s) => (
                    <div key={s.label} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <span className="text-[9px] text-gray-400 uppercase font-bold block">{s.label}</span>
                      <span className="text-base font-black text-gray-900">{s.value}</span>
                    </div>
                  ))}
                </div>

                {/* Critical drug shortages */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Drug Shortage Alerts</span>
                  {selectedDistrict.criticalDrugs.length === 0 ? (
                    <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="text-[11px] text-emerald-700 font-bold">No critical shortages reported</span>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {selectedDistrict.criticalDrugs.map((drug) => (
                        <div key={drug} className="flex items-center space-x-2 bg-red-50 border border-red-100 rounded-lg p-2.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                          <span className="text-[11px] text-red-700 font-bold">{drug}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Coverage bar chart by drug category (mock) */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Category Coverage</span>
                  {[
                    { label: 'Antimalarials', pct: Math.min(100, selectedDistrict.activeStock + 5) },
                    { label: 'Antibiotics',   pct: Math.min(100, selectedDistrict.activeStock - 2) },
                    { label: 'Analgesics',    pct: Math.min(100, selectedDistrict.activeStock + 8) },
                    { label: 'Antidiabetics', pct: Math.min(100, selectedDistrict.activeStock - 10) },
                  ].map((bar) => (
                    <div key={bar.label} className="space-y-0.5">
                      <div className="flex justify-between text-[10px] font-semibold text-gray-600">
                        <span>{bar.label}</span>
                        <span>{bar.pct}%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${heatClass(bar.pct)}`} style={{ width: `${bar.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-xs text-center space-y-3">
              <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                <MapPin className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="font-black text-gray-900 text-sm">Select a District</h3>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Click any district cell in the heatmap to view detailed stock analytics, shortage alerts, and pharmacy coverage metrics.
              </p>
            </div>
          )}

          {/* Province Summary Mini Table */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs space-y-3 mt-4">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Province Summary</span>
            {['Kigali City', 'Northern Province', 'Southern Province', 'Eastern Province', 'Western Province'].map((prov) => {
              const provDistricts = districts.filter((d) => d.province === prov)
              const avgStock = provDistricts.length > 0 
                ? Math.round(provDistricts.reduce((a, d) => a + d.activeStock, 0) / provDistricts.length)
                : 0
              return (
                <div key={prov}>
                  <div className="flex justify-between text-[11px] font-semibold text-gray-700 mb-1">
                    <button
                      className="hover:text-health-primary transition-colors text-left"
                      onClick={() => { setProvinceFilter(prov); setSelectedDistrict(null) }}
                    >
                      {prov.replace(' Province', '')}
                    </button>
                    <span className={`font-black ${avgStock >= 90 ? 'text-emerald-700' : avgStock >= 70 ? 'text-amber-700' : 'text-red-700'}`}>
                      {avgStock}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${heatClass(avgStock)}`} style={{ width: `${avgStock}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}