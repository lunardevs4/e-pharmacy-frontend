import React, { useState, useEffect } from 'react'
import { MedicineApi } from '@/services/medicine-api'
import { Medicine } from '@/types'
import { Package, Search, Plus, X, Check, Archive, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function MedicineRegistry() {
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [loading, setLoading] = useState(false)
  
  // Custom status tracker for approvals/archiving inside MoH dashboard context
  const [medicineStatus, setMedicineStatus] = useState<Record<string, 'Approved' | 'Review' | 'Archived'>>({})

  // Filter states
  const [searchVal, setSearchVal] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  // Add catalog modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [name, setName] = useState('')
  const [genericName, setGenericName] = useState('')
  const [tradeNames, setTradeNames] = useState('')
  const [category, setCategory] = useState('Analgesics')
  const [manufacturer, setManufacturer] = useState('')
  const [prescriptionRequired, setPrescriptionRequired] = useState(false)
  const [uses, setUses] = useState('')
  
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const triggerToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  // Load essential catalogue lists
  const loadCatalogue = async () => {
    setLoading(true)
    try {
      const list = await MedicineApi.searchMedicines('', '', false)
      setMedicines(list)
      
      // Initialize mock catalog statuses
      const statuses: Record<string, 'Approved' | 'Review' | 'Archived'> = {}
      list.forEach((m) => {
        // Mock default statuses
        if (m.id === 'med-005') statuses[m.id] = 'Approved'
        else if (m.id.startsWith('med-00')) statuses[m.id] = 'Approved'
        else statuses[m.id] = 'Review'
      })
      setMedicineStatus(statuses)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCatalogue()
  }, [])

  // Submit and save new catalogue medication to dynamic localStorage seeds
  const handleRegisterMedicine = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !genericName || !manufacturer) return

    const newMed: Medicine = {
      id: `med-${Math.floor(100000 + Math.random() * 900000)}`,
      name,
      genericName,
      tradeNames: tradeNames ? tradeNames.split(',').map((t) => t.trim()) : [],
      category,
      manufacturer,
      prescriptionRequired,
      uses: uses || `Essential ${category} medication indicated for primary healthcare services.`,
      dosage: 'As prescribed by clinical health practitioners.',
      warnings: 'Keep out of reach of children.',
      sideEffects: 'Mild dizziness or nausea may occur.',
      interactions: 'Consult clinical summaries.',
      storage: 'Store below 30°C in a dry place.'
    }

    try {
      await MedicineApi.addCustomMedicine(newMed)
      setMedicineStatus((prev) => ({ ...prev, [newMed.id]: 'Approved' }))
      
      // Seed audit log log to notifications centre
      const notKey = 'epharmacy_notifications_mock'
      const rawNot = localStorage.getItem(notKey)
      const list = rawNot ? JSON.parse(rawNot) : []
      const newAlert = {
        id: `not-${Math.random().toString(36).substring(2, 9)}`,
        title: 'New Medicine Registered',
        message: `Ministry of Health registered ${name} (${genericName}) into the National Essential Medicine Catalogue.`,
        type: 'SYSTEM',
        read: false,
        createdAt: new Date().toISOString()
      }
      localStorage.setItem(notKey, JSON.stringify([newAlert, ...list]))

      triggerToast(`Essential drug ${name} added to the national catalog catalogue successfully.`)
      setShowAddModal(false)
      loadCatalogue()

      // Clear inputs
      setName('')
      setGenericName('')
      setTradeNames('')
      setManufacturer('')
      setPrescriptionRequired(false)
      setUses('')
    } catch (err: any) {
      triggerToast(err.message || 'Registration failed.')
    }
  }

  // Toggle approvals
  const handleApprove = (id: string) => {
    setMedicineStatus((prev) => ({ ...prev, [id]: 'Approved' }))
    triggerToast('Medicine catalog reference approved for pharmacy stocking.')
  }

  const handleArchive = (id: string) => {
    setMedicineStatus((prev) => ({ ...prev, [id]: 'Archived' }))
    triggerToast('Medicine discontinued and archived from active stock registry.')
  }

  const filteredMedicines = medicines.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(searchVal.toLowerCase()) || 
                          m.genericName.toLowerCase().includes(searchVal.toLowerCase()) ||
                          m.manufacturer.toLowerCase().includes(searchVal.toLowerCase())
    const matchesCategory = categoryFilter ? m.category === categoryFilter : true
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 relative">
      
      {/* Toast alert popup */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-55 bg-emerald-50 border border-emerald-250 text-emerald-800 px-4.5 py-3 rounded-lg shadow-xl animate-fadeIn flex items-center space-x-2 text-xs font-bold">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Directory table card list */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
        
        <div className="flex justify-between items-center pb-2 border-b border-gray-150">
          <div className="flex items-center space-x-2">
            <Package className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-black text-gray-900">National Essential Medicine Registry</h3>
          </div>
          <span className="text-xs text-slate-500 font-bold">{filteredMedicines.length} Indexed Medicines</span>
        </div>

        {/* Filters console and Register button */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto flex-grow max-w-2xl">
            <div className="relative flex-grow">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search catalog brand, generic molecule, or manufacturer..."
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

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="bg-health-primary hover:bg-health-secondary text-white font-bold px-4 py-2 rounded-lg text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-sm focus:outline-none"
          >
            <Plus className="w-4 h-4" />
            <span>Register Medicine</span>
          </button>
        </div>

        {/* Medicines table grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-gray-150">
            <thead>
              <tr className="text-[10px] font-black text-slate-450 uppercase tracking-wider">
                <th className="py-2.5">Trade Name</th>
                <th className="py-2.5">Generic Molecule</th>
                <th className="py-2.5">Category</th>
                <th className="py-2.5">Manufacturer</th>
                <th className="py-2.5">Prescription</th>
                <th className="py-2.5">Catalogue Status</th>
                <th className="py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-gray-400">Loading catalog items...</td>
                </tr>
              ) : filteredMedicines.map((med) => {
                const status = medicineStatus[med.id] || 'Approved'
                return (
                  <tr key={med.id} className="hover:bg-gray-50/50">
                    <td className="py-3 font-bold text-gray-950 flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-650">
                        {med.name[0].toUpperCase()}
                      </span>
                      <span>{med.name}</span>
                    </td>
                    <td className="py-3 font-bold text-gray-900 underline">{med.genericName}</td>
                    <td className="py-3">{med.category}</td>
                    <td className="py-3 text-gray-650">{med.manufacturer}</td>
                    <td className="py-3">
                      {med.prescriptionRequired ? (
                        <span className="text-[9px] font-black text-red-750 bg-red-50 border border-red-200 px-2 py-0.5 rounded uppercase">Rx Required</span>
                      ) : (
                        <span className="text-[9px] font-black text-emerald-800 bg-emerald-50 border border-emerald-250 px-2 py-0.5 rounded uppercase">Rx Free</span>
                      )}
                    </td>
                    <td className="py-3">
                      {status === 'Approved' ? (
                        <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-250">
                          Approved
                        </span>
                      ) : status === 'Review' ? (
                        <span className="inline-flex items-center text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-250">
                          Review Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                          Archived
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <div className="inline-flex space-x-1 justify-end">
                        {status !== 'Approved' && (
                          <button
                            type="button"
                            onClick={() => handleApprove(med.id)}
                            className="border border-emerald-350 hover:bg-emerald-50 text-health-primary font-bold px-2 py-1 rounded text-[10px] transition-colors focus:outline-none"
                          >
                            Approve
                          </button>
                        )}
                        {status !== 'Archived' && (
                          <button
                            type="button"
                            onClick={() => handleArchive(med.id)}
                            className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold px-2 py-1 rounded text-[10px] transition-colors focus:outline-none"
                          >
                            Archive
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

      </div>

      {/* Add Catalogue Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-55 flex items-center justify-center px-4 py-6">
          <div onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-gray-900/50 backdrop-blur-xs" />
          
          <div className="relative w-full max-w-md bg-white rounded-2xl border border-gray-250 shadow-2xl overflow-hidden z-55 flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-emerald-950 text-white px-6 py-4 flex items-center justify-between border-b border-emerald-900">
              <div>
                <h3 className="font-black text-sm">Register Essential Medicine</h3>
                <p className="text-xs text-emerald-300">Add drug entries into National Catalogue</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-emerald-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleRegisterMedicine} className="p-6 space-y-4 text-xs font-bold text-gray-700">
              
              <div className="space-y-1.5">
                <label className="block text-gray-400 uppercase tracking-wider text-[10px]">Trade / Brand Name</label>
                <input
                  type="text"
                  placeholder="e.g. Panadol Forte 500mg"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-950 font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-gray-400 uppercase tracking-wider text-[10px]">Generic Molecule Name</label>
                <input
                  type="text"
                  placeholder="e.g. Paracetamol"
                  required
                  value={genericName}
                  onChange={(e) => setGenericName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-950 font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-gray-400 uppercase tracking-wider text-[10px]">Trade Brands (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Calpol, Crocin, Tylenol"
                  value={tradeNames}
                  onChange={(e) => setTradeNames(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-950 font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-gray-400 uppercase tracking-wider text-[10px]">Manufacturer</label>
                <input
                  type="text"
                  placeholder="e.g. GSK plc"
                  required
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-950 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-gray-400 uppercase tracking-wider text-[10px]">Drug Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs focus:outline-none text-gray-950 font-bold"
                  >
                    <option value="Analgesics">Analgesics</option>
                    <option value="Antibiotics">Antibiotics</option>
                    <option value="Antidiabetics">Antidiabetics</option>
                    <option value="Antihypertensives">Antihypertensives</option>
                  </select>
                </div>

                <div className="space-y-1.5 flex flex-col justify-end pb-1.5">
                  <label className="flex items-center space-x-2 text-xs font-bold text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prescriptionRequired}
                      onChange={(e) => setPrescriptionRequired(e.target.checked)}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span>Prescription Required</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-gray-400 uppercase tracking-wider text-[10px]">Clinical Indications &amp; Uses</label>
                <textarea
                  rows={2}
                  placeholder="Specify therapeutic indications..."
                  value={uses}
                  onChange={(e) => setUses(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-950 font-bold leading-normal"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-health-primary hover:bg-health-secondary text-white font-bold py-2.5 rounded-lg text-xs transition-colors shadow-sm focus:outline-none mt-2"
              >
                Approve Entry &amp; Register Catalog
              </button>

            </form>

          </div>
        </div>
      )}

    </div>
  )
}
