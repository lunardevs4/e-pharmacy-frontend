import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { apiClient } from '@/api/client'
import { useLanguageStore } from '@/store/languageStore'
import LanguageSelector from '@/components/common/LanguageSelector'

function CountUp({ end, duration = 1500, suffix = '', decimals = 0 }: { end: number; duration?: number; suffix?: string; decimals?: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTimestamp: number | null = null
    let active = true
    const step = (timestamp: number) => {
      if (!active) return
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      setCount(progress * end)
      if (progress < 1) {
        window.requestAnimationFrame(step)
      }
    }
    window.requestAnimationFrame(step)
    return () => {
      active = false
    }
  }, [end, duration])

  const formatted = decimals > 0 
    ? count.toFixed(decimals)
    : Math.floor(count).toLocaleString('en-US')

  return (
    <span>
      {formatted}
      {suffix}
    </span>
  )
}
import {
  Search,
  MapPin,
  Check,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Upload,
  CreditCard,
  Bell,
  Bookmark,
  Sparkles,
  Bot,
  X,
  Send,
  Landmark,
  Shield,
  Menu,
} from 'lucide-react'

export default function LandingPage() {
  const { t } = useLanguageStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState({
    registeredPharmacies: '—',
    patientsRegistered: '—',
    provincesCovered: '—',
    nationalAvailability: '—',
  })
  const [statsLoading, setStatsLoading] = useState(true)
  const [showResults, setShowResults] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(1) // Item 1 (How do I find a medicine near me?) is expanded by default

  const [showChat, setShowChat] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string }>>([
    {
      sender: 'assistant',
      text: 'Hello! I can answer educational questions about medicines — what they are, what they treat, and common side effects. I do not replace professional medical advice. How can I help?',
    },
  ])

  useEffect(() => {
    let active = true

    apiClient
      .get('/public/stats')
      .then((response) => {
        const data = response.data?.data ?? response.data
        if (!active || !data) return

        setStats({
          registeredPharmacies: Number(data.registeredPharmacies).toLocaleString(),
          patientsRegistered: Number(data.patientsRegistered).toLocaleString(),
          provincesCovered: Number(data.provincesCovered).toLocaleString(),
          nationalAvailability: `${Number(data.nationalAvailability).toFixed(1)}%`,
        })
      })
      .catch((error) => console.error('Unable to load public platform stats:', error))
      .finally(() => {
        if (active) setStatsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    const userMsg = chatInput.trim()
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }])
    setChatInput('')

    setTimeout(() => {
      let replyText = ''
      const lower = userMsg.toLowerCase()
      if (lower.includes('paracetamol')) {
        replyText =
          'Paracetamol (Acetaminophen) is a common pain reliever and fever reducer. It is used to treat mild to moderate pain (headaches, muscle aches, toothaches) and reduce fever. Normal adult dose is 500mg-1000mg every 4-6 hours, not exceeding 4000mg per day to avoid potential liver damage.'
      } else if (lower.includes('amoxicillin')) {
        replyText =
          'Amoxicillin is a penicillin-type antibiotic used to treat bacterial infections (e.g. pneumonia, strep throat, ear infections). It will not work for viral infections (cold, flu). Please make sure to complete the entire course prescribed by your physician.'
      } else if (lower.includes('ibuprofen')) {
        replyText =
          'Ibuprofen is a Nonsteroidal Anti-inflammatory Drug (NSAID) used to treat fever, pain, and swelling. It is recommended to take it with food or milk to minimize potential stomach irritation.'
      } else {
        replyText =
          'I can provide educational details on standard medications like Paracetamol, Amoxicillin, or Ibuprofen. Please consult a licensed professional medical provider for specific diagnosis, prescriptions, or medical decisions.'
      }
      setMessages((prev) => [...prev, { sender: 'assistant', text: replyText }])
    }, 1000)
  }

  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searchUsedFallback, setSearchUsedFallback] = useState(false)

  const handleSearch = async () => {
    if (!searchTerm.trim()) return
    setIsSearching(true)
    setSearchError(null)
    setSearchUsedFallback(false)
    setShowResults(true)
    try {
      let lat: number | undefined
      let lon: number | undefined

      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3500 })
        })
        lat = pos.coords.latitude
        lon = pos.coords.longitude
      } catch (e) {
        console.warn('Geolocation failed or denied. Searching without coordinates.', e)
      }

      const response = await apiClient.get('/search/medicines', {
        params: {
          query: searchTerm,
          latitude: lat,
          longitude: lon,
          limit: 10,
        },
      })

      const payload = response.data?.data?.data ?? response.data?.data ?? response.data ?? []
      const meta = response.data?.data?.meta ?? response.data?.meta
      setSearchUsedFallback(Boolean(meta?.usedFallback))
      setSearchResults(Array.isArray(payload) ? payload : [])
    } catch (err: any) {
      console.error(err)
      setSearchError(err.message || 'An error occurred while searching for medicines.')
      setSearchUsedFallback(false)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const features = [
    {
      title: t('feature.search.title'),
      desc: t('feature.search.desc'),
      icon: Search,
    },
    {
      title: t('feature.nearest.title'),
      desc: t('feature.nearest.desc'),
      icon: MapPin,
    },
    {
      title: t('feature.reserve.title'),
      desc: t('feature.reserve.desc'),
      icon: Bookmark,
    },
    {
      title: t('feature.upload.title'),
      desc: t('feature.upload.desc'),
      icon: Upload,
    },
    {
      title: t('feature.insurance.title'),
      desc: t('feature.insurance.desc'),
      icon: CreditCard,
    },
    {
      title: t('feature.reminders.title'),
      desc: t('feature.reminders.desc'),
      icon: Bell,
    },
  ]

  const portalDetails = [
    {
      role: t('portal.patients.title'),
      desc: t('portal.patients.desc'),
      icon: UserIcon,
    },
    {
      role: t('portal.pharmacies.title'),
      desc: t('portal.pharmacies.desc'),
      icon: PharmacyIcon,
    },
    {
      role: t('portal.government.title'),
      desc: t('portal.government.desc'),
      icon: Landmark,
    },
    {
      role: 'Insurance',
      desc: 'Manage member coverage, verify claims, and support seamless healthcare payments.',
      icon: Shield,
    },
  ]

  const faqs = [
    {
      q: t('faq.q1'),
      a: t('faq.a1'),
    },
    {
      q: t('faq.q2'),
      a: t('faq.a2'),
    },
    {
      q: t('faq.q3'),
      a: t('faq.a3'),
    },
    {
      q: t('faq.q4'),
      a: t('faq.a4'),
    },
    {
      q: t('faq.q5'),
      a: t('faq.a5'),
    },
    {
      q: t('faq.q6'),
      a: t('faq.a6'),
    },
  ]

  const toggleFaq = (idx: number) => {
    setExpandedFaq(expandedFaq === idx ? null : idx)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="bg-white border-b border-gray-150 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex flex-col items-center flex-shrink-0 leading-none">
            <img
              src="/logo1.png"
              alt="Rwanda E-Pharmacy Logo"
              className="h-9 sm:h-12 w-auto object-contain flex-shrink-0"
            />
            <span className="mt-0.5 text-[9px] sm:text-[10px] font-black text-health-primary tracking-tight">E-pharmacy</span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden lg:flex space-x-6 xl:space-x-8 text-sm font-bold text-gray-500">
            <a href="#home" className="hover:text-health-primary transition-colors">{t('nav.home')}</a>
            <a href="#features" className="hover:text-health-primary transition-colors">{t('nav.features')}</a>
            <a href="#about" className="hover:text-health-primary transition-colors">{t('nav.about')}</a>
            <a href="#faq" className="hover:text-health-primary transition-colors">{t('nav.faq')}</a>
            <a href="#contact" className="hover:text-health-primary transition-colors">{t('nav.contact')}</a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <LanguageSelector />
            <Link to="/login" className="hidden lg:inline text-xs sm:text-sm font-bold text-gray-800 hover:text-health-primary transition-colors whitespace-nowrap">
              {t('nav.login')}
            </Link>
            <Link
              to="/register"
              className="hidden lg:flex bg-health-primary hover:bg-health-secondary text-white text-xs sm:text-sm font-bold px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-colors items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <span>{t('nav.register')}</span>
            </Link>
            <button
              type="button"
              onClick={() => setShowMobileMenu((open) => !open)}
              aria-label={showMobileMenu ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={showMobileMenu}
              className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-health-primary transition-colors focus:outline-none focus:ring-2 focus:ring-health-primary/30"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {showMobileMenu && (
          <div className="lg:hidden border-t border-gray-100 bg-white shadow-lg">
            <nav aria-label="Mobile navigation" className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
              <div className="flex flex-col">
                {[
                  ['#home', t('nav.home')],
                  ['#features', t('nav.features')],
                  ['#about', t('nav.about')],
                  ['#faq', t('nav.faq')],
                  ['#contact', t('nav.contact')],
                ].map(([href, label]) => (
                  <a
                    key={href}
                    href={href}
                    onClick={() => setShowMobileMenu(false)}
                    className="border-b border-gray-100 py-3 text-sm font-bold text-gray-600 hover:text-health-primary transition-colors"
                  >
                    {label}
                  </a>
                ))}
                <Link
                  to="/login"
                  onClick={() => setShowMobileMenu(false)}
                  className="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 hover:border-health-primary hover:text-health-primary transition-colors"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setShowMobileMenu(false)}
                  className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-health-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-health-secondary transition-colors"
                >
                  {t('nav.register')}
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>{' '}
      <section
        id="home"
        className="relative py-10 sm:py-16 md:py-24 bg-slate-50/50 border-b border-gray-150 overflow-hidden"
      >
        <div className="absolute inset-0 bg-grid-mesh pointer-events-none opacity-75" aria-hidden="true" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[20rem] sm:w-[35rem] h-[20rem] sm:h-[35rem] bg-emerald-100/40 rounded-full blur-[120px] pointer-events-none" aria-hidden="true" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7 space-y-5 sm:space-y-6">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] sm:text-[11px] font-black bg-emerald-50 text-health-lightText border border-emerald-100 tracking-wider uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 inline-block animate-pulse"></span>
                GOVERNMENT OF RWANDA
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-black text-gray-950 leading-[1.1] tracking-tight">
                {t('landing.heroTitleMain')}
              </h1>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-xl">
                {t('landing.heroSubtitleMain')}
              </p>

              <form
                onSubmit={(e) => { e.preventDefault(); handleSearch() }}
                className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 w-full"
              >
                <div className="relative flex-grow shadow-sm rounded-xl">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('landing.searchPlaceholderInput')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 bg-white border border-gray-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 text-sm font-semibold"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-health-primary hover:bg-health-secondary text-white font-bold px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl transition-colors text-sm flex items-center justify-center space-x-2 shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
                >
                  <span>{t('landing.searchButtonInput')}</span>
                </button>
              </form>

              <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-gray-500">
                <Link to="/register/patient" className="text-health-primary hover:underline">{t('landing.registerAsPatientLink')}</Link>
                <span className="text-gray-300">|</span>
                <Link to="/register/pharmacy" className="text-health-primary hover:underline">{t('landing.registerAsPharmacyLink')}</Link>
              </div>
            </div>

            {/* Right Interactive Card */}
            <div className="lg:col-span-5">
              {showResults ? (
                <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-white/60 shadow-xl overflow-hidden animate-scaleIn">
                  <div className="bg-slate-50/60 border-b border-gray-150 px-6 py-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">
                        {t('landing.searchResultsTitle', { query: searchTerm || 'Paracetamol' })}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5 font-medium">
                        {isSearching
                          ? t('landing.searchingProgress')
                          : searchUsedFallback
                            ? 'No nearby pharmacies found; showing other pharmacies with stock'
                            : `${searchResults.length} pharmacies nearby`}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowResults(false)
                        setSearchTerm('')
                        setSearchResults([])
                        setSearchError(null)
                        setSearchUsedFallback(false)
                      }}
                      className="text-xs font-bold text-gray-400 hover:text-gray-650 transition-colors"
                    >
                      {t('landing.clearBtn')}
                    </button>
                  </div>

                  <div className="divide-y divide-gray-150 max-h-[350px] overflow-y-auto custom-scrollbar">
                    {isSearching ? (
                      <div className="p-8 text-center text-sm text-gray-500 font-medium">
                        <span className="inline-block animate-pulse">
                          {t('landing.searchingProgress')}
                        </span>
                      </div>
                    ) : searchError ? (
                      <div className="p-6 text-center text-xs text-red-500 font-medium leading-relaxed">
                        {searchError}
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="p-8 text-center text-sm text-gray-500">
                        {t('landing.noStockFound', { query: searchTerm })}
                      </div>
                    ) : (
                      searchResults.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
                        >
                          <div className="space-y-1">
                            <h4 className="font-bold text-gray-900 text-sm">
                              {item.medicine?.tradeName || item.medicine?.genericName || searchTerm}
                            </h4>
                            <p className="text-xs text-gray-600">
                              {item.medicine?.genericName &&
                              item.medicine.genericName !== item.medicine.tradeName
                                ? item.medicine.genericName
                                : item.pharmacy.name}
                            </p>
                            <div className="flex items-center space-x-2 text-xs text-gray-450 font-medium">
                              {item.medicine?.genericName &&
                                item.medicine.genericName !== item.medicine.tradeName && (
                                  <>
                                    <span>{item.pharmacy.name}</span>
                                    <span>&middot;</span>
                                  </>
                                )}
                              <span>
                                {item.distance !== null ? `${item.distance.toFixed(1)} km` : 'N/A'}
                              </span>
                              <span>&middot;</span>
                              <span>{item.pharmacy.address || 'Kigali, Rwanda'}</span>
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end space-y-1">
                            <span className="font-bold text-gray-900 text-sm">
                              RWF {item.price}
                            </span>
                            <div className="flex items-center space-x-2">
                              <span
                                className={`text-[10px] font-bold ${
                                  item.quantity > 5 ? 'text-emerald-600' : 'text-orange-550'
                                }`}
                              >
                                {item.quantity > 5 
                                  ? t('landing.availableText') 
                                  : t('landing.lowStockText', { qty: String(item.quantity) })}
                              </span>
                              <Link
                                to="/login"
                                className="bg-health-primary hover:bg-health-secondary text-white text-[11px] font-bold px-3 py-1 rounded transition-colors shadow-xs"
                              >
                                {t('landing.reserveBtn')}
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="backdrop-blur-md bg-white/80 border border-white/60 shadow-xl rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[350px] relative overflow-hidden">
                  <div className="w-16 h-16 bg-emerald-50 text-health-primary rounded-full flex items-center justify-center mb-4 relative z-10">
                    <Search className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-black text-gray-900 relative z-10">
                    {t('landing.searchButtonInput')}
                  </h3>
                  <p className="text-gray-500 text-xs mt-2.5 max-w-xs leading-relaxed mx-auto relative z-10 font-medium">
                    {t('landing.heroSubtitleMain')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <section className="bg-white border-y border-gray-200 py-6 sm:py-8 relative select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 text-center">
            <div className="space-y-1">
              <span className="block text-2xl sm:text-3xl font-extrabold text-gray-900">
                {statsLoading ? '…' : stats.registeredPharmacies}
              </span>
              <span className="block text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                {t('landing.registeredPharmacies')}
              </span>
            </div>
            <div className="space-y-1">
              <span className="block text-2xl sm:text-3xl font-extrabold text-gray-900">
                {statsLoading ? '…' : stats.patientsRegistered}
              </span>
              <span className="block text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                {t('landing.patientsRegistered')}
              </span>
            </div>
            <div className="space-y-1">
              <span className="block text-2xl sm:text-3xl font-extrabold text-gray-900">
                {statsLoading ? '…' : stats.provincesCovered}
              </span>
              <span className="block text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                {t('landing.provincesCovered')}
              </span>
            </div>
            <div className="space-y-1">
              <span className="block text-2xl sm:text-3xl font-extrabold text-gray-900">
                {statsLoading ? '…' : stats.nationalAvailability}
              </span>
              <span className="block text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                {t('landing.nationalAvailability')}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features Section */}
      <section id="features" className="relative py-12 sm:py-20 bg-white border-b border-gray-150 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="space-y-3 sm:space-y-4 max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-widest text-health-primary">{t('landing.platformFeatures')}</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-gray-950">{t('landing.featuresHeading')}</h2>
            <p className="text-gray-600 text-sm sm:text-base font-medium">{t('landing.featuresDesc')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-8 mt-8 sm:mt-12">
            {features.map((feat, idx) => {
              const Icon = feat.icon
              return (
                <div key={idx} className="p-5 sm:p-6 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow duration-150 space-y-3 sm:space-y-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-50 text-health-primary rounded-lg flex items-center justify-center">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h3 className="text-sm sm:text-base font-serif font-bold text-gray-950">{feat.title}</h3>
                  <p className="text-gray-550 text-xs sm:text-sm leading-relaxed font-medium">{feat.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>
      <section id="about" className="relative py-12 sm:py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-start">
            <div className="space-y-6 sm:space-y-8 pt-2 sm:pt-6 order-2 lg:order-1">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black bg-emerald-50 text-health-primary border border-emerald-100 tracking-wider uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-health-primary mr-2 inline-block"></span>
                {t('landing.aboutTitle')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-gray-950 leading-tight">{t('landing.aboutHeading')}</h2>
              <div className="space-y-4 text-gray-600 text-sm leading-relaxed font-medium">
                <p>{t('landing.aboutP1')}</p>
                <p>{t('landing.aboutP2')}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-4 sm:pt-6">
                {portalDetails.map((portal, idx) => {
                  const Icon = portal.icon
                  return (
                    <div key={idx} className="text-center space-y-1.5 sm:space-y-2">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 text-health-primary rounded-full flex items-center justify-center mx-auto">
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <h3 className="font-bold text-gray-950 text-xs sm:text-sm">{portal.role}</h3>
                      <p className="text-gray-550 text-[10px] sm:text-[11px] leading-relaxed font-medium hidden sm:block">{portal.desc}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="relative flex justify-center items-center overflow-visible order-1 lg:order-2">
              <div className="absolute -inset-8 rounded-full bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-900 opacity-25 blur-xl" />
              <div className="relative z-10 w-full max-w-[340px] sm:max-w-[440px] mx-auto aspect-square rounded-full overflow-hidden shadow-2xl border-4 border-white">
                <img src="/pharmacy.png" alt="Healthcare Workers" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-4 sm:-bottom-6 right-2 sm:right-0 w-56 sm:w-72 z-20">
                <div className="bg-emerald-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl text-white space-y-2 sm:space-y-3">
                  <div className="flex items-center space-x-2 mb-1 sm:mb-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/30 flex items-center justify-center">
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                  </div>
                  <h3 className="font-bold text-sm sm:text-lg">{t('landing.connectedCardHeading')}</h3>
                  <p className="text-xs sm:text-sm leading-relaxed text-emerald-100">{t('landing.connectedCardDesc')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 bg-white border-t border-gray-150">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-8">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            {t('landing.partnerTitle')}
          </span>
          <div className="flex flex-wrap justify-center items-center gap-4">
            {[
              'Ministry of Health',
              'RSSB',
              'MMI Rwanda',
              'WHO Rwanda',
              'UNICEF Rwanda',
              'Rwanda Biomedical Centre',
            ].map((partner) => (
              <span
                key={partner}
                className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 transition-colors cursor-default"
              >
                {partner}
              </span>
            ))}
          </div>
        </div>
      </section>
      <section id="faq" className="py-20 bg-white border-t border-gray-150">
        <div className="max-w-4xl mx-auto px-6 space-y-10">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-health-primary">
              {t('nav.faq')}
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900">{t('nav.faq')}</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isExpanded = expandedFaq === idx
              return (
                <div
                  key={idx}
                  className="border border-gray-250 rounded-lg overflow-hidden bg-white"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors text-left focus:outline-none"
                  >
                    <span className="font-bold text-gray-900 text-sm sm:text-base">{faq.q}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="px-6 pb-5 pt-1 text-gray-500 text-sm leading-relaxed border-t border-gray-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>
      <section className="bg-health-primary text-white py-16">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {t('landing.ctaTitle')}
          </h2>
          <p className="text-emerald-100 text-base max-w-md mx-auto">
            {t('landing.ctaSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2">
            <Link
              to="/register/patient"
              className="w-full sm:w-auto bg-white text-health-primary hover:bg-emerald-50 px-6 py-3 rounded-lg text-sm font-bold shadow-md transition-colors text-center"
            >
              {t('landing.ctaPatientBtn')}
            </Link>
            <Link
              to="/register/pharmacy"
              className="w-full sm:w-auto border border-white hover:bg-white/10 px-6 py-3 rounded-lg text-sm font-bold transition-colors text-center font-sans"
            >
              {t('landing.ctaPharmacyBtn')}
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto bg-emerald-950/40 border border-white/20 hover:bg-emerald-950/60 px-6 py-3 rounded-lg text-sm font-bold transition-colors text-center"
            >
              {t('landing.ctaSignInBtn')}
            </Link>
          </div>
        </div>
      </section>
      <footer
        id="contact"
        className="bg-[#111827] text-gray-400 pt-16 pb-8 border-t border-gray-800"
      >
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <img
                  src="/logo1.png"
                  alt="Rwanda E-Pharmacy Logo"
                  className="h-10 w-auto object-contain flex-shrink-0"
                />
                <div>
                  <span className="text-xs font-black text-white tracking-wider block uppercase leading-none">
                    Rwanda
                  </span>
                  <span className="text-xs font-black text-emerald-450 tracking-wider block uppercase leading-none mt-0.5">
                    E-Pharmacy
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                {t('landing.footerTagline')}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4">
                {t('landing.footerPlatform')}
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/login" className="hover:text-white transition-colors">
                    {t('landing.searchButton')}
                  </Link>
                </li>
                <li>
                  <a href="#home" className="hover:text-white transition-colors">
                    {t('feature.nearest.title')}
                  </a>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white transition-colors">
                    {t('nav.reservations')}
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white transition-colors">
                    {t('feature.upload.title')}
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white transition-colors">
                    {t('feature.reminders.title')}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4">
                {t('landing.footerPortal')}s
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/login" className="hover:text-white transition-colors">
                    {t('portal.patients.title')} {t('landing.footerPortal')}
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white transition-colors">
                    {t('portal.pharmacies.title')} {t('landing.footerPortal')}
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white transition-colors">
                    {t('portal.government.title')} {t('landing.footerPortal')}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4">
                {t('landing.footerLegal')}
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="#contact" className="hover:text-white transition-colors">
                    Help Centre
                  </a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-white transition-colors">
                    Report an Issue
                  </a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-white transition-colors">
                    {t('landing.footerContact')}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-gray-800">
            <div className="flex items-center space-x-3 bg-gray-900/40 p-4 rounded-xl border border-gray-800">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <div>
                <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                  Hotline
                </span>
                <span className="text-white text-sm font-bold">+250 788 000 000</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-gray-900/40 p-4 rounded-xl border border-gray-800">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                  Email
                </span>
                <span className="text-white text-sm font-bold">support@epharmacy.rw</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-gray-900/40 p-4 rounded-xl border border-gray-800">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                  Address
                </span>
                <span className="text-white text-sm font-bold">KG 7 Ave, Kigali, Rwanda</span>
              </div>
            </div>
          </div>

          {/* Copyright & Tags */}
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-xs">
            <span>&copy; 2024 Government of Rwanda. All rights reserved.</span>
            <div className="flex items-center space-x-4">
              <span>ISO 27001</span>
              <span>&bull;</span>
              <span>GDPR</span>
              <span>&bull;</span>
              <span>WCAG 2.1 AA</span>
              <span>&bull;</span>
              <span className="flex items-center text-emerald-400 font-bold">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1.5 inline-block"></span>
                All systems operational
              </span>
            </div>
          </div>
        </div>
      </footer>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {showChat && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-80 sm:w-96 overflow-hidden mb-4 flex flex-col h-[450px]">
            <div className="bg-health-primary text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded bg-emerald-500/25 flex items-center justify-center font-bold text-xs text-white">
                  &bull;
                </div>
                <h3 className="font-bold text-sm">Medicine Assistant</h3>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="text-white/80 hover:text-white transition-colors focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-emerald-50 text-emerald-800 text-[11px] px-4 py-2 border-b border-emerald-100 leading-normal font-medium flex-shrink-0">
              Educational information only. Does not replace professional medical advice.
            </div>

            <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-gray-50/50 flex flex-col">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-health-primary text-white rounded-tr-none'
                        : 'bg-white text-gray-800 border border-gray-150 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleSendMessage}
              className="p-3 bg-white border-t border-gray-150 flex items-center space-x-2 flex-shrink-0"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about a medicine..."
                className="flex-grow bg-gray-50 border border-gray-250 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
              />
              <button
                type="submit"
                className="bg-health-primary hover:bg-health-secondary text-white p-2 rounded-lg transition-colors flex-shrink-0 focus:outline-none"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        <button
          onClick={() => setShowChat(!showChat)}
          aria-label="Toggle Chat Assistant"
          className="w-14 h-14 bg-health-primary hover:bg-health-secondary text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 focus:outline-none"
        >
          {showChat ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        </button>
      </div>

    </div>
  )
}

function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function PharmacyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function MoHIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4.8 20h14.4M12 4v12M8 8h8M10 12h4" />
    </svg>
  )
}
