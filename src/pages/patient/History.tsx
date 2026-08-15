import React, { useState, useEffect } from 'react'
import { MedicineApi } from '@/services/medicine-api'
import { History, Package, MapPin, Calendar, DollarSign, Filter, Search, FileText, AlertCircle } from 'lucide-react'

interface MedicineHistoryItem {
  id: string
  medicineName: string
  genericName: string
  pharmacyName: string
  quantity: number
  price: number
  insuranceProvider: string
  patientPays: number
  purchaseDate: string
  prescriptionRequired: boolean
  pharmacistNotes: string
}

export default function PatientHistory() {
  const [history, setHistory] = useState<MedicineHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [pharmacyFilter, setPharmacyFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await MedicineApi.getMedicineHistory()
      setHistory(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load medicine history')
    } finally {
      setLoading(false)
    }
  }

  // Get unique pharmacies for filter
  const uniquePharmacies = Array.from(new Set(history.map(item => item.pharmacyName)))

  // Filter history
  const filteredHistory = history.filter(item => {
    const matchesSearch = 
      item.medicineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.pharmacyName.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesPharmacy = pharmacyFilter ? item.pharmacyName === pharmacyFilter : true
    
    const matchesDate = dateFilter ? item.purchaseDate.startsWith(dateFilter) : true
    
    return matchesSearch && matchesPharmacy && matchesDate
  })

  // Calculate statistics
  const totalPurchases = history.length
  const totalSpent = history.reduce((sum, item) => sum + item.patientPays, 0)
  const totalQuantity = history.reduce((sum, item) => sum + item.quantity, 0)
  const insuranceUsage = history.filter(item => item.insuranceProvider).length

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center space-x-3">
          <History className="w-6 h-6 text-health-primary" />
          <div>
            <h1 className="text-2xl font-black text-gray-900">Medicine Purchase History</h1>
            <p className="text-gray-500 text-xs mt-1">Track all your medication purchases, costs, and pharmacy visits</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-50 rounded-lg text-health-primary">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block uppercase font-bold">Total Purchases</span>
            <span className="text-lg font-black text-gray-950">{totalPurchases}</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-center space-x-3">
          <div className="p-2.5 bg-blue-50 rounded-lg text-blue-700">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block uppercase font-bold">Total Spent</span>
            <span className="text-lg font-black text-gray-950">{totalSpent.toLocaleString()} RWF</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-center space-x-3">
          <div className="p-2.5 bg-amber-50 rounded-lg text-amber-700">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block uppercase font-bold">Medicines Dispensed</span>
            <span className="text-lg font-black text-gray-950">{totalQuantity}</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-center space-x-3">
          <div className="p-2.5 bg-purple-50 rounded-lg text-purple-700">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block uppercase font-bold">Insurance Used</span>
            <span className="text-lg font-black text-gray-950">{insuranceUsage} times</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-grow max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search medicine, pharmacy, or generic name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-semibold"
            />
          </div>

          <select
            value={pharmacyFilter}
            onChange={(e) => setPharmacyFilter(e.target.value)}
            className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-700 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">All Pharmacies</option>
            {uniquePharmacies.map(pharmacy => (
              <option key={pharmacy} value={pharmacy}>{pharmacy}</option>
            ))}
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-700 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-gray-400">
            Loading medicine history...
          </div>
        ) : error ? (
          <div className="py-12 text-center text-red-600 text-xs">
            {error}
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="py-16 text-center text-gray-400 space-y-3">
            <Package className="w-12 h-12 text-gray-200 mx-auto" />
            <p className="text-xs">No medicine history found matching the filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Medicine</th>
                  <th className="px-5 py-3">Generic Name</th>
                  <th className="px-5 py-3">Pharmacy</th>
                  <th className="px-5 py-3 text-center">Qty</th>
                  <th className="px-5 py-3">Insurance</th>
                  <th className="px-5 py-3 text-right">Paid</th>
                  <th className="px-5 py-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3 font-mono text-gray-550">
                      {new Date(item.purchaseDate).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-gray-900">{item.medicineName}</span>
                        {item.prescriptionRequired && (
                          <FileText className="w-3 h-3 text-red-600" />
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{item.genericName}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span className="font-semibold text-gray-800">{item.pharmacyName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center font-bold text-gray-900">{item.quantity}</td>
                    <td className="px-5 py-3">
                      {item.insuranceProvider ? (
                        <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {item.insuranceProvider}
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400 font-semibold">Private</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right font-black text-health-primary">
                      {item.patientPays.toLocaleString()} RWF
                    </td>
                    <td className="px-5 py-3 text-gray-500 max-w-xs truncate">
                      {item.pharmacistNotes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
