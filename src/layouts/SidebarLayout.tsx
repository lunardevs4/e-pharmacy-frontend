import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { 
  Menu, X, LogOut, User, Bell, ChevronRight,
  LayoutDashboard, Search, FileText, History, Settings, ShieldAlert,
  ClipboardList, Package, DollarSign, TrendingUp, BarChart2, Users, FileLock2 
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
          { path: '/pharmacy/claims', label: 'Insurance Claims', icon: DollarSign },
          { path: '/pharmacy/reports', label: 'Reports', icon: TrendingUp },
          { path: '/pharmacy/notifications', label: 'Notifications', icon: Bell },
          { path: '/pharmacy/profile', label: 'Profile', icon: User },
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
          { path: '/government/medicine', label: 'Medicine Analytics', icon: Package },
          { path: '/government/district', label: 'District Analytics', icon: BarChart2 },
          { path: '/government/province', label: 'Province Analytics', icon: TrendingUp },
          { path: '/government/reports', label: 'MOH Reports', icon: FileText },
        ]
      case 'ADMIN':
        return [
          { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
          { path: '/admin/users', label: 'Users', icon: Users },
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
      <aside className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-emerald-950 text-white flex flex-col transform transition-transform duration-250 ease-in-out md:translate-x-0 md:static ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Brand header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-emerald-900/60">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded bg-emerald-400 text-emerald-950 flex items-center justify-center font-bold text-base">
              R
            </div>
            <div>
              <span className="font-bold text-sm leading-tight block">National E-Pharmacy</span>
              <span className="block text-[8px] text-emerald-350 tracking-wider font-semibold uppercase -mt-0.5">
                {user?.role} Portal
              </span>
            </div>
          </div>
          <button onClick={toggleSidebar} className="md:hidden text-white hover:text-emerald-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-grow py-6 px-4 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive = location.pathname === link.path
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-emerald-800 text-white font-bold shadow-md' 
                    : 'text-emerald-200 hover:bg-emerald-900/50 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-emerald-300'}`} />
                  <span>{link.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />}
              </Link>
            )
          })}
        </nav>

        {/* Footer profile & logout */}
        <div className="p-4 border-t border-emerald-900/60 bg-emerald-970">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-emerald-800 flex items-center justify-center text-sm font-bold text-emerald-300">
              {user?.name?.[0]}
            </div>
            <div className="overflow-hidden">
              <span className="block font-bold text-xs truncate">{user?.name}</span>
              <span className="block text-[10px] text-emerald-300 truncate">{user?.email}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-emerald-900/50 hover:bg-red-900/30 text-emerald-250 hover:text-red-200 border border-emerald-800/40 rounded-lg text-xs font-semibold transition-colors duration-150"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
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
