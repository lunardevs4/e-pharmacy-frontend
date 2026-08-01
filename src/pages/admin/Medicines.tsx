import React, { useState } from 'react'
import { Package, Search, Plus, X, Check, AlertTriangle, Edit, Archive, RefreshCw } from 'lucide-react'

interface MedicineEntry {
  id: string
  name: string
  genericName: string
  category: string
  manufacturer: string
  prescriptionRequired: boolean
  status: 'Active' | 'Archived' | 'Under Review'
  addedAt: string
}

const MOCK_MEDICINES: MedicineEntry[] = [
  { id: 'MED-001', name: 'Panadol Forte 500mg', genericName: 'Paracetamol', category: 'Analgesics', manufacturer: 'GSK', prescriptionRequired: false, status: 'Active', addedAt: '2026-01-10' },
  { id: 'MED-002', name: 'Coartem 80/480mg', genericName: 'Artemether + Lumefantrine', category: 'Antimalarials', manufacturer: 'Novartis', prescriptionRequired: true, status: 'Active', addedAt: '2026-01-15' },
  { id: 'MED-003', name: 'Amoxil 500mg', genericName: 'Amoxicillin', category: 'Antibiotics', manufacturer: 'Beecham', prescriptionRequired: true, status: 'Active', addedAt: '2026-02-01' },
  { id: 'MED-004', name: 'Glucophage 850mg', genericName: 'Metformin HCl', category: 'Antidiabetics', manufacturer: 'Merck', prescriptionRequired: true, status: 'Active', addedAt: '2026-02-10' },
  { id: 'MED-005', name: 'Tenormin 50mg', genericName: 'Atenolol', category: 'Antihypertensives', manufacturer: 'AstraZeneca', prescriptionRequired: true, status: 'Active', addedAt: '2026-03-05' },
  { id: 'MED-006', name: 'Insulatard 100IU/mL', genericName: 'Insulin Isophane', category: 'Antidiabetics', manufacturer: 'Novo Nordisk', prescriptionRequired: true, status: 'Active', addedAt: '2026-03-20' },
  { id: 'MED-007', name: 'Zithromax 250mg', genericName: 'Azithromycin', category: 'Antibiotics', manufacturer: 'Pfizer', prescriptionRequired: true, status: 'Under Review', addedAt: '2026-05-15' },
  { id: 'MED-008', name: 'ORS Sachet 20g', genericName: 'Oral Rehydration Salts', category: 'Electrolytes', manufacturer: 'UNICEF Rwanda', prescriptionRequired: false, status: 'Active', addedAt: '2026-01-05' },
]

const CATEGORIES = ['Analgesics', 'Antimalarials', 'Antibiotics', 'Antidiabetics', 'Antihypertensives', 'Electrolytes', 'Vaccines', 'Other']

export default function AdminMedicines() {
  const [medicines, setMedicines] = useState<MedicineEntry[]>(MOCK_MEDICINES)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const [showAddModal, setShowAddModal] = useState(false)
  const [editTarget, setEditTarget] = useState<MedicineEntry | null>(null)

  // Form fields
  const [fName, setFName] = useState('')
  const [fGeneric, setFGeneric] = useState('')
  const [fCategory, setFCategory] = useState('Analgesics')
  const [fManufacturer, setFManufacturer] = useState('')
  const [fRx, setFRx] = useState(false)

  const triggerToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  const openAdd = () => {
    setEditTarget(null)
    setFName(''); setFGeneric(''); setFCategory('Analgesics'); setFManufacturer(''); setFRx(false)
    setShowAddModal(true)
  }

  const openEdit = (m: MedicineEntry) => {
    setEditTarget(m)
    setFName(m.name); setFGeneric(m.genericName); setFCategory(m.category)
    setFManufacturer(m.manufacturer); setFRx(m.prescriptionRequired)
    setShowAddModal(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fName || !fGeneric || !fManufacturer) return
    if (editTarget) {
      setMedicines((prev) => prev.map((m) => m.id === editTarget.id
        ? { ...m, name: fName, genericName: fGeneric, category: fCategory, manufacturer: fManufacturer, prescriptionRequired: fRx }
        : m
      ))
      triggerToast(`${fName} updated successfully.`)
    } else {
      const newMed: MedicineEntry = {
        id: `MED-${String(medicines.length + 1).padStart(3, '0')}`,
        name: fName, genericName: fGeneric, category: fCategory,
        manufacturer: fManufacturer, prescriptionRequired: fRx,
        status: 'Under Review', addedAt: new Date().toISOString().split('T')[0],
      }
      setMedicines((prev) => [newMed, ...prev])
      triggerToast(`${fName} added to the national catalogue.`)
    }
    setShowAddModal(false)
  }

  const toggleArchive = (id: string) => {
    setMedicines((prev) => prev.map((m) => {
      if (m.id !== id) return m
      const next = m.status === 'Archived' ? 'Active' : 'Archived'
      triggerToast(`${m.name} set to ${next}.`)
      return { ...m, status: next }
    }))
  }

  const setReviewStatus = (id: string, s: MedicineEntry['status']) => {
    setMedicines((prev) => prev.map((m) => m.id === id ? { ...m, status: s } : m))
    triggerToast(`Status updated to ${s}.`)
  }

  const filtered = medicines.filter((m) => {
    const q = search.toLowerCase()
    const matchSearch = m.name.toLowerCase().includes(q) || m.genericName.toLowerCase().includes(q) || m.manufacturer.toLowerCase().includes(q)
    const matchCat = categoryFilter ? m.category === categoryFilter : true
    const matchStatus = statusFilter ? m.status === statusFilter : true
    return matchSearch && matchCat && matchStatus
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 relative">
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg shadow-xl text-xs font-bold flex items-center space-x-2">
          <Check className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Medicines', value: medicines.length, color: 'text-gray-900' },
          { label: 'Active', value: medicines.filter((m) => m.status === 'Active').length, color: 'text-emerald-700' },
          { label: 'Under Review', value: medicines.filter((m) => m.status === 'Under Review').length, color: 'text-amber-700' },
          { label: 'Archived', value: medicines.filter((m) => m.status === 'Archived').length, color: 'text-gray-500' },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
            <span className="text-[10px] text-gray-400 block uppercase font-bold">{s.label}</span>
            <span className={`text-2xl font-black ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row gap-2 flex-grow max-w-2xl">
            <div className="relative flex-grow">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input type="text" placeholder="Search medicine name or generic..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold" />
            </div>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-2.5 py-2 text-xs text-gray-700 font-bold focus:outline-none">
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-2.5 py-2 text-xs text-gray-700 font-bold focus:outline-none">
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Under Review">Under Review</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
          <button onClick={openAdd}
            className="bg-health-primary hover:bg-health-secondary text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center space-x-1.5 shadow-sm transition-colors">
            <Plus className="w-4 h-4" />
            <span>Add Medicine</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3">Medicine</th>
                <th className="px-5 py-3">Generic Name</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Manufacturer</th>
                <th className="px-5 py-3">Rx</th>
                <th className="px-5 py-3">Added</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-black flex-shrink-0">
                        {m.name[0]}
                      </div>
                      <span className="font-bold text-gray-900">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-mono text-gray-700 underline">{m.genericName}</td>
                  <td className="px-5 py-3">
                    <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px] font-semibold">{m.category}</span>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{m.manufacturer}</td>
                  <td className="px-5 py-3">
                    {m.prescriptionRequired
                      ? <span className="text-[9px] font-black text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">Rx Required</span>
                      : <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">OTC</span>
                    }
                  </td>
                  <td className="px-5 py-3 font-mono text-gray-400">{m.addedAt}</td>
                  <td className="px-5 py-3">
                    {m.status === 'Active' && <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">Active</span>}
                    {m.status === 'Under Review' && <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">Under Review</span>}
                    {m.status === 'Archived' && <span className="text-[10px] font-bold text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded">Archived</span>}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button onClick={() => openEdit(m)}
                        className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-health-primary transition-colors" title="Edit">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      {m.status === 'Under Review' && (
                        <button onClick={() => setReviewStatus(m.id, 'Active')}
                          className="text-[10px] font-bold px-2 py-1 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-colors">
                          Approve
                        </button>
                      )}
                      <button onClick={() => toggleArchive(m.id)}
                        className="text-[10px] font-bold px-2 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                        {m.status === 'Archived' ? 'Restore' : 'Archive'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-10 text-gray-400 text-xs">No medicines match the current filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden z-50">
            <div className="bg-emerald-950 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm">{editTarget ? 'Edit Medicine' : 'Add Medicine to Catalogue'}</h3>
                <p className="text-xs text-emerald-300">National essential drug registry</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-emerald-300 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Trade / Brand Name *</label>
                  <input required value={fName} onChange={(e) => setFName(e.target.value)} placeholder="e.g. Panadol Forte"
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold" />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Generic Molecule *</label>
                  <input required value={fGeneric} onChange={(e) => setFGeneric(e.target.value)} placeholder="e.g. Paracetamol"
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold" />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Category *</label>
                  <select value={fCategory} onChange={(e) => setFCategory(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none font-semibold">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Manufacturer *</label>
                  <input required value={fManufacturer} onChange={(e) => setFManufacturer(e.target.value)} placeholder="e.g. GSK"
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold" />
                </div>
                <div className="col-span-2 flex items-center space-x-2 pt-1">
                  <input type="checkbox" id="rx" checked={fRx} onChange={(e) => setFRx(e.target.checked)}
                    className="h-4 w-4 text-emerald-600 border-gray-300 rounded" />
                  <label htmlFor="rx" className="text-xs font-bold text-gray-700 cursor-pointer">Requires Medical Prescription (Rx)</label>
                </div>
              </div>
              <button type="submit"
                className="w-full bg-health-primary hover:bg-health-secondary text-white font-bold py-2.5 rounded-lg text-xs transition-colors shadow-sm">
                {editTarget ? 'Save Changes' : 'Register Medicine'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
