import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { MedicineApi } from '@/services/medicine-api'
import { Reservation, Medicine, PharmacyStock, Notification, SearchHistoryItem } from '@/types'
import {
  Search, ClipboardList, Clock, CheckCircle2, XCircle, AlertTriangle,
  ShieldCheck, History, ArrowRight, Trash2, Bell, Heart, MapPin
} from 'lucide-react'

export default function PatientDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  // Data states
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([])
  const [favMedicines, setFavMedicines] = useState<Medicine[]>([])
  const [favPharmacies, setFavPharmacies] = useState<PharmacyStock[]>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')

  // Load patient dashboard records
  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const [resData, notData, histData, reportData] = await Promise.all([
        MedicineApi.getReservationHistory(),
        MedicineApi.getNotifications(),
        MedicineApi.getSearchHistory(),
        MedicineApi.getPatientDashboardReport().catch(() => null),
      ])

      setReservations(resData)
      setNotifications(notData)
      setSearchHistory(histData)

      if (reportData?.reservations?.length) {
        const reportReservations = reportData.reservations.map((item: any) => ({
          ...item,
          medicineName: item.medicine?.name || item.medicineName || 'Medication',
          pharmacyName: item.pharmacy?.name || item.pharmacyName || 'Pharmacy',
          patientPays: Number(item.patientPays ?? item.totalPrice ?? 0),
          status: String(item.status || 'PENDING').toUpperCase(),
        }))
        setReservations(reportReservations)
      }

      const favMedIds: string[] = await MedicineApi.getFavouriteMedicines().catch(() => [])
      const favPharmIds: string[] = await MedicineApi.getFavouritePharmacies().catch(() => [])
      const allMeds = await MedicineApi.searchMedicines('', '', false).catch(() => [])
      setFavMedicines(allMeds.filter((m) => favMedIds.includes(m.id)))

      if (allMeds.length > 0) {
        const stocks = await MedicineApi.getMedicineAvailability(allMeds[0].id).catch(() => [])
        setFavPharmacies(stocks.filter((s) => favPharmIds.includes(s.pharmacyId)))
      }
    } catch (err) {
      console.error('Error loading dashboard data', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  // Execute quick search
  const handleQuickSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    try {
      await MedicineApi.saveSearchHistory(query, 'All')
      navigate(`/patient/search?q=${encodeURIComponent(query)}`)
    } catch (err) {
      console.error(err)
    }
  }

  // Repeat past search query
  const handleRepeatSearch = async (pastQuery: string, category: string) => {
    try {
      await MedicineApi.saveSearchHistory(pastQuery, category)
      navigate(`/patient/search?q=${encodeURIComponent(pastQuery)}`)
    } catch (err) {
      console.error(err)
    }
  }

  // Delete single search history item
  const handleDeleteHistoryItem = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    try {
      const key = 'epharmacy_search_history_mock'
      const updated = searchHistory.filter((item) => item.id !== id)
      localStorage.setItem(key, JSON.stringify(updated))
      setSearchHistory(updated)
    } catch (err) {
      console.error(err)
    }
  }

  // Clear entire search history
  const handleClearHistory = async () => {
    try {
      await MedicineApi.clearSearchHistory()
      setSearchHistory([])
    } catch (err) {
      console.error(err)
    }
  }

  // Remove bookmark
  const handleRemoveFavMedicine = async (e: React.MouseEvent, medId: string) => {
    e.stopPropagation()
    try {
      await MedicineApi.saveFavouriteMedicine(medId, false)
      setFavMedicines((prev) => prev.filter((m) => m.id !== medId))
    } catch (err) {
      console.error(err)
    }
  }

  const handleRemoveFavPharmacy = async (e: React.MouseEvent, pharmId: string) => {
    e.stopPropagation()
    try {
      await MedicineApi.saveFavouritePharmacy(pharmId, false)
      setFavPharmacies((prev) => prev.filter((p) => p.pharmacyId !== pharmId))
    } catch (err) {
      console.error(err)
    }
  }

  // Stats calculators
  const pendingCount = reservations.filter((r) => r.status === 'PENDING' || r.status === 'CONFIRMED').length
  const collectedCount = reservations.filter((r) => r.status === 'COLLECTED').length
  const cancelledCount = reservations.filter((r) => r.status === 'CANCELLED').length
  const unreadCount = notifications.filter((n) => !n.read).length

  // Profile completion meter computation
  const getProfileCompletion = () => {
    let fields = 0
    if (user?.name) fields++
    if (user?.email) fields++
    if (user?.phone) fields++
    if (user?.province) fields++
    if (user?.district) fields++
    if (user?.emergencyContact) fields++
    if (user?.preferredPharmacy) fields++
    return Math.round((fields / 7) * 100)
  }

  const completionPercent = getProfileCompletion()

  // Get status icon badge
  const getStatusIcon = (status: Reservation['status']) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4 text-amber-600" />
      case 'CONFIRMED':
        return <ShieldCheck className="w-4 h-4 text-blue-600" />
      case 'COLLECTED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />
      default:
        return <XCircle className="w-4 h-4 text-red-500" />
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">

      {/* Top Welcome & Search Hero panel banner */}
      <div className="bg-white text-gray-900 rounded-xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xs border border-emerald-800/20 relative overflow-hidden">

        {/* Abstract design elements */}
        <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-50/50 rounded-full blur-xl pointer-events-none" />

        <div className="space-y-2 flex-grow">
          <h1 className="text-xl sm:text-2xl font-black text-gray-950">Muraho, {user?.name || 'Citizen'}</h1>
          <p className="text-gray-500 text-xs max-w-lg font-medium leading-normal">
            Welcome to the Rwanda Ministry of Health national drug dispensary system. Check reservation statuses, search medication catalogues, or upload prescriptions below.
          </p>

          <form onSubmit={handleQuickSearchSubmit} className="relative max-w-lg pt-3">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-6" />
            <input
              type="text"
              placeholder="Quick search medicines, generic molecule names or manufacturers..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-24 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold text-gray-950 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-sm"
            />
            <button
              type="submit"
              className="absolute right-1 top-4 py-1.5 px-3.5 bg-health-primary hover:bg-emerald-900 rounded-md text-white font-bold text-[10px] uppercase transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Completion Progress widget */}
        <div className="flex-shrink-0 bg-emerald-50/60 border border-emerald-200/60 p-4 rounded-xl text-center space-y-2.5 max-w-[200px] w-full">
          <span className="text-[10px] text-emerald-800 block uppercase tracking-wider font-bold">Health Profile Score</span>

          {/* Progress Circle Ring */}
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="32" cy="32" r="28" stroke="rgba(15,81,50,0.15)" strokeWidth="4" fill="transparent" />
              <circle
                cx="32" cy="32" r="28"
                stroke="#0f5132" strokeWidth="4" fill="transparent"
                strokeDasharray={176}
                strokeDashoffset={176 - (176 * completionPercent) / 100}
              />
            </svg>
            <span className="absolute text-xs font-black text-emerald-950">{completionPercent}%</span>
          </div>

          <button
            type="button"
            onClick={() => navigate('/patient/profile')}
            className="text-[10px] text-emerald-800 hover:text-emerald-950 font-bold block mx-auto hover:underline"
          >
            Complete profile &rarr;
          </button>
        </div>

      </div>

      {/* Stats blocks overview grids */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center space-x-3.5 shadow-xs">
          <div className="p-2.5 bg-amber-50 rounded-lg text-amber-700">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block uppercase font-bold">Pending Pickups</span>
            <span className="text-lg font-black text-gray-950">{pendingCount} orders</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center space-x-3.5 shadow-xs">
          <div className="p-2.5 bg-emerald-50 rounded-lg text-health-primary">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block uppercase font-bold">Collected Items</span>
            <span className="text-lg font-black text-gray-950">{collectedCount} medications</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center space-x-3.5 shadow-xs">
          <div className="p-2.5 bg-red-50 rounded-lg text-red-700">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block uppercase font-bold">Cancelled Orders</span>
            <span className="text-lg font-black text-gray-950">{cancelledCount} items</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center space-x-3.5 shadow-xs">
          <div className="p-2.5 bg-blue-50 rounded-lg text-blue-700">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block uppercase font-bold">Unread Updates</span>
            <span className="text-lg font-black text-gray-950">{unreadCount} alerts</span>
          </div>
        </div>

      </div>

      {/* Main dashboard content sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Left Side: Table & History (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Recent Reservations Table card */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-150">
              <h3 className="font-black text-gray-950 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                <ClipboardList className="w-4 h-4 text-emerald-700" />
                <span>Recent Dispensing Reservations</span>
              </h3>
              <button
                type="button"
                onClick={() => navigate('/patient/reservations')}
                className="text-xs text-health-primary hover:text-emerald-900 font-bold flex items-center space-x-0.5"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {reservations.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-400">
                No active medicine pickup reservations logged.
              </div>
            ) : (
              <div className="overflow-x-auto text-xs font-semibold text-gray-700">
                <table className="w-full text-left divide-y divide-gray-150">
                  <thead>
                    <tr className="text-[9px] font-black text-gray-400 uppercase tracking-widest pb-2">
                      <th className="py-2">Ref ID</th>
                      <th className="py-2">Medicine</th>
                      <th className="py-2">Pharmacy</th>
                      <th className="py-2">Out-of-Pocket</th>
                      <th className="py-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-bold text-gray-900">
                    {reservations.slice(0, 5).map((res) => (
                      <tr
                        key={res.id}
                        onClick={() => navigate('/patient/reservations')}
                        className="hover:bg-gray-50/50 cursor-pointer"
                      >
                        <td className="py-3 font-mono text-gray-450">{res.id.slice(0, 8)}</td>
                        <td className="py-3 text-gray-950">{res.medicineName}</td>
                        <td className="py-3 text-gray-550">{res.pharmacyName}</td>
                        <td className="py-3 text-health-primary">{res.patientPays || 0} RWF</td>
                        <td className="py-3 text-right">
                          <div className="inline-flex items-center space-x-1">
                            {getStatusIcon(res.status)}
                            <span className="text-[10px] capitalize text-gray-700">{res.status.toLowerCase()}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Search History Cards */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-gray-150">
              <h3 className="font-black text-gray-950 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                <History className="w-4 h-4 text-emerald-700" />
                <span>Recent Search History</span>
              </h3>
              {searchHistory.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="text-[10px] text-red-650 hover:underline font-bold"
                >
                  Clear all history
                </button>
              )}
            </div>

            {searchHistory.length === 0 ? (
              <div className="text-center py-4 text-xs text-gray-400">
                Search history logs are empty.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 pt-1 text-xs">
                {searchHistory.slice(0, 10).map((hist) => (
                  <div
                    key={hist.id}
                    onClick={() => handleRepeatSearch(hist.query, hist.category)}
                    className="bg-gray-50 hover:bg-emerald-50 hover:text-emerald-950 border border-gray-250 hover:border-emerald-300 rounded-lg pl-3 pr-2.5 py-1.5 flex items-center space-x-2.5 transition-all cursor-pointer font-bold"
                  >
                    <span>{hist.query}</span>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteHistoryItem(e, hist.id)}
                      className="text-gray-400 hover:text-red-650"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Side Column (1/3 width) */}
        <div className="space-y-6">

          {/* Notifications widget preview */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-150">
              <h3 className="font-black text-gray-950 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                <Bell className="w-4 h-4 text-emerald-700" />
                <span>Recent Notifications</span>
              </h3>
              <button
                type="button"
                onClick={() => navigate('/patient/notifications')}
                className="text-[10px] text-health-primary hover:underline font-bold"
              >
                Open centre
              </button>
            </div>

            {notifications.length === 0 ? (
              <div className="text-center py-4 text-xs text-gray-400">
                No alerts in log.
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 3).map((not) => (
                  <div
                    key={not.id}
                    onClick={() => navigate('/patient/notifications')}
                    className={`p-3 rounded-lg border text-xs leading-normal transition-all cursor-pointer ${!not.read ? 'bg-emerald-50/20 border-emerald-100' : 'bg-gray-50 border-gray-150'
                      }`}
                  >
                    <div className="flex justify-between font-black text-gray-900">
                      <span>{not.title}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 self-center" />
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1 font-semibold">{not.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Favourite Medicines widget card */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-gray-150">
              <h3 className="font-black text-gray-950 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                <span>Bookmarked Medicines</span>
              </h3>
            </div>

            {favMedicines.length === 0 ? (
              <div className="text-center py-4 text-xs text-gray-400">
                Bookmark drugs on the search catalog for quick access.
              </div>
            ) : (
              <div className="space-y-2.5">
                {favMedicines.map((med) => (
                  <div
                    key={med.id}
                    onClick={() => navigate(`/patient/search?q=${encodeURIComponent(med.name)}`)}
                    className="border border-gray-200 hover:border-rose-300 p-3 rounded-lg flex items-center justify-between text-xs transition-all cursor-pointer bg-white"
                  >
                    <div>
                      <span className="font-bold text-gray-900 block">{med.name}</span>
                      <span className="text-[10px] text-gray-400 block font-semibold">{med.category} &bull; {med.manufacturer}</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleRemoveFavMedicine(e, med.id)}
                      className="p-1 hover:bg-red-50 text-rose-600 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Favourite Pharmacies widget card */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-gray-150">
              <h3 className="font-black text-gray-950 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-emerald-700" />
                <span>Bookmarked Pharmacies</span>
              </h3>
            </div>

            {favPharmacies.length === 0 ? (
              <div className="text-center py-4 text-xs text-gray-400">
                Bookmark pharmacies on search list views for quick lookup.
              </div>
            ) : (
              <div className="space-y-2.5">
                {favPharmacies.map((pharm) => (
                  <div
                    key={pharm.pharmacyId}
                    onClick={() => navigate(`/patient/search?q=${encodeURIComponent(pharm.pharmacyName)}`)}
                    className="border border-gray-200 hover:border-emerald-350 p-3 rounded-lg flex items-center justify-between text-xs transition-all cursor-pointer bg-white"
                  >
                    <div>
                      <span className="font-bold text-gray-900 block">{pharm.pharmacyName}</span>
                      <span className="text-[10px] text-gray-400 block font-semibold">{pharm.locationText} &bull; {pharm.distance} km</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleRemoveFavPharmacy(e, pharm.pharmacyId)}
                      className="p-1 hover:bg-red-50 text-rose-600 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  )
}
