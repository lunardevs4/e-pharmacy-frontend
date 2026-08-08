import React, { useState, useEffect } from 'react'
import { MedicineApi } from '@/services/medicine-api'
import { Medicine } from '@/types'
import { Package, Search } from 'lucide-react'

export default function MedicineRegistry() {
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [searchVal, setSearchVal] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const loadCatalogue = async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const list = await MedicineApi.searchMedicines('', '', false)
      setMedicines(list)
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'Unable to load the national medicine registry.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCatalogue()
  }, [])

  const filteredMedicines = medicines.filter((m) => {
    const search = searchVal.toLowerCase()
    const matchesSearch = m.name.toLowerCase().includes(search) ||
      m.genericName.toLowerCase().includes(search) ||
      m.manufacturer.toLowerCase().includes(search)
    const matchesCategory = categoryFilter ? m.category === categoryFilter : true
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 relative">
      {errorMsg && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
          {errorMsg}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
          <div className="flex items-center space-x-2">
            <Package className="w-4 h-4 text-emerald-700" />
            <div>
              <h3 className="text-sm font-black text-gray-900">National Essential Medicine Registry</h3>
              <p className="text-xs text-gray-500">Live medicine catalogue powered by backend registry data.</p>
            </div>
          </div>
          <span className="text-xs text-slate-500 font-bold">{filteredMedicines.length} medicines indexed</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto flex-grow max-w-2xl">
            <div className="relative flex-grow">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search medicine name, generic molecule, or manufacturer"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-semibold"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-2 text-xs text-gray-700 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">All Categories</option>
              <option value="Analgesics">Analgesics</option>
              <option value="Antibiotics">Antibiotics</option>
              <option value="Antidiabetics">Antidiabetics</option>
              <option value="Antihypertensives">Antihypertensives</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs divide-y divide-gray-150">
            <thead>
              <tr className="text-[10px] font-black text-slate-450 uppercase tracking-wider">
                <th className="py-2.5">Trade Name</th>
                <th className="py-2.5">Generic Molecule</th>
                <th className="py-2.5">Category</th>
                <th className="py-2.5">Manufacturer</th>
                <th className="py-2.5">Prescription</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-400">Loading medicine catalogue...</td>
                </tr>
              ) : filteredMedicines.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-500 text-sm">No medicine records match the current filter.</td>
                </tr>
              ) : (
                filteredMedicines.map((med) => (
                  <tr key={med.id} className="hover:bg-gray-50/50">
                    <td className="py-3 font-bold text-gray-950 flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-650">
                        {med.name.charAt(0).toUpperCase()}
                      </span>
                      <span>{med.name}</span>
                    </td>
                    <td className="py-3 text-gray-900">{med.genericName}</td>
                    <td className="py-3">{med.category}</td>
                    <td className="py-3 text-gray-600">{med.manufacturer || 'Unknown'}</td>
                    <td className="py-3">
                      {med.prescriptionRequired ? (
                        <span className="text-[9px] font-black text-red-700 bg-red-50 border border-red-100 px-2 py-0.5 rounded uppercase">Rx Required</span>
                      ) : (
                        <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded uppercase">Rx Free</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
