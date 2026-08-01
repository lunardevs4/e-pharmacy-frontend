import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
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
      case 'INSURANCE':
        return [
          { path: '/insurance', label: 'Dashboard', icon: LayoutDashboard },
          { path: '/insurance/claims', label: 'Claims Reviews', icon: FileText },
          { path: '/insurance/payments', label: 'Payments', icon: DollarSign },
          { path: '/insurance/reports', label: 'Reports', icon: BarChart2 },
          { path: '/insurance/patients', label: 'Insured Patients', icon: Users },
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
          className="fixed inset-0 z-30 bg-gray-900/40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Panel */}
      <aside className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col transform transition-transform duration-250 ease-in-out md:translate-x-0 md:static ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Brand header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-xs">
              R
            </div>
            <div>
              <span className="font-bold text-sm leading-none block text-white">Rwanda</span>
              <span className="block text-[8px] text-emerald-450 tracking-wider font-semibold uppercase mt-0.5">
                E-Pharmacy
              </span>
            </div>
          </div>
          <button onClick={toggleSidebar} className="md:hidden text-white hover:text-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-grow py-6 px-4 space-y-1 overflow-y-auto">
          <span className="block text-[10px] font-bold tracking-wider text-slate-500 uppercase px-3 mb-2">
            {user?.role} Portal
          </span>
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive = location.pathname === link.path
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
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-450'}`} />
                  <span>{link.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
              </Link>
            )
          })}
        </nav>

        {/* Footer profile & logout */}
        <div className="p-4 border-t border-slate-800 bg-[#0f172a]/40 flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 flex-shrink-0">
              {user?.name ? (
                user.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
              ) : 'MU'}
            </div>
            <div className="overflow-hidden">
              <span className="block font-bold text-xs text-white truncate">{user?.name || 'Marie Uwimana'}</span>
              <span className="block text-[10px] text-slate-400 truncate">v2.4.1</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors focus:outline-none"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-20">
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleSidebar} 
              className="text-gray-500 hover:text-health-primary focus:outline-none"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:block text-sm text-gray-500 font-medium">
              Republic of Rwanda &bull; Integrated Healthcare Platform
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications toggle */}
            <button className="relative w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-550 hover:text-health-primary transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
            </button>

            {/* Profile widget */}
            <div className="flex items-center space-x-2 border-l border-gray-200 pl-4">
              <span className="text-xs font-bold text-gray-800 hidden md:block">
                {user?.name}
              </span>
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-health-primary flex items-center justify-center font-bold text-sm">
                {user?.name?.[0]}
              </div>
            </div>
          </div>
        </header>

        {/* Content Page Container */}
        <main className="flex-grow p-6 overflow-y-auto max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
