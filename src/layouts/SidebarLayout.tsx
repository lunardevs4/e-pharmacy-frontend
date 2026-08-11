import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { useEffect } from 'react'
import { 
  Menu, X, LogOut, User, Bell, ChevronRight,
  LayoutDashboard, Search, FileText, History, Settings, ShieldAlert,
  ClipboardList, Package, DollarSign, TrendingUp, BarChart2, Users, FileLock2, MapPin
} from 'lucide-react'

export default function SidebarLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { sidebarOpen, toggleSidebar } = useUIStore()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Close sidebar on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sidebarOpen) toggleSidebar()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [sidebarOpen, toggleSidebar])

  // Redirect unapproved pharmacies attempting to navigate away from dashboard
  useEffect(() => {
    if (user?.role === 'PHARMACY' && user?.pharmacy?.status !== 'APPROVED' && location.pathname !== '/pharmacy') {
      navigate('/pharmacy')
    }
  }, [user, location.pathname, navigate])

  // Define sidebar links based on role
  const getLinks = () => {
    const role = user?.role || 'PATIENT'
    switch (role) {
      case 'PATIENT':
        return [
          { path: '/patient', label: 'Dashboard', icon: LayoutDashboard },
          { path: '/patient/search', label: 'Search Medicine', icon: Search },
          { path: '/patient/reservations', label: 'My Reservations', icon: ClipboardList },
          { path: '/patient/history', label: 'History', icon: History },
          { path: '/patient/notifications', label: 'Notifications', icon: Bell },
          { path: '/patient/profile', label: 'Profile', icon: User },
        ]
      case 'PHARMACY':
        return [
          { path: '/pharmacy', label: 'Dashboard', icon: LayoutDashboard },
          { path: '/pharmacy/inventory', label: 'Inventory', icon: Package },
          { path: '/pharmacy/reservations', label: 'Reservations', icon: ClipboardList },
          { path: '/pharmacy/patients', label: 'Patients', icon: Users },
          { path: '/pharmacy/claims', label: 'Billing', icon: DollarSign },
          { path: '/pharmacy/staff', label: 'Staff Management', icon: Users },
          { path: '/pharmacy/audit', label: 'Audit Trail', icon: FileLock2 },
          { path: '/pharmacy/reports', label: 'Reports', icon: BarChart2 },
          { path: '/pharmacy/settings', label: 'Settings', icon: Settings },
        ]
      case 'GOVERNMENT':
        return [
          { path: '/government', label: 'Dashboard', icon: LayoutDashboard },
          { path: '/government/pharmacies', label: 'Pharmacy Registry', icon: Users },
          { path: '/government/medicines', label: 'Medicine Registry', icon: Package },
          { path: '/government/analytics', label: 'National Analytics', icon: BarChart2 },
          { path: '/government/districts', label: 'District Heatmap', icon: MapPin },
          { path: '/government/province-analytics', label: 'Province Analytics', icon: TrendingUp },
          { path: '/government/medicine-analytics', label: 'Drug Analytics', icon: Package },
          { path: '/government/compliance', label: 'Compliance Audits', icon: FileLock2 },
          { path: '/government/reports', label: 'MOH Reports', icon: FileText },
        ]
      case 'ADMIN':
        return [
          { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
          { path: '/admin/users', label: 'Users', icon: Users },
          { path: '/admin/medicines', label: 'Medicines', icon: Package },
          { path: '/admin/roles', label: 'Roles & Access', icon: ShieldAlert },
          { path: '/admin/settings', label: 'Settings', icon: Settings },
          { path: '/admin/audit', label: 'Audit Logs', icon: FileLock2 },
        ]
      default:
        return []
    }
  }

  const navLinks = getLinks()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div 
          onClick={toggleSidebar}
          aria-hidden="true"
          className="fixed inset-0 z-30 bg-gray-900/40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Panel — always fixed, never scrolls with page */}
      <aside
        id="main-sidebar"
        aria-label="Main navigation"
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="bg-white rounded-lg p-1.5 flex-shrink-0">
              <img
                src="/logo1.png"
                alt="Rwanda E-Pharmacy"
                className="h-8 w-auto object-contain"
              />
            </div>
            <div>
              <span className="font-black text-sm leading-none block text-white tracking-wide">Rwanda</span>
              <span className="block text-[9px] text-emerald-400 tracking-widest font-bold uppercase mt-0.5">
                E-Pharmacy
              </span>
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            aria-label="Close navigation menu"
            aria-expanded={sidebarOpen}
            aria-controls="main-sidebar"
            className="md:hidden text-white hover:text-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 rounded"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Navigation list */}
        <nav aria-label={`${user?.role} portal navigation`} className="flex-grow py-6 px-4 space-y-1 overflow-y-auto">
          <span className="block text-[10px] font-bold tracking-wider text-slate-500 uppercase px-3 mb-2">
            {user?.role} Portal
          </span>
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive = location.pathname === link.path
            const isPharmacyApproved = user?.role !== 'PHARMACY' || user?.pharmacy?.status === 'APPROVED'
            const isDisabled = !isPharmacyApproved && link.path !== '/pharmacy'

            if (isDisabled) {
              return (
                <div
                  key={link.path}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium opacity-40 cursor-not-allowed text-slate-500 select-none"
                  title="MOH Approval Required"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4 text-slate-500" aria-hidden="true" />
                    <span className="text-slate-400">{link.label}</span>
                  </div>
                </div>
              )
            }

            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-slate-800 text-white font-bold shadow-sm' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} aria-hidden="true" />
                  <span>{link.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />}
              </Link>
            )
          })}
        </nav>

        {/* Footer profile & logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div
              aria-hidden="true"
              className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 flex-shrink-0"
            >
              {user?.name ? user.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() : 'MU'}
            </div>
            <div className="overflow-hidden">
              <span className="block font-bold text-xs text-white truncate">{user?.name || 'User'}</span>
              <span className="block text-[10px] text-slate-400 truncate">v2.4.1</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            aria-label="Sign out of your account"
            className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-400"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </aside>

      {/* Main Container — offset by sidebar width on desktop */}
      <div className="flex-grow flex flex-col min-w-0 md:ml-64">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-20">
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleSidebar}
              aria-label="Toggle navigation menu"
              aria-expanded={sidebarOpen}
              aria-controls="main-sidebar"
              className="text-gray-500 hover:text-health-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 rounded"
            >
              <Menu className="w-6 h-6" aria-hidden="true" />
            </button>
            <div className="hidden sm:block text-sm text-gray-500 font-medium">
              Republic of Rwanda &bull; Integrated Healthcare Platform
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              className="relative w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-health-primary transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
              aria-label="Notifications — 1 unread"
            >
              <Bell className="w-5 h-5" aria-hidden="true" />
              <span aria-hidden="true" className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
            </button>

            {/* Profile widget */}
            <div className="flex items-center space-x-2 border-l border-gray-200 pl-4">
              <span className="text-xs font-bold text-gray-800 hidden md:block">
                {user?.name}
              </span>
              <div
                aria-hidden="true"
                className="w-8 h-8 rounded-full bg-emerald-100 text-health-primary flex items-center justify-center font-bold text-sm"
              >
                {user?.name?.[0]}
              </div>
            </div>
          </div>
        </header>

        {/* Content Page Container */}
        <main id="main-content" className="flex-grow p-6 overflow-y-auto max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
