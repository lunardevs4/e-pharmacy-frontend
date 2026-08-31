import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { MedicineApi } from '@/services/medicine-api'
import { AuthApi } from '@/services/auth-api'
import { insuranceApi } from '@/services/insurance-api'
import { Reservation, Medicine, PharmacyStock, Notification, SearchHistoryItem } from '@/types'
import {
  Search, ClipboardList, Clock, CheckCircle2, XCircle, AlertTriangle,
  ShieldCheck, History, ArrowRight, Trash2, Bell, Heart, MapPin, 
  TrendingUp, DollarSign, Package, Calendar, Shield, Save, RefreshCw
} from 'lucide-react'

export default function PatientDashboard() {
  const navigate = useNavigate()
  const { user, updateProfile } = useAuthStore()

  const [isEditingInsurance, setIsEditingInsurance] = useState(false)
  const [selectedInsurance, setSelectedInsurance] = useState(user?.insuranceProvider || 'None')
  const [insuranceSaveLoading, setInsuranceSaveLoading] = useState(false)
  const [insuranceSaveError, setInsuranceSaveError] = useState<string | null>(null)
  const [insuranceSaveSuccess, setInsuranceSaveSuccess] = useState(false)
  const [providers, setProviders] = useState<any[]>([])

  useEffect(() => {
    insuranceApi.getProviders()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProviders(data.filter((p: any) => p.isActive !== false))
        }
      })
      .catch((err) => console.error('Error loading dynamic insurance providers:', err))
  }, [])

  useEffect(() => {
    if (user?.insuranceProvider) {
      setSelectedInsurance(user.insuranceProvider)
    }
  }, [user?.insuranceProvider])

  const handleSaveInsurance = async () => {
    setInsuranceSaveError(null)
    setInsuranceSaveSuccess(false)
    setInsuranceSaveLoading(true)
    try {
      const updated = await AuthApi.updateProfile(user?.username || 'patient', {
        firstName: user?.firstName || user?.name?.split(' ')[0] || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        insuranceProvider: selectedInsurance,
        province: user?.province || '',
        district: user?.district || '',
        sector: user?.sector || '',
        cell: user?.cell || '',
        village: user?.village || '',
        emergencyContact: user?.emergencyContact || '',
        preferredPharmacy: user?.preferredPharmacy || '',
        medicalNotes: user?.medicalNotes || ''
      })
      updateProfile(updated)
      setInsuranceSaveSuccess(true)
      setIsEditingInsurance(false)
      setTimeout(() => setInsuranceSaveSuccess(false), 3000)
    } catch (err: any) {
      setInsuranceSaveError(err.message || 'Failed to update insurance provider.')
    } finally {
      setInsuranceSaveLoading(false)
    }
  }

  const [reservations, setReservations] = useState<Reservation[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([])
  const [favMedicines, setFavMedicines] = useState<Medicine[]>([])
  const [favPharmacies, setFavPharmacies] = useState<PharmacyStock[]>([])
  const [medicineHistory, setMedicineHistory] = useState<any[]>([])
  const [reminders, setReminders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const [resData, notData, histData, reportData, medHistoryData, remindersData] = await Promise.all([
        MedicineApi.getReservationHistory().catch(() => []),
        MedicineApi.getNotifications().catch(() => []),
        MedicineApi.getSearchHistory(),
        MedicineApi.getPatientDashboardReport().catch(() => null),
        MedicineApi.getMedicineHistory().catch(() => []),
        MedicineApi.getReminders().catch(() => []),
      ])

      setReservations(resData)
      setNotifications(notData)
      setSearchHistory(histData)
      setMedicineHistory(medHistoryData)
      setReminders(remindersData.filter((r: any) => r.isActive))

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

  const handleRepeatSearch = async (pastQuery: string, category: string) => {
    try {
      await MedicineApi.saveSearchHistory(pastQuery, category)
      navigate(`/patient/search?q=${encodeURIComponent(pastQuery)}`)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteHistoryItem = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    try {
      const key = 'epharmacy_search_history'
      const updated = searchHistory.filter((item) => item.id !== id)
      localStorage.setItem(key, JSON.stringify(updated))
      setSearchHistory(updated)
    } catch (err) {
      console.error(err)
    }
  }

  const handleClearHistory = async () => {
    try {
      await MedicineApi.clearSearchHistory()
      setSearchHistory([])
    } catch (err) {
      console.error(err)
    }
  }

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

  const pendingCount = reservations.filter((r) => r.status === 'PENDING' || r.status === 'CONFIRMED').length
  const collectedCount = reservations.filter((r) => r.status === 'COLLECTED').length
  const cancelledCount = reservations.filter((r) => r.status === 'CANCELLED').length
  const unreadCount = notifications.filter((n) => !n.read).length
  
  const totalSpent = medicineHistory.reduce((sum, item) => sum + (item.patientPays || 0), 0)
  const totalMedicinesPurchased = medicineHistory.length
  const activeRemindersCount = reminders.length
  const todayDosesCount = reminders.reduce((sum, r) => sum + (r.times?.length || 0), 0)

  const spendingTrend = useMemo(() => {
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
    
    const recentSpending = medicineHistory
      .filter(item => new Date(item.purchaseDate) >= sevenDaysAgo)
      .reduce((sum, item) => sum + (item.patientPays || 0), 0)
    
    const previousSpending = medicineHistory
      .filter(item => {
        const date = new Date(item.purchaseDate)
        return date >= fourteenDaysAgo && date < sevenDaysAgo
      })
      .reduce((sum, item) => sum + (item.patientPays || 0), 0)
    
    if (previousSpending === 0) return recentSpending > 0 ? 100 : 0
    return Math.round(((recentSpending - previousSpending) / previousSpending) * 100)
  }, [medicineHistory])

  const reservationDistribution = useMemo(() => {
    const total = reservations.length || 1
    return {
      pending: Math.round((pendingCount / total) * 100),
      collected: Math.round((collectedCount / total) * 100),
      cancelled: Math.round((cancelledCount / total) * 100),
    }
  }, [reservations, pendingCount, collectedCount, cancelledCount])

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

      <div className="bg-white text-gray-900 rounded-xl p-4 sm:p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6 shadow-xs border border-emerald-800/20 relative overflow-hidden">

        <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-50/50 rounded-full blur-xl pointer-events-none" />

        <div className="space-y-2 flex-grow">
          <h1 className="text-lg sm:text-xl md:text-2xl font-black text-gray-950">Muraho, {user?.firstName?.split(' ')[0] || user?.name?.split(' ')[0] || 'Citizen'}</h1>
          <p className="text-gray-500 text-[10px] sm:text-xs max-w-lg font-medium leading-normal">
            Welcome to the Rwanda Ministry of Health national drug dispensary system. Check reservation statuses, search medication catalogues, or upload prescriptions below.
          </p>

          <form onSubmit={handleQuickSearchSubmit} className="relative max-w-lg pt-3">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-6" />
            <input
              type="text"
              placeholder="Quick search medicines, generic molecule names or manufacturers..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-20 sm:pr-24 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-[10px] sm:text-xs font-bold text-gray-950 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-sm"
            />
            <button
              type="submit"
              className="absolute right-1 top-4 py-1.5 px-2.5 sm:px-3.5 bg-health-primary hover:bg-emerald-900 rounded-md text-white font-bold text-[9px] sm:text-[10px] uppercase transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        <div className="flex-shrink-0 bg-emerald-50/60 border border-emerald-200/60 p-3 sm:p-4 rounded-xl text-center space-y-2 sm:space-y-2.5 max-w-[180px] sm:max-w-[210px] w-full relative z-10 font-sans">
          <span className="text-[9px] sm:text-[10px] text-emerald-800 block uppercase tracking-wider font-bold">Linked Insurance</span>

          {insuranceSaveSuccess && (
            <div className="bg-emerald-100 border border-emerald-200 text-emerald-800 py-1 px-2 rounded text-[9px] font-bold animate-fadeIn">
              Saved!
            </div>
          )}

          {insuranceSaveError && (
            <div className="bg-red-50 border border-red-200 text-red-800 py-1 px-2 rounded text-[9px] font-bold animate-fadeIn truncate" title={insuranceSaveError}>
              Error saving
            </div>
          )}

          {isEditingInsurance ? (
            <div className="space-y-2">
              <select
                value={selectedInsurance}
                onChange={(e) => setSelectedInsurance(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded px-1.5 py-1 text-[11px] text-gray-700 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {providers.map((prov) => (
                  <option key={prov.id} value={prov.code || prov.name}>
                    {prov.code || prov.name}
                  </option>
                ))}
                <option value="None">None (Cash)</option>
              </select>
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  disabled={insuranceSaveLoading}
                  onClick={handleSaveInsurance}
                  className="flex-grow bg-health-primary hover:bg-emerald-800 text-white text-[9px] font-bold py-1 px-1.5 rounded transition-colors flex items-center justify-center space-x-0.5 cursor-pointer"
                >
                  {insuranceSaveLoading ? '...' : 'Save'}
                </button>
                <button
                  type="button"
                  disabled={insuranceSaveLoading}
                  onClick={() => {
                    setIsEditingInsurance(false)
                    setSelectedInsurance(user?.insuranceProvider || 'None')
                    setInsuranceSaveError(null)
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-[9px] font-bold py-1 px-1.5 rounded transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {user?.insuranceProvider && user.insuranceProvider !== 'None' ? (
                <>
                  <div className="flex items-center justify-center space-x-1 text-emerald-700">
                    <Shield className="w-4 h-4 fill-emerald-100" />
                    <span className="text-xs font-black">{user.insuranceProvider} Active</span>
                  </div>
                  <span className="block text-[10px] text-emerald-750 font-semibold leading-none">
                    {(() => {
                      const matched = providers.find(p => p.code === user.insuranceProvider || p.name === user.insuranceProvider)
                      if (matched) {
                        const pct = matched.defaultCoveragePercentage
                        const display = pct > 1 ? pct : Math.round(pct * 100)
                        return `${display}% cost covered`
                      }
                      return 'Discount active'
                    })()}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditingInsurance(true)}
                    className="text-[9px] text-emerald-800 hover:text-emerald-950 font-bold block mx-auto hover:underline cursor-pointer"
                  >
                    Change Provider &rarr;
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center space-x-1 text-amber-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-xs font-black">Paying Cash</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditingInsurance(true)}
                    className="text-[9px] bg-amber-600 hover:bg-amber-700 text-white font-bold px-2 py-1 rounded shadow-xs transition-colors block mx-auto cursor-pointer"
                  >
                    Link Insurance
                  </button>
                </>
              )}
            </div>
          )}
        </div>

      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">

        <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 flex items-center space-x-2.5 sm:space-x-3.5 shadow-xs">
          <div className="p-2 sm:p-2.5 bg-amber-50 rounded-lg text-amber-700">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <span className="text-[9px] sm:text-[10px] text-gray-400 block uppercase font-bold">Pending Pickups</span>
            <span className="text-base sm:text-lg font-black text-gray-950">{pendingCount} orders</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 flex items-center space-x-2.5 sm:space-x-3.5 shadow-xs">
          <div className="p-2 sm:p-2.5 bg-emerald-50 rounded-lg text-health-primary">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <span className="text-[9px] sm:text-[10px] text-gray-400 block uppercase font-bold">Collected Items</span>
            <span className="text-base sm:text-lg font-black text-gray-950">{collectedCount} medications</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 flex items-center space-x-2.5 sm:space-x-3.5 shadow-xs">
          <div className="p-2 sm:p-2.5 bg-blue-50 rounded-lg text-blue-700">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <span className="text-[9px] sm:text-[10px] text-gray-400 block uppercase font-bold">Total Spent</span>
            <span className="text-base sm:text-lg font-black text-gray-950">{totalSpent.toLocaleString()} RWF</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 flex items-center space-x-2.5 sm:space-x-3.5 shadow-xs">
          <div className="p-2 sm:p-2.5 bg-purple-50 rounded-lg text-purple-700">
            <Package className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <span className="text-[9px] sm:text-[10px] text-gray-400 block uppercase font-bold">Medicines Purchased</span>
            <span className="text-base sm:text-lg font-black text-gray-950">{totalMedicinesPurchased}</span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 flex items-center space-x-2.5 sm:space-x-3.5 shadow-xs">
          <div className="p-2 sm:p-2.5 bg-rose-50 rounded-lg text-rose-700">
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <span className="text-[9px] sm:text-[10px] text-gray-400 block uppercase font-bold">Active Reminders</span>
            <span className="text-base sm:text-lg font-black text-gray-955">{activeRemindersCount} medications</span>
            <span className="text-[9px] sm:text-[10px] text-gray-400 block">{todayDosesCount} doses today</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 flex items-center space-x-2.5 sm:space-x-3.5 shadow-xs">
          <div className="p-2 sm:p-2.5 bg-teal-50 rounded-lg text-teal-700">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <span className="text-[9px] sm:text-[10px] text-gray-400 block uppercase font-bold">Spending Trend (7d)</span>
            <span className={`text-base sm:text-lg font-black ${spendingTrend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {spendingTrend >= 0 ? '+' : ''}{spendingTrend}%
            </span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 flex items-center space-x-2.5 sm:space-x-3.5 shadow-xs">
          <div className="p-2 sm:p-2.5 bg-indigo-50 rounded-lg text-indigo-700">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <span className="text-[9px] sm:text-[10px] text-gray-400 block uppercase font-bold">Unread Updates</span>
            <span className="text-base sm:text-lg font-black text-gray-955">{unreadCount} alerts</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center space-x-3.5 shadow-xs font-sans">
          <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="20" cy="20" r="16" stroke="rgba(15,81,50,0.1)" strokeWidth="2.5" fill="transparent" />
              <circle
                cx="20"
                cy="20"
                r="16"
                stroke="#0f5132"
                strokeWidth="2.5"
                fill="transparent"
                strokeDasharray={100}
                strokeDashoffset={100 - completionPercent}
              />
            </svg>
            <span className="absolute text-[9px] font-black text-emerald-955">{completionPercent}%</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block uppercase font-bold">Profile Score</span>
            <button
              type="button"
              onClick={() => navigate('/patient/profile')}
              className="text-[10px] text-health-primary hover:text-emerald-900 font-bold block hover:underline text-left mt-0.5 cursor-pointer"
            >
              Complete Profile &rarr;
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start">

        <div className="lg:col-span-2 space-y-6">

          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
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
              <div className="overflow-x-auto text-[10px] sm:text-xs font-semibold text-gray-700">
                <table className="w-full text-left divide-y divide-gray-150">
                  <thead>
                    <tr className="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-widest pb-2">
                      <th className="py-2 px-1 sm:px-0">Ref ID</th>
                      <th className="py-2 px-1 sm:px-0">Medicine</th>
                      <th className="py-2 px-1 sm:px-0">Pharmacy</th>
                      <th className="py-2 px-1 sm:px-0">Out-of-Pocket</th>
                      <th className="py-2 px-1 sm:px-0 text-right">Status</th>
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

          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
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
              <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1 text-[10px] sm:text-xs">
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

        <div className="space-y-6">

          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-150">
              <h3 className="font-black text-gray-955 text-xs uppercase tracking-wider flex items-center space-x-1.5">
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

          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
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
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveFavMedicine(e, med.id)
                      }}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-gray-150">
              <h3 className="font-black text-gray-950 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                <ClipboardList className="w-4 h-4 text-emerald-700" />
                <span>Reservation Status</span>
              </h3>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Pending', value: reservationDistribution.pending, color: 'bg-amber-500' },
                { label: 'Collected', value: reservationDistribution.collected, color: 'bg-emerald-500' },
                { label: 'Cancelled', value: reservationDistribution.cancelled, color: 'bg-red-500' },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-gray-700">
                    <span>{item.label}</span>
                    <span>{item.value}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`${item.color} h-2 rounded-full transition-all`}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

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
