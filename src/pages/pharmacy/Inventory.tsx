import React, { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { MedicineApi } from '@/services/medicine-api'
import { Medicine, PharmacyStock } from '@/types'
import { 
  Plus, Search, Filter, ArrowUpDown, Box, AlertTriangle, 
  Edit, Check, X, Calendar, DollarSign, RefreshCw, ShieldAlert,
  ArrowRight, HeartPulse, ChevronDown, Percent, Info, Loader2
} from 'lucide-react'

interface InventoryItem {
  medicine: Medicine
  stockInfo: PharmacyStock
  customBatch?: string
  customExpiry?: string
  customSupplier?: string
  customCostPrice?: number
  customStorage?: string
}

export default function PharmacyInventory() {
  const { user } = useAuthStore()
  const pharmacyId = user?.pharmacyId || 'ph-001'
  const pharmacyName = user?.pharmacyName || 'Kigali National Pharmacy'

  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Search & Filter States
  const [searchVal, setSearchVal] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [stockFilter, setStockFilter] = useState('') // 'low', 'out', 'high', ''
  const [sortBy, setSortBy] = useState('name') // 'name', 'stock', 'price', 'expiry'
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  // Modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)

  // Edit stock/price states
  const [editPrice, setEditPrice] = useState(0)
  const [editStock, setEditStock] = useState(0)
  const [editStatus, setEditStatus] = useState(true)

  // Add medicine form states
  const [medName, setMedName] = useState('')
  const [medGenericName, setMedGenericName] = useState('')
  const [medCategory, setMedCategory] = useState('Analgesics')
  const [medManufacturer, setMedManufacturer] = useState('')
  const [medBatch, setMedBatch] = useState('')
  const [medExpiry, setMedExpiry] = useState('')
  const [medCost, setMedCost] = useState('')
  const [medPrice, setMedPrice] = useState('')
  const [medStock, setMedStock] = useState('')
  const [medPrescription, setMedPrescription] = useState(false)
  const [medStorage, setMedStorage] = useState('Room Temperature (<30°C)')
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)

  // Load Inventory Data
  const loadInventory = async () => {
    setLoading(true)
    setError(null)
    try {
      // 1. Get all catalog medicines
      const medicines = await MedicineApi.searchMedicines('', '', false)
      
      // 2. Fetch stock details for each medicine
      const items: InventoryItem[] = await Promise.all(
        medicines.map(async (med) => {
          const availList = await MedicineApi.getMedicineAvailability(med.id)
          const stockInfo = availList.find((a) => a.pharmacyId === pharmacyId) || {
            pharmacyId,
            pharmacyName,
            rating: 4.5,
            isOpen: true,
            distance: 1.0,
            price: 0,
            stock: 0,
            stockStatus: 'OUT_OF_STOCK' as const,
            insuranceAccepted: ['RSSB', 'MMI'],
            lat: -1.94,
            lng: 30.06,
            locationText: 'Kigali City'
          }

          // Fetch extra mock parameters from local storage transaction cards if any
          const savedExtras = localStorage.getItem(`epharmacy_extras_${pharmacyId}_${med.id}`)
          const extras = savedExtras ? JSON.parse(savedExtras) : {}

          return {
            medicine: med,
            stockInfo,
            customBatch: extras.batch || `B-${Math.floor(1000 + Math.random() * 9000)}`,
            customExpiry: extras.expiry || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            customSupplier: extras.supplier || 'Rwandan Pharma Wholesalers Ltd',
            customCostPrice: extras.costPrice || Math.round(stockInfo.price * 0.75),
            customStorage: extras.storage || 'Room Temperature (<30°C)'
          }
        })
      )
      setInventoryList(items)
    } catch (err: any) {
      setError(err.message || 'Failed to load pharmacy inventory.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInventory()
  }, [pharmacyId])

  // Handles updating stock and price
  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItem) return
    try {
      await MedicineApi.updatePharmacyInventory(
        pharmacyId,
        selectedItem.medicine.id,
        editPrice,
        editStock,
        editStatus
      )
      
      // Update extras locally too
      const savedExtras = localStorage.getItem(`epharmacy_extras_${pharmacyId}_${selectedItem.medicine.id}`)
      const extras = savedExtras ? JSON.parse(savedExtras) : {}
      extras.costPrice = Math.round(editPrice * 0.75)
      localStorage.setItem(`epharmacy_extras_${pharmacyId}_${selectedItem.medicine.id}`, JSON.stringify(extras))

      setShowEditModal(false)
      loadInventory()
    } catch (err: any) {
      alert(err.message || 'Failed to update stock.')
    }
  }

  // Handles adding new catalog drug & assigning inventory stock
  const handleAddMedicineSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFormSuccess(null)

    if (!medName || !medGenericName || !medManufacturer || !medBatch || !medExpiry || !medCost || !medPrice || !medStock) {
      setFormError('Please fill in all required fields.')
      return
    }

    const costNum = parseFloat(medCost)
    const priceNum = parseFloat(medPrice)
    const stockNum = parseInt(medStock)

    if (isNaN(costNum) || costNum <= 0) {
      setFormError('Cost price must be a valid positive number.')
      return
    }
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('Selling price must be a valid positive number.')
      return
    }
    if (priceNum < costNum) {
      setFormError('Selling price cannot be less than cost price.')
      return
    }
    if (isNaN(stockNum) || stockNum < 0) {
      setFormError('Initial stock must be a non-negative integer.')
      return
    }

    const expiryDate = new Date(medExpiry)
    if (expiryDate <= new Date()) {
      setFormError('Expiry date must be in the future.')
      return
    }

    try {
      const newMedId = `med_custom_${Math.floor(100000 + Math.random() * 900000)}`
      
      // 1. Add to custom catalog
      await MedicineApi.addCustomMedicine({
        id: newMedId,
        name: medName.trim(),
        genericName: medGenericName.trim(),
        tradeNames: [medName.trim()],
        category: medCategory,
        manufacturer: medManufacturer.trim(),
        prescriptionRequired: medPrescription,
        uses: 'Added manually by pharmacist. Approved local inventory.',
        dosage: 'As prescribed by clinical protocols.',
        warnings: 'Observe temperature warnings.',
        sideEffects: 'Inform physician of adverse responses.',
        interactions: 'Check interactions before dispensing.',
        storage: medStorage
      })

      // 2. Set stock levels in inventory
      await MedicineApi.updatePharmacyInventory(
        pharmacyId,
        newMedId,
        priceNum,
        stockNum,
        true
      )

      // 3. Save extra metadata properties to localStorage
      localStorage.setItem(`epharmacy_extras_${pharmacyId}_${newMedId}`, JSON.stringify({
        batch: medBatch.trim(),
        expiry: medExpiry,
        costPrice: costNum,
        storage: medStorage,
        supplier: 'Custom Pharmacy Entry'
      }))

      // Audit Log log action
      const logs = JSON.parse(localStorage.getItem('pharmacy_audit_logs') || '[]')
      logs.unshift({
        time: new Date().toLocaleString(),
        staff: user?.name || 'Eric Mugisha',
        role: user?.role || 'Pharmacy Manager',
        action: `Added medicine ${medName} to inventory (${stockNum} units at RWF ${priceNum})`,
        ip: '197.243.12.90',
        status: 'Success'
      })
      localStorage.setItem('pharmacy_audit_logs', JSON.stringify(logs))

      setFormSuccess('Medicine successfully registered and stocked!')
      setTimeout(() => {
        setShowAddModal(false)
        resetForm()
        loadInventory()
      }, 1500)
    } catch (err: any) {
      setFormError(err.message || 'Failed to add medicine.')
    }
  }

  const resetForm = () => {
    setMedName('')
    setMedGenericName('')
    setMedCategory('Analgesics')
    setMedManufacturer('')
    setMedBatch('')
    setMedExpiry('')
    setMedCost('')
    setMedPrice('')
    setMedStock('')
    setMedPrescription(false)
    setMedStorage('Room Temperature (<30°C)')
    setFormError(null)
    setFormSuccess(null)
  }

  const openEditModal = (item: InventoryItem) => {
    setSelectedItem(item)
    setEditPrice(item.stockInfo.price)
    setEditStock(item.stockInfo.stock)
    setEditStatus(item.stockInfo.isOpen)
    setShowEditModal(true)
  }

  // Filter & Sort Logic
  const getFilteredInventory = () => {
    let list = [...inventoryList]

    // 1. Search Query
    if (searchVal.trim()) {
      const q = searchVal.toLowerCase().trim()
      list = list.filter((item) => 
        item.medicine.name.toLowerCase().includes(q) ||
        item.medicine.genericName.toLowerCase().includes(q) ||
        item.customBatch?.toLowerCase().includes(q)
      )
    }

    // 2. Category Filter
    if (categoryFilter) {
      list = list.filter((item) => item.medicine.category.toLowerCase() === categoryFilter.toLowerCase())
    }

    // 3. Stock Level Filter
    if (stockFilter) {
      if (stockFilter === 'out') {
        list = list.filter((item) => item.stockInfo.stock === 0)
      } else if (stockFilter === 'low') {
        list = list.filter((item) => item.stockInfo.stock > 0 && item.stockInfo.stock < 20)
      } else if (stockFilter === 'high') {
        list = list.filter((item) => item.stockInfo.stock >= 20)
      }
    }

    // 4. Sorting
    list.sort((a, b) => {
      let valA: any = a.medicine.name
      let valB: any = b.medicine.name

      if (sortBy === 'stock') {
        valA = a.stockInfo.stock
        valB = b.stockInfo.stock
      } else if (sortBy === 'price') {
        valA = a.stockInfo.price
        valB = b.stockInfo.price
      } else if (sortBy === 'expiry') {
        valA = a.customExpiry || ''
        valB = b.customExpiry || ''
      }

      if (valA < valB) return sortOrder === 'ASC' ? -1 : 1
      if (valA > valB) return sortOrder === 'ASC' ? 1 : -1
      return 0
    })

    return list
  }

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')
    } else {
      setSortBy(field)
      setSortOrder('ASC')
    }
  }

  const filteredItems = getFilteredInventory()
  
  // Pagination indexes
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage)
  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Metrics summary computations
  const totalSKUs = inventoryList.length
  const lowStockCount = inventoryList.filter(i => i.stockInfo.stock > 0 && i.stockInfo.stock < 20).length
  const outOfStockCount = inventoryList.filter(i => i.stockInfo.stock === 0).length
  const totalValue = inventoryList.reduce((acc, item) => acc + (item.stockInfo.stock * item.stockInfo.price), 0)

  // Expiry check - expiring within 90 days
  const isExpiringSoon = (dateStr?: string) => {
    if (!dateStr) return false
    const expDate = new Date(dateStr)
    const diff = expDate.getTime() - Date.now()
    const days = diff / (1000 * 60 * 60 * 24)
    return days > 0 && days <= 90
  }

  const expiringSoonCount = inventoryList.filter(i => isExpiringSoon(i.customExpiry)).length

  // Calculate dynamic profit margin helper
  const getProfitMargin = () => {
    const cost = parseFloat(medCost)
    const sell = parseFloat(medPrice)
    if (isNaN(cost) || isNaN(sell) || sell <= 0) return 0
    return ((sell - cost) / sell * 100).toFixed(1)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Header Banner */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Package className="w-6 h-6 text-health-primary" />
            <h1 className="text-2xl font-black text-gray-900">Stock Management</h1>
          </div>
          <p className="text-xs text-gray-500 font-medium">
            Active Storefront: <span className="font-bold text-health-primary">{pharmacyName}</span> (ID: {pharmacyId})
          </p>
        </div>

        <button
          onClick={() => {
            resetForm()
            setShowAddModal(true)
          }}
          className="flex items-center justify-center space-x-2 py-2.5 px-4 bg-health-primary hover:bg-health-secondary text-white font-bold rounded-lg text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Medication</span>
        </button>
      </div>

      {/* Analytics Summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* SKUs */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total SKUs stocked</span>
            <p className="text-3xl font-black text-gray-900 mt-1">{loading ? '...' : totalSKUs}</p>
            <span className="text-[10px] text-red-500 font-semibold mt-1 block">{outOfStockCount} out of stock</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100">
            <Box className="w-5 h-5" />
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Low Stock Warnings</span>
            <p className="text-3xl font-black text-gray-900 mt-1">{loading ? '...' : lowStockCount}</p>
            <span className="text-[10px] text-amber-600 font-semibold mt-1 block">Requires replenishment</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-700 rounded-lg border border-amber-100">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Expiring batch */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expiring batches (&lt;90 days)</span>
            <p className="text-3xl font-black text-gray-900 mt-1">{loading ? '...' : expiringSoonCount}</p>
            <span className="text-[10px] text-slate-500 font-semibold mt-1 block">Check batch recalls</span>
          </div>
          <div className="p-3 bg-slate-50 text-slate-700 rounded-lg border border-slate-200">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        {/* Value */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Store Stock Value</span>
            <p className="text-2xl font-black text-gray-900 mt-1.5">
              {loading ? '...' : `RWF ${totalValue.toLocaleString()}`}
            </p>
            <span className="text-[10px] text-health-accent font-semibold mt-1 block">Estimated retail price</span>
          </div>
          <div className="p-3 bg-health-50 text-health-700 rounded-lg border border-health-100">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Table & Filtering */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        
        {/* Filters control bar */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search */}
          <div className="relative rounded-md max-w-sm w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchVal}
              onChange={(e) => {
                setSearchVal(e.target.value)
                setCurrentPage(1)
              }}
              className="block w-full pl-9 pr-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-900"
              placeholder="Search by drug name or batch..."
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Category selection */}
            <div className="flex items-center space-x-1.5">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="bg-white border border-gray-300 rounded-lg py-1.5 px-3 text-xs text-gray-700 focus:outline-none"
              >
                <option value="">All Categories</option>
                <option value="Analgesics">Analgesics</option>
                <option value="Antibiotics">Antibiotics</option>
                <option value="Antidiabetics">Antidiabetics</option>
                <option value="Antihypertensives">Antihypertensives</option>
              </select>
            </div>

            {/* Stock filter */}
            <select
              value={stockFilter}
              onChange={(e) => {
                setStockFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="bg-white border border-gray-300 rounded-lg py-1.5 px-3 text-xs text-gray-700 focus:outline-none"
            >
              <option value="">All Stock Levels</option>
              <option value="high">High Stock (&gt;= 20)</option>
              <option value="low">Low Stock (&lt; 20)</option>
              <option value="out">Out of Stock</option>
            </select>

            {/* Refresh btn */}
            <button
              onClick={loadInventory}
              aria-label="Refresh inventory"
              className="p-1.5 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 text-gray-600 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Content State */}
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin text-health-primary mx-auto mb-2" />
            <p className="text-xs">Loading local inventory catalog...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-700 space-y-2">
            <ShieldAlert className="w-8 h-8 mx-auto text-red-500" />
            <p className="text-sm font-bold">{error}</p>
            <button onClick={loadInventory} className="py-1 px-3 border border-red-300 rounded-md text-xs hover:bg-red-50 font-bold">
              Retry
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-16 text-center text-gray-500">
            <Box className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <p className="text-sm font-bold text-gray-700">No inventory records found</p>
            <p className="text-xs text-gray-400 mt-1">Try expanding your search query or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
              <thead className="bg-gray-50 font-bold text-gray-500 uppercase tracking-wider text-[10px] border-b border-gray-200">
                <tr>
                  <th scope="col" className="px-6 py-3 cursor-pointer select-none hover:bg-gray-100" onClick={() => toggleSort('name')}>
                    <div className="flex items-center space-x-1">
                      <span>Drug Name (Generic)</span>
                      <ArrowUpDown className="w-3 h-3" aria-hidden="true" />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3">Category</th>
                  <th scope="col" className="px-6 py-3">Batch Number</th>
                  <th scope="col" className="px-6 py-3 cursor-pointer select-none hover:bg-gray-100" onClick={() => toggleSort('expiry')}>
                    <div className="flex items-center space-x-1">
                      <span>Expiry Date</span>
                      <ArrowUpDown className="w-3 h-3" aria-hidden="true" />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 cursor-pointer select-none hover:bg-gray-100 text-center" onClick={() => toggleSort('stock')}>
                    <div className="flex items-center space-x-1 justify-center">
                      <span>Stock Qty</span>
                      <ArrowUpDown className="w-3 h-3" aria-hidden="true" />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 cursor-pointer select-none hover:bg-gray-100" onClick={() => toggleSort('price')}>
                    <div className="flex items-center space-x-1">
                      <span>Unit Price</span>
                      <ArrowUpDown className="w-3 h-3" aria-hidden="true" />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-center">Status</th>
                  <th scope="col" className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-150">
                {paginatedItems.map((item) => {
                  const hasExpired = new Date(item.customExpiry || '') <= new Date()
                  const isExpSoon = isExpiringSoon(item.customExpiry)
                  
                  return (
                    <tr key={item.medicine.id} className="hover:bg-gray-50/50 transition-colors">
                      {/* Name */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{item.medicine.name}</div>
                        <div className="text-[10px] text-gray-400 font-semibold font-mono mt-0.5">{item.medicine.genericName}</div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700">
                          {item.medicine.category}
                        </span>
                      </td>

                      {/* Batch */}
                      <td className="px-6 py-4 font-mono font-bold text-gray-700">{item.customBatch}</td>

                      {/* Expiry */}
                      <td className="px-6 py-4">
                        <span className={`font-semibold font-mono ${
                          hasExpired 
                            ? 'text-red-650 font-bold bg-red-50 px-2 py-0.5 rounded' 
                            : isExpSoon 
                            ? 'text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded' 
                            : 'text-gray-600'
                        }`}>
                          {item.customExpiry}
                        </span>
                      </td>

                      {/* Stock Level */}
                      <td className="px-6 py-4 text-center">
                        <div className="font-bold font-mono text-sm text-gray-900">{item.stockInfo.stock}</div>
                        <div className="mt-1">
                          {item.stockInfo.stock === 0 ? (
                            <span className="text-[9px] bg-red-100 text-red-800 font-bold px-1.5 py-0.5 rounded-full">Out of Stock</span>
                          ) : item.stockInfo.stock < 20 ? (
                            <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-full">Low Stock</span>
                          ) : (
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full">High</span>
                          )}
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4 font-black text-gray-900 font-mono">
                        RWF {item.stockInfo.price.toLocaleString()}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          item.stockInfo.isOpen 
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' 
                            : 'bg-red-50 text-red-800 border border-red-100'
                        }`}>
                          {item.stockInfo.isOpen ? 'ACTIVE/SELLABLE' : 'SUSPENDED'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right space-x-1.5">
                        <button
                          onClick={() => openEditModal(item)}
                          className="inline-flex items-center justify-center p-1.5 text-slate-500 hover:text-health-primary hover:bg-slate-100 rounded-lg transition-colors border border-gray-150 bg-white"
                          title="Edit Stock/Price"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Page <span className="font-bold text-gray-900">{currentPage}</span> of {totalPages}
                </span>
                <div className="flex space-x-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="p-1 px-3 border border-gray-300 rounded bg-white text-xs hover:bg-gray-50 disabled:opacity-50 transition-all font-semibold"
                  >
                    Previous
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="p-1 px-3 border border-gray-300 rounded bg-white text-xs hover:bg-gray-50 disabled:opacity-50 transition-all font-semibold"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Stock & Price Modal */}
      {showEditModal && selectedItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-modal-title"
          className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4"
          onKeyDown={(e) => { if (e.key === 'Escape') setShowEditModal(false) }}
        >
          <div className="bg-white rounded-xl border border-gray-200 w-full max-w-md shadow-xl overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 id="edit-modal-title" className="font-black text-gray-900 text-sm">Adjust Pharmacy Inventory</h3>
                <p className="text-[10px] text-gray-400 font-mono mt-0.5">{selectedItem.medicine.name}</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                aria-label="Close edit modal"
                className="text-gray-400 hover:text-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 rounded"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateStock} className="p-5 space-y-4">
              {/* Price */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Selling Price (RWF)
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-xs">RWF</span>
                  </div>
                  <input
                    type="number"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="block w-full pl-12 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Stock */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Active Stock Level
                </label>
                <input
                  type="number"
                  required
                  value={editStock}
                  onChange={(e) => setEditStock(Math.max(0, parseInt(e.target.value) || 0))}
                  className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-150">
                <div>
                  <span className="text-xs font-bold text-gray-700 block">Sellable Store Status</span>
                  <span className="text-[10px] text-gray-450">Toggles visibility on Patient Searches</span>
                </div>
                <input
                  type="checkbox"
                  checked={editStatus}
                  onChange={(e) => setEditStatus(e.target.checked)}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded cursor-pointer"
                />
              </div>

              {/* Submit */}
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-health-primary text-white font-bold rounded-lg text-xs hover:bg-health-secondary shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Medicine Drawer Modal */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-modal-title"
          className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-sm flex items-center justify-end"
          onKeyDown={(e) => { if (e.key === 'Escape') setShowAddModal(false) }}
        >
          <div className="bg-white h-full w-full max-w-lg shadow-2xl flex flex-col border-l border-gray-200">
            {/* Header */}
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-health-primary" aria-hidden="true" />
                <div>
                  <h3 id="add-modal-title" className="font-black text-gray-900 text-base">Add Medication to Catalog</h3>
                  <p className="text-[10px] text-gray-400 font-semibold">Store-specific dynamic stock definition</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                aria-label="Close add medicine panel"
                className="text-gray-400 hover:text-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 rounded"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Form Scroll Area */}
            <form onSubmit={handleAddMedicineSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2 text-red-800 text-xs">
                  <ShieldAlert className="w-5 h-5 flex-shrink-0 text-red-650" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="bg-emerald-50 border border-emerald-250 rounded-lg p-3 flex items-start space-x-2 text-emerald-800 text-xs">
                  <Check className="w-5 h-5 flex-shrink-0 text-emerald-700" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {/* Name & Generic */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Trade / Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={medName}
                    onChange={(e) => setMedName(e.target.value)}
                    placeholder="e.g. Panadol Forte"
                    className="block w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Generic Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={medGenericName}
                    onChange={(e) => setMedGenericName(e.target.value)}
                    placeholder="e.g. Paracetamol"
                    className="block w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Category & Manufacturer */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Therapeutic Category *
                  </label>
                  <select
                    value={medCategory}
                    onChange={(e) => setMedCategory(e.target.value)}
                    className="block w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Analgesics">Analgesics</option>
                    <option value="Antibiotics">Antibiotics</option>
                    <option value="Antidiabetics">Antidiabetics</option>
                    <option value="Antihypertensives">Antihypertensives</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Manufacturer / Supplier *
                  </label>
                  <input
                    type="text"
                    required
                    value={medManufacturer}
                    onChange={(e) => setMedManufacturer(e.target.value)}
                    placeholder="e.g. GSK Rwanda"
                    className="block w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Batch & Expiry */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Batch / LOT Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={medBatch}
                    onChange={(e) => setMedBatch(e.target.value)}
                    placeholder="e.g. B-7032-GSK"
                    className="block w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={medExpiry}
                    onChange={(e) => setMedExpiry(e.target.value)}
                    className="block w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Cost & Selling price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Unit Cost Price (RWF) *
                  </label>
                  <input
                    type="number"
                    required
                    value={medCost}
                    onChange={(e) => setMedCost(e.target.value)}
                    placeholder="Cost price in RWF"
                    className="block w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Unit Selling Price (RWF) *
                  </label>
                  <input
                    type="number"
                    required
                    value={medPrice}
                    onChange={(e) => setMedPrice(e.target.value)}
                    placeholder="Selling price in RWF"
                    className="block w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Cost Margin Display */}
              {medCost && medPrice && parseFloat(medPrice) >= parseFloat(medCost) && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-100 flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center space-x-1.5">
                    <Percent className="w-4 h-4 text-emerald-600" />
                    <span>Estimated Gross Profit Margin:</span>
                  </div>
                  <span className="font-black text-sm">{getProfitMargin()}%</span>
                </div>
              )}

              {/* Stock Quantity */}
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Initial Stock Quantity (Units) *
                </label>
                <input
                  type="number"
                  required
                  value={medStock}
                  onChange={(e) => setMedStock(e.target.value)}
                  placeholder="e.g. 500"
                  className="block w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Storage Conditions */}
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Storage Conditions & Temperature *
                </label>
                <select
                  value={medStorage}
                  onChange={(e) => setMedStorage(e.target.value)}
                  className="block w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Room Temperature (<30°C)">Room Temperature (&lt;30°C)</option>
                  <option value="Cold Chain (2°C - 8°C)">Cold Chain (2°C - 8°C)</option>
                  <option value="Protect from Light / Moisture">Protect from Light / Moisture</option>
                  <option value="Controlled Substance Locker">Controlled Substance Locker</option>
                </select>
              </div>

              {/* Prescription Required & Clinical Placeholders */}
              <div className="space-y-3 pt-3 border-t border-gray-200">
                <div className="flex items-start">
                  <input
                    id="prescriptionReq"
                    type="checkbox"
                    checked={medPrescription}
                    onChange={(e) => setMedPrescription(e.target.checked)}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded mt-0.5 cursor-pointer"
                  />
                  <label htmlFor="prescriptionReq" className="ml-2 block text-xs text-gray-700 font-semibold cursor-pointer">
                    Dispensation requires a valid medical prescription (MOH Regulated)
                  </label>
                </div>
                
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-start space-x-2 text-[10px] text-gray-500 leading-normal">
                  <Info className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    Clinical uses, storage directives, barcodes, and medicine catalog images will be generated automatically matching MoH drug catalogs on final registration.
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/3 py-2 border border-gray-300 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2 bg-health-primary hover:bg-health-secondary text-white font-bold rounded-lg text-xs shadow-sm flex items-center justify-center space-x-2"
                >
                  <span>Register Medicine</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
