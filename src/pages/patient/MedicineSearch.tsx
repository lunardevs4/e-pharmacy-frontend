import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Map,
  List,
  Star,
  MapPin,
  X,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  Navigation,
} from 'lucide-react'
import { useMedicineSearch } from '@/hooks/useMedicineSearch'
import { Medicine, PharmacyStock, Reservation } from '@/types'
import { MedicineApi } from '@/services/medicine-api'
import { insuranceApi } from '@/services/insurance-api'
import MedicineSearchBar from '@/components/patient/MedicineSearchBar'
import MedicineCard from '@/components/patient/MedicineCard'
import PharmacyAvailabilityTable from '@/components/patient/PharmacyAvailabilityTable'
import PrescriptionUploader from '@/components/patient/PrescriptionUploader'
import { CardSkeleton } from '@/components/patient/LoadingSkeleton'
import { useAuthStore } from '@/store/authStore'
import { INSURANCE_COVERAGE_RATES } from '@/config/insurance-rates'
import {
  getPharmacyInsurancePrice,
  getInsuranceTariff,
  calculatePatientCopay
} from '@/utils/insuranceCalculator'

export default function MedicineSearch() {
  const location = useLocation()
  const initialQuery = (location.state as any)?.initialQuery || ''

  const {
    results,
    loading,
    error,
    executeSearch,
    getMedicineAvailability,
    createReservation,
    uploadPrescription,
    createPrescription,
  } = useMedicineSearch()

  const { user } = useAuthStore()
  const [selectedInsurance, setSelectedInsurance] = useState<string>(user?.insuranceProvider || 'None')
  const [providers, setProviders] = useState<any[]>([])
  const [providersLoading, setProvidersLoading] = useState(true)

  useEffect(() => {
    setProvidersLoading(true)
    insuranceApi.getProviders()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProviders(data.filter((p: any) => p.isActive !== false))
        }
      })
      .catch((err) => console.error('Error fetching registered insurance providers in search:', err))
      .finally(() => setProvidersLoading(false))
  }, [])

  useEffect(() => {
    setSelectedInsurance(user?.insuranceProvider || 'None')
  }, [user?.insuranceProvider])

  const [query, setQuery] = useState(initialQuery)
  const [category, setCategory] = useState('')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [sortBy, setSortBy] = useState('proximity')
  const [hasSearched, setHasSearched] = useState(!!initialQuery)

  const [bookmarkedMedicines, setBookmarkedMedicines] = useState<string[]>([])
  const [bookmarkedPharmacies, setBookmarkedPharmacies] = useState<string[]>([])
  const [searchHistory, setSearchHistory] = useState<any[]>([])
  const [inputFocused, setInputFocused] = useState(false)

  useEffect(() => {
    MedicineApi.getFavouriteMedicines().then(setBookmarkedMedicines)
    MedicineApi.getFavouritePharmacies().then(setBookmarkedPharmacies)
    MedicineApi.getSearchHistory().then(setSearchHistory)
  }, [])

  useEffect(() => {
    if (initialQuery) {
      executeSearch(initialQuery, '', false)
      MedicineApi.saveSearchHistory(initialQuery, '')
    }
  }, [initialQuery, executeSearch])

  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null)
  const [stockList, setStockList] = useState<PharmacyStock[]>([])
  const [stockLoading, setStockLoading] = useState(false)

  const [mobileView, setMobileView] = useState<'list' | 'map'>('list')

  const [showResModal, setShowResModal] = useState(false)
  const [resStep, setResStep] = useState<1 | 2 | 3 | 4 | 5>(1)
  const [selectedPharmacy, setSelectedPharmacy] = useState<PharmacyStock | null>(null)
  const [quantity, setQuantity] = useState(1)

  const [resLoading, setResLoading] = useState(false)
  const [createdReservation, setCreatedReservation] = useState<Reservation | null>(null)
  const [uploadedPrescription, setUploadedPrescription] = useState<File | null>(null)
  const [prescriptionPreviewUrl, setPrescriptionPreviewUrl] = useState<string | null>(null)
  const [prescriptionUploadProgress, setPrescriptionUploadProgress] = useState(0)
  const [prescriptionError, setPrescriptionError] = useState<string | null>(null)

  const handlePrescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      setPrescriptionError('Please upload a PDF, JPG, or PNG prescription.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setPrescriptionError('Prescription files must be smaller than 10MB.')
      return
    }

    if (prescriptionPreviewUrl) URL.revokeObjectURL(prescriptionPreviewUrl)
    setUploadedPrescription(file)
    setPrescriptionPreviewUrl(file.type.startsWith('image/') ? URL.createObjectURL(file) : null)
    setPrescriptionUploadProgress(0)
    setPrescriptionError(null)
  }

  const removePrescription = () => {
    if (prescriptionPreviewUrl) URL.revokeObjectURL(prescriptionPreviewUrl)
    setUploadedPrescription(null)
    setPrescriptionPreviewUrl(null)
    setPrescriptionUploadProgress(0)
    setPrescriptionError(null)
  }

  const getUserLocation = () => {
    setLocationLoading(true)
    setLocationError(null)
    
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser')
      setLocationLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ lat: latitude, lng: longitude })
        setMapQuery(`${latitude},${longitude}`)
        setMapZoom(15)
        setLocationLoading(false)
      },
      (error) => {
        setLocationError('Unable to retrieve your location. Using default location.')
        setLocationLoading(false)
        setUserLocation({ lat: -1.9441, lng: 30.0619 })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    getUserLocation()
    
    setSelectedMedicine(null)
    setStockList([])
    executeSearch(query, category, inStockOnly)
    if (query.trim()) {
      MedicineApi.saveSearchHistory(query, category)
      MedicineApi.getSearchHistory().then(setSearchHistory)
    }
    setHasSearched(true)
  }

  const handlePopularSearch = (term: string) => {
    setQuery(term)
    setSelectedMedicine(null)
    setStockList([])
    executeSearch(term, category, inStockOnly)
    MedicineApi.saveSearchHistory(term, category)
    MedicineApi.getSearchHistory().then(setSearchHistory)
    setHasSearched(true)
  }

  const handleToggleBookmarkMedicine = async (medId: string) => {
    const isFav = bookmarkedMedicines.includes(medId)
    const nextStatus = !isFav
    try {
      await MedicineApi.saveFavouriteMedicine(medId, nextStatus)
      setBookmarkedMedicines((prev) =>
        nextStatus ? [...prev, medId] : prev.filter((id) => id !== medId),
      )
    } catch (err) {
      console.error(err)
    }
  }

  const handleToggleBookmarkPharmacy = async (pharmId: string) => {
    const isFav = bookmarkedPharmacies.includes(pharmId)
    const nextStatus = !isFav
    try {
      await MedicineApi.saveFavouritePharmacy(pharmId, nextStatus)
      setBookmarkedPharmacies((prev) =>
        nextStatus ? [...prev, pharmId] : prev.filter((id) => id !== pharmId),
      )
    } catch (err) {
      console.error(err)
    }
  }

  const handleViewAvailability = async (med: Medicine, insuranceOverride?: string) => {
    setSelectedMedicine(med)
    setStockLoading(true)
    
    getUserLocation()
    
    try {
      const insurance = insuranceOverride ?? selectedInsurance
      const matchedProvider = providers.find(p => p.code === insurance || p.name === insurance)
      const insuranceId = insurance !== 'None' ? (matchedProvider?.id || null) : null
      
      const list = await getMedicineAvailability(med.id, insuranceId)
      
      if (userLocation) {
        const listWithDistances = list.map(pharmacy => {
          const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            pharmacy.lat,
            pharmacy.lng
          )
          return { ...pharmacy, distance }
        })
        setStockList(listWithDistances)
      } else {
        setStockList(list)
      }
      
      setMobileView('list')
    } catch (err) {
      console.error(err)
    } finally {
      setStockLoading(false)
    }
  }

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c // Distance in km
  }

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

  const handleConfirmReservation = async () => {
    if (!selectedMedicine || !selectedPharmacy) return
    setResLoading(true)
    setPrescriptionError(null)
    try {
      if (selectedMedicine.prescriptionRequired && !uploadedPrescription) {
        setPrescriptionError('Please upload a prescription before continuing.')
        setResLoading(false)
        return
      }

      if (selectedMedicine.prescriptionRequired && uploadedPrescription) {
        const uploaded = await uploadPrescription(uploadedPrescription, setPrescriptionUploadProgress)
        await createPrescription({
          documentUrl: uploaded.fileUrl,
          pharmacyId: selectedPharmacy.pharmacyId,
          medicineId: selectedMedicine.id,
          quantity,
          dosage: selectedMedicine.dosage,
          notes: `Prescription uploaded during reservation for ${selectedMedicine.name}`,
        })
      }

      const matchedProvider = providers.find(p => p.code === selectedInsurance || p.name === selectedInsurance)
      const insuranceId = matchedProvider?.id || null
      const backendCoverage = selectedPharmacy.insuranceCoverage as any
      const isAccepted = Boolean(
        insuranceId && (
          backendCoverage?.hasAgreement ||
          selectedPharmacy.insuranceAccepted.includes(selectedInsurance)
        ),
      )

      const priceInfo = getPharmacyInsurancePrice(selectedPharmacy.pharmacyId, selectedMedicine.id, insuranceId, selectedPharmacy.price)
      const resolvedPrice = priceInfo.price

      const tariff = insuranceId ? getInsuranceTariff(insuranceId, selectedMedicine.id) : null

      const copay = calculatePatientCopay(resolvedPrice, tariff)

      const hasCoverage = isAccepted && (backendCoverage?.isCovered ?? copay.isCovered)
      const totalCost = resolvedPrice * quantity
      let insurancePays = 0
      let patientPays = totalCost

      if (hasCoverage) {
        insurancePays = Math.round(
          (backendCoverage?.insurancePays ?? copay.insurancePays) * quantity,
        )
        patientPays = Math.round(
          (backendCoverage?.patientPays ?? copay.patientPays) * quantity,
        )
      }

      const res = await createReservation({
        medicineId: selectedMedicine.id,
        pharmacyId: selectedPharmacy.pharmacyId,
        quantity,
      })
      setCreatedReservation({ ...res, insuranceProvider: selectedInsurance, insurancePays, patientPays })

      setStockList((prev) =>
        prev.map((s) =>
          s.pharmacyId === selectedPharmacy.pharmacyId
            ? { ...s, stock: Math.max(0, s.stock - quantity) }
            : s,
        ),
      )

      setResStep(5)
    } catch (err: any) {
      console.error(err)
      setPrescriptionError(err.message || 'Unable to upload the prescription and complete the reservation.')
    } finally {
      setResLoading(false)
    }
  }

  const resetResWizard = () => {
    setShowResModal(false)
    setResStep(1)
    setSelectedPharmacy(null)
    setQuantity(1)
    setCreatedReservation(null)
    removePrescription()
  }

  const [mapQuery, setMapQuery] = useState('Kigali, Rwanda')
  const [mapZoom, setMapZoom] = useState(13)
  
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

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
    <div className="flex flex-col relative overflow-visible" style={{ height: 'calc(100dvh - 4rem)' }}>
      {/* ── Search Bar Header ── */}
      <div className="relative z-10 flex-shrink-0 bg-white border-b border-gray-200 py-3 px-4 sm:px-6">
        <form
          onSubmit={handleSearch}
          className="max-w-5xl mx-auto flex flex-col gap-3"
        >
          {/* Title row */}
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-health-primary flex-shrink-0" />
            <h1 className="text-sm sm:text-base md:text-lg font-black text-gray-900 leading-none">
              Find Medicines Near You
            </h1>
            {locationLoading && (
              <span className="text-[10px] text-gray-400 flex items-center space-x-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Getting location...</span>
              </span>
            )}
            {userLocation && !locationLoading && (
              <span className="text-[10px] text-emerald-600 font-medium">✓ Location tracked</span>
            )}
            {locationError && (
              <span className="text-[10px] text-amber-600 font-medium">{locationError}</span>
            )}
          </div>

          {/* Inputs row */}
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            {/* Search input with autocomplete */}
            <div className="relative flex-grow min-w-0">
              <input
                type="text"
                placeholder="Search trade brand or generic molecule name..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setTimeout(() => setInputFocused(false), 200)}
                className="w-full pl-4 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white text-gray-950 text-xs font-semibold"
              />
              {inputFocused && searchHistory.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-250 rounded-lg shadow-xl z-[60] max-h-48 overflow-y-auto text-xs font-bold text-gray-700 divide-y divide-gray-100">
                  <div className="p-2 bg-gray-55/30 text-[9px] uppercase tracking-wider text-gray-400">
                    Recent Searches
                  </div>
                  {searchHistory.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      onMouseDown={() => {
                        setQuery(item.query)
                        setSelectedMedicine(null)
                        setStockList([])
                        executeSearch(item.query, item.category, inStockOnly)
                        setHasSearched(true)
                      }}
                      className="p-2.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between text-gray-900"
                    >
                      <span>{item.query}</span>
                      <span className="text-[9px] text-gray-400 font-mono font-medium">
                        {item.category}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Category + Location + Search in one flex row on mobile */}
            <div className="flex gap-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex-1 sm:flex-none bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-2.5 text-xs text-gray-700 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">All Categories</option>
                <option value="Analgesics">Analgesics</option>
                <option value="Antibiotics">Antibiotics</option>
                <option value="Antidiabetics">Antidiabetics</option>
                <option value="Antihypertensives">Antihypertensives</option>
              </select>

              <button
                type="button"
                onClick={getUserLocation}
                disabled={locationLoading}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-3 py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center space-x-1.5 flex-shrink-0"
                title="Get my current location"
              >
                {locationLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Navigation className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">My Location</span>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="bg-health-primary hover:bg-health-secondary text-white font-bold px-4 sm:px-5 py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center space-x-2 flex-shrink-0"
              >
                {loading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>Search</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="flex-1 min-h-0 flex relative overflow-hidden">
        <div
          className={`w-full lg:w-1/2 flex flex-col min-h-0 bg-gray-50 border-r border-gray-200 overflow-y-auto p-4 sm:p-5 space-y-5 ${
            mobileView === 'map' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {!hasSearched && (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center space-y-4 shadow-xs">
              <span className="inline-block p-3 bg-emerald-50 text-health-primary rounded-full">
                <MapPin className="w-6 h-6" />
              </span>
              <div className="space-y-1">
                <h3 className="font-black text-gray-900 text-base">
                  Enter a drug name to check inventory
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Type a medicine brand name or category. We will pinpoint pharmacies near your
                  coordinates with live stock quantities.
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

          {hasSearched && !selectedMedicine && (
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  National Search Matches
                </h2>
                <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  {results.length} Indexed
                </span>
              </div>

              {results.length === 0 && !loading && (
                <div className="bg-white border rounded-xl p-10 text-center text-gray-400 text-xs">
                  No medicines found matching the search filters.
                </div>
              )}

              <div className="space-y-4">
                {loading ? (
                  <>
                    <CardSkeleton />
                    <CardSkeleton />
                    <CardSkeleton />
                  </>
                ) : (
                  results.map((med) => (
                    <MedicineCard
                      key={med.id}
                      medicine={med}
                      onViewAvailability={handleViewAvailability}
                      onReserve={handleViewAvailability}
                      isBookmarked={bookmarkedMedicines.includes(med.id)}
                      onToggleBookmark={handleToggleBookmarkMedicine}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {selectedMedicine && (
            <div className="space-y-5 animate-fadeIn">
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

              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <h2 className="font-black text-gray-900 text-lg">{selectedMedicine.name}</h2>
                  {selectedMedicine.prescriptionRequired && (
                    <span className="text-[9px] font-black text-red-755 bg-red-50 border border-red-250 px-1.5 py-0.5 rounded uppercase">
                      Prescription Required
                    </span>
                  )}
                </div>

                <div className="text-xs space-y-2.5 text-gray-700 pt-3 border-t border-gray-150">
                  {selectedMedicine.prescriptionRequired && (
                    <div className="bg-amber-50 border border-amber-250 text-amber-900 rounded-lg p-3 text-[11px] font-bold mt-1 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                      <span>
                        Always use prescription medicines strictly according to professional medical advice. Follow your physician's prescribed directions carefully.
                      </span>
                    </div>
                  )}
                  {selectedMedicine.storage && selectedMedicine.storage !== 'Not provided' && (
                    <p>
                      <span className="font-bold text-gray-900">Storage Conditions:</span>{' '}
                      {selectedMedicine.storage}
                    </p>
                  )}
                  {selectedMedicine.minTemperature != null && (
                  <p>
                    <span className="font-bold text-gray-900">Minimum Temperature:</span>{' '}
                    {selectedMedicine.minTemperature != null ? `${selectedMedicine.minTemperature}°C` : 'Not provided'}
                  </p>
                  )}
                  {selectedMedicine.maxTemperature != null && (
                  <p>
                    <span className="font-bold text-gray-900">Maximum Temperature:</span>{' '}
                    {selectedMedicine.maxTemperature != null ? `${selectedMedicine.maxTemperature}°C` : 'Not provided'}
                  </p>
                  )}
                </div>
              </div>

              {stockLoading ? (
                <div className="text-center py-10 text-xs text-gray-400 flex items-center justify-center space-x-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
                  <span>Loading inventory details...</span>
                </div>
              ) : sortedPharmacies.length === 0 ? (
                <div className="text-center py-16 text-gray-400 space-y-4 border border-dashed rounded-xl">
                  <MapPin className="w-12 h-12 text-gray-200 mx-auto" />
                  <div>
                    <p className="font-bold text-gray-700">No pharmacies found</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {selectedMedicine.name} is not currently available at any pharmacies near your location.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMedicine(null)
                      setStockList([])
                    }}
                    className="text-health-primary font-bold hover:underline text-xs"
                  >
                    Search for a different medicine
                  </button>
                </div>
              ) : (
                <PharmacyAvailabilityTable
                  pharmacies={sortedPharmacies}
                  medicineId={selectedMedicine.id}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  onReserve={(pharm) => {
                    setSelectedPharmacy(pharm)
                    setShowResModal(true)
                  }}
                  onSelectPharmacy={handleSelectPharmacyMap}
                  bookmarkedPharmacies={bookmarkedPharmacies}
                  onToggleBookmarkPharmacy={handleToggleBookmarkPharmacy}
                  selectedInsurance={selectedInsurance}
                  onInsuranceChange={(insurance) => {
                    setSelectedInsurance(insurance)
                    void handleViewAvailability(selectedMedicine, insurance)
                  }}
                  providers={providers}
                />
              )}
            </div>
          )}
        </div>

        <div
          className={`w-full lg:w-1/2 min-h-0 relative ${
            mobileView === 'map' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <iframe
            title="Google Map Locator"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&hl=en&z=${mapZoom}&t=&ie=UTF8&iwloc=&output=embed`}
            className="w-full h-full min-h-[300px] lg:min-h-full border-0 shadow-sm"
            allowFullScreen
            loading="lazy"
          />
        </div>
      </div>

      <div className="lg:hidden absolute bottom-20 right-4 z-30 safe-area-bottom">
        <button
          type="button"
          onClick={() => setMobileView((prev) => (prev === 'list' ? 'map' : 'list'))}
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

      {showResModal && selectedMedicine && selectedPharmacy && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center px-0 sm:px-4 py-0 sm:py-6">
          <div
            onClick={resetResWizard}
            className="portal-modal-backdrop absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
          />

          <div className="portal-modal-panel relative w-full max-w-lg bg-white rounded-2xl border border-gray-255 shadow-2xl overflow-hidden z-[9999] flex flex-col max-h-[90vh]">
            <div className="bg-emerald-950 text-white px-6 py-4 flex items-center justify-between border-b border-emerald-900 flex-shrink-0">
              <div>
                <h3 className="font-black text-sm">Reserve Medication</h3>
                <p className="text-xs text-emerald-300 font-medium">{selectedMedicine.name}</p>
              </div>
              <button
                onClick={resetResWizard}
                className="text-emerald-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {resStep < 5 && (
              <div className="bg-gray-50 border-b border-gray-150 px-6 py-3 text-xs font-bold text-health-primary flex-shrink-0">
                Select quantity
              </div>
            )}

            <div className="flex-grow p-6 overflow-y-auto min-h-[220px]">
              {resStep === 1 && (
                <div className="space-y-5">
                  <div className="bg-gray-50 border rounded-xl p-4 space-y-2 text-xs">
                    <span className="text-[10px] font-bold text-gray-450 block uppercase">
                      Selection Details
                    </span>
                    <div className="flex justify-between items-center text-gray-700">
                      <span>Medicine:</span>
                      <span className="font-bold text-gray-900">{selectedMedicine.name}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-700">
                      <span>Store location:</span>
                      <span className="font-bold text-gray-900">
                        {selectedPharmacy.pharmacyName}
                      </span>
                    </div>
                    {(
                      (
                        selectedPharmacy.insuranceCoverage?.hasAgreement &&
                        selectedPharmacy.insuranceCoverage?.isCovered
                      ) || selectedPharmacy.insuranceAccepted.includes(selectedInsurance)
                    ) && selectedInsurance !== 'None' ? (
                      <>
                        {(() => {
                          const matchedProvider = providers.find(p => p.code === selectedInsurance || p.name === selectedInsurance)
                          const coverageRate = selectedPharmacy.insuranceCoverage?.coveragePercentage
                            ? selectedPharmacy.insuranceCoverage.coveragePercentage / 100
                            : matchedProvider 
                            ? (matchedProvider.defaultCoveragePercentage > 1 ? matchedProvider.defaultCoveragePercentage / 100 : matchedProvider.defaultCoveragePercentage)
                            : (INSURANCE_COVERAGE_RATES[selectedInsurance] || 0)
                          const displayCoverage = Math.round(coverageRate * 100)
                          const insuranceAmount = Math.round((selectedPharmacy.insuranceCoverage?.insurancePays ?? selectedPharmacy.price * coverageRate) * quantity)
                          const patientAmount = Math.round((selectedPharmacy.insuranceCoverage?.patientPays ?? selectedPharmacy.price - selectedPharmacy.price * coverageRate) * quantity)

                          return (
                            <>
                              <div className="flex justify-between items-center text-gray-700">
                                <span>Your price per unit:</span>
                                <span className="font-bold text-gray-900">{Math.round(patientAmount / quantity)} RWF</span>
                              </div>
                              <div className="flex justify-between items-center text-emerald-800 font-semibold">
                                <span>Insurance Pays ({selectedInsurance} - {displayCoverage}%):</span>
                                <span>-{insuranceAmount} RWF</span>
                              </div>
                              <div className="flex justify-between items-center text-gray-955 font-black pt-1.5 border-t border-dashed border-gray-200">
                                <span>Total you pay:</span>
                                <span className="text-health-primary text-sm">
                                  {patientAmount} RWF
                                </span>
                              </div>
                            </>
                          )
                        })()}
                      </>
                    ) : (
                      <div className="flex justify-between items-center text-gray-955 font-black pt-1.5 border-t border-dashed border-gray-200">
                        <span>Your total to pay:</span>
                        <span className="text-health-primary text-sm">{selectedPharmacy.price * quantity} RWF</span>
                      </div>
                    )}
                  </div>

                  <div className="text-center space-y-3.5 pt-2">
                    <span className="text-xs font-bold text-gray-500 block uppercase">
                      Select Quantity (tablets)
                    </span>
                    <div className="flex items-center justify-center space-x-4">
                      <button
                        type="button"
                        disabled={quantity <= 1}
                        onClick={() => setQuantity((prev) => prev - 1)}
                        className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 text-gray-600 font-bold"
                      >
                        -
                      </button>
                      <span className="text-2xl font-black text-gray-900 w-12">{quantity}</span>
                      <button
                        type="button"
                        disabled={quantity >= selectedPharmacy.stock}
                        onClick={() => setQuantity((prev) => prev + 1)}
                        className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 text-gray-600 font-bold"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 font-bold">
                      Total stock available: {selectedPharmacy.stock} tablets
                    </p>
                  </div>

                  {selectedMedicine.prescriptionRequired && (
                    <div className="border-t border-gray-150 pt-5">
                      <PrescriptionUploader
                        uploadedFile={uploadedPrescription}
                        filePreviewUrl={prescriptionPreviewUrl}
                        onFileChange={handlePrescriptionChange}
                        onRemove={removePrescription}
                        isRequired
                        uploadProgress={prescriptionUploadProgress}
                        error={prescriptionError}
                      />
                    </div>
                  )}
                </div>
              )}

              {resStep === 5 && createdReservation && (
                <div className="space-y-5 text-center py-4">
                  <div className="w-14 h-14 bg-emerald-50 text-health-primary rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-gray-400 uppercase font-black tracking-widest">
                      Reservation Created
                    </span>
                    <h4 className="text-xl font-black text-gray-900">{createdReservation.id}</h4>
                  </div>

                  <div className="border border-gray-250 rounded-xl p-4 bg-gray-50/50 max-w-sm mx-auto text-xs space-y-2">
                    <div className="flex justify-between items-center text-gray-700">
                      <span>Store Name:</span>
                      <span className="font-bold text-gray-900">
                        {createdReservation.pharmacyName}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-gray-700">
                      <span>Pickup Deadline:</span>
                      <span className="font-bold text-gray-900">
                        {createdReservation.pickupDeadline}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-emerald-800 font-black pt-2 border-t border-gray-200">
                      <span>Total you pay:</span>
                      <span>{createdReservation.patientPays.toLocaleString()} RWF</span>
                    </div>
                    {createdReservation.insuranceProvider && createdReservation.insuranceProvider !== 'None' && (
                      <div className="text-[10px] text-gray-500">
                        {createdReservation.insuranceProvider} coverage applied
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-gray-400 leading-normal max-w-xs mx-auto">
                    Keep your reservation reference and collect it from the selected pharmacy.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 border-t border-gray-150 px-6 py-4 flex items-center justify-end space-x-2 flex-shrink-0">
              {resStep < 5 ? (
                <button
                  type="button"
                  disabled={resLoading}
                  onClick={handleConfirmReservation}
                  className="bg-health-primary hover:bg-health-secondary text-white px-5 py-2 rounded-lg text-xs font-bold transition-colors focus:outline-none flex items-center justify-center disabled:opacity-50"
                >
                  {resLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin mr-1.5" />
                      <span>Reserving...</span>
                    </>
                  ) : (
                    <span>Reserve Medicine</span>
                  )}
                </button>
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
