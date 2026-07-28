import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Map, List, Star, MapPin, Check, X, Shield, ArrowRight, ArrowLeft, CheckCircle2, RefreshCw, AlertCircle, ChevronRight } from 'lucide-react'
import { useMedicineSearch } from '@/hooks/useMedicineSearch'
import { Medicine, PharmacyStock, Reservation } from '@/types'
import MedicineSearchBar from '@/components/patient/MedicineSearchBar'
import MedicineCard from '@/components/patient/MedicineCard'
import PharmacyAvailabilityTable from '@/components/patient/PharmacyAvailabilityTable'
import PrescriptionUploader from '@/components/patient/PrescriptionUploader'
import { INSURANCE_COVERAGE_RATES } from '@/config/insurance-rates'

export default function MedicineSearch() {
  const location = useLocation()
  const initialQuery = (location.state as any)?.initialQuery || ''

  const { 
    results, 
    loading, 
    error, 
    executeSearch, 
    getMedicineAvailability, 
    calculateInsuranceCoverage, 
    uploadPrescription, 
    createReservation 
  } = useMedicineSearch()

  // Search filter states
  const [query, setQuery] = useState(initialQuery)
  const [category, setCategory] = useState('')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [sortBy, setSortBy] = useState('proximity')
  const [hasSearched, setHasSearched] = useState(!!initialQuery)

  // Trigger search immediately if quick search initialQuery exists
  useEffect(() => {
    if (initialQuery) {
      executeSearch(initialQuery, '', false)
    }
  }, [initialQuery, executeSearch])

  // Selected drug details states
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null)
  const [stockList, setStockList] = useState<PharmacyStock[]>([])
  const [stockLoading, setStockLoading] = useState(false)
  const [expandedClinical, setExpandedClinical] = useState(false)

  // Responsive mobile toggle (List vs Map)
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list')

  // Reservation Wizard Stepper states (4-step layout)
  const [showResModal, setShowResModal] = useState(false)
  const [resStep, setResStep] = useState<1 | 2 | 3 | 4 | 5>(1) 
  const [selectedPharmacy, setSelectedPharmacy] = useState<PharmacyStock | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [insuranceProvider, setInsuranceProvider] = useState('None')
  const [insuranceId, setInsuranceId] = useState('')
  
  // Prescription uploader properties
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploaderError, setUploaderError] = useState<string | null>(null)
  
  // Cost calculations
  const [costCalculations, setCostCalculations] = useState({
    percent: 0,
    insurancePays: 0,
    patientPays: 0,
    total: 0
  })

  const [resLoading, setResLoading] = useState(false)
  const [createdReservation, setCreatedReservation] = useState<Reservation | null>(null)

  // Execute registry search
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setSelectedMedicine(null)
    setStockList([])
    executeSearch(query, category, inStockOnly)
    setHasSearched(true)
  }

  // popular tag click trigger
  const handlePopularSearch = (term: string) => {
    setQuery(term)
    setSelectedMedicine(null)
    setStockList([])
    executeSearch(term, category, inStockOnly)
    setHasSearched(true)
  }

  // Load pharmacy availability details
  const handleViewAvailability = async (med: Medicine) => {
    setSelectedMedicine(med)
    setStockLoading(true)
    setExpandedClinical(false)
    try {
      const list = await getMedicineAvailability(med.id)
      setStockList(list)
      setMobileView('list')
    } catch (err) {
      console.error(err)
    } finally {
      setStockLoading(false)
    }
  }

  // Apply sorter logic to pharmacy details
  const getSortedPharmacies = () => {
    const list = [...stockList]
    if (sortBy === 'proximity') {
      return list.sort((a, b) => a.distance - b.distance)
    }
    if (sortBy === 'price') {
      return list.sort((a, b) => a.price - b.price)
    }
    if (sortBy === 'stock') {
      return list.sort((a, b) => b.stock - a.stock)
    }
    if (sortBy === 'rating') {
      return list.sort((a, b) => b.rating - a.rating)
    }
    return list
  }

  const sortedPharmacies = getSortedPharmacies()

  // Calculate cost splits dynamically when qty or insurance selection modifies
  useEffect(() => {
    if (!selectedPharmacy) return
    const total = selectedPharmacy.price * quantity
    
    calculateInsuranceCoverage(insuranceProvider, total)
      .then((res) => {
        setCostCalculations({
          percent: res.percent,
          insurancePays: res.insurancePays,
          patientPays: res.patientPays,
          total
        })
      })
      .catch((err) => console.error(err))
  }, [insuranceProvider, quantity, selectedPharmacy])

  // Stepper helper navigation (4-step layout)
  const nextStep = () => {
    if (resStep === 2) {
      if (selectedMedicine && !selectedMedicine.prescriptionRequired) {
        setResStep(4) 
        return
      }
    }
    setResStep((prev) => (prev + 1) as any)
  }

  const prevStep = () => {
    if (resStep === 4) {
      if (selectedMedicine && !selectedMedicine.prescriptionRequired) {
        setResStep(2)
        return
      }
    }
    setResStep((prev) => (prev - 1) as any)
  }

  // File upload progress validation
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setUploaderError(null)
      setUploadedFile(file)
      setUploadProgress(0)

      try {
        const uploaded = await uploadPrescription(file, (percent) => {
          setUploadProgress(percent)
        })
        
        if (file.type.startsWith('image/')) {
          setFilePreviewUrl(uploaded.fileUrl)
        } else {
          setFilePreviewUrl(null)
        }
      } catch (err: any) {
        setUploaderError(err.message || 'File upload failed.')
        setUploadedFile(null)
        setUploadProgress(0)
      }
    }
  }

  // Remove file
  const handleRemoveFile = () => {
    setUploadedFile(null)
    setUploaderError(null)
    setUploadProgress(0)
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl)
      setFilePreviewUrl(null)
    }
  }

  // Submit checkout reservation
  const handleConfirmReservation = async () => {
    if (!selectedMedicine || !selectedPharmacy) return
    setResLoading(true)
    try {
      const res = await createReservation({
        medicineId: selectedMedicine.id,
        pharmacyId: selectedPharmacy.pharmacyId,
        quantity,
        insuranceProvider,
        insuranceId,
        prescriptionFileName: uploadedFile ? uploadedFile.name : undefined
      })
      setCreatedReservation(res)
      
      setStockList((prev) => 
        prev.map((s) => s.pharmacyId === selectedPharmacy.pharmacyId ? { ...s, stock: Math.max(0, s.stock - quantity) } : s)
      )

      setResStep(5) 
    } catch (err) {
      console.error(err)
    } finally {
      setResLoading(false)
    }
  }

  // Clear checkout variables
  const resetResWizard = () => {
    setShowResModal(false)
    setResStep(1)
    setSelectedPharmacy(null)
    setQuantity(1)
    setInsuranceProvider('None')
    setInsuranceId('')
    setUploadedFile(null)
    setFilePreviewUrl(null)
    setUploadProgress(0)
    setUploaderError(null)
    setCreatedReservation(null)
  }

  // Google Maps state variables
  const [mapQuery, setMapQuery] = useState('Kigali, Rwanda')
  const [mapZoom, setMapZoom] = useState(13)

  // Update Google Maps focus when a new medicine is selected or stockList loads
  useEffect(() => {
    if (selectedMedicine && stockList.length > 0) {
      const closest = stockList[0]
      setMapQuery(`${closest.lat},${closest.lng}`)
      setMapZoom(15)
    } else {
      setMapQuery('Kigali, Rwanda')
      setMapZoom(13)
    }
  }, [selectedMedicine, stockList])

  const handleSelectPharmacyMap = (pharm: PharmacyStock) => {
    setMapQuery(`${pharm.lat},${pharm.lng}`)
    setMapZoom(16)
  }

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col relative overflow-hidden">
      
      {/* Search Header Console */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 py-4 px-6">
        <form onSubmit={handleSearch} className="max-w-5xl mx-auto flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex items-center space-x-2 flex-shrink-0">
            <MapPin className="w-5 h-5 text-health-primary" />
            <h1 className="text-lg font-black text-gray-900 leading-none">Find Medicines Near You</h1>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto flex-grow max-w-2xl">
            <input
              type="text"
              placeholder="Search trade brand or generic molecule name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-grow pl-4 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white text-gray-950 text-xs font-semibold"
            />
            
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-2 text-xs text-gray-700 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">All Categories</option>
              <option value="Analgesics">Analgesics</option>
              <option value="Antibiotics">Antibiotics</option>
              <option value="Antidiabetics">Antidiabetics</option>
              <option value="Antihypertensives">Antihypertensives</option>
            </select>

            <button
              type="submit"
              disabled={loading}
              className="bg-health-primary hover:bg-health-secondary text-white font-bold px-5 py-2 rounded-lg text-xs transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>Search Registry</span>}
            </button>
          </div>
        </form>
      </div>

      {/* Split-Screen layout map hero */}
      <div className="flex-grow flex relative overflow-hidden">
        
        {/* Left Panel: Search list results and clinical guides */}
        <div className={`w-full lg:w-1/2 flex flex-col h-full bg-gray-50 border-r border-gray-200 overflow-y-auto p-4 sm:p-6 space-y-6 ${
          mobileView === 'map' ? 'hidden lg:flex' : 'flex'
        }`}>
          
          {/* Default initial message (before user queries) */}
          {!hasSearched && (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center space-y-4 shadow-xs">
              <span className="inline-block p-3 bg-emerald-50 text-health-primary rounded-full">
                <MapPin className="w-6 h-6" />
              </span>
              <div className="space-y-1">
                <h3 className="font-black text-gray-900 text-base">Enter a drug name to check inventory</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Type a medicine brand name or category. We will pinpoint pharmacies near your coordinates with live stock quantities.
                </p>
              </div>
              
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2 text-xs">
                <span className="text-gray-400 font-semibold">Try searching:</span>
                {['Paracetamol', 'Amoxicillin', 'Metformin'].map((med) => (
                  <button
                    key={med}
                    type="button"
                    onClick={() => handlePopularSearch(med)}
                    className="px-2.5 py-1 bg-gray-50 hover:bg-emerald-50 border border-gray-200 text-gray-600 hover:text-emerald-800 rounded-lg font-bold transition-all text-[11px]"
                  >
                    {med}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Result Matches cards */}
          {hasSearched && !selectedMedicine && (
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">National Search Matches</h2>
                <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">{results.length} Indexed</span>
              </div>

              {results.length === 0 && !loading && (
                <div className="bg-white border rounded-xl p-10 text-center text-gray-400 text-xs">
                  No medicines found matching the search filters.
                </div>
              )}

              <div className="space-y-4">
                {results.map((med) => (
                  <MedicineCard
                    key={med.id}
                    medicine={med}
                    onViewAvailability={handleViewAvailability}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Selected Medicine Stock Table details inside the Left column */}
          {selectedMedicine && (
            <div className="space-y-5 animate-fadeIn">
              
              {/* Back to search matches */}
              <button
                type="button"
                onClick={() => {
                  setSelectedMedicine(null)
                  setStockList([])
                }}
                className="text-xs font-bold text-health-primary hover:underline flex items-center hover:text-health-secondary transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                <span>Back to Search Results</span>
              </button>

              {/* Medicine details block */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <h2 className="font-black text-gray-900 text-lg">{selectedMedicine.name}</h2>
                  {selectedMedicine.prescriptionRequired && (
                    <span className="text-[9px] font-black text-red-755 bg-red-50 border border-red-250 px-1.5 py-0.5 rounded uppercase">Prescription Required</span>
                  )}
                </div>

                {/* Patient Clinical Info */}
                <div className="text-xs space-y-2.5 text-gray-700 pt-3 border-t border-gray-150">
                  <p><span className="font-bold text-gray-900">Clinical Uses:</span> {selectedMedicine.uses}</p>
                  <p><span className="font-bold text-gray-900">Recommended Dosage:</span> {selectedMedicine.dosage}</p>
                  <p><span className="font-bold text-gray-900">Warnings &amp; Safety:</span> <span className="text-rose-700">{selectedMedicine.warnings}</span></p>
                  
                  <button 
                    type="button"
                    onClick={() => setExpandedClinical(!expandedClinical)}
                    className="text-health-primary font-bold hover:underline"
                  >
                    {expandedClinical ? 'Show Less' : 'View Clinical Contraindications & Storage'}
                  </button>

                  {expandedClinical && (
                    <div className="space-y-2 pt-2 border-t border-dashed border-gray-250 animate-fadeIn">
                      <p><span className="font-bold text-gray-900">Common Side Effects:</span> {selectedMedicine.sideEffects}</p>
                      <p><span className="font-bold text-gray-900">Drug Interactions:</span> {selectedMedicine.interactions}</p>
                      <p><span className="font-bold text-gray-900">Storage Requirements:</span> {selectedMedicine.storage}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Pharmacy stocking list */}
              {stockLoading ? (
                <div className="text-center py-10 text-xs text-gray-400 flex items-center justify-center space-x-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
                  <span>Loading inventory details...</span>
                </div>
              ) : (
                <PharmacyAvailabilityTable
                  pharmacies={sortedPharmacies}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  onReserve={(pharm) => {
                    setSelectedPharmacy(pharm)
                    setShowResModal(true)
                  }}
                  onSelectPharmacy={handleSelectPharmacyMap}
                />
              )}
            </div>
          )}

        </div>

        {/* Right Panel: Permanent Map View */}
        <div className={`w-full lg:w-1/2 h-full relative ${
          mobileView === 'map' ? 'flex' : 'hidden lg:flex'
        }`}>
          <iframe
            title="Google Map Locator"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&hl=en&z=${mapZoom}&t=&ie=UTF8&iwloc=&output=embed`}
            className="w-full h-full min-h-[500px] lg:min-h-full border-0 shadow-sm"
            allowFullScreen
            loading="lazy"
          />
        </div>

      </div>

      {/* Floating Action Button for responsive mobile map switch */}
      <div className="lg:hidden absolute bottom-6 right-6 z-30">
        <button
          type="button"
          onClick={() => setMobileView(prev => prev === 'list' ? 'map' : 'list')}
          className="bg-slate-900 text-white font-bold px-4 py-3 rounded-full flex items-center justify-center space-x-2 shadow-2xl focus:outline-none"
        >
          {mobileView === 'list' ? (
            <>
              <Map className="w-4 h-4 text-emerald-450" />
              <span className="text-xs">View Map</span>
            </>
          ) : (
            <>
              <List className="w-4 h-4 text-emerald-450" />
              <span className="text-xs">View List</span>
            </>
          )}
        </button>
      </div>

      {/* 4-Step Reservation Wizard Stepper Modal */}
      {showResModal && selectedMedicine && selectedPharmacy && (
        <div className="fixed inset-0 z-55 flex items-center justify-center px-4 py-6">
          <div onClick={resetResWizard} className="absolute inset-0 bg-gray-900/50 backdrop-blur-xs" />
          
          <div className="relative w-full max-w-lg bg-white rounded-2xl border border-gray-255 shadow-2xl overflow-hidden z-55 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-emerald-950 text-white px-6 py-4 flex items-center justify-between border-b border-emerald-900 flex-shrink-0">
              <div>
                <h3 className="font-black text-sm">Reserve Medication</h3>
                <p className="text-xs text-emerald-300 font-medium">{selectedMedicine.name}</p>
              </div>
              <button onClick={resetResWizard} className="text-emerald-300 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Wizard Indicator (Steps 1 to 4) */}
            {resStep < 5 && (
              <div className="bg-gray-50 border-b border-gray-150 px-6 py-3 flex items-center justify-between text-xs font-bold text-gray-400 flex-shrink-0">
                {[
                  { num: 1, label: 'Qty & Store' },
                  { num: 2, label: 'Insurance' },
                  { num: 3, label: 'Prescription' },
                  { num: 4, label: 'Confirm' }
                ].map((st) => {
                  const isCurrent = resStep === st.num
                  const isPassed = resStep > st.num
                  return (
                    <div key={st.num} className="flex items-center space-x-1.5">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                        isCurrent ? 'bg-health-primary text-white scale-105' : isPassed ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {isPassed ? <Check className="w-3 h-3" /> : st.num}
                      </div>
                      <span className={`hidden sm:inline ${isCurrent ? 'text-health-primary' : 'text-gray-450'}`}>{st.label}</span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Stepper Content Pane */}
            <div className="flex-grow p-6 overflow-y-auto min-h-[220px]">
              
              {/* Step 1: Review selected items & Qty selection */}
              {resStep === 1 && (
                <div className="space-y-5">
                  <div className="bg-gray-50 border rounded-xl p-4 space-y-2 text-xs">
                    <span className="text-[10px] font-bold text-gray-450 block uppercase">Selection Details</span>
                    <div className="flex justify-between items-center text-gray-700">
                      <span>Medicine:</span>
                      <span className="font-bold text-gray-900">{selectedMedicine.name}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-700">
                      <span>Store location:</span>
                      <span className="font-bold text-gray-900">{selectedPharmacy.pharmacyName}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-700">
                      <span>Unit Retail Price:</span>
                      <span className="font-bold text-gray-900">{selectedPharmacy.price} RWF</span>
                    </div>
                  </div>

                  <div className="text-center space-y-3.5 pt-2">
                    <span className="text-xs font-bold text-gray-500 block uppercase">Select Quantity (tablets)</span>
                    <div className="flex items-center justify-center space-x-4">
                      <button
                        type="button"
                        disabled={quantity <= 1}
                        onClick={() => setQuantity(prev => prev - 1)}
                        className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 text-gray-600 font-bold"
                      >
                        -
                      </button>
                      <span className="text-2xl font-black text-gray-900 w-12">{quantity}</span>
                      <button
                        type="button"
                        disabled={quantity >= selectedPharmacy.stock}
                        onClick={() => setQuantity(prev => prev + 1)}
                        className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 text-gray-600 font-bold"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 font-bold">Total stock available: {selectedPharmacy.stock} tablets</p>
                  </div>
                </div>
              )}

              {/* Step 2: Insurance Provider & dynamic rate splits */}
              {resStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Insurance Provider</label>
                    <select
                      value={insuranceProvider}
                      onChange={(e) => {
                        setInsuranceProvider(e.target.value)
                        setInsuranceId('')
                      }}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
                    >
                      <option value="None">No Copay / Private Patient</option>
                      {selectedPharmacy.insuranceAccepted.includes('RSSB') && <option value="RSSB">Mutuelle de Santé (RSSB)</option>}
                      {selectedPharmacy.insuranceAccepted.includes('MMI') && <option value="MMI">Military Medical Insurance (MMI)</option>}
                      {selectedPharmacy.insuranceAccepted.includes('SANLAM') && <option value="SANLAM">SANLAM Healthcare</option>}
                      {selectedPharmacy.insuranceAccepted.includes('Radiant') && <option value="Radiant">Radiant Insurance</option>}
                    </select>
                  </div>

                  {insuranceProvider !== 'None' && (
                    <div className="space-y-1.5 animate-fadeIn">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Insurance Policy ID Number</label>
                      <input
                        type="text"
                        placeholder="Enter card identification code..."
                        value={insuranceId}
                        onChange={(e) => setInsuranceId(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                  )}

                  {/* Pricing Breakdown details panel */}
                  <div className="border border-gray-250 rounded-xl p-4 bg-gray-50/50 space-y-2 text-xs">
                    <span className="font-bold text-gray-800 block mb-1">Pricing Breakdown</span>
                    <div className="flex justify-between items-center text-gray-600">
                      <span>Total Retail Cost ({quantity} tabs):</span>
                      <span className="font-bold text-gray-900">{costCalculations.total} RWF</span>
                    </div>
                    {insuranceProvider !== 'None' && (
                      <>
                        <div className="flex justify-between items-center text-emerald-800">
                          <span>Insurance Coverage Contribution ({costCalculations.percent}%):</span>
                          <span>- {costCalculations.insurancePays} RWF</span>
                        </div>
                        <div className="h-px bg-gray-250 my-1" />
                      </>
                    )}
                    <div className="flex justify-between items-center text-sm font-black pt-1">
                      <span className="text-gray-900">Estimated Patient Co-pay:</span>
                      <span className="text-health-primary">{costCalculations.patientPays} RWF</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Prescription Upload */}
              {resStep === 3 && (
                <PrescriptionUploader
                  uploadedFile={uploadedFile}
                  filePreviewUrl={filePreviewUrl}
                  onFileChange={handleFileUpload}
                  onRemove={handleRemoveFile}
                  isRequired={selectedMedicine.prescriptionRequired}
                  uploadProgress={uploadProgress}
                  error={uploaderError}
                />
              )}

              {/* Step 4: Summary checkout review */}
              {resStep === 4 && (
                <div className="space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">Confirm Details</span>
                  
                  <div className="border border-gray-250 rounded-xl divide-y divide-gray-150 text-xs bg-white">
                    <div className="p-3 flex justify-between">
                      <span className="text-gray-400 font-semibold">Medicine:</span>
                      <span className="font-bold text-gray-900">{selectedMedicine.name}</span>
                    </div>
                    <div className="p-3 flex justify-between">
                      <span className="text-gray-400 font-semibold">Quantity:</span>
                      <span className="font-bold text-gray-900">{quantity} tablets</span>
                    </div>
                    <div className="p-3 flex justify-between">
                      <span className="text-gray-400 font-semibold">Pharmacy:</span>
                      <span className="font-bold text-gray-900">{selectedPharmacy.pharmacyName}</span>
                    </div>
                    <div className="p-3 flex justify-between">
                      <span className="text-gray-400 font-semibold">Insurance scheme:</span>
                      <span className="font-bold text-gray-900">{insuranceProvider !== 'None' ? `${insuranceProvider} (${insuranceId})` : 'Private Patient'}</span>
                    </div>
                    {uploadedFile && (
                      <div className="p-3 flex justify-between">
                        <span className="text-gray-400 font-semibold">Prescription:</span>
                        <span className="font-bold text-gray-900 truncate max-w-[200px]">{uploadedFile.name}</span>
                      </div>
                    )}
                    <div className="p-3 flex justify-between text-sm font-black bg-gray-50/50">
                      <span className="text-gray-900">Total Patient Co-pay:</span>
                      <span className="text-health-primary">{costCalculations.patientPays} RWF</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Checkout reservation success page */}
              {resStep === 5 && createdReservation && (
                <div className="space-y-5 text-center py-4">
                  <div className="w-14 h-14 bg-emerald-50 text-health-primary rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-gray-400 uppercase font-black tracking-widest">Reservation Created</span>
                    <h4 className="text-xl font-black text-gray-900">{createdReservation.id}</h4>
                  </div>
                  
                  <div className="border border-gray-250 rounded-xl p-4 bg-gray-50/50 max-w-sm mx-auto text-xs space-y-2">
                    <div className="flex justify-between items-center text-gray-700">
                      <span>Store Code:</span>
                      <span className="font-mono font-black text-emerald-800 text-sm">{createdReservation.pickupCode}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-700">
                      <span>Store Name:</span>
                      <span className="font-bold text-gray-900">{createdReservation.pharmacyName}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-700">
                      <span>Patient Pays:</span>
                      <span className="font-bold text-gray-955 text-sm">{createdReservation.patientPays} RWF</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-700">
                      <span>Pickup Deadline:</span>
                      <span className="font-bold text-gray-900">{createdReservation.pickupDeadline}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-400 leading-normal max-w-xs mx-auto">
                    Show your reservation code **{createdReservation.id}** and the pickup code **{createdReservation.pickupCode}** at the counter. Keep your physical prescription with you.
                  </p>
                </div>
              )}

            </div>

            {/* Stepper wizard navigation actions */}
            <div className="bg-gray-50 border-t border-gray-150 px-6 py-4 flex items-center justify-end space-x-2 flex-shrink-0">
              {resStep < 5 ? (
                <>
                  {resStep > 1 && (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="border border-gray-300 hover:bg-gray-50 text-gray-600 px-4 py-2 rounded-lg text-xs font-bold transition-colors focus:outline-none flex items-center"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                      <span>Back</span>
                    </button>
                  )}
                  {resStep < 4 ? (
                    <button
                      type="button"
                      disabled={
                        (resStep === 2 && insuranceProvider !== 'None' && !insuranceId.trim()) ||
                        (resStep === 3 && selectedMedicine.prescriptionRequired && !uploadedFile)
                      }
                      onClick={nextStep}
                      className="bg-health-primary hover:bg-health-secondary text-white px-5 py-2 rounded-lg text-xs font-bold transition-colors focus:outline-none flex items-center disabled:opacity-50"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={resLoading}
                      onClick={handleConfirmReservation}
                      className="bg-health-primary hover:bg-health-secondary text-white px-5 py-2 rounded-lg text-xs font-bold transition-colors focus:outline-none flex items-center justify-center"
                    >
                      {resLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin mr-1.5" />
                          <span>Reserving...</span>
                        </>
                      ) : (
                        <span>Confirm Reservation</span>
                      )}
                    </button>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  onClick={resetResWizard}
                  className="bg-health-primary hover:bg-health-secondary text-white px-5 py-2 rounded-lg text-xs font-bold transition-colors focus:outline-none"
                >
                  Return to Dashboard
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
