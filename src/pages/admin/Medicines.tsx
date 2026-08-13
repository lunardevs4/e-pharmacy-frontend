import React, { useState, useEffect } from 'react'
import { Package, Search, Plus, X, Check, AlertTriangle, Edit, Archive, RefreshCw } from 'lucide-react'
import { MedicineApi } from '@/services/medicine-api'

interface MedicineEntry {
  id: string
  name: string
  genericName: string
  category: string
  manufacturer: string
  status: 'Active' | 'Archived'
  addedAt: string
}

interface CategoryOption {
  id: string
  name: string
}

interface ManufacturerOption {
  id: string
  name: string
}

const CATEGORIES = ['Analgesics', 'Antibiotics', 'Antidiabetics', 'Antihypertensives', 'Electrolytes', 'Vaccines', 'Other']

interface AutocompleteInputProps {
  label: string
  placeholder: string
  options: { id: string; name: string }[]
  selectedId: string
  selectedName: string
  onChange: (id: string, name: string) => void
  required?: boolean
}

function AutocompleteInput({
  label,
  placeholder,
  options,
  selectedId,
  selectedName,
  onChange,
  required,
}: AutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(selectedName)
  const containerRef = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    setInputValue(selectedName)
  }, [selectedName])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInputValue(val)
    setIsOpen(true)

    const exactMatch = options.find((opt) => opt.name.trim().toLowerCase() === val.trim().toLowerCase())
    if (exactMatch) {
      onChange(exactMatch.id, exactMatch.name)
    } else {
      onChange('', val)
    }
  }

  const handleSelectOption = (id: string, name: string) => {
    onChange(id, name)
    setInputValue(name)
    setIsOpen(false)
  }

  const filteredOptions = options.filter((opt) =>
    opt.name.toLowerCase().includes(inputValue.toLowerCase())
  )

  const showCreateOption =
    inputValue.trim() !== '' &&
    !options.some((opt) => opt.name.toLowerCase() === inputValue.trim().toLowerCase())

  return (
    <div ref={containerRef} className="space-y-1 relative">
      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
        {label}
      </label>
      <input
        required={required}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
      />
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-50 divide-y divide-gray-50 font-semibold text-xs">
          {filteredOptions.map((opt) => (
            <div
              key={opt.id}
              onClick={() => handleSelectOption(opt.id, opt.name)}
              className="px-3 py-2 hover:bg-emerald-50 hover:text-emerald-900 cursor-pointer transition-colors flex items-center justify-between"
            >
              <span>{opt.name}</span>
              {selectedId === opt.id && <Check className="w-3.5 h-3.5 text-emerald-600" />}
            </div>
          ))}
          {showCreateOption && (
            <div
              onClick={() => handleSelectOption('', inputValue.trim())}
              className="px-3 py-2 text-emerald-700 hover:bg-emerald-50 cursor-pointer font-bold transition-colors"
            >
              Create new: "{inputValue.trim()}"
            </div>
          )}
          {filteredOptions.length === 0 && !showCreateOption && (
            <div className="px-3 py-2 text-gray-400 text-[11px] italic">No options found</div>
          )}
        </div>
      )}
    </div>
  )
}

export default function AdminMedicines() {
  const [medicines, setMedicines] = useState<MedicineEntry[]>([])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [manufacturers, setManufacturers] = useState<ManufacturerOption[]>([])

  const [showAddModal, setShowAddModal] = useState(false)
  const [editTarget, setEditTarget] = useState<MedicineEntry | null>(null)

  // Form fields
  const [fName, setFName] = useState('')
  const [fGeneric, setFGeneric] = useState('')
  const [fCategoryId, setFCategoryId] = useState('')
  const [fCategoryName, setFCategoryName] = useState('')
  const [fManufacturerId, setFManufacturerId] = useState('')
  const [fManufacturerName, setFManufacturerName] = useState('')

  const triggerToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  const mapMedicine = (item: any): MedicineEntry => {
    const categoryName = item.category?.name || item.category || 'Uncategorized'
    const manufacturerName = item.manufacturer?.name || item.manufacturer || 'Unknown'
    return {
      id: item.id,
      name: item.name,
      genericName: item.genericName || '',
      category: categoryName,
      manufacturer: manufacturerName,
      status: item.isActive === false ? 'Archived' : 'Active',
      addedAt: item.createdAt ? new Date(item.createdAt).toISOString().split('T')[0] : 'Unknown',
    }
  }

  const loadMedicines = async () => {
    setIsLoading(true)
    setErrorMsg(null)
    try {
      const [medicineItems, categoryItems, manufacturerItems] = await Promise.all([
        MedicineApi.getMedicines(1, 200),
        MedicineApi.getCategories(),
        MedicineApi.getManufacturers(),
      ])
      setMedicines(medicineItems.map(mapMedicine))
      setCategories(categoryItems.map((c: any) => ({ id: c.id, name: c.name })))
      setManufacturers(manufacturerItems.map((m: any) => ({ id: m.id, name: m.name })))
      if (!fCategoryId && categoryItems.length) {
        setFCategoryId(categoryItems[0].id)
        setFCategoryName(categoryItems[0].name)
      }
      if (!fManufacturerId && manufacturerItems.length) {
        setFManufacturerId(manufacturerItems[0].id)
        setFManufacturerName(manufacturerItems[0].name)
      }
    } catch (error: any) {
      setErrorMsg(error?.message || 'Unable to load medicines data from the backend.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadMedicines()
  }, [])

  const openAdd = () => {
    setEditTarget(null)
    setFName('')
    setFGeneric('')
    setFCategoryId(categories[0]?.id || '')
    setFCategoryName(categories[0]?.name || '')
    setFManufacturerId(manufacturers[0]?.id || '')
    setFManufacturerName(manufacturers[0]?.name || '')
    setShowAddModal(true)
  }

  const openEdit = (m: MedicineEntry) => {
    setEditTarget(m)
    setFName(m.name)
    setFGeneric(m.genericName)
    const matchedCategory = categories.find((c) => c.name === m.category)
    const matchedManufacturer = manufacturers.find((mfr) => mfr.name === m.manufacturer)
    setFCategoryId(matchedCategory?.id || '')
    setFCategoryName(m.category)
    setFManufacturerId(matchedManufacturer?.id || '')
    setFManufacturerName(m.manufacturer)
    setShowAddModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fName || !fGeneric || !fCategoryName) return

    try {
      let categoryId = fCategoryId
      if (!categoryId && fCategoryName) {
        const match = categories.find(
          (c) => c.name.toLowerCase() === fCategoryName.trim().toLowerCase()
        )
        if (match) {
          categoryId = match.id
        } else {
          const newCat = await MedicineApi.createCategory(fCategoryName.trim())
          categoryId = newCat.id
        }
      }

      let manufacturerId = fManufacturerId
      if (!manufacturerId && fManufacturerName) {
        const match = manufacturers.find(
          (m) => m.name.toLowerCase() === fManufacturerName.trim().toLowerCase()
        )
        if (match) {
          manufacturerId = match.id
        } else if (fManufacturerName.trim() !== '') {
          const newMfr = await MedicineApi.createManufacturer(fManufacturerName.trim())
          manufacturerId = newMfr.id
        }
      }

      if (editTarget) {
        await MedicineApi.updateMedicine(editTarget.id, {
          name: fName,
          genericName: fGeneric,
          categoryId: categoryId,
          manufacturerId: manufacturerId || undefined,
        })
        triggerToast(`${fName} updated successfully.`)
      } else {
        await MedicineApi.createMedicine({
          name: fName,
          genericName: fGeneric,
          categoryId: categoryId,
          manufacturerId: manufacturerId || undefined,
        })
        triggerToast(`${fName} added to the catalogue.`)
      }
      await loadMedicines()
    } catch (error: any) {
      triggerToast(error?.message || 'Failed to save medicine.')
    } finally {
      setShowAddModal(false)
    }
  }

  const toggleArchive = async (id: string, currentStatus: MedicineEntry['status']) => {
    const restore = currentStatus === 'Archived'
    try {
      await MedicineApi.updateMedicine(id, { isActive: restore })
      await loadMedicines()
      triggerToast(restore ? 'Medicine restored successfully.' : 'Medicine archived successfully.')
    } catch (error: any) {
      triggerToast(error?.message || 'Failed to update medicine status.')
    }
  }

  const filtered = medicines.filter((m) => {
    const q = search.toLowerCase()
    const matchSearch = m.name.toLowerCase().includes(q) || m.genericName.toLowerCase().includes(q) || m.manufacturer.toLowerCase().includes(q)
    const matchCat = categoryFilter ? m.category === categoryFilter : true
    const matchStatus = statusFilter ? m.status === statusFilter : true
    return matchSearch && matchCat && matchStatus
  })

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-16 pt-8">
        <div className="h-10 bg-gray-200 rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 relative">
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg shadow-xl text-xs font-bold flex items-center space-x-2">
          <Check className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Medicines', value: medicines.length, color: 'text-gray-900' },
          { label: 'Active', value: medicines.filter((m) => m.status === 'Active').length, color: 'text-emerald-700' },
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
              {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-2.5 py-2 text-xs text-gray-700 font-bold focus:outline-none">
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
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
                  <td className="px-5 py-3 font-mono text-gray-400">{m.addedAt}</td>
                  <td className="px-5 py-3">
                    {m.status === 'Active' && <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">Active</span>}
                    {m.status === 'Archived' && <span className="text-[10px] font-bold text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded">Archived</span>}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button onClick={() => openEdit(m)}
                        className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-health-primary transition-colors" title="Edit">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => toggleArchive(m.id, m.status)}
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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden z-[9999]">
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
                <AutocompleteInput
                  label="Category *"
                  placeholder="Search or type new category..."
                  options={categories}
                  selectedId={fCategoryId}
                  selectedName={fCategoryName}
                  onChange={(id, name) => {
                    setFCategoryId(id)
                    setFCategoryName(name)
                  }}
                  required
                />
                <AutocompleteInput
                  label="Manufacturer *"
                  placeholder="Search or type new manufacturer..."
                  options={manufacturers}
                  selectedId={fManufacturerId}
                  selectedName={fManufacturerName}
                  onChange={(id, name) => {
                    setFManufacturerId(id)
                    setFManufacturerName(name)
                  }}
                  required
                />
              </div>
              <button type="submit"
                className="w-full bg-health-primary hover:bg-health-secondary text-white font-bold py-2.5 rounded-lg text-xs transition-colors shadow-sm"
                disabled={!fCategoryName || !fManufacturerName}
              >
                {editTarget ? 'Save Changes' : 'Register Medicine'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
