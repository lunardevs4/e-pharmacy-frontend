import React, { useState, useEffect } from 'react'
import { MedicineApi } from '@/services/medicine-api'
import {
  Bell, ClipboardList, Shield, FileText, CheckCircle2,
  Trash2, CheckSquare, AlertCircle, RefreshCw, Clock
} from 'lucide-react'

interface NotificationItem {
  id: string
  title: string
  message: string
  type: 'RESERVATION' | 'PRESCRIPTION' | 'SECURITY' | 'SYSTEM' | 'LATE_PICKUP'
  read: boolean
  createdAt: string
}

const TYPE_LABELS: Record<NotificationItem['type'], string> = {
  RESERVATION:  'Reservation',
  PRESCRIPTION: 'Prescription',
  SECURITY:     'Security',
  SYSTEM:       'System',
  LATE_PICKUP:  'Late Pickup',
}

const TYPE_FILTERS: Array<NotificationItem['type'] | 'ALL'> = [
  'ALL', 'RESERVATION', 'PRESCRIPTION', 'SECURITY', 'LATE_PICKUP', 'SYSTEM',
]

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60)    return `${diff}s ago`
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function PatientNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading]             = useState(false)
  const [typeFilter, setTypeFilter]       = useState<NotificationItem['type'] | 'ALL'>('ALL')
  const [readFilter, setReadFilter]       = useState<'ALL' | 'UNREAD'>('ALL')
  const [toastMsg, setToastMsg]           = useState<string | null>(null)
  const [latePickups, setLatePickups]     = useState<any[]>([])

  const triggerToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 2500)
  }

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const data = await MedicineApi.getNotifications()
      setNotifications(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const checkLatePickups = async () => {
    try {
      const latePickupsData = await MedicineApi.checkLatePickups()
      setLatePickups(latePickupsData)
      if (latePickupsData.length > 0) {
        setNotifications(prev => {
          const existingIds = new Set(prev.map(n => n.id))
          const newItems = latePickupsData
            .filter((p: any) => !existingIds.has(`late-${p.reservationId}`))
            .map((p: any) => ({
              id: `late-${p.reservationId}`,
              title: `Late Pickup — ${p.medicineName}`,
              message: `Your reservation for ${p.medicineName} at ${p.pharmacyName} is ${p.hoursLate} hours late. Please collect it or contact the pharmacy.`,
              type: 'LATE_PICKUP' as const,
              read: false,
              createdAt: new Date().toISOString(),
            }))
          return newItems.length > 0 ? [...newItems, ...prev] : prev
        })
      }
    } catch (err) {
      console.error('Error checking late pickups:', err)
    }
  }

  useEffect(() => {
    loadNotifications()
    checkLatePickups()
    const interval = setInterval(checkLatePickups, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const handleMarkRead = async (id: string) => {
    try {
      await MedicineApi.markNotificationRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
      triggerToast('Marked as read.')
    } catch (err) { console.error(err) }
  }

  const handleMarkAllRead = async () => {
    try {
      await MedicineApi.markAllNotificationsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      triggerToast('All alerts marked as read.')
    } catch (err) { console.error(err) }
  }

  const handleDelete = async (id: string) => {
    try {
      await MedicineApi.deleteNotification(id)
      setNotifications(prev => prev.filter(n => n.id !== id))
      triggerToast('Alert deleted.')
    } catch (err) { console.error(err) }
  }

  const handleClearAll = async () => {
    try {
      await MedicineApi.clearAllNotifications()
      setNotifications([])
      triggerToast('Notifications cleared.')
    } catch (err) { console.error(err) }
  }

  const getIconMeta = (type: NotificationItem['type']) => {
    switch (type) {
      case 'RESERVATION':  return { icon: ClipboardList, bg: 'bg-emerald-50 border-emerald-100', color: 'text-emerald-700' }
      case 'PRESCRIPTION': return { icon: FileText,      bg: 'bg-blue-50 border-blue-100',       color: 'text-blue-700'    }
      case 'SECURITY':     return { icon: Shield,        bg: 'bg-rose-50 border-rose-100',        color: 'text-rose-700'    }
      case 'LATE_PICKUP':  return { icon: Clock,         bg: 'bg-amber-50 border-amber-100',      color: 'text-amber-700'   }
      default:             return { icon: Bell,          bg: 'bg-gray-50 border-gray-100',        color: 'text-gray-500'    }
    }
  }

  const filtered = notifications.filter(n => {
    const matchType = typeFilter === 'ALL' || n.type === typeFilter
    const matchRead = readFilter === 'ALL' || (readFilter === 'UNREAD' && !n.read)
    return matchType && matchRead
  })

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto pb-16 relative">

      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 text-xs font-bold max-w-[calc(100vw-2rem)]">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{toastMsg}</span>
        </div>
      )}

      {/* ── Header ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Bell className="w-5 h-5 text-health-primary flex-shrink-0" />
              <h1 className="text-base sm:text-xl font-black text-gray-900 leading-tight">Notifications Centre</h1>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0">
                  {unreadCount}
                </span>
              )}
            </div>
            <p className="text-gray-500 text-xs mt-1 leading-snug">
              Reservation updates, prescription claims, and account alerts.
            </p>

            {/* Late pickup banner */}
            {latePickups.length > 0 && (
              <div className="mt-2 inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-lg">
                <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{latePickups.length} late pickup{latePickups.length > 1 ? 's' : ''} — please collect your medicines</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
            <button
              type="button"
              disabled={unreadCount === 0 || loading}
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
            <button
              type="button"
              disabled={notifications.length === 0 || loading}
              onClick={handleClearAll}
              className="flex items-center gap-1.5 border border-red-300 hover:bg-red-50 text-red-700 px-3 py-2 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear all</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 shadow-xs flex flex-col gap-3">
        {/* Type chips — horizontal scroll on mobile */}
        <div
          className="flex items-center gap-1.5 overflow-x-auto pb-0.5"
          style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {TYPE_FILTERS.map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setTypeFilter(type)}
              className={`flex-shrink-0 px-3 py-1.5 text-xs font-bold rounded-full border transition-all ${
                typeFilter === type
                  ? 'bg-health-primary text-white border-health-primary shadow-xs'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-gray-900'
              }`}
            >
              {type === 'ALL' ? 'All Alerts' : TYPE_LABELS[type as NotificationItem['type']]}
            </button>
          ))}
        </div>

        {/* Read status */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex-shrink-0">Status:</span>
          <select
            value={readFilter}
            onChange={e => setReadFilter(e.target.value as 'ALL' | 'UNREAD')}
            className="flex-1 sm:flex-none bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">Show all</option>
            <option value="UNREAD">Unread only</option>
          </select>
        </div>
      </div>

      {/* ── Notification list ── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
            <span>Loading notifications...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-14 sm:py-16 text-center text-gray-400 space-y-3 px-4">
            <Bell className="w-10 h-10 text-gray-200 mx-auto" />
            <p className="text-sm font-bold text-gray-500">No notifications found.</p>
            <p className="text-xs text-gray-400">Try changing the filter above.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filtered.map(not => {
              const { icon: Icon, bg, color } = getIconMeta(not.type)
              return (
                <li
                  key={not.id}
                  className={`relative flex items-start gap-3 sm:gap-4 px-4 sm:px-5 py-4 transition-colors ${
                    !not.read ? 'bg-emerald-50/20' : 'hover:bg-gray-50/30'
                  }`}
                >
                  {/* Unread dot */}
                  {!not.read && (
                    <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                  )}

                  {/* Icon */}
                  <div className={`p-2 border rounded-lg flex-shrink-0 mt-0.5 ${bg}`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>

                  {/* Content — min-w-0 critical for text truncation inside flex */}
                  <div className="flex-grow min-w-0 space-y-1">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <h4 className={`text-xs sm:text-sm leading-snug break-words ${not.read ? 'font-bold text-gray-800' : 'font-black text-gray-900'}`}>
                        {not.title}
                      </h4>
                      <span className="text-[9px] text-gray-400 font-mono flex-shrink-0">
                        {timeAgo(not.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed break-words">{not.message}</p>
                  </div>

                  {/* Action buttons — stacked on mobile */}
                  <div className="flex flex-col sm:flex-row items-center gap-1 flex-shrink-0">
                    {!not.read && (
                      <button
                        type="button"
                        title="Mark as read"
                        aria-label="Mark as read"
                        onClick={() => handleMarkRead(not.id)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-emerald-700 transition-colors"
                      >
                        <CheckSquare className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      title="Delete"
                      aria-label="Delete notification"
                      onClick={() => handleDelete(not.id)}
                      className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
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
