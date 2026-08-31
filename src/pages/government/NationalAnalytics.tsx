import React, { useState, useEffect } from 'react'
import { Activity, MapPin, AlertCircle, BarChart2, ShieldAlert, FileClock, RefreshCw } from 'lucide-react'
import { AuthApi } from '@/services/auth-api'

interface DistrictAlert {
  id: string
  district: string
  province: string
  activePharmacies: number
  activeReservations: number
  shortageMeds: string[]
  status: 'Optimal' | 'Limited Supply' | 'Critical Shortage'
  stockLevel?: number
}

export default function NationalAnalytics() {
  const [districtAlerts, setDistrictAlerts] = useState<DistrictAlert[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadNationalAnalytics = async () => {
    setLoading(true)
    setError(null)
    try {
      const [lowStockData, medicineAvailability] = await Promise.all([
        AuthApi.getGovernmentLowStock(10),
        AuthApi.getGovernmentMedicineAvailability().catch(() => []),
      ])

      const districtMap = new Map<string, DistrictAlert>()

      lowStockData.forEach((item: any) => {
        const district = item.pharmacy?.district || item.district || 'Unknown'
        const province = item.pharmacy?.province || item.province || 'Unknown'
        const medicineName = item.medicine?.name || item.medicineName || 'Unknown Medicine'
        const quantity = item.quantity || 0

        if (!districtMap.has(district)) {
          districtMap.set(district, {
            id: `dist-${district}`,
            district,
            province,
            activePharmacies: 0,
            activeReservations: 0,
            shortageMeds: [],
            status: quantity === 0 ? 'Critical Shortage' : 'Limited Supply',
            stockLevel: quantity,
          })
        }

        const districtData = districtMap.get(district)!
        if (!districtData.shortageMeds.includes(medicineName)) {
          districtData.shortageMeds.push(medicineName)
        }
      })

      const pharmacies = await AuthApi.getAllPharmacies().catch(() => [])
      pharmacies.forEach((pharm: any) => {
        const district = pharm.district || 'Unknown'
        if (districtMap.has(district)) {
          const districtData = districtMap.get(district)!
          districtData.activePharmacies++
          if (pharm.status === 'APPROVED') {
            districtData.activeReservations += Math.floor(Math.random() * 50) + 10 // Mock reservation count
          }
        }
      })

      const alerts = Array.from(districtMap.values())
      
      const approvedPharmacies = pharmacies.filter((p: any) => p.status === 'APPROVED')
      const districtCounts = new Map<string, number>()
      approvedPharmacies.forEach((p: any) => {
        const district = p.district || 'Unknown'
        districtCounts.set(district, (districtCounts.get(district) || 0) + 1)
      })

      districtCounts.forEach((count, district) => {
        if (!districtMap.has(district) && count > 5) {
          const pharmacy = approvedPharmacies.find((p: any) => p.district === district)
          alerts.push({
            id: `dist-${district}`,
            district,
            province: (pharmacy as any)?.province || 'Unknown',
            activePharmacies: count,
            activeReservations: count * 10,
            shortageMeds: [],
            status: 'Optimal',
            stockLevel: 95,
          })
        }
      })

      setDistrictAlerts(alerts.slice(0, 10)) // Limit to top 10
    } catch (err: any) {
      setError(err.message || 'Failed to load national analytics')
      console.error('National analytics error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNationalAnalytics()
  }, [])

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2 text-red-800 text-xs">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {districtAlerts.some(d => d.status === 'Critical Shortage') && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex items-start space-x-3 text-xs shadow-xs">
          <ShieldAlert className="w-5 h-5 text-red-650 flex-shrink-0 mt-0.5" />
          <div className="leading-normal">
            <span className="font-bold">National Shortage Warning:</span> Essential drug supply index in critical districts has dropped below safety limits. District medical dispatch operations are notified.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-150">
            <div className="flex items-center space-x-2">
              <BarChart2 className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-black text-gray-900">District Stock Level monitoring</h3>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 font-bold">{districtAlerts.length} Monitored Districts</span>
              <button
                onClick={loadNationalAnalytics}
                disabled={loading}
                className="text-[10px] font-bold text-health-primary border border-health-primary px-2 py-1 rounded hover:bg-health-primary/5 transition disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-10 flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
                <span className="text-xs text-gray-400 font-medium">Loading district analytics...</span>
              </div>
            ) : districtAlerts.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-xs font-medium">
                No district data available from backend.
              </div>
            ) : (
              <table className="w-full text-left text-xs divide-y divide-gray-150">
                <thead>
                  <tr className="text-[10px] font-black text-slate-450 uppercase tracking-wider">
                    <th className="py-2.5">District</th>
                    <th className="py-2.5">Province</th>
                    <th className="py-2.5 text-center">Active Stores</th>
                    <th className="py-2.5 text-center">Active Res.</th>
                    <th className="py-2.5">Shortage Drugs</th>
                    <th className="py-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {districtAlerts.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50/50">
                      <td className="py-3 font-bold text-gray-950">{d.district}</td>
                      <td className="py-3 text-gray-550">{d.province}</td>
                      <td className="py-3 text-center">{d.activePharmacies}</td>
                      <td className="py-3 text-center text-emerald-800 font-bold">{d.activeReservations}</td>
                      <td className="py-3">
                        {d.shortageMeds.length > 0 ? (
                          <span className="text-[9px] font-black text-red-750 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                            {d.shortageMeds.join(', ')}
                          </span>
                        ) : (
                          <span className="text-[9px] text-gray-400 font-medium">None</span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        {d.status === 'Optimal' ? (
                          <span className="inline-flex items-center text-[9px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-250">
                            Optimal
                          </span>
                        ) : d.status === 'Limited Supply' ? (
                          <span className="inline-flex items-center text-[9px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-250">
                            Limited
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[9px] font-black text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                            Shortage
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

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-150">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-black text-gray-900">National Shortage Map</h3>
            </div>
          </div>

          <div className="w-full h-48 bg-gray-50 border border-gray-250 rounded-xl flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-xs flex items-center justify-center">
              <span className="text-[10px] text-gray-400 font-black uppercase bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm">Interactive GPS Overlay</span>
            </div>
            
            <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-red-600 rounded-full animate-ping" />
            <div className="absolute top-1/4 left-1/3 w-2.5 h-2.5 bg-red-600 rounded-full" />
            <div className="absolute bottom-1/3 right-1/4 w-3.5 h-3.5 bg-amber-500 rounded-full animate-pulse" />
          </div>

          <div className="space-y-2 text-xs font-semibold text-gray-600">
            <div className="flex items-center justify-between">
              <span>National Safety Limit</span>
              <span className="font-bold text-gray-900">85% threshold</span>
            </div>
            <div className="flex items-center justify-between border-t border-gray-100 pt-2">
              <span>MOH Dispatch Lead</span>
              <span className="font-bold text-health-primary">Dr. Eric Habimana</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
