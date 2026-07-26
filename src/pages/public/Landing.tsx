import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { 
  Search, MapPin, Check, ChevronDown, ChevronUp, MessageSquare, 
  Upload, CreditCard, Bell, Bookmark, Shield, Sparkles, Bot, X, Send 
} from 'lucide-react'

export default function LandingPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState({
    registeredPharmacies: '1,847',
    patientsRegistered: '2.4M+',
    provincesCovered: '5',
    nationalAvailability: '94.2%'
  })
  const [showResults, setShowResults] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(1) // Item 1 (How do I find a medicine near me?) is expanded by default

  const [showChat, setShowChat] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string }>>([
    { sender: 'assistant', text: 'Hello! I can answer educational questions about medicines — what they are, what they treat, and common side effects. I do not replace professional medical advice. How can I help?' }
  ])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    const userMsg = chatInput.trim()
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }])
    setChatInput('')

    // Simulate AI assistant typing latency
    setTimeout(() => {
      let replyText = ''
      const lower = userMsg.toLowerCase()
      if (lower.includes('paracetamol')) {
        replyText = 'Paracetamol (Acetaminophen) is a common pain reliever and fever reducer. It is used to treat mild to moderate pain (headaches, muscle aches, toothaches) and reduce fever. Normal adult dose is 500mg-1000mg every 4-6 hours, not exceeding 4000mg per day to avoid potential liver damage.'
      } else if (lower.includes('amoxicillin')) {
        replyText = 'Amoxicillin is a penicillin-type antibiotic used to treat bacterial infections (e.g. pneumonia, strep throat, ear infections). It will not work for viral infections (cold, flu). Please make sure to complete the entire course prescribed by your physician.'
      } else if (lower.includes('ibuprofen')) {
        replyText = 'Ibuprofen is a Nonsteroidal Anti-inflammatory Drug (NSAID) used to treat fever, pain, and swelling. It is recommended to take it with food or milk to minimize potential stomach irritation.'
      } else {
        replyText = 'I can provide educational details on standard medications like Paracetamol, Amoxicillin, or Ibuprofen. Please consult a licensed professional medical provider for specific diagnosis, prescriptions, or medical decisions.'
      }
      setMessages(prev => [...prev, { sender: 'assistant', text: replyText }])
    }, 1000)
  }

  const pharmacies = [
    { name: 'Bralirwa Pharmacy', distance: '0.8 km', location: 'Gasabo', status: 'Available', price: 'RWF 300', insurance: true },
    { name: 'CityMed Nyarugenge', distance: '1.4 km', location: 'Nyarugenge', status: 'Available', price: 'RWF 300', insurance: true },
    { name: 'MedPlus Remera', distance: '2.1 km', location: 'Gasabo', status: 'Available', price: 'RWF 300', insurance: false },
    { name: 'HealthPoint Kicukiro', distance: '3.6 km', location: 'Kicukiro', status: 'Low Stock', price: 'RWF 300', insurance: true },
  ]

  const features = [
    {
      title: 'Search Any Medicine',
      desc: 'Find medicines by generic name, trade name, or manufacturer across all registered pharmacies in Rwanda.',
      icon: Search,
    },
    {
      title: 'Nearest Pharmacies',
      desc: 'Instantly see which pharmacies near your registered residence currently have the medicine in stock, sorted by distance.',
      icon: MapPin,
    },
    {
      title: 'Reserve for Pickup',
      desc: 'Reserve your medicine online and collect it in person at the pharmacy. No delivery — your medicine is held for you.',
      icon: Bookmark,
    },
    {
      title: 'Upload Prescription',
      desc: 'Photograph your prescription and submit it digitally. The pharmacy verifies it before you arrive.',
      icon: Upload,
    },
    {
      title: 'Insurance Integration',
      desc: 'See insurance coverage at a glance. Your insurer pays their share directly to the pharmacy.',
      icon: CreditCard,
    },
    {
      title: 'Medication Reminders',
      desc: 'Receive reminders when it is time to take your medicine, or when your reservation is ready for pickup.',
      icon: Bell,
    },
  ]

  const portalDetails = [
    {
      role: 'Patients',
      desc: 'Search medicines, check availability, reserve for pickup, manage prescriptions and reminders.',
      icon: UserIcon,
    },
    {
      role: 'Pharmacies',
      desc: 'Manage inventory, handle reservations, process billing with insurance integration.',
      icon: PharmacyIcon,
    },
    {
      role: 'Insurance Companies',
      desc: 'Track claims, monitor patient usage, process reimbursements to pharmacies.',
      icon: Shield,
    },
    {
      role: 'Ministry of Health',
      desc: 'Monitor national medicine availability, track disease trends, detect shortages.',
      icon: MoHIcon,
    },
  ]

  const faqs = [
    {
      q: 'Does this platform deliver medicines?',
      a: 'No, the platform does not deliver medicines. Its purpose is to ensure that every Rwandan can quickly locate a medicine, confirm it is available, verify their insurance coverage, and reserve it for in-person collection.',
    },
    {
      q: 'How do I find a medicine near me?',
      a: 'Search by generic name, trade name, or manufacturer. The system will show you all nearby pharmacies that currently have stock, sorted by distance from your registered residence.',
    },
    {
      q: 'Is insurance accepted?',
      a: 'Yes. Major public and private insurance providers in Rwanda (such as RSSB/Mutuelle, MMI, and RAMA) are integrated. The system calculates your co-payment share automatically.',
    },
    {
      q: 'Who can use this platform?',
      a: 'All citizens and residents of Rwanda with a valid National ID or passport can register as patients. Licensed pharmacies, insurance companies, and Ministry of Health personnel have dedicated portals.',
    },
    {
      q: 'Is my medical data secure?',
      a: 'Yes. The platform is fully ISO 27001 certified and GDPR compliant. Patient data is encrypted and accessible only to authorized healthcare professionals.',
    },
    {
      q: 'How do I register?',
      a: 'Patients can register online using their 16-digit Rwandan National ID. Pharmacies must submit their licensing details for verification by the Ministry of Health before activation.',
    },
  ]

  const toggleFaq = (idx: number) => {
    setExpandedFaq(expandedFaq === idx ? null : idx)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-150 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="w-8 h-8 rounded-full border border-gray-200 flex-shrink-0 bg-white shadow-sm"
              style={{
                backgroundImage: 'url(/logo.jpg)',
                backgroundSize: '270%',
                backgroundPosition: '50% 12%',
                backgroundRepeat: 'no-repeat'
              }}
              role="img"
              aria-label="Rwanda E-Pharmacy Logo"
            />
            <div>
              <span className="text-xs font-black text-gray-950 tracking-wider block uppercase leading-none">Rwanda</span>
              <span className="text-xs font-black text-health-primary tracking-wider block uppercase leading-none mt-0.5">E-Pharmacy</span>
              <span className="text-[8px] text-gray-400 font-bold block mt-0.5 leading-none uppercase tracking-wide">Government</span>
            </div>
          </div>

          <nav className="hidden md:flex space-x-8 text-sm font-bold text-gray-500">
            <a href="#home" className="hover:text-health-primary transition-colors">Home</a>
            <a href="#features" className="hover:text-health-primary transition-colors">Features</a>
            <a href="#about" className="hover:text-health-primary transition-colors">About</a>
            <a href="#faq" className="hover:text-health-primary transition-colors">FAQ</a>
            <a href="#contact" className="hover:text-health-primary transition-colors">Contact</a>
          </nav>

          <div className="flex items-center space-x-6">
            <Link to="/login" className="text-sm font-bold text-gray-800 hover:text-health-primary transition-colors">
              Log In
            </Link>
            <Link to="/register" className="bg-health-primary hover:bg-health-secondary text-white text-sm font-bold px-4 py-2.5 rounded-lg transition-colors">
              Register Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-health-light-text border border-emerald-100">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 inline-block"></span>
                GOVERNMENT OF RWANDA
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-tight">
                Find medicines across <br />
                Rwanda &mdash; instantly.
              </h1>
              <p className="text-gray-500 text-base sm:text-lg leading-relaxed max-w-xl">
                Search any medicine by name or manufacturer, see which nearby pharmacies have it in stock, check the price and insurance coverage, and reserve it for pickup &mdash; all in one place.
              </p>

              {/* Search Control */}
              <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
                <div className="relative flex-grow">
                  <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search a medicine, e.g. Paracetamol..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 shadow-sm text-sm"
                  />
                </div>
                <button
                  onClick={() => setShowResults(true)}
                  className="bg-health-primary hover:bg-health-secondary text-white font-bold px-6 py-3.5 rounded-xl transition-colors text-sm flex items-center justify-center space-x-2 shadow-md"
                >
                  <span>Search</span>
                </button>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <Link to="/register" className="font-bold text-health-primary hover:underline">
                  Create Account &gt;
                </Link>
                <span className="text-gray-300">|</span>
                <span>Free &middot; No card required</span>
              </div>
            </div>

            <div className="lg:col-span-5">
              {showResults ? (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden animate-fadeIn">
                  <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">Search Results &mdash; {searchTerm || 'Paracetamol'}</h3>
                      <p className="text-xs text-gray-450 mt-0.5">4 pharmacies nearby</p>
                    </div>
                    <button 
                      onClick={() => {
                        setShowResults(false)
                        setSearchTerm('')
                      }} 
                      className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      Clear
                    </button>
                  </div>

                  <div className="divide-y divide-gray-150">
                    {pharmacies.map((pharmacy, idx) => (
                      <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50/30 transition-colors">
                        <div className="space-y-1">
                          <h4 className="font-bold text-gray-900 text-sm">{pharmacy.name}</h4>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>{pharmacy.distance}</span>
                            <span>&middot;</span>
                            <span>{pharmacy.location}</span>
                            <span>&middot;</span>
                            <span>{pharmacy.insurance ? 'Insurance' : 'No Insurance'}</span>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end space-y-1">
                          <span className="font-bold text-gray-900 text-sm">{pharmacy.price}</span>
                          <div className="flex items-center space-x-2">
                            <span className={`text-[10px] font-bold ${
                              pharmacy.status === 'Available' ? 'text-emerald-600' : 'text-orange-550'
                            }`}>
                              {pharmacy.status}
                            </span>
                            {pharmacy.status !== 'MedPlus Remera' && (
                              <Link to="/login" className="bg-health-primary hover:bg-health-secondary text-white text-[11px] font-bold px-3 py-1 rounded transition-colors">
                                Reserve
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-8 text-center flex flex-col items-center justify-center min-h-[350px]">
                  <div className="w-16 h-16 bg-emerald-50 text-health-primary rounded-full flex items-center justify-center mb-4">
                    <Search className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-black text-gray-900">National Medicine Search</h3>
                  <p className="text-gray-500 text-xs mt-2 max-w-xs leading-relaxed mx-auto">
                    Search by generic name (e.g. Paracetamol) or trade name to view real-time availability, copay insurance splits, and nearby locations.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-y border-gray-200 py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-gray-200 text-center">
            <div className="space-y-1">
              <span className="block text-3xl font-extrabold text-gray-900">{stats.registeredPharmacies}</span>
              <span className="block text-xs text-gray-500 font-bold uppercase tracking-wider">Registered Pharmacies</span>
            </div>
            <div className="space-y-1 pl-4">
              <span className="block text-3xl font-extrabold text-gray-900">{stats.patientsRegistered}</span>
              <span className="block text-xs text-gray-500 font-bold uppercase tracking-wider">Patients Registered</span>
            </div>
            <div className="space-y-1 pl-4">
              <span className="block text-3xl font-extrabold text-gray-900">{stats.provincesCovered}</span>
              <span className="block text-xs text-gray-500 font-bold uppercase tracking-wider">Provinces Covered</span>
            </div>
            <div className="space-y-1 pl-4">
              <span className="block text-3xl font-extrabold text-gray-900">{stats.nationalAvailability}</span>
              <span className="block text-xs text-gray-500 font-bold uppercase tracking-wider">National Availability</span>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="space-y-4 max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-widest text-health-primary">Platform Features</span>
            <h2 className="text-3xl font-extrabold text-gray-900">Everything you need in one platform.</h2>
            <p className="text-gray-500 text-base">
              From finding a medicine to confirming your insurance coverage and reserving for pickup.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {features.map((feat, idx) => {
              const Icon = feat.icon
              return (
                <div key={idx} className="p-6 bg-white rounded-xl border border-gray-150 hover:shadow-md transition-shadow duration-150 space-y-4">
                  <div className="w-10 h-10 bg-emerald-50 text-health-primary rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">{feat.title}</h3>
                  <p className="text-gray-550 text-sm leading-relaxed">{feat.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* About The Platform Section */}
      <section id="about" className="py-20 bg-white border-t border-gray-150">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column */}
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-health-primary">About the Platform</span>
              <h2 className="text-3xl font-extrabold text-gray-900 leading-tight">
                A national healthcare infrastructure project.
              </h2>
              <div className="space-y-4 text-gray-500 text-base leading-relaxed">
                <p>
                  Rwanda E-Pharmacy is an initiative of the Ministry of Health to digitise medicine access across all five provinces. The platform connects patients, pharmacies, insurance companies, and government health authorities into one centralised, real-time system.
                </p>
                <p>
                  The platform does not deliver medicines. Its purpose is to ensure that every Rwandan can quickly locate a medicine, confirm it is available, verify their insurance coverage, and reserve it for in-person collection.
                </p>
              </div>

              {/* Compliance Badges */}
              <div className="flex flex-wrap gap-2 pt-4">
                {['ISO 27001 Certified', 'GDPR Compliant', 'WCAG 2.1 AA', 'MOH Regulated', '24/7 Availability'].map((badge) => (
                  <span key={badge} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-health-light-text border border-emerald-100">
                    <Check className="w-3.5 h-3.5 mr-1" /> {badge}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {portalDetails.map((portal, idx) => {
                const Icon = portal.icon
                return (
                  <div key={idx} className="p-5 rounded-xl border border-gray-150 flex items-start space-x-4 bg-white hover:bg-gray-50/30 transition-colors">
                    <div className="w-10 h-10 bg-emerald-50 text-health-primary rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">{portal.role}</h3>
                      <p className="text-gray-500 text-sm mt-1 leading-relaxed">{portal.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Partner Organisations */}
      <section className="py-16 bg-white border-t border-gray-150">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-8">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Partner Organisations</span>
          <div className="flex flex-wrap justify-center items-center gap-4">
            {['Ministry of Health', 'RSSB', 'MMI Rwanda', 'WHO Rwanda', 'UNICEF Rwanda', 'Rwanda Biomedical Centre'].map((partner) => (
              <span key={partner} className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 transition-colors cursor-default">
                {partner}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white border-t border-gray-150">
        <div className="max-w-4xl mx-auto px-6 space-y-10">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-health-primary">FAQ</span>
            <h2 className="text-3xl font-extrabold text-gray-900">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isExpanded = expandedFaq === idx
              return (
                <div key={idx} className="border border-gray-250 rounded-lg overflow-hidden bg-white">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors text-left focus:outline-none"
                  >
                    <span className="font-bold text-gray-900 text-sm sm:text-base">{faq.q}</span>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
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

      {/* CTA Section */}
      <section className="bg-health-primary text-white py-16">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Ready to find your medicine?</h2>
          <p className="text-emerald-100 text-base max-w-md mx-auto">
            Join 2.4 million Rwandans already registered. Free for all patients.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2">
            <Link to="/register" className="w-full sm:w-auto bg-white text-health-primary hover:bg-emerald-50 px-6 py-3 rounded-lg text-sm font-bold shadow-md transition-colors text-center">
              Create Free Account
            </Link>
            <Link to="/login" className="w-full sm:w-auto border border-white hover:bg-white/10 px-6 py-3 rounded-lg text-sm font-bold transition-colors text-center">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-[#111827] text-gray-400 pt-16 pb-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          {/* Main columns */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-10 h-10 rounded-full border border-gray-800 flex-shrink-0 bg-white"
                  style={{
                    backgroundImage: 'url(/logo.jpg)',
                    backgroundSize: '270%',
                    backgroundPosition: '50% 12%',
                    backgroundRepeat: 'no-repeat'
                  }}
                  role="img"
                  aria-label="Rwanda E-Pharmacy Logo"
                />
                <div>
                  <span className="text-xs font-black text-white tracking-wider block uppercase leading-none">Rwanda</span>
                  <span className="text-xs font-black text-emerald-450 tracking-wider block uppercase leading-none mt-0.5">E-Pharmacy</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Official national digital pharmacy platform operated by the Government of Rwanda.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4">Platform</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/patient/search" className="hover:text-white transition-colors">Search Medicines</Link></li>
                <li><a href="#home" className="hover:text-white transition-colors">Nearby Pharmacies</a></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Reservations</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Upload Prescription</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Medicine Reminders</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4">Portals</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/login" className="hover:text-white transition-colors">Patient Portal</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Pharmacy Portal</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Insurance Portal</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Government Portal</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4">Support</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#contact" className="hover:text-white transition-colors">Help Centre</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Report an Issue</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>

          {/* Contact Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-gray-800">
            <div className="flex items-center space-x-3 bg-gray-900/40 p-4 rounded-xl border border-gray-800">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Hotline</span>
                <span className="text-white text-sm font-bold">+250 788 000 000</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-gray-900/40 p-4 rounded-xl border border-gray-800">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Email</span>
                <span className="text-white text-sm font-bold">support@epharmacy.rw</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-gray-900/40 p-4 rounded-xl border border-gray-800">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Address</span>
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

      {/* Floating AI Assistant Chat Widget (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {showChat && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-80 sm:w-96 overflow-hidden mb-4 flex flex-col h-[450px]">
            {/* Header */}
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

            {/* Disclaimer */}
            <div className="bg-emerald-50 text-emerald-800 text-[11px] px-4 py-2 border-b border-emerald-100 leading-normal font-medium flex-shrink-0">
              Educational information only. Does not replace professional medical advice.
            </div>

            {/* Message Area */}
            <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-gray-50/50 flex flex-col">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-health-primary text-white rounded-tr-none' 
                      : 'bg-white text-gray-800 border border-gray-150 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-150 flex items-center space-x-2 flex-shrink-0">
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

        {/* Floating Button Toggle */}
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

// Inline SVGs/components for portal details to avoid additional dependencies
function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function PharmacyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function MoHIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4.8 20h14.4M12 4v12M8 8h8M10 12h4" />
    </svg>
  )
}
