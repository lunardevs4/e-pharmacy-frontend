import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { useNotificationStore } from '@/store/notificationStore'
import { useEffect, useRef, useState } from 'react'
import PharmacyRegistrationGate, { isPharmacyGated } from '@/components/pharmacy/PharmacyRegistrationGate'
import { Lock } from 'lucide-react'
import {
  Menu, X, LogOut, User, Bell, ChevronRight,
  LayoutDashboard, Search, FileText, History, Settings, ShieldAlert,
  ClipboardList, Package, DollarSign, TrendingUp, BarChart2, Users, FileLock2, MapPin,
  CheckSquare, Trash2, Clock, AlarmClock, PanelLeft, Percent
} from 'lucide-react'

export default function SidebarLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { sidebarOpen, setSidebarOpen, toggleSidebar } = useUIStore()
  const { items: notifs, unreadCount, load, markRead, markAllRead, remove } = useNotificationStore()
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  // Load notifications for this role on mount / role change
  useEffect(() => {
    if (user?.role) {
      const normalizedRole = ['PHARMACY', 'PHARMACY_OWNER', 'PHARMACIST'].includes(user.role) ? 'PHARMACY' : user.role
      load(normalizedRole)
    }
  }, [user?.role, load])

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Notification page path per role
  const notifPath = () => {
    switch (user?.role) {
      case 'PATIENT':    return '/patient/notifications'
      case 'PHARMACY':
      case 'PHARMACY_OWNER':
      case 'PHARMACIST': return '/pharmacy/notifications'
      case 'INSURANCE':  return '/insurance/notifications'
      case 'GOVERNMENT': return '/government/notifications'
      case 'ADMIN':      return '/admin/notifications'
      default:           return null
    }
  }

  // Track whether we've done the initial size-based open so resize doesn't override user choice
  const initialised = useRef(false)

  // On first mount: open sidebar if desktop, close if mobile
  useEffect(() => {
    if (!initialised.current) {
      setSidebarOpen(window.innerWidth >= 768)
      initialised.current = true
    }
  }, [setSidebarOpen])

  // On resize: only auto-adjust when crossing the breakpoint boundary
  useEffect(() => {
    let wasDesktop = window.innerWidth >= 768
    const onResize = () => {
      const isDesktop = window.innerWidth >= 768
      if (isDesktop !== wasDesktop) {
        // Switched breakpoints — snap to expected default
        setSidebarOpen(isDesktop)
        wasDesktop = isDesktop
      }
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [setSidebarOpen])

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sidebarOpen) setSidebarOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [sidebarOpen, setSidebarOpen])

  // Close sidebar when navigating on mobile
  useEffect(() => {
    if (window.innerWidth < 768) setSidebarOpen(false)
  }, [location.pathname, setSidebarOpen])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const getLinks = () => {
    const role = user?.role || 'PATIENT'
    switch (role) {
      case 'PATIENT':
        return [
          { path: '/patient',               label: 'Dashboard',      icon: LayoutDashboard },
          { path: '/patient/search',         label: 'Search Medicine',icon: Search          },
          { path: '/patient/reservations',   label: 'My Reservations',icon: ClipboardList   },
          { path: '/patient/history',        label: 'History',        icon: History         },
          { path: '/patient/reminders',      label: 'Reminders',      icon: AlarmClock      },
          { path: '/patient/notifications',  label: 'Notifications',  icon: Bell            },
          { path: '/patient/profile',        label: 'Profile',        icon: User            },
        ]
      case 'PHARMACY':
      case 'PHARMACY_OWNER':
      case 'PHARMACIST': {
        const isOwner = user?.role === 'PHARMACY' || user?.role === 'PHARMACY_OWNER'
        const links = [
          { path: '/pharmacy',               label: 'Dashboard',      icon: LayoutDashboard },
          { path: '/pharmacy/inventory',     label: 'Inventory',      icon: Package         },
          { path: '/pharmacy/reservations',  label: 'Reservations',   icon: ClipboardList   },
          { path: '/pharmacy/patients',      label: 'Patients',       icon: Users           },
          { path: '/pharmacy/claims',        label: 'Billing',        icon: DollarSign      },
        ]
        if (isOwner) {
          links.push(
            { path: '/pharmacy/staff',         label: 'Staff',          icon: Users           },
            { path: '/pharmacy/audit',         label: 'Audit Trail',    icon: FileLock2       },
          )
        }
        links.push(
          { path: '/pharmacy/reports',       label: 'Reports',        icon: BarChart2       },
          { path: '/pharmacy/settings',      label: 'Profile',        icon: User            },
        )
        return links
      }
      case 'INSURANCE':
        return [
          { path: '/insurance',              label: 'Dashboard',      icon: LayoutDashboard },
          { path: '/insurance/claims',       label: 'Claims',         icon: FileText        },
          { path: '/insurance/payments',     label: 'Payments',       icon: DollarSign      },
          { path: '/insurance/tariffs',      label: 'Medicine Discounts', icon: Percent         },
          { path: '/insurance/reports',      label: 'Reports',        icon: BarChart2       },
          { path: '/insurance/patients',     label: 'Insured Patients',icon: Users          },
        ]
      case 'GOVERNMENT':
        return [
          { path: '/government',                    label: 'Dashboard',        icon: LayoutDashboard },
          { path: '/government/pharmacies',         label: 'Pharmacy Registry',icon: Users           },
          { path: '/government/medicines',          label: 'Medicine Registry',icon: Package         },
          { path: '/government/analytics',         label: 'National Analytics',icon: BarChart2       },
          { path: '/government/districts',         label: 'District Heatmap', icon: MapPin          },
          { path: '/government/province-analytics',label: 'Province Analytics',icon: TrendingUp      },
          { path: '/government/medicine-analytics',label: 'Drug Analytics',   icon: Package         },
          { path: '/government/compliance',        label: 'Compliance Audits',icon: FileLock2       },
          { path: '/government/reports',           label: 'MOH Reports',      icon: FileText        },
        ]
      case 'ADMIN':
        return [
          { path: '/admin',          label: 'Dashboard',   icon: LayoutDashboard },
          { path: '/admin/users',    label: 'Users',       icon: Users           },
          
          { path: '/admin/roles',    label: 'Roles',       icon: ShieldAlert     },
          { path: '/admin/settings', label: 'Profile',     icon: User            },
          { path: '/admin/audit',    label: 'Audit Logs',  icon: FileLock2       },
        ]
      default:
        return []
    }
  }

  const navLinks = getLinks()
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768
  const currentRole = user?.role ? (['PHARMACY', 'PHARMACY_OWNER', 'PHARMACIST'].includes(user.role) ? 'PHARMACY' : user.role) : ''

  // Pharmacy owners must register their store and receive MOH approval before
  // any portal section becomes usable.
  const portalGated = isPharmacyGated(user)

  // Dynamic theme colors and branding based on insurance provider
  const isInsurance = user?.role === 'INSURANCE'
  const insurer = user?.insuranceProvider || ''

  const sidebarBg = 'bg-[#064e3b]'
  const activeLinkClass = 'bg-[#022c22]/45 text-white font-bold border-l-4 border-emerald-400 pl-2 pr-3'
  const hoverLinkClass = 'text-emerald-100/80 hover:bg-[#022c22]/30 hover:text-white pl-3 pr-3'
  const borderClass = 'border-[#022c22]/50'
  const footerBg = 'bg-[#022c22]/45'

  const portalLabel = isInsurance
    ? insurer === 'MMI'
      ? 'MMI Portal'
      : 'RSSB Portal'
    : `${user?.role} Portal`

  const portalSub = isInsurance
    ? insurer === 'MMI'
      ? 'MMI Insurance'
      : 'RSSB Insurance'
    : 'E-Pharmacy'

  const headerBg = 'bg-white'
  const headerBorder = 'border-gray-200'

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Dark backdrop — only on mobile when sidebar is open */}
      {sidebarOpen && !isDesktop && (
        <div
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
          className="fixed inset-0 z-30 bg-gray-900/50 transition-opacity md:hidden"
        />
      )}

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside
        id="main-sidebar"
        aria-label="Main navigation"
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 ${sidebarBg} text-white flex flex-col overflow-hidden
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Brand */}
        <div className={`h-16 flex items-center justify-between px-4 border-b ${borderClass} flex-shrink-0`}>
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="flex-shrink-0 rounded-lg overflow-hidden">
              <img src="/browsersvg.png" alt="Rwanda E-Pharmacy" className="h-8 w-8 object-contain" />
            </div>
            <div className="min-w-0">
              <span className="font-black text-sm leading-none block text-white tracking-wide">Rwanda</span>
              <span className="block text-[9px] text-emerald-300 tracking-widest font-bold uppercase mt-0.5">
                {portalSub}
              </span>
            </div>
          </div>
          {/* Sidebar Toggle button — visible when sidebar is open */}
          <button
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
            className="text-slate-200 hover:text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 rounded p-1 flex-shrink-0"
          >
            <PanelLeft className="w-5 h-5 text-white" aria-hidden="true" />
          </button>
        </div>

        {/* Nav links */}
        <nav
          aria-label={`${portalLabel} navigation`}
          className="flex-grow py-5 px-3 space-y-0.5 overflow-y-auto"
        >
          <p className="text-[10px] font-bold tracking-wider text-emerald-200/70 uppercase px-3 mb-3">
            {portalLabel}
          </p>
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive = location.pathname === link.path
            const locked = portalGated
            return (
              <Link
                key={link.path}
                to={locked ? location.pathname : link.path}
                onClick={(e) => {
                  if (locked) e.preventDefault()
                }}
                aria-current={isActive ? 'page' : undefined}
                aria-disabled={locked || undefined}
                title={locked ? 'Register and get MOH approval to unlock this section' : undefined}
                className={`flex items-center justify-between py-2.5 rounded-none text-sm font-medium transition-all
                  focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 ${
                  isActive
                    ? activeLinkClass
                    : hoverLinkClass
                } ${locked ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-emerald-200/70'}`} aria-hidden="true" />
                  <span>{link.label}</span>
                </div>
                {locked ? (
                  <Lock className="w-3 h-3 text-emerald-300/70 flex-shrink-0" aria-label="Locked" />
                ) : (
                  isActive && <ChevronRight className="w-3.5 h-3.5 text-emerald-200/70 flex-shrink-0" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* User footer */}
        <div className={`p-4 border-t ${borderClass} ${footerBg} flex items-center justify-between flex-shrink-0`}>
          <div className="flex items-center space-x-3 overflow-hidden">
            <div
              aria-hidden="true"
              className="w-9 h-9 rounded-full bg-emerald-950 flex items-center justify-center text-xs font-bold text-emerald-100 flex-shrink-0"
            >
              {user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <span className="block font-bold text-xs text-white truncate">{user?.name || 'User'}</span>
              <span className="block text-[10px] text-emerald-200/70 truncate">{isInsurance ? `${insurer} Auditor` : user?.role}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            aria-label="Sign out"
            className="p-2 text-emerald-200/70 hover:text-red-300 rounded-lg hover:bg-emerald-800/70 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-400"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div
        className={`flex-grow flex flex-col min-w-0 transition-all duration-200 ${
          sidebarOpen ? 'md:ml-64' : 'ml-0'
        }`}
      >
        {/* Top header */}
        <header className={`h-16 ${headerBg} backdrop-blur border-b ${headerBorder} flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20`}>
          <div className="flex items-center space-x-3">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                aria-label="Open navigation menu"
                className="p-2 rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 mr-2 text-slate-900 hover:bg-slate-100"
              >
                <PanelLeft className="w-6 h-6" aria-hidden="true" />
              </button>
            )}

            <span className="hidden sm:block text-sm text-gray-550 font-bold tracking-tight">
              {portalLabel}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* ── Notification bell + dropdown ─────────────────────── */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(v => !v)}
                aria-label={`Notifications${unreadCount > 0 ? ` — ${unreadCount} unread` : ''}`}
                aria-expanded={notifOpen}
                className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-health-primary transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
              >
                <Bell className="w-5 h-5" aria-hidden="true" />
                {unreadCount > 0 && (
                  <span
                    aria-hidden="true"
                    className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-0.5 border-2 border-white"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown panel */}
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                      <span className="text-sm font-black text-gray-900">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={() => markAllRead(currentRole)}
                          className="text-[10px] font-bold text-emerald-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 rounded"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Notification list */}
                  <ul className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                    {notifs.length === 0 ? (
                      <li className="py-10 text-center text-gray-400">
                        <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" aria-hidden="true" />
                        <p className="text-xs font-semibold">No notifications</p>
                      </li>
                    ) : (
                      notifs.slice(0, 8).map(n => (
                        <li
                          key={n.id}
                          className={`flex items-start gap-3 px-4 py-3 transition-colors relative ${!n.read ? 'bg-emerald-50/30' : 'hover:bg-gray-50/60'}`}
                        >
                          {/* Unread indicator */}
                          {!n.read && (
                            <span aria-hidden="true" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-500 rounded-r-full" />
                          )}
                          <div className="flex-grow min-w-0">
                            <p className={`text-xs leading-snug ${!n.read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                              {n.title}
                            </p>
                            <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
                            <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400">
                              <Clock className="w-3 h-3" aria-hidden="true" />
                              <time dateTime={n.createdAt}>
                                {(() => {
                                  const diff = Math.floor((Date.now() - new Date(n.createdAt).getTime()) / 1000)
                                  if (diff < 60) return `${diff}s ago`
                                  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
                                  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
                                  return `${Math.floor(diff / 86400)}d ago`
                                })()}
                              </time>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0 pt-0.5">
                            {!n.read && (
                              <button
                                onClick={() => markRead(n.id, currentRole)}
                                aria-label="Mark as read"
                                className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-emerald-600 transition-colors"
                              >
                                <CheckSquare className="w-3.5 h-3.5" aria-hidden="true" />
                              </button>
                            )}
                            <button
                              onClick={() => remove(n.id, currentRole)}
                              aria-label="Dismiss notification"
                              className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                            </button>
                          </div>
                        </li>
                      ))
                    )}
                  </ul>

                  {/* Footer — link to full notifications page */}
                  <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                    {notifPath() ? (
                      <Link
                        to={notifPath()!}
                        onClick={() => setNotifOpen(false)}
                        className="block text-center text-xs font-bold text-health-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 rounded"
                      >
                        View all notifications →
                      </Link>
                    ) : (
                      <p className="text-center text-[11px] text-gray-400">
                        {notifs.length} notification{notifs.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="flex items-center space-x-3 border-l border-gray-200 pl-3">
              <div
                aria-hidden="true"
                className="w-8 h-8 rounded-full bg-emerald-100 text-health-primary flex items-center justify-center font-bold text-sm flex-shrink-0"
              >
                {user?.name?.[0] ?? 'U'}
              </div>
              <div className="hidden md:flex flex-col min-w-0 text-left">
                <span className="text-xs font-bold text-gray-800 truncate max-w-[180px] leading-tight">
                  {user?.name}
                </span>
                <span className="text-[10px] text-gray-500 font-medium truncate max-w-[180px] leading-tight mt-0.5">
                  {['PHARMACY', 'PHARMACY_OWNER', 'PHARMACIST'].includes(user?.role || '') && user?.pharmacy?.name
                    ? `${user?.role} • ${user?.pharmacy?.name}`
                    : isInsurance && insurer
                    ? `${insurer} Auditor`
                    : user?.role}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main id="main-content" className="flex-grow p-4 sm:p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {portalGated ? (
              <PharmacyRegistrationGate>
                <Outlet />
              </PharmacyRegistrationGate>
            ) : (
              <Outlet />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
