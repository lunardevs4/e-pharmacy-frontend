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
import MedicineSearchBar from '@/components/patient/MedicineSearchBar'
import MedicineCard from '@/components/patient/MedicineCard'
import PharmacyAvailabilityTable from '@/components/patient/PharmacyAvailabilityTable'
import { CardSkeleton } from '@/components/patient/LoadingSkeleton'

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
  } = useMedicineSearch()

  // Search filter states
  const [query, setQuery] = useState(initialQuery)
  const [category, setCategory] = useState('')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [sortBy, setSortBy] = useState('proximity')
  const [hasSearched, setHasSearched] = useState(!!initialQuery)

  // Bookmarking and search history states
  const [bookmarkedMedicines, setBookmarkedMedicines] = useState<string[]>([])
  const [bookmarkedPharmacies, setBookmarkedPharmacies] = useState<string[]>([])
  const [searchHistory, setSearchHistory] = useState<any[]>([])
  const [inputFocused, setInputFocused] = useState(false)

  // Load bookmarks and history on mount
  useEffect(() => {
    MedicineApi.getFavouriteMedicines().then(setBookmarkedMedicines)
    MedicineApi.getFavouritePharmacies().then(setBookmarkedPharmacies)
    MedicineApi.getSearchHistory().then(setSearchHistory)
  }, [])

  // Trigger search immediately if quick search initialQuery exists
  useEffect(() => {
    if (initialQuery) {
      executeSearch(initialQuery, '', false)
      MedicineApi.saveSearchHistory(initialQuery, '')
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

  const [resLoading, setResLoading] = useState(false)
  const [createdReservation, setCreatedReservation] = useState<Reservation | null>(null)

  // Get user's current location
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
        // Default to Kigali
        setUserLocation({ lat: -1.9441, lng: 30.0619 })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  // Execute registry search
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    // Get user location when searching
    getUserLocation()
    
    setSelectedMedicine(null)
    setStockList([])
    executeSearch(query, category, inStockOnly)
    if (query.trim()) {
      MedicineApi.saveSearchHistory(query, category)
      // Refresh search history cache
      MedicineApi.getSearchHistory().then(setSearchHistory)
    }
    setHasSearched(true)
  }

  // popular tag click trigger
  const handlePopularSearch = (term: string) => {
    setQuery(term)
    setSelectedMedicine(null)
    setStockList([])
    executeSearch(term, category, inStockOnly)
    MedicineApi.saveSearchHistory(term, category)
    MedicineApi.getSearchHistory().then(setSearchHistory)
    setHasSearched(true)
  }

  // Bookmarks toggles
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

  // Load pharmacy availability details
  const handleViewAvailability = async (med: Medicine) => {
    setSelectedMedicine(med)
    setStockLoading(true)
    setExpandedClinical(false)
    
    // Get user location when viewing availability
    getUserLocation()
    
    try {
      const list = await getMedicineAvailability(med.id)
      
      // Calculate distances from user location
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

  // Calculate distance between two coordinates (Haversine formula)
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

  // Submit checkout reservation
  const handleConfirmReservation = async () => {
    if (!selectedMedicine || !selectedPharmacy) return
    setResLoading(true)
    try {
      const res = await createReservation({
        medicineId: selectedMedicine.id,
        pharmacyId: selectedPharmacy.pharmacyId,
        quantity,
      })
      setCreatedReservation(res)

      setStockList((prev) =>
        prev.map((s) =>
          s.pharmacyId === selectedPharmacy.pharmacyId
            ? { ...s, stock: Math.max(0, s.stock - quantity) }
            : s,
        ),
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
    setCreatedReservation(null)
  }

  // Google Maps state variables
  const [mapQuery, setMapQuery] = useState('Kigali, Rwanda')
  const [mapZoom, setMapZoom] = useState(13)
  
  // Location tracking state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

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
    <div className="h-[calc(100vh-6rem)] flex flex-col relative overflow-visible">
      {/* Search Header Console */}
      <div className="relative z-50 flex-shrink-0 bg-white border-b border-gray-200 py-4 px-6">
        <form
          onSubmit={handleSearch}
          className="max-w-5xl mx-auto flex flex-col md:flex-row gap-3 items-center justify-between"
        >
          <div className="flex items-center space-x-2 flex-shrink-0">
            <MapPin className="w-5 h-5 text-health-primary" />
            <h1 className="text-lg font-black text-gray-900 leading-none">
              Find Medicines Near You
            </h1>
            {locationLoading && (
              <span className="text-[10px] text-gray-400 flex items-center space-x-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Getting location...</span>
              </span>
            )}
            {userLocation && !locationLoading && (
              <span className="text-[10px] text-emerald-600 font-medium">
                Location tracked
              </span>
            )}
            {locationError && (
              <span className="text-[10px] text-amber-600 font-medium">
                {locationError}
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto flex-grow max-w-2xl relative">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search trade brand or generic molecule name..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setTimeout(() => setInputFocused(false), 200)}
                className="w-full pl-4 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white text-gray-950 text-xs font-semibold"
              />
              {/* Recent searches dropdown list */}
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
              type="button"
              onClick={getUserLocation}
              disabled={locationLoading}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-center space-x-2"
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
              className="bg-health-primary hover:bg-health-secondary text-white font-bold px-5 py-2 rounded-lg text-xs transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <span>Search Registry</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Split-Screen layout map hero */}
      <div className="flex-grow flex relative overflow-hidden">
        {/* Left Panel: Search list results and clinical guides */}
        <div
          className={`w-full lg:w-1/2 flex flex-col h-full bg-gray-50 border-r border-gray-200 overflow-y-auto p-4 sm:p-6 space-y-6 ${
            mobileView === 'map' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Default initial message (before user queries) */}
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

          {/* Search Result Matches cards */}
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
                    <span className="text-[9px] font-black text-red-755 bg-red-50 border border-red-250 px-1.5 py-0.5 rounded uppercase">
                      Prescription Required
                    </span>
                  )}
                </div>

                {/* Patient Clinical Info */}
                <div className="text-xs space-y-2.5 text-gray-700 pt-3 border-t border-gray-150">
                  <p>
                    <span className="font-bold text-gray-900">Clinical Uses:</span>{' '}
                    {selectedMedicine.uses}
                  </p>
                  <p>
                    <span className="font-bold text-gray-900">Recommended Dosage:</span>{' '}
                    {selectedMedicine.dosage}
                  </p>
                  <p>
                    <span className="font-bold text-gray-900">Warnings &amp; Safety:</span>{' '}
                    <span className="text-rose-700">{selectedMedicine.warnings}</span>
                  </p>

                  <button
                    type="button"
                    onClick={() => setExpandedClinical(!expandedClinical)}
                    className="text-health-primary font-bold hover:underline"
                  >
                    {expandedClinical ? 'Show Less' : 'View Clinical Contraindications & Storage'}
                  </button>

                  {expandedClinical && (
                    <div className="space-y-2 pt-2 border-t border-dashed border-gray-250 animate-fadeIn">
                      <p>
                        <span className="font-bold text-gray-900">Common Side Effects:</span>{' '}
                        {selectedMedicine.sideEffects}
                      </p>
                      <p>
                        <span className="font-bold text-gray-900">Drug Interactions:</span>{' '}
                        {selectedMedicine.interactions}
                      </p>
                      <p>
                        <span className="font-bold text-gray-900">Storage Requirements:</span>{' '}
                        {selectedMedicine.storage}
                      </p>
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
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  onReserve={(pharm) => {
                    setSelectedPharmacy(pharm)
                    setShowResModal(true)
                  }}
                  onSelectPharmacy={handleSelectPharmacyMap}
                  bookmarkedPharmacies={bookmarkedPharmacies}
                  onToggleBookmarkPharmacy={handleToggleBookmarkPharmacy}
                />
              )}
            </div>
          )}
        </div>

        {/* Right Panel: Permanent Map View */}
        <div
          className={`w-full lg:w-1/2 h-full relative ${
            mobileView === 'map' ? 'flex' : 'hidden lg:flex'
          }`}
        >
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

      {/* 4-Step Reservation Wizard Stepper Modal */}
      {showResModal && selectedMedicine && selectedPharmacy && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6">
          <div
            onClick={resetResWizard}
            className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-lg bg-white rounded-2xl border border-gray-255 shadow-2xl overflow-hidden z-[9999] flex flex-col max-h-[90vh]">
            {/* Modal Header */}
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

            {/* Quantity-only reservation */}
            {resStep < 5 && (
              <div className="bg-gray-50 border-b border-gray-150 px-6 py-3 text-xs font-bold text-health-primary flex-shrink-0">
                Select quantity
              </div>
            )}

            {/* Stepper Content Pane */}
            <div className="flex-grow p-6 overflow-y-auto min-h-[220px]">
              {/* Step 1: Review selected items & Qty selection */}
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
                    <div className="flex justify-between items-center text-gray-700">
                      <span>Unit Retail Price:</span>
                      <span className="font-bold text-gray-900">{selectedPharmacy.price} RWF</span>
                    </div>
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
                </div>
              )}

              {/* Step 5: Checkout reservation success page */}
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
                  </div>

                  <p className="text-[11px] text-gray-400 leading-normal max-w-xs mx-auto">
                    Keep your reservation reference and collect it from the selected pharmacy.
                  </p>
                </div>
              )}
            </div>

            {/* Stepper wizard navigation actions */}
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
