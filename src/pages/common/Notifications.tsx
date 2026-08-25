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
  const currentRole = user?.role ? (['PHARMACY', 'PHARMACY_OWNER', 'PHARMACIST'].includes(user.role) ? 'PHARMACY' : user.role) : ''
  const normalizedRole = currentRole.toLowerCase()

  const { items: notifs, load, markRead, markAllRead, remove, clearAll } = useNotificationStore()

  const [typeFilter, setTypeFilter] = useState<string>('ALL')
  const [readFilter, setReadFilter] = useState<'ALL' | 'UNREAD'>('ALL')
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (user?.role) {
      load(normalizedRole)
    }
  }, [user?.role, load, normalizedRole])

  const triggerToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const handleMarkRead = (id: string) => {
    markRead(id, normalizedRole)
    triggerToast('Notification marked as read.')
  }

  const handleMarkAllRead = () => {
    markAllRead(normalizedRole)
    triggerToast('All notifications marked as read.')
  }

  const handleRemove = (id: string) => {
    remove(id, normalizedRole)
    triggerToast('Notification deleted.')
  }

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      clearAll(normalizedRole)
      triggerToast('All notifications cleared.')
    }
  }

  // Filter list
  const filtered = notifs.filter(n => {
    const matchType = typeFilter === 'ALL' || n.type === typeFilter
    const matchRead = readFilter === 'ALL' || (readFilter === 'UNREAD' && !n.read)
    return matchType && matchRead
  })

  // Get distinct types for filters
  const types = Array.from(new Set(notifs.map(n => n.type)))

  // Group notifications by type for count mapping
  const typeCounts = notifs.reduce<Record<string, number>>((acc, n) => {
    acc[n.type] = (acc[n.type] || 0) + 1
    return acc
  }, {})

  const getSeverityStyles = (type: string) => {
    switch (type) {
      case 'SHORTAGE':
      case 'SECURITY':
        return { bg: 'bg-red-50 border-red-100', iconColor: 'text-red-600', label: 'Alert' }
      case 'MOH':
      case 'SYSTEM':
        return { bg: 'bg-amber-50 border-amber-100', iconColor: 'text-amber-600', label: 'System Notice' }
      case 'BILLING':
        return { bg: 'bg-emerald-50 border-emerald-100', iconColor: 'text-emerald-600', label: 'Billing' }
      case 'RESERVATION':
        return { bg: 'bg-teal-50 border-teal-100', iconColor: 'text-teal-600', label: 'Reservation' }
      default:
        return { bg: 'bg-gray-50 border-gray-150', iconColor: 'text-gray-500', label: 'Notification' }
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'SHORTAGE':
      case 'SECURITY':
        return AlertTriangle
      case 'MOH':
        return FileText
      case 'BILLING':
        return CheckCircle2
      case 'RESERVATION':
        return Package
      default:
        return Bell
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 font-sans">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 bg-gray-905 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-slideUp">
          <Check className="w-4 h-4 text-emerald-450" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-health-primary rounded-lg">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-905">Notifications & Alerts</h1>
            <p className="text-xs text-gray-500">
              Manage system notices, alerts, and billing claims notifications for your account.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {notifs.some(n => !n.read) && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold text-xs rounded-lg transition-colors"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          )}

          {notifs.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1 px-3 py-1.5 border border-red-200 text-red-700 hover:bg-red-50 font-semibold text-xs rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear all</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Layout Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Filters Toolbar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                typeFilter === 'ALL'
                  ? 'bg-health-primary text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              All Types ({notifs.length})
            </button>

            {types.map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  typeFilter === t
                    ? 'bg-health-primary text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {t.charAt(0) + t.slice(1).toLowerCase()} ({typeCounts[t] || 0})
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={readFilter}
              onChange={(e) => setReadFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="UNREAD">Unread Only</option>
            </select>
          </div>
        </div>

        {/* Notifications list */}
        {filtered.length === 0 ? (
          <div className="py-24 text-center text-gray-400">
            <Bell className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <h3 className="font-bold text-gray-800">No notifications found</h3>
            <p className="text-xs text-gray-550 mt-1">
              You are completely caught up! We will notify you when something updates.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-150">
            {filtered.map(n => {
              const styles = getSeverityStyles(n.type)
              const Icon = getIcon(n.type)

              return (
                <li
                  key={n.id}
                  className={`flex items-start gap-4 p-5 transition-colors relative ${
                    !n.read ? 'bg-emerald-50/20' : 'hover:bg-gray-50/50'
                  }`}
                >
                  {/* Unread vertical line */}
                  {!n.read && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-health-primary" />
                  )}

                  {/* Left Icon Badge */}
                  <div className={`p-2.5 rounded-lg border ${styles.bg} ${styles.iconColor} flex-shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Body Text */}
                  <div className="flex-grow min-w-0">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <h4 className={`text-sm ${!n.read ? 'font-bold text-gray-905' : 'font-semibold text-gray-800'}`}>
                        {n.title}
                      </h4>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold border ${styles.bg}`}>
                        {styles.label}
                      </span>
                    </div>

                    <p className="text-gray-600 text-xs mt-1 leading-relaxed font-medium">
                      {n.message}
                    </p>

                    <div className="flex items-center gap-1.5 mt-2.5 text-[10px] text-gray-400 font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Received {timeAgo(n.createdAt)}</span>
                      <span>•</span>
                      <span>Status: {n.read ? 'Read' : 'Unread'}</span>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {!n.read && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        title="Mark as read"
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-health-primary transition-colors focus:outline-none"
                      >
                        <CheckSquare className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => handleRemove(n.id)}
                      title="Delete notification"
                      className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-600 transition-colors focus:outline-none"
                    >
                      <Trash2 className="w-4 h-4" />
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
