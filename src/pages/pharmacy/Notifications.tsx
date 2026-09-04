import React, { useState } from 'react'
import {
  Bell, AlertTriangle, Package, FileText,
  CheckSquare, Trash2, CheckCircle2, Clock
} from 'lucide-react'

type NType = 'SHORTAGE' | 'RESERVATION' | 'MOH' | 'SYSTEM' | 'BILLING'

interface PharmacyNotif {
  id: string
  title: string
  message: string
  type: NType
  read: boolean
  createdAt: string
  severity?: 'high' | 'medium' | 'info'
}

const SEED: PharmacyNotif[] = [
  {
    id: 'n-001', type: 'SHORTAGE', read: false, severity: 'high',
    title: 'Critical Stock Alert — Coartem',
    message: 'Artemether + Lumefantrine stock has fallen below the 10-unit safety threshold. Immediate reorder required. MOH district dispatch has been notified.',
    createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
  },
  {
    id: 'n-002', type: 'RESERVATION', read: false, severity: 'info',
    title: 'New Reservation — RES-2026-006',
    message: 'Robert Uwera has reserved Atenolol 50mg (qty: 1). Pickup deadline: 2026-08-04. Insurance: Radiant (70% covered).',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'n-003', type: 'MOH', read: false, severity: 'medium',
    title: 'MOH Circular — Q3 Inspection',
    message: 'Ministry of Health will conduct routine Q3 compliance inspections from 10–14 August 2026. Please ensure stock records, temperature logs, and dispensing registries are up to date.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: 'n-004', type: 'BILLING', read: true, severity: 'info',
    title: 'Insurance Claim Approved — CLM-2026-002',
    message: 'RSSB has approved claim CLM-2026-002 for Metformin 850mg (RWF 1,728 payable to pharmacy). Payment will be processed in the July 2026 batch.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 'n-005', type: 'SHORTAGE', read: true, severity: 'medium',
    title: 'Low Stock Warning — Metformin',
    message: 'Metformin 850mg current stock: 0 units. 2 pending reservations affected. Please update inventory to reflect actual stock levels.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: 'n-006', type: 'SYSTEM', read: true, severity: 'info',
    title: 'Staff Account Created — Alice Uwimana',
    message: 'New staff member Alice Uwimana (Pharmacist) was added by Pharmacy Manager. Temporary credentials have been issued.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
]

const TYPE_META: Record<NType, { label: string; icon: React.FC<any>; bg: string; iconColor: string }> = {
  SHORTAGE:    { label: 'Stock Alert',  icon: AlertTriangle, bg: 'bg-red-50 border-red-100',         iconColor: 'text-red-600'     },
  RESERVATION: { label: 'Reservation', icon: Package,       bg: 'bg-emerald-50 border-emerald-100',  iconColor: 'text-emerald-600' },
  MOH:         { label: 'MOH Notice',  icon: FileText,      bg: 'bg-amber-50 border-amber-100',      iconColor: 'text-amber-600'   },
  BILLING:     { label: 'Billing',     icon: CheckCircle2,  bg: 'bg-blue-50 border-blue-100',        iconColor: 'text-blue-600'    },
  SYSTEM:      { label: 'System',      icon: Bell,          bg: 'bg-gray-50 border-gray-200',        iconColor: 'text-gray-500'    },
}

const SEV_DOT: Record<string, string> = {
  high:   'bg-red-500',
  medium: 'bg-amber-500',
  info:   'bg-emerald-500',
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60)   return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function PharmacyNotifications() {
  const [items, setItems] = useState<PharmacyNotif[]>(SEED)
  const [typeFilter, setTypeFilter] = useState<NType | 'ALL'>('ALL')
  const [readFilter, setReadFilter] = useState<'ALL' | 'UNREAD'>('ALL')
  const [toast, setToast] = useState<string | null>(null)

  const triggerToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2800)
  }

  const markRead   = (id: string) => setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  const markAllRead = () => { setItems(prev => prev.map(n => ({ ...n, read: true }))); triggerToast('All notifications marked as read.') }
  const deleteItem = (id: string) => { setItems(prev => prev.filter(n => n.id !== id)); triggerToast('Notification removed.') }
  const clearAll   = () => { setItems([]); triggerToast('All notifications cleared.') }

  const filtered = items.filter(n =>
    (typeFilter === 'ALL' || n.type === typeFilter) &&
    (readFilter === 'ALL' || !n.read)
  )
  const unreadCount = items.filter(n => !n.read).length

  const TYPE_FILTERS: Array<NType | 'ALL'> = ['ALL', 'SHORTAGE', 'RESERVATION', 'MOH', 'BILLING', 'SYSTEM']

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto pb-16 relative">

      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-20 right-4 z-50 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg shadow-xl text-xs font-bold flex items-center space-x-2 max-w-[calc(100vw-2rem)]"
        >
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          <span className="truncate">{toast}</span>
        </div>
      )}

      {/* ── Header ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Bell className="w-5 h-5 text-emerald-700 flex-shrink-0" aria-hidden="true" />
              <h1 className="text-base sm:text-xl font-black text-gray-900 leading-tight">Pharmacy Notifications</h1>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0">
                  {unreadCount}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1 leading-snug">
              Stock alerts, MOH circulars, reservation updates, and billing events.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
            <button
              onClick={markAllRead}
              disabled={unreadCount === 0}
              aria-label="Mark all notifications as read"
              className="flex items-center gap-1.5 border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 font-bold px-3 py-2 rounded-lg text-xs disabled:opacity-40 transition-colors whitespace-nowrap"
            >
              <CheckSquare className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Mark all read</span>
            </button>
            <button
              onClick={clearAll}
              disabled={items.length === 0}
              aria-label="Clear all notifications"
              className="flex items-center gap-1.5 border border-red-200 bg-white text-red-600 hover:bg-red-50 font-bold px-3 py-2 rounded-lg text-xs disabled:opacity-40 transition-colors whitespace-nowrap"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Clear all</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 shadow-xs flex flex-col gap-3">
        {/* Type chips — horizontal scroll on mobile, no wrapping overflow */}
        <div
          role="group"
          aria-label="Filter by type"
          className="flex items-center gap-1.5 overflow-x-auto pb-0.5"
          style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {TYPE_FILTERS.map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`flex-shrink-0 text-[11px] font-bold px-3 py-1.5 rounded-full border transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 ${
                typeFilter === t
                  ? 'bg-health-primary text-white border-health-primary'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'
              }`}
            >
              {t === 'ALL' ? 'All' : TYPE_META[t as NType]?.label ?? t}
            </button>
          ))}
        </div>

        {/* Read status */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex-shrink-0">Status:</span>
          <select
            aria-label="Filter by read status"
            value={readFilter}
            onChange={e => setReadFilter(e.target.value as 'ALL' | 'UNREAD')}
            className="flex-1 sm:flex-none bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">All</option>
            <option value="UNREAD">Unread only</option>
          </select>
        </div>
      </div>

      {/* ── List ── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 sm:py-20 text-center text-gray-400 space-y-3 px-4">
            <Bell className="w-10 h-10 sm:w-12 sm:h-12 text-gray-200 mx-auto" aria-hidden="true" />
            <p className="text-sm font-bold text-gray-500">No notifications match the selected filters.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filtered.map(n => {
              const meta = TYPE_META[n.type]
              const Icon = meta.icon
              return (
                <li
                  key={n.id}
                  className={`relative flex items-start gap-3 sm:gap-4 px-4 sm:px-5 py-4 transition-colors ${
                    !n.read ? 'bg-emerald-50/20' : 'hover:bg-gray-50/50'
                  }`}
                >
                  {/* Severity bar */}
                  {!n.read && (
                    <span
                      aria-hidden="true"
                      className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full ${SEV_DOT[n.severity ?? 'info']}`}
                    />
                  )}

                  {/* Icon */}
                  <div
                    className={`p-2 sm:p-2.5 rounded-lg border flex-shrink-0 mt-0.5 ${meta.bg}`}
                    aria-hidden="true"
                  >
                    <Icon className={`w-4 h-4 ${meta.iconColor}`} />
                  </div>

                  {/* Text — min-w-0 prevents overflow push */}
                  <div className="flex-grow min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs sm:text-sm font-black text-gray-900 break-words ${!n.read ? 'font-black' : 'font-bold'}`}>
                        {n.title}
                      </span>
                      <span className={`inline-flex flex-shrink-0 text-[9px] font-bold border px-1.5 py-0.5 rounded uppercase tracking-wide ${meta.bg} ${meta.iconColor}`}>
                        {meta.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed break-words">{n.message}</p>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 font-semibold mt-1">
                      <Clock className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                      <time dateTime={n.createdAt}>{timeAgo(n.createdAt)}</time>
                    </div>
                  </div>

                  {/* Actions — stacked on mobile */}
                  <div className="flex flex-col sm:flex-row items-center gap-1 flex-shrink-0">
                    {!n.read && (
                      <button
                        onClick={() => markRead(n.id)}
                        aria-label={`Mark "${n.title}" as read`}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-emerald-600 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
                      >
                        <CheckSquare className="w-4 h-4" aria-hidden="true" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteItem(n.id)}
                      aria-label={`Delete: ${n.title}`}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-600 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-400"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
