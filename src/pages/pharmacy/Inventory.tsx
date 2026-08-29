import React, { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/authStore'
import { MedicineApi } from '@/services/medicine-api'
import { apiClient } from '@/api/client'
import { getPharmacyInsurancePrice } from '@/utils/insuranceCalculator'
import { InsuranceProvider } from '@/services/insurance-api'
import { Medicine, PharmacyStock } from '@/types'
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Box,
  AlertTriangle,
  Edit,
  Check,
  X,
  Calendar,
  DollarSign,
  RefreshCw,
  ShieldAlert,
  ArrowRight,
  HeartPulse,
  ChevronDown,
  Percent,
  Info,
  Loader2,
  Package,
  Upload,
  FileSpreadsheet,
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

export interface CreateMedicinePayload {
  tradeName: string
  genericName: string

  categoryId?: string
  categoryName?: string

  manufacturerId?: string
  manufacturerName?: string

  initialBatch: {
    batchNumber: string
    lotNumber: string
    expiryDate: string
    unitCost: number
    unitSellingPrice: number
    initialStock: number
    storageConditions?: string
    minTemperature?: number
    maxTemperature?: number
  }
}

export default function PharmacyInventory() {
  const { user } = useAuthStore()
  // Resolve the real pharmacy context — never fall back to a fake ID,
  // otherwise every inventory API call fails with an invalid UUID.
  const pharmacyId = user?.pharmacy?.id || user?.pharmacyId || ''
  const pharmacyName = user?.pharmacy?.name || user?.pharmacyName || 'Your Pharmacy'
  const hasPharmacyContext = Boolean(pharmacyId)

  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Search & Filter States
  const [searchVal, setSearchVal] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [stockFilter, setStockFilter] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  // Modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)

  // Spreadsheet import states
  const [showImportModal, setShowImportModal] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [importResult, setImportResult] = useState<{
    total: number
    imported: number
    failed: number
    errors: { row: number; error: string; data: any }[]
  } | null>(null)

  // Edit stock/price states
  const [editPrices, setEditPrices] = useState<Record<string, number>>({ CASH: 0 })
  const [editStock, setEditStock] = useState(0)
  const [editStatus, setEditStatus] = useState(true)

  // Add medicine form states
  const [medName, setMedName] = useState('')
  const [medGenericName, setMedGenericName] = useState('')

  const [medCategory, setMedCategory] = useState('')
  const [medCategoryId, setMedCategoryId] = useState<string | undefined>()

  const [medManufacturer, setMedManufacturer] = useState('')
  const [medManufacturerId, setMedManufacturerId] = useState<string | undefined>()

  const [medBatchNumber, setMedBatchNumber] = useState('')
  const [medLotNumber, setMedLotNumber] = useState('')
  const [medExpiry, setMedExpiry] = useState('')

  const [medCost, setMedCost] = useState('')
  const [medPrices, setMedPrices] = useState<Record<string, string>>({ CASH: '' })
  const [medStock, setMedStock] = useState('')

  const [activeInsurances, setActiveInsurances] = useState<InsuranceProvider[]>([])

  const [medStorageConditions, setMedStorageConditions] = useState('')
  const [medMinTemperature, setMedMinTemperature] = useState('')
  const [medMaxTemperature, setMedMaxTemperature] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)

  const [categories, setCategories] = useState<any[]>([])
  const [manufacturers, setManufacturers] = useState<any[]>([])

  // ============================================================
  // AUTOCOMPLETE STATES
  // ============================================================

  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false)
  const [showManufacturerSuggestions, setShowManufacturerSuggestions] = useState(false)

  const categoryRef = useRef<HTMLDivElement>(null)
  const manufacturerRef = useRef<HTMLDivElement>(null)

  // Filter categories according to what the user types
  const filteredCategories = categories.filter((category) =>
    category.name?.toLowerCase().includes(medCategory.trim().toLowerCase()),
  )

  // Filter manufacturers according to what the user types
  const filteredManufacturers = manufacturers.filter((manufacturer) =>
    manufacturer.name?.toLowerCase().includes(medManufacturer.trim().toLowerCase()),
  )

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      try {
        const [catList, mfrList] = await Promise.all([
          MedicineApi.getCategories(medCategory),
          MedicineApi.getManufacturers(medManufacturer),
        ])
        setCategories(catList)
        setManufacturers(mfrList)
      } catch {
        // The submit request reports the authoritative backend error.
      }
    }, 250)
    return () => window.clearTimeout(timer)
  }, [medCategory, medManufacturer])

  // Close autocomplete suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node

      if (categoryRef.current && !categoryRef.current.contains(target)) {
        setShowCategorySuggestions(false)
      }

      if (manufacturerRef.current && !manufacturerRef.current.contains(target)) {
        setShowManufacturerSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Load Inventory Data
  const loadInventory = async () => {
    if (!hasPharmacyContext) {
      setLoading(false)
      setError('No pharmacy is linked to your account. Complete your pharmacy registration first.')
      return
    }
    setLoading(true)
    setError(null)

    try {
        // Real pharmacy-insurance agreements from the backend (not local config)
        let working: InsuranceProvider[] = []
        try {
          const agreementsResponse = await apiClient.get(`/pharmacies/${pharmacyId}/insurance`)
          const rawAgreements = agreementsResponse?.data?.data ?? agreementsResponse?.data ?? []
          working = (Array.isArray(rawAgreements) ? rawAgreements : []).map((a: any) => ({
            id: a.id,
            name: a.name,
            code: a.code,
            email: a.email ?? '',
            phone: a.phone ?? '',
            address: a.address ?? '',
            defaultCoveragePercentage: Number(a.defaultCoveragePercentage ?? 85),
            defaultCopayPercentage: Number(a.defaultCopayPercentage ?? 15),
            status: a.status ?? 'ACTIVE',
            isActive: a.isActive !== false,
          }))
        } catch {
          working = []
        }
        setActiveInsurances(working)

        const rawItems = await MedicineApi.getPharmacyInventory(pharmacyId)

        const [catList, mfrList] = await Promise.all([
          MedicineApi.getCategories(),
          MedicineApi.getManufacturers(),
        ])

        setCategories(catList)
        setManufacturers(mfrList)

        if (catList.length && !medCategory) {
          setMedCategory(catList[0].name)
        }

        const items: InventoryItem[] = rawItems.map((item: any) => {
          const med = item.medicine || {}

          const categoryName = med.category?.name || med.category || 'Uncategorized'

          const manufacturerName = med.manufacturer?.name || med.manufacturer || 'Unknown'

          const batch =
            (med.batches || []).find(
              (candidate: any) =>
                candidate.batchNumber === item.batchNumber ||
                candidate.lotNumber === item.batchNumber,
            ) || med.batches?.[0]

          const medicine: Medicine = {
            id: med.id,
            name: med.tradeName,
            genericName: med.genericName || '',
            tradeNames: [med.tradeName],
            category: categoryName,
            manufacturer: manufacturerName,
            prescriptionRequired: med.prescriptionRequired || false,
            uses: '',
            dosage: '',
            warnings: '',
            sideEffects: '',
            interactions: '',
            storage: med.storage || 'Room Temperature (<30°C)',
          }

          const stock = item.quantity ?? 0

          let stockStatus: PharmacyStock['stockStatus'] = 'HIGH'

          if (stock === 0) {
            stockStatus = 'OUT_OF_STOCK'
          } else if (stock < 10) {
            stockStatus = 'ALMOST_OUT'
          } else if (stock < 35) {
            stockStatus = 'LIMITED'
          }

          // Fetch price mapping
          const savedPrices = localStorage.getItem(`epharmacy_prices_${pharmacyId}_${med.id}`)
          const pricesMap: Record<string, number> = savedPrices ? JSON.parse(savedPrices) : { CASH: Number(item.price) }
          const resolvedPrice = pricesMap.CASH ?? Number(item.price)

          const stockInfo: PharmacyStock = {
            pharmacyId: item.pharmacyId,
            pharmacyName: pharmacyName,
            rating: 4.5,
            isOpen: item.isActive !== false,
            distance: 1.0,
            price: resolvedPrice,
            stock,
            stockStatus,
            insuranceAccepted: working.map((p) => p.code),
            lat: -1.94,
            lng: 30.06,
            locationText: 'Kigali City',
          }

        return {
          medicine,
          stockInfo,
          customBatch: item.batchNumber || batch?.batchNumber || batch?.lotNumber || 'N/A',
          customExpiry:
            item.expiryDate || batch?.expiryDate
              ? new Date(item.expiryDate || batch.expiryDate).toISOString().split('T')[0]
              : 'N/A',
          customSupplier: manufacturerName,
          customCostPrice: Math.round(Number(item.price) * 0.75),
          customStorage: batch?.storageConditions || med.storage || 'Room Temperature (<30°C)',
        }
      })

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
      const cashPrice = editPrices.CASH || 0
      if (cashPrice <= 0) {
        alert('Cash price must be a valid positive number.')
        return
      }

      for (const key of Object.keys(editPrices)) {
        if (editPrices[key] < 0) {
          alert('Prices cannot be negative.')
          return
        }
      }

      // Save custom prices mapping to localStorage
      localStorage.setItem(
        `epharmacy_prices_${pharmacyId}_${selectedItem.medicine.id}`,
        JSON.stringify(editPrices),
      )

      await MedicineApi.updatePharmacyInventory(
        pharmacyId,
        selectedItem.medicine.id,
        cashPrice,
        editStock,
        editStatus,
      )

      const savedExtras = localStorage.getItem(
        `epharmacy_extras_${pharmacyId}_${selectedItem.medicine.id}`,
      )

      const extras = savedExtras ? JSON.parse(savedExtras) : {}

      extras.costPrice = Math.round(cashPrice * 0.75)

      localStorage.setItem(
        `epharmacy_extras_${pharmacyId}_${selectedItem.medicine.id}`,
        JSON.stringify(extras),
      )

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

    if (
      !medName ||
      !medGenericName ||
      !medCategory ||
      !medManufacturer ||
      !medBatchNumber ||
      !medLotNumber ||
      !medExpiry ||
      !medCost ||
      !medPrices.CASH?.trim() ||
      medStock === '' ||
      !medStorageConditions
    ) {
      setFormError('Please fill in all required fields.')
      return
    }

    const costNum = parseFloat(medCost)
    const priceNum = parseFloat(medPrices.CASH || '')
    const stockNum = parseInt(medStock, 10)
    const minTemperature = medMinTemperature.trim() ? parseFloat(medMinTemperature) : undefined
    const maxTemperature = medMaxTemperature.trim() ? parseFloat(medMaxTemperature) : undefined

    if (isNaN(costNum) || costNum <= 0) {
      setFormError('Cost price must be a valid positive number.')
      return
    }

    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('Cash selling price must be a valid positive number.')
      return
    }

    if (priceNum < costNum) {
      setFormError('Cash selling price cannot be less than cost price.')
      return
    }

    if (isNaN(stockNum) || stockNum < 0) {
      setFormError('Initial stock must be a non-negative integer.')
      return
    }

    // Validate and build multi-insurance prices record
    const finalPricesMap: Record<string, number> = { CASH: priceNum }
    for (const p of activeInsurances) {
      const pVal = medPrices[p.id]
      if (pVal && pVal.trim() !== '') {
        const valNum = parseFloat(pVal)
        if (isNaN(valNum) || valNum < 0) {
          setFormError(`Price for ${p.name} must be a valid non-negative number.`)
          return
        }
        finalPricesMap[p.id] = valNum
      }
    }

    if (
      (minTemperature !== undefined && isNaN(minTemperature)) ||
      (maxTemperature !== undefined && isNaN(maxTemperature))
    ) {
      setFormError('Temperature limits must be valid numbers.')
      return
    }

    if (
      minTemperature !== undefined &&
      maxTemperature !== undefined &&
      minTemperature > maxTemperature
    ) {
      setFormError('Minimum temperature cannot exceed maximum temperature.')
      return
    }

    const expiryDate = new Date(medExpiry)

    if (expiryDate <= new Date()) {
      setFormError('Expiry date must be in the future.')
      return
    }

    if (!hasPharmacyContext) {
      setFormError(
        'No pharmacy is linked to your account. Complete your pharmacy registration and get MOH approval first.',
      )
      return
    }

    try {
      const matchedCat = categories.find(
        (c) => c.name.trim().toLowerCase() === medCategory.trim().toLowerCase(),
      )

      const matchedMfr = manufacturers.find(
        (m) => m.name.trim().toLowerCase() === medManufacturer.trim().toLowerCase(),
      )

      const createdMedicine = await MedicineApi.createMedicine({
        tradeName: medName.trim(),
        genericName: medGenericName.trim(),
        ...(matchedCat?.id || medCategoryId
          ? { categoryId: matchedCat?.id || medCategoryId }
          : { categoryName: medCategory.trim() }),
        ...(matchedMfr?.id || medManufacturerId
          ? { manufacturerId: matchedMfr?.id || medManufacturerId }
          : { manufacturerName: medManufacturer.trim() }),
        initialBatch: {
          batchNumber: medBatchNumber.trim(),
          lotNumber: medLotNumber.trim(),
          expiryDate: medExpiry,
          unitCost: costNum,
          unitSellingPrice: priceNum,
          initialStock: stockNum,
          storageConditions: medStorageConditions.trim(),
          minTemperature,
          maxTemperature,
        },
      })

      const newMedId = createdMedicine.id

      // Keep the pharmacy-specific stock record linked to the new medicine.
      // If catalog creation succeeded but stocking fails, say exactly that —
      // the medicine exists and a retry must not duplicate it.
      try {
        await MedicineApi.updatePharmacyInventory(pharmacyId, newMedId, priceNum, stockNum, true)
      } catch (stockErr: any) {
        const stockMsg =
          stockErr?.response?.data?.message ||
          stockErr?.message ||
          'Unknown stocking error'
        setFormError(
          `Medicine "${medName.trim()}" was registered in the national catalog, but linking stock to your pharmacy failed: ${
            typeof stockMsg === 'string' ? stockMsg : JSON.stringify(stockMsg)
          }. Reopen this form with the SAME details to retry — the catalog entry will be reused.`,
        )
        return
      }

      // Save custom prices mapping to localStorage
      localStorage.setItem(
        `epharmacy_prices_${pharmacyId}_${newMedId}`,
        JSON.stringify(finalPricesMap),
      )

      // Audit Log
      const logs = JSON.parse(localStorage.getItem('pharmacy_audit_logs') || '[]')

      logs.unshift({
        time: new Date().toLocaleString(),
        staff: user?.name || 'Pharmacy staff',
        role: user?.role || 'PHARMACY',
        action: `Added medicine ${medName} to inventory (${stockNum} units at RWF ${priceNum})`,
        status: 'Success',
      })

      localStorage.setItem('pharmacy_audit_logs', JSON.stringify(logs))

      setFormSuccess('Medicine successfully registered and stocked!')

      setTimeout(() => {
        setShowAddModal(false)
        resetForm()
        loadInventory()
      }, 1500)
    } catch (err: any) {
      const backendMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to add medicine.'
      setFormError(
        typeof backendMessage === 'string'
          ? backendMessage
          : Array.isArray(backendMessage)
            ? backendMessage.join(' · ')
            : 'Failed to add medicine.',
      )
    }
  }

  const resetForm = () => {
    setMedName('')
    setMedGenericName('')
    setMedCategory('')
    setMedCategoryId(undefined)
    setMedManufacturer('')
    setMedManufacturerId(undefined)
    setMedBatchNumber('')
    setMedLotNumber('')
    setMedExpiry('')
    setMedCost('')
    setMedPrices({ CASH: '' })
    setMedStock('')
    setMedStorageConditions('')
    setMedMinTemperature('')
    setMedMaxTemperature('')
    setFormError(null)
    setFormSuccess(null)

    setShowCategorySuggestions(false)
    setShowManufacturerSuggestions(false)
  }

  const openEditModal = (item: InventoryItem) => {
    setSelectedItem(item)
    
    // Retrieve prices mapping
    const savedMapping = localStorage.getItem(`epharmacy_prices_${pharmacyId}_${item.medicine.id}`)
    const parsed: Record<string, number> = savedMapping ? JSON.parse(savedMapping) : { CASH: item.stockInfo.price }
    if (parsed.CASH === undefined) {
      parsed.CASH = item.stockInfo.price
    }

    setEditPrices(parsed)
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

      list = list.filter(
        (item) =>
          item.medicine.name.toLowerCase().includes(q) ||
          item.medicine.genericName.toLowerCase().includes(q) ||
          item.customBatch?.toLowerCase().includes(q),
      )
    }

    // 2. Category Filter
    if (categoryFilter) {
      list = list.filter(
        (item) => item.medicine.category.toLowerCase() === categoryFilter.toLowerCase(),
      )
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

      if (valA < valB) {
        return sortOrder === 'ASC' ? -1 : 1
      }

      if (valA > valB) {
        return sortOrder === 'ASC' ? 1 : -1
      }

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

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage)

  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  // Metrics summary computations
  const totalSKUs = inventoryList.length

  const lowStockCount = inventoryList.filter(
    (i) => i.stockInfo.stock > 0 && i.stockInfo.stock < 20,
  ).length

  const outOfStockCount = inventoryList.filter((i) => i.stockInfo.stock === 0).length

  const totalValue = inventoryList.reduce(
    (acc, item) => acc + item.stockInfo.stock * item.stockInfo.price,
    0,
  )

  // Expiry check
  const isExpiringSoon = (dateStr?: string) => {
    if (!dateStr) return false

    const expDate = new Date(dateStr)

    const diff = expDate.getTime() - Date.now()

    const days = diff / (1000 * 60 * 60 * 24)

    return days > 0 && days <= 90
  }

  const expiringSoonCount = inventoryList.filter((i) => isExpiringSoon(i.customExpiry)).length

  // Calculate dynamic profit margin helper
  const getProfitMargin = () => {
    const cost = parseFloat(medCost)
    const sell = parseFloat(medPrices.CASH || '')

    if (isNaN(cost) || isNaN(sell) || sell <= 0) {
      return 0
    }

    return (((sell - cost) / sell) * 100).toFixed(1)
  }

  // ── Spreadsheet import handler ───────────────────────────────────────────
  const handleImportSpreadsheet = async () => {
    if (!importFile) {
      setImportError('Please choose a CSV or Excel file first.')
      return
    }
    const validExtensions = ['.csv', '.xlsx', '.xls']
    const ext = importFile.name.substring(importFile.name.lastIndexOf('.')).toLowerCase()
    if (!validExtensions.includes(ext)) {
      setImportError('Unsupported file type. Please upload a .csv, .xlsx or .xls file.')
      return
    }

    setIsImporting(true)
    setImportError(null)
    try {
      const result = await MedicineApi.importInventorySpreadsheet(pharmacyId, importFile)
      setImportResult(result)
      await loadInventory()
    } catch (err: any) {
      setImportError(
        err?.response?.data?.message || err?.message || 'Import failed. Please check the file format.',
      )
    } finally {
      setIsImporting(false)
    }
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
            Active Storefront: <span className="font-bold text-health-primary">{pharmacyName}</span>{' '}
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

        <button
          onClick={() => {
            setImportFile(null)
            setImportResult(null)
            setImportError(null)
            setShowImportModal(true)
          }}
          className="flex items-center justify-center space-x-2 py-2.5 px-4 border border-health-primary text-health-primary hover:bg-emerald-50 font-bold rounded-lg text-sm transition-colors"
        >
          <Upload className="w-4 h-4" />
          <span>Import CSV/Excel</span>
        </button>
      </div>

      {/* Analytics Summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* SKUs */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total SKUs stocked
            </span>

            <p className="text-3xl font-black text-gray-900 mt-1">{loading ? '...' : totalSKUs}</p>

            <span className="text-[10px] text-red-500 font-semibold mt-1 block">
              {outOfStockCount} out of stock
            </span>
          </div>

          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100">
            <Box className="w-5 h-5" />
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Low Stock Warnings
            </span>

            <p className="text-3xl font-black text-gray-900 mt-1">
              {loading ? '...' : lowStockCount}
            </p>

            <span className="text-[10px] text-amber-600 font-semibold mt-1 block">
              Requires replenishment
            </span>
          </div>

          <div className="p-3 bg-amber-50 text-amber-700 rounded-lg border border-amber-100">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Expiring batch */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Expiring batches (&lt;90 days)
            </span>

            <p className="text-3xl font-black text-gray-900 mt-1">
              {loading ? '...' : expiringSoonCount}
            </p>

            <span className="text-[10px] text-slate-500 font-semibold mt-1 block">
              Check batch recalls
            </span>
          </div>

          <div className="p-3 bg-slate-50 text-slate-700 rounded-lg border border-slate-200">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        {/* Value */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Store Stock Value
            </span>

            <p className="text-2xl font-black text-gray-900 mt-1.5">
              {loading ? '...' : `RWF ${totalValue.toLocaleString()}`}
            </p>

            <span className="text-[10px] text-health-accent font-semibold mt-1 block">
              Estimated retail price
            </span>
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

            <button
              onClick={loadInventory}
              className="py-1 px-3 border border-red-300 rounded-md text-xs hover:bg-red-50 font-bold"
            >
              Retry
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-16 text-center text-gray-500">
            <Box className="w-10 h-10 mx-auto text-gray-300 mb-2" />

            <p className="text-sm font-bold text-gray-700">No inventory records found</p>

            <p className="text-xs text-gray-400 mt-1">
              Try expanding your search query or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
              <thead className="bg-gray-50 font-bold text-gray-500 uppercase tracking-wider text-[10px] border-b border-gray-200">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 cursor-pointer select-none hover:bg-gray-100"
                    onClick={() => toggleSort('name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Drug Name (Generic)</span>
                      <ArrowUpDown className="w-3 h-3" aria-hidden="true" />
                    </div>
                  </th>

                  <th scope="col" className="px-6 py-3">
                    Category
                  </th>

                  <th scope="col" className="px-6 py-3">
                    Batch Number
                  </th>

                  <th
                    scope="col"
                    className="px-6 py-3 cursor-pointer select-none hover:bg-gray-100"
                    onClick={() => toggleSort('expiry')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Expiry Date</span>
                      <ArrowUpDown className="w-3 h-3" aria-hidden="true" />
                    </div>
                  </th>

                  <th
                    scope="col"
                    className="px-6 py-3 cursor-pointer select-none hover:bg-gray-100 text-center"
                    onClick={() => toggleSort('stock')}
                  >
                    <div className="flex items-center space-x-1 justify-center">
                      <span>Stock Qty</span>
                      <ArrowUpDown className="w-3 h-3" aria-hidden="true" />
                    </div>
                  </th>

                  <th
                    scope="col"
                    className="px-6 py-3 cursor-pointer select-none hover:bg-gray-100"
                    onClick={() => toggleSort('price')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Unit Price</span>
                      <ArrowUpDown className="w-3 h-3" aria-hidden="true" />
                    </div>
                  </th>

                  <th scope="col" className="px-6 py-3 text-center">
                    Status
                  </th>

                  <th scope="col" className="px-6 py-3 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-150">
                {paginatedItems.map((item) => {
                  const hasExpired = new Date(item.customExpiry || '') <= new Date()

                  const isExpSoon = isExpiringSoon(item.customExpiry)

                  return (
                    <tr key={item.medicine.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{item.medicine.name}</div>

                        <div className="text-[10px] text-gray-400 font-semibold font-mono mt-0.5">
                          {item.medicine.genericName}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700">
                          {item.medicine.category}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-mono font-bold text-gray-700">
                        {item.customBatch}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`font-semibold font-mono ${
                            hasExpired
                              ? 'text-red-650 font-bold bg-red-50 px-2 py-0.5 rounded'
                              : isExpSoon
                                ? 'text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded'
                                : 'text-gray-600'
                          }`}
                        >
                          {item.customExpiry}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="font-bold font-mono text-sm text-gray-900">
                          {item.stockInfo.stock}
                        </div>

                        <div className="mt-1">
                          {item.stockInfo.stock === 0 ? (
                            <span className="text-[9px] bg-red-100 text-red-800 font-bold px-1.5 py-0.5 rounded-full">
                              Out of Stock
                            </span>
                          ) : item.stockInfo.stock < 20 ? (
                            <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-full">
                              Low Stock
                            </span>
                          ) : (
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full">
                              High
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 font-black text-gray-900 font-mono">
                        RWF {item.stockInfo.price.toLocaleString()}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            item.stockInfo.isOpen
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                              : 'bg-red-50 text-red-800 border border-red-100'
                          }`}
                        >
                          {item.stockInfo.isOpen ? 'ACTIVE/SELLABLE' : 'SUSPENDED'}
                        </span>
                      </td>

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
                  Page <span className="font-bold text-gray-900">{currentPage}</span> of{' '}
                  {totalPages}
                </span>

                <div className="flex space-x-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    className="p-1 px-3 border border-gray-300 rounded bg-white text-xs hover:bg-gray-50 disabled:opacity-50 transition-all font-semibold"
                  >
                    Previous
                  </button>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
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
          className="fixed inset-0 z-[9999] bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowEditModal(false)
            }
          }}
        >
          <div className="portal-modal-panel bg-white rounded-xl border border-gray-200 w-full max-w-md shadow-xl overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 id="edit-modal-title" className="font-black text-gray-900 text-sm">
                  Adjust Pharmacy Inventory
                </h3>

                <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                  {selectedItem.medicine.name}
                </p>
              </div>

              <button
                onClick={() => setShowEditModal(false)}
                aria-label="Close edit modal"
                className="text-gray-400 hover:text-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 rounded"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleUpdateStock} className="portal-form p-5 space-y-4">
              {/* Cash Price */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Cash / No Insurance Price (RWF) *
                </label>

                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-xs">RWF</span>
                  </div>

                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={editPrices.CASH ?? ''}
                    onChange={(e) => setEditPrices(prev => ({ ...prev, CASH: Math.max(0, parseFloat(e.target.value) || 0) }))}
                    className="block w-full pl-12 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Insurance Prices */}
              {activeInsurances.map((p) => (
                <div key={p.id}>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    {p.name} Price (RWF)
                  </label>

                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-xs">RWF</span>
                    </div>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Uses Cash price fallback"
                      value={editPrices[p.id] ?? ''}
                      onChange={(e) => {
                        const val = e.target.value.trim() === '' ? undefined : Math.max(0, parseFloat(e.target.value) || 0)
                        setEditPrices(prev => {
                          const copy = { ...prev }
                          if (val === undefined) {
                            delete copy[p.id]
                          } else {
                            copy[p.id] = val
                          }
                          return copy
                        })
                      }}
                      className="block w-full pl-12 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>
              ))}

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
                  <span className="text-xs font-bold text-gray-700 block">
                    Sellable Store Status
                  </span>

                  <span className="text-[10px] text-gray-450">
                    Toggles visibility on Patient Searches
                  </span>
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
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowAddModal(false)
            }
          }}
        >
          <div
            onClick={() => setShowAddModal(false)}
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
          />

          <div className="relative bg-white w-full max-w-lg max-h-[90vh] rounded-2xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden animate-scaleIn z-10">
            {/* Header */}
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-health-primary" aria-hidden="true" />

                <div>
                  <h3 id="add-modal-title" className="font-black text-gray-900 text-base">
                    Add Medication to Catalog
                  </h3>

                  <p className="text-[10px] text-gray-400 font-semibold">
                    Store-specific dynamic stock definition
                  </p>
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
            <form
              onSubmit={handleAddMedicineSubmit}
              className="portal-form flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6"
            >
              {/* Error */}
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2 text-red-800 text-xs">
                  <ShieldAlert className="w-5 h-5 flex-shrink-0 text-red-600" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Success */}
              {formSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-start space-x-2 text-emerald-800 text-xs">
                  <Check className="w-5 h-5 flex-shrink-0 text-emerald-700" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {/* ============================================================
      MEDICINE INFORMATION
      ============================================================ */}
              <section>
                <div className="mb-3">
                  <h4 className="text-sm font-black text-gray-900">Medicine Information</h4>

                  <p className="text-[10px] text-gray-500 mt-0.5">
                    Enter the basic information that identifies the medicine.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Trade & Generic Name */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Trade Name */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Trade Name *
                      </label>

                      <input
                        type="text"
                        required
                        value={medName}
                        onChange={(e) => setMedName(e.target.value)}
                        placeholder="e.g. Panadol Forte"
                        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    {/* Generic Name */}
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
                        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Category & Manufacturer */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* CATEGORY */}
                    <div ref={categoryRef} className="relative">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Category *
                      </label>

                      <input
                        type="text"
                        required
                        value={medCategory}
                        onChange={(e) => {
                          setMedCategory(e.target.value)
                          setMedCategoryId(undefined)
                          setShowCategorySuggestions(true)
                        }}
                        onFocus={() => {
                          setShowCategorySuggestions(true)
                        }}
                        placeholder="Type category..."
                        autoComplete="off"
                        className="block w-full px-3 py-2 pr-8 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />

                      <ChevronDown
                        className={`absolute right-2 top-[30px] w-3.5 h-3.5 text-gray-400 transition-transform ${
                          showCategorySuggestions ? 'rotate-180' : ''
                        }`}
                      />

                      {showCategorySuggestions && (
                        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {filteredCategories.length > 0 ? (
                            filteredCategories.map((category) => (
                              <button
                                key={category.id}
                                type="button"
                                onClick={() => {
                                  setMedCategory(category.name)
                                  setMedCategoryId(category.id)
                                  setShowCategorySuggestions(false)
                                }}
                                className="w-full text-left px-3 py-2.5 text-xs text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                              >
                                {category.name}
                              </button>
                            ))
                          ) : medCategory.trim() ? (
                            <div className="px-3 py-3 text-xs">
                              <div className="text-gray-500">No matching category found.</div>

                              <div className="mt-1 text-emerald-600 font-semibold">
                                "{medCategory}" will be created when you register the medicine.
                              </div>
                            </div>
                          ) : (
                            <div className="px-3 py-3 text-xs text-gray-500">
                              Start typing to search categories.
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* MANUFACTURER */}
                    <div ref={manufacturerRef} className="relative">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Manufacturer *
                      </label>

                      <input
                        type="text"
                        required
                        value={medManufacturer}
                        onChange={(e) => {
                          setMedManufacturer(e.target.value)
                          setMedManufacturerId(undefined)
                          setShowManufacturerSuggestions(true)
                        }}
                        onFocus={() => {
                          setShowManufacturerSuggestions(true)
                        }}
                        placeholder="Type manufacturer..."
                        autoComplete="off"
                        className="block w-full px-3 py-2 pr-8 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />

                      <ChevronDown
                        className={`absolute right-2 top-[30px] w-3.5 h-3.5 text-gray-400 transition-transform ${
                          showManufacturerSuggestions ? 'rotate-180' : ''
                        }`}
                      />

                      {showManufacturerSuggestions && (
                        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {filteredManufacturers.length > 0 ? (
                            filteredManufacturers.map((manufacturer) => (
                              <button
                                key={manufacturer.id}
                                type="button"
                                onClick={() => {
                                  setMedManufacturer(manufacturer.name)
                                  setMedManufacturerId(manufacturer.id)
                                  setShowManufacturerSuggestions(false)
                                }}
                                className="w-full text-left px-3 py-2.5 text-xs text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                              >
                                {manufacturer.name}
                              </button>
                            ))
                          ) : medManufacturer.trim() ? (
                            <div className="px-3 py-3 text-xs">
                              <div className="text-gray-500">No matching manufacturer found.</div>

                              <div className="mt-1 text-emerald-600 font-semibold">
                                "{medManufacturer}" will be created when you register the medicine.
                              </div>
                            </div>
                          ) : (
                            <div className="px-3 py-3 text-xs text-gray-500">
                              Start typing to search manufacturers.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* ============================================================
      BATCH INFORMATION
      ============================================================ */}
              <section className="pt-5 border-t border-gray-200">
                <div className="mb-3">
                  <h4 className="text-sm font-black text-gray-900">Batch Information</h4>

                  <p className="text-[10px] text-gray-500 mt-0.5">
                    Enter the batch information provided by the manufacturer.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Batch Number & Lot Number */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Batch Number */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Batch Number *
                      </label>

                      <input
                        type="text"
                        required
                        value={medBatchNumber}
                        onChange={(e) => setMedBatchNumber(e.target.value)}
                        placeholder="e.g. BTH-2026-001"
                        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />

                      <p className="text-[9px] text-gray-400 mt-1">
                        Enter the batch number printed by the manufacturer.
                      </p>
                    </div>

                    {/* Lot Number */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Lot Number *
                      </label>

                      <input
                        type="text"
                        required
                        value={medLotNumber}
                        onChange={(e) => setMedLotNumber(e.target.value)}
                        placeholder="e.g. LOT-2026-001"
                        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Expiry */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Expiry Date *
                    </label>

                    <input
                      type="date"
                      required
                      value={medExpiry}
                      onChange={(e) => setMedExpiry(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />

                    <p className="text-[9px] text-gray-400 mt-1">
                      The expiry date must be in the future.
                    </p>
                  </div>
                </div>
              </section>

              {/* ============================================================
      PRICING & STOCK
      ============================================================ */}
              <section className="pt-5 border-t border-gray-200">
                <div className="mb-3">
                  <h4 className="text-sm font-black text-gray-900">Pricing & Stock</h4>

                  <p className="text-[10px] text-gray-500 mt-0.5">
                    Enter the purchase price, selling price and initial stock.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Cost & Selling Price */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Unit Cost */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Unit Cost (RWF) *
                      </label>

                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={medCost}
                        onChange={(e) => setMedCost(e.target.value)}
                        placeholder="e.g. 100"
                        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    {/* Cash Selling Price */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Cash Selling Price (RWF) *
                      </label>

                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={medPrices.CASH ?? ''}
                        onChange={(e) => setMedPrices(prev => ({ ...prev, CASH: e.target.value }))}
                        placeholder="e.g. 150"
                        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* Insurance Custom Prices */}
                  {activeInsurances.length > 0 && (
                    <div className="bg-gray-50 border border-gray-150 rounded-lg p-3 space-y-3">
                      <span className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                        Insurance Custom Prices (Optional)
                      </span>
                      <p className="text-[9px] text-gray-400">
                        Leave blank to automatically default to the Cash price.
                      </p>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {activeInsurances.map((p) => (
                          <div key={p.id}>
                            <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1 font-semibold">
                              {p.name} (RWF)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={medPrices[p.id] ?? ''}
                              onChange={(e) => {
                                const val = e.target.value
                                setMedPrices(prev => ({ ...prev, [p.id]: val }))
                              }}
                              placeholder="Default fallback"
                              className="block w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Profit Margin */}
                  {medCost && medPrices.CASH && parseFloat(medPrices.CASH) >= parseFloat(medCost) && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-100 flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center space-x-1.5">
                        <Percent className="w-4 h-4 text-emerald-600" />

                        <span>Estimated Gross Profit Margin:</span>
                      </div>

                      <span className="font-black text-sm">{getProfitMargin()}%</span>
                    </div>
                  )}

                  {/* Initial Stock */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Initial Stock Quantity (Units) *
                    </label>

                    <input
                      type="number"
                      required
                      min="0"
                      step="1"
                      value={medStock}
                      onChange={(e) => setMedStock(e.target.value)}
                      placeholder="e.g. 500"
                      className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </section>

              {/* ============================================================
      STORAGE
      ============================================================ */}
              <section className="pt-5 border-t border-gray-200">
                <div className="mb-3">
                  <h4 className="text-sm font-black text-gray-900">Storage Requirements</h4>

                  <p className="text-[10px] text-gray-500 mt-0.5">
                    Enter the storage requirements provided for this medicine.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Storage Conditions */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Storage Conditions *
                    </label>

                    <textarea
                      required
                      rows={2}
                      value={medStorageConditions}
                      onChange={(e) => setMedStorageConditions(e.target.value)}
                      placeholder="e.g. Store in a cool, dry place away from direct sunlight."
                      className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Temperature */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Minimum */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Minimum Temperature (°C)
                      </label>

                      <input
                        type="number"
                        step="0.1"
                        value={medMinTemperature}
                        onChange={(e) => setMedMinTemperature(e.target.value)}
                        placeholder="e.g. 2"
                        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    {/* Maximum */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Maximum Temperature (°C)
                      </label>

                      <input
                        type="number"
                        step="0.1"
                        value={medMaxTemperature}
                        onChange={(e) => setMedMaxTemperature(e.target.value)}
                        placeholder="e.g. 25"
                        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start space-x-2">
                    <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />

                    <p className="text-[10px] text-blue-700 leading-relaxed">
                      Enter the storage temperature range according to the manufacturer's
                      instructions. Leave the temperature fields empty if the medicine does not have
                      a specific temperature range.
                    </p>
                  </div>
                </div>
              </section>

              {/* ============================================================
      SUBMIT
      ============================================================ */}
              <div className="flex space-x-3 pt-5 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    resetForm()
                    setShowAddModal(false)
                  }}
                  className="w-1/3 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="w-2/3 py-2.5 bg-health-primary hover:bg-health-secondary text-white font-bold rounded-lg text-xs shadow-sm flex items-center justify-center space-x-2 transition-colors"
                >
                  <span>Register Medicine</span>

                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          IMPORT SPREADSHEET MODAL (CSV / Excel)
          ============================================================ */}
      {showImportModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Import inventory spreadsheet"
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm overflow-y-auto"
        >
          <div className="portal-modal-panel bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-xl my-8">
            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-gray-900">Import Inventory Spreadsheet</h2>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    Bulk-add stock from a CSV or Excel (.xlsx) file. Rows are validated individually.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                aria-label="Close import dialog"
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Format guide */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-[11px] font-semibold text-gray-600 space-y-1.5">
                <span className="block text-[10px] tracking-wider text-slate-400 uppercase font-black mb-1">
                  Required columns
                </span>
                <p><span className="font-mono text-emerald-700">tradeName</span>, <span className="font-mono text-emerald-700">quantity</span>, <span className="font-mono text-emerald-700">price</span></p>
                <span className="block text-[10px] tracking-wider text-slate-400 uppercase font-black pt-1">
                  Optional columns
                </span>
                <p>
                  <span className="font-mono">genericName</span>,{' '}
                  <span className="font-mono">category</span>,{' '}
                  <span className="font-mono">manufacturer</span>,{' '}
                  <span className="font-mono">batchNumber</span>,{' '}
                  <span className="font-mono">lotNumber</span>,{' '}
                  <span className="font-mono">expiryDate</span> (YYYY-MM-DD),{' '}
                  <span className="font-mono">unitCost</span>
                </p>
                <p className="text-[10px] text-gray-400 pt-1">
                  Existing medicines are topped up; new ones are registered automatically with their category and manufacturer.
                </p>
              </div>

              {importError && (
                <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 text-red-800 text-xs">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span className="font-semibold">{importError}</span>
                </div>
              )}

              {/* File input */}
              {!importResult && (
                <>
                  <label className="block">
                    <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Spreadsheet file (.csv, .xlsx, .xls)
                    </span>
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      onChange={(e) => {
                        setImportFile(e.target.files?.[0] ?? null)
                        setImportError(null)
                      }}
                      disabled={isImporting}
                      className="block w-full text-xs text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 file:mr-3 file:py-2 file:px-3 file:border-0 file:bg-health-primary file:text-white file:font-bold file:text-xs file:cursor-pointer"
                    />
                  </label>
                  {importFile && (
                    <p className="text-[11px] text-gray-500 font-medium pl-1">
                      Selected: <span className="font-bold text-gray-800">{importFile.name}</span>{' '}
                      ({Math.max(1, Math.round(importFile.size / 1024))} KB)
                    </p>
                  )}
                </>
              )}

              {/* Import summary report */}
              {importResult && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl py-3">
                      <p className="text-xl font-black text-emerald-700">{importResult.imported}</p>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Imported</p>
                    </div>
                    <div className="bg-red-50 border border-red-100 rounded-xl py-3">
                      <p className="text-xl font-black text-red-700">{importResult.failed}</p>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-red-600">Failed</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl py-3">
                      <p className="text-xl font-black text-gray-800">{importResult.total}</p>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total rows</p>
                    </div>
                  </div>

                  {importResult.errors.length > 0 && (
                    <div className="border border-red-200 rounded-xl overflow-hidden">
                      <p className="text-[10px] font-black text-red-700 uppercase tracking-wider bg-red-50 px-4 py-2 border-b border-red-100">
                        Row-level validation errors
                      </p>
                      <ul className="max-h-44 overflow-y-auto divide-y divide-red-50 text-xs">
                        {importResult.errors.map((rowError, index) => (
                          <li key={index} className="px-4 py-2 flex items-start gap-2 text-gray-700">
                            <span className="flex-shrink-0 font-mono font-bold text-red-600 bg-red-50 border border-red-100 rounded px-1.5">
                              Row {rowError.row}
                            </span>
                            <span className="font-medium">{rowError.error}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="flex justify-end gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50/60 rounded-b-2xl">
              {importResult ? (
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="py-2.5 px-5 bg-health-primary hover:bg-health-secondary text-white font-bold rounded-lg text-xs transition-colors"
                >
                  Done
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setShowImportModal(false)}
                    disabled={isImporting}
                    className="py-2.5 px-5 border border-gray-300 text-gray-600 rounded-lg text-xs font-bold hover:bg-white disabled:opacity-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleImportSpreadsheet}
                    disabled={!importFile || isImporting}
                    className="py-2.5 px-5 bg-health-primary hover:bg-health-secondary text-white font-bold rounded-lg text-xs transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        Upload &amp; Import
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
