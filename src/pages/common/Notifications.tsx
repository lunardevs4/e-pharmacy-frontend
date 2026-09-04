import React, { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore } from '@/store/notificationStore'
import {
  Bell, AlertTriangle, Package, FileText, CheckCircle2,
  Trash2, CheckSquare, Clock, Check
} from 'lucide-react'

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function SharedNotifications() {
  const { user } = useAuthStore()
  const currentRole = user?.role
    ? (['PHARMACY', 'PHARMACY_OWNER', 'PHARMACIST'].includes(user.role) ? 'PHARMACY' : user.role)
    : ''
  const normalizedRole = currentRole.toLowerCase()

  const { items: notifs, load, markRead, markAllRead, remove, clearAll } = useNotificationStore()

  const [typeFilter, setTypeFilter] = useState<string>('ALL')
  const [readFilter, setReadFilter] = useState<'ALL' | 'UNREAD'>('ALL')
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (user?.role) load(normalizedRole)
  }, [user?.role, load, normalizedRole])

  const triggerToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const handleMarkRead    = (id: string) => { markRead(id, normalizedRole);    triggerToast('Marked as read.') }
  const handleMarkAllRead = ()            => { markAllRead(normalizedRole);     triggerToast('All marked as read.') }
  const handleRemove      = (id: string) => { remove(id, normalizedRole);      triggerToast('Notification deleted.') }
  const handleClearAll    = () => {
    if (window.confirm('Clear all notifications?')) {
      clearAll(normalizedRole)
      triggerToast('All notifications cleared.')
    }
  }

  const filtered = notifs.filter(n => {
    const matchType = typeFilter === 'ALL' || n.type === typeFilter
    const matchRead = readFilter === 'ALL' || (readFilter === 'UNREAD' && !n.read)
    return matchType && matchRead
  })

  const types       = Array.from(new Set(notifs.map(n => n.type)))
  const typeCounts  = notifs.reduce<Record<string, number>>((acc, n) => {
    acc[n.type] = (acc[n.type] || 0) + 1
    return acc
  }, {})

  const getSeverityStyles = (type: string) => {
    switch (type) {
      case 'SHORTAGE': case 'SECURITY':
        return { bg: 'bg-red-50 border-red-100',         iconColor: 'text-red-600',     label: 'Alert' }
      case 'MOH':      case 'SYSTEM':
        return { bg: 'bg-amber-50 border-amber-100',     iconColor: 'text-amber-600',   label: 'System' }
      case 'BILLING':
        return { bg: 'bg-emerald-50 border-emerald-100', iconColor: 'text-emerald-600', label: 'Billing' }
      case 'RESERVATION':
        return { bg: 'bg-teal-50 border-teal-100',       iconColor: 'text-teal-600',    label: 'Reservation' }
      default:
        return { bg: 'bg-gray-50 border-gray-150',       iconColor: 'text-gray-500',    label: 'Notification' }
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'SHORTAGE': case 'SECURITY': return AlertTriangle
      case 'MOH':                       return FileText
      case 'BILLING':                   return CheckCircle2
      case 'RESERVATION':               return Package
      default:                          return Bell
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto pb-16 font-sans">

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* ── Header card ── */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-sm">
        {/* Top row: icon+title left, actions right */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 bg-emerald-50 text-health-primary rounded-lg flex-shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold text-gray-900 leading-tight">
                Notifications &amp; Alerts
              </h1>
              <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                Manage system notices, alerts, and billing notifications.
              </p>
            </div>
          </div>

          {/* Action buttons — wrap on tiny screens */}
          <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
            {notifs.some(n => !n.read) && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold text-xs rounded-lg transition-colors whitespace-nowrap"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
            {notifs.length > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 px-3 py-2 border border-red-200 text-red-700 hover:bg-red-50 font-semibold text-xs rounded-lg transition-colors whitespace-nowrap"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear all</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-gray-200 bg-gray-50/50 flex flex-col gap-3">
          {/* Type filter chips — horizontal scroll on mobile */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`flex-shrink-0 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                typeFilter === 'ALL'
                  ? 'bg-health-primary text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              All ({notifs.length})
            </button>
            {types.map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`flex-shrink-0 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  typeFilter === t
                    ? 'bg-health-primary text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {t.charAt(0) + t.slice(1).toLowerCase()} ({typeCounts[t] || 0})
              </button>
            ))}
          </div>

          {/* Read status filter */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex-shrink-0">Status:</span>
            <select
              value={readFilter}
              onChange={(e) => setReadFilter(e.target.value as 'ALL' | 'UNREAD')}
              className="flex-1 sm:flex-none px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">All statuses</option>
              <option value="UNREAD">Unread only</option>
            </select>
          </div>
        </div>

        {/* ── Notification list ── */}
        {filtered.length === 0 ? (
          <div className="py-16 sm:py-24 text-center text-gray-400 px-4">
            <Bell className="w-10 h-10 sm:w-12 sm:h-12 text-gray-200 mx-auto mb-3" />
            <h3 className="font-bold text-gray-800 text-sm">No notifications found</h3>
            <p className="text-xs text-gray-500 mt-1">You are completely caught up!</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-150">
            {filtered.map(n => {
              const styles = getSeverityStyles(n.type)
              const Icon   = getIcon(n.type)

              return (
                <li
                  key={n.id}
                  className={`relative flex items-start gap-3 sm:gap-4 p-4 sm:p-5 transition-colors ${
                    !n.read ? 'bg-emerald-50/20' : 'hover:bg-gray-50/50'
                  }`}
                >
                  {/* Unread left bar */}
                  {!n.read && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-health-primary rounded-r" />
                  )}

                  {/* Type icon */}
                  <div className={`p-2 sm:p-2.5 rounded-lg border flex-shrink-0 mt-0.5 ${styles.bg} ${styles.iconColor}`}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>

                  {/* Content — grows, min-w-0 prevents overflow */}
                  <div className="flex-grow min-w-0 space-y-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <h4 className={`text-xs sm:text-sm leading-snug break-words ${
                        !n.read ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'
                      }`}>
                        {n.title}
                      </h4>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold border flex-shrink-0 ${styles.bg}`}>
                        {styles.label}
                      </span>
                    </div>

                    <p className="text-gray-600 text-xs leading-relaxed font-medium break-words">
                      {n.message}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-[10px] text-gray-400 font-semibold">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {timeAgo(n.createdAt)}
                      </span>
                      <span>·</span>
                      <span>{n.read ? 'Read' : 'Unread'}</span>
                    </div>
                  </div>

                  {/* Actions — stacked vertically on mobile */}
                  <div className="flex flex-col sm:flex-row items-center gap-1 flex-shrink-0">
                    {!n.read && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        title="Mark as read"
                        aria-label="Mark as read"
                        className="p-1.5 sm:p-2 border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-emerald-600 transition-colors focus:outline-none"
                      >
                        <CheckSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleRemove(n.id)}
                      title="Delete"
                      aria-label="Delete notification"
                      className="p-1.5 sm:p-2 border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-600 transition-colors focus:outline-none"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
