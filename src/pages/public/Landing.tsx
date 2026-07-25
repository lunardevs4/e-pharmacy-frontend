import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, CheckCircle, FileText } from 'lucide-react'

export default function LandingPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showResults, setShowResults] = useState(false)

  const pharmacies = [
    { name: 'Bralirwa Pharmacy', distance: '0.8 km', location: 'Gasabo', status: 'Available', price: 'RWF 300', insurance: true },
    { name: 'CityMed Nyarugenge', distance: '1.4 km', location: 'Nyarugenge', status: 'Available', price: 'RWF 300', insurance: true },
    { name: 'MedPlus Remera', distance: '2.1 km', location: 'Gasabo', status: 'Available', price: 'RWF 300', insurance: false },
    { name: 'HealthPoint Kicukiro', distance: '3.6 km', location: 'Kicukiro', status: 'Low Stock', price: 'RWF 300', insurance: true },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top Banner / Ministry badge */}
      <div className="bg-emerald-950 text-emerald-100 py-2 px-4 text-xs font-semibold text-center uppercase tracking-wider">
        Ministry of Health • Republic of Rwanda • National E-Pharmacy Platform
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-health-primary flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">Rwanda E-Pharmacy</span>
              <span className="block text-[9px] text-emerald-700 font-bold uppercase tracking-widest -mt-1">National System</span>
            </div>
          </div>

          <nav className="hidden md:flex space-x-8 text-sm font-medium text-gray-500">
            <a href="#features" className="hover:text-health-primary">Features</a>
            <a href="#about" className="hover:text-health-primary">About</a>
            <a href="#faq" className="hover:text-health-primary">FAQ</a>
            <a href="#contact" className="hover:text-health-primary">Contact</a>
          </nav>

          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-sm font-semibold text-gray-700 hover:text-health-primary">Log In</Link>
            <Link to="/register" className="bg-health-primary hover:bg-health-secondary text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors duration-200">
              Register Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                <CheckCircle className="w-3.5 h-3.5 mr-1" /> MINISTRY OF HEALTH • REPUBLIC OF RWANDA
              </span>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
                Find medicines across <br className="hidden sm:inline" />
                <span className="text-health-primary">Rwanda — instantly.</span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed max-w-xl">
                Search any medicine by name or manufacturer, see which nearby pharmacies have it in stock, check the price and insurance coverage, and reserve it for pickup — all in one place.
              </p>

              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
                <div className="relative flex-grow">
                  <Search className="absolute left-4 top-3.5 h-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search a medicine, e.g. Paracetamol..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 shadow-sm"
                  />
                </div>
                <button
                  onClick={() => setShowResults(true)}
                  className="bg-health-primary hover:bg-health-secondary text-white font-semibold px-6 py-3 rounded-xl transition-all duration-150 flex items-center justify-center space-x-2"
                >
                  <span>Search</span>
                </button>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <Link to="/register" className="font-semibold text-health-primary hover:underline">Create Account &rarr;</Link>
                <span>•</span>
                <span>Free • No card required</span>
              </div>
            </div>

            {/* Right Live Mockup */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">Search Results</h3>
                    <p className="text-xs text-gray-500">Showing pharmacies nearby</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-full">
                    {showResults ? searchTerm || 'Paracetamol' : 'Enter medication'}
                  </span>
                </div>

                <div className="divide-y divide-gray-150 max-h-[360px] overflow-y-auto">
                  {showResults ? (
                    pharmacies.map((pharmacy, idx) => (
                      <div key={idx} className="p-4 hover:bg-emerald-50/20 transition-colors duration-150">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm">{pharmacy.name}</h4>
                            <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                              <span className="flex items-center"><MapPin className="w-3 h-3 mr-0.5" /> {pharmacy.distance}</span>
                              <span>•</span>
                              <span>{pharmacy.location}</span>
                              <span>•</span>
                              <span>{pharmacy.insurance ? 'Insurance OK' : 'No Insurance'}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="block font-bold text-gray-900 text-sm">{pharmacy.price}</span>
                            <span className={`inline-block text-[10px] font-semibold mt-1 px-2 py-0.5 rounded-full ${
                              pharmacy.status === 'Available' ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-850'
                            }`}>
                              {pharmacy.status}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 flex justify-end">
                          <Link to="/login" className="bg-health-primary hover:bg-health-secondary text-white text-xs font-bold px-3.5 py-1.5 rounded-md transition-colors">
                            Reserve
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-550 space-y-2">
                      <Search className="w-8 h-8 text-gray-300 mx-auto animate-bounce" />
                      <p className="text-sm font-semibold text-gray-700">No active search</p>
                      <p className="text-xs text-gray-400">Type a medication (like "Paracetamol") and press search to view real-time availability across Rwanda.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <section className="bg-emerald-950 text-white py-12 border-y border-emerald-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <span className="block text-3xl sm:text-4xl font-extrabold text-emerald-400">1,847</span>
                <span className="block text-xs uppercase tracking-wider text-emerald-250 mt-1">Registered Pharmacies</span>
              </div>
              <div>
                <span className="block text-3xl sm:text-4xl font-extrabold text-emerald-400">2.4M+</span>
                <span className="block text-xs uppercase tracking-wider text-emerald-250 mt-1">Patients Registered</span>
              </div>
              <div>
                <span className="block text-3xl sm:text-4xl font-extrabold text-emerald-400">5</span>
                <span className="block text-xs uppercase tracking-wider text-emerald-250 mt-1">Provinces Covered</span>
              </div>
              <div>
                <span className="block text-3xl sm:text-4xl font-extrabold text-emerald-400">94.2%</span>
                <span className="block text-xs uppercase tracking-wider text-emerald-250 mt-1">National Availability</span>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Features Section */}
        <section id="features" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-health-primary">Platform Features</span>
              <h2 className="text-3xl font-extrabold text-gray-900">Everything you need in one platform.</h2>
              <p className="text-gray-500">
                Seamless digital healthcare workflows linking citizens, pharmacies, insurance companies, and regulators.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-150 space-y-4">
                <div className="w-12 h-12 bg-emerald-100 text-health-primary rounded-xl flex items-center justify-center">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Real-Time Search</h3>
                <p className="text-gray-650 text-sm">
                  Locate standard medications, generic substitutes, and critical drugs across any local pharmacy in the country.
                </p>
              </div>

              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-150 space-y-4">
                <div className="w-12 h-12 bg-emerald-100 text-health-primary rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Instant Reservations</h3>
                <p className="text-gray-650 text-sm">
                  Reserve your prescription medications with real-time feedback and pricing, avoiding out-of-stock disappointments.
                </p>
              </div>

              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-150 space-y-4">
                <div className="w-12 h-12 bg-emerald-100 text-health-primary rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Insurance Co-Pay Splitting</h3>
                <p className="text-gray-650 text-sm">
                  Verify mutual insurance coverage (RSSB, MMI, etc.) and calculate patient contribution automatically.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="contact" className="bg-emerald-950 text-emerald-200 border-t border-emerald-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded bg-emerald-400 text-emerald-950 flex items-center justify-center font-bold">
                R
              </div>
              <span className="font-bold text-white">Rwanda National E-Pharmacy</span>
            </div>
            <p className="text-xs text-emerald-400">
              &copy; {new Date().getFullYear()} Ministry of Health. All rights reserved. Registered under RSSB standard guidelines.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
