import React, { useState, useEffect } from 'react'
import { MedicineApi } from '@/services/medicine-api'
import { Bell, ClipboardList, Shield, FileText, CheckCircle2, Trash2, CheckSquare, XCircle, AlertCircle, RefreshCw } from 'lucide-react'

interface NotificationItem {
  id: string
  title: string
  message: string
  type: 'RESERVATION' | 'PRESCRIPTION' | 'SECURITY' | 'SYSTEM'
  read: boolean
  createdAt: string
}

export default function PatientNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(false)
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [readFilter, setReadFilter] = useState('ALL') // ALL, UNREAD
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const triggerToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 2500)
  }

  // Load notifications from service layer
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

  useEffect(() => {
    loadNotifications()
  }, [])

  // Mark single as read
  const handleMarkRead = async (id: string) => {
    try {
      await MedicineApi.markNotificationRead(id)
      setNotifications((prev) => 
        prev.map((n) => n.id === id ? { ...n, read: true } : n)
      )
      triggerToast('Alert marked as read.')
    } catch (err) {
      console.error(err)
    }
  }

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      await MedicineApi.markAllNotificationsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      triggerToast('All alerts marked as read.')
    } catch (err) {
      console.error(err)
    }
  }

  // Delete notification
  const handleDeleteNotification = async (id: string) => {
    try {
      await MedicineApi.deleteNotification(id)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
      triggerToast('Alert deleted.')
    } catch (err) {
      console.error(err)
    }
  }

  // Clear all notifications
  const handleClearAll = async () => {
    try {
      await MedicineApi.clearAllNotifications()
      setNotifications([])
      triggerToast('Notifications cleared successfully.')
    } catch (err) {
      console.error(err)
    }
  }

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'RESERVATION':
        return <ClipboardList className="w-4 h-4 text-emerald-700" />
      case 'PRESCRIPTION':
        return <FileText className="w-4 h-4 text-blue-700" />
      case 'SECURITY':
        return <Shield className="w-4 h-4 text-rose-700" />
      case 'SYSTEM':
      default:
        return <Bell className="w-4 h-4 text-gray-500" />
    }
  }

  const getIconBg = (type: NotificationItem['type']) => {
    switch (type) {
      case 'RESERVATION':
        return 'bg-emerald-50 border-emerald-100'
      case 'PRESCRIPTION':
        return 'bg-blue-50 border-blue-100'
      case 'SECURITY':
        return 'bg-rose-50 border-rose-100'
      case 'SYSTEM':
      default:
        return 'bg-gray-50 border-gray-100'
    }
  }

  // Filter logs list
  const filteredNotifications = notifications.filter((n) => {
    const matchesType = typeFilter === 'ALL' || n.type === typeFilter
    const matchesRead = readFilter === 'ALL' || (readFilter === 'UNREAD' && !n.read)
    return matchesType && matchesRead
  })

  // Unread count
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-sm space-y-6 max-w-4xl mx-auto pb-16 relative">
      
      {/* Toast alert popup */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-55 bg-emerald-50 border border-emerald-250 text-emerald-800 px-4.5 py-3 rounded-lg shadow-xl animate-fadeIn flex items-center space-x-2 text-xs font-bold">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header section with counts */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-150 gap-4">
        <div>
          <h1 className="text-xl font-black text-gray-900 flex items-center space-x-2">
            <Bell className="w-5.5 h-5.5 text-health-primary" />
            <span>Notifications Centre</span>
          </h1>
          <p className="text-gray-500 text-xs mt-1">
            Track pharmacy reservation updates, prescription claims, and account alerts.
            {unreadCount > 0 && <span className="font-black text-emerald-700 ml-1">({unreadCount} unread)</span>}
          </p>
        </div>

        {/* Toolbar actions */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            type="button"
            disabled={unreadCount === 0 || loading}
            onClick={handleMarkAllRead}
            className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-xs font-bold transition-colors flex items-center space-x-1.5 focus:outline-none disabled:opacity-50"
          >
            <CheckSquare className="w-4 h-4" />
            <span>Mark all read</span>
          </button>
          <button
            type="button"
            disabled={notifications.length === 0 || loading}
            onClick={handleClearAll}
            className="border border-red-300 hover:bg-red-50 text-red-700 px-3 py-2 rounded-lg text-xs font-bold transition-colors flex items-center space-x-1.5 focus:outline-none disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear all</span>
          </button>
        </div>
      </div>

      {/* Dynamic Filters layout */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between bg-gray-50/50 p-3 rounded-lg border border-gray-200 text-xs font-bold text-gray-500">
        <div className="flex flex-wrap items-center gap-1">
          {['ALL', 'RESERVATION', 'PRESCRIPTION', 'SECURITY', 'SYSTEM'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1 rounded-md transition-all ${
                typeFilter === type
                  ? 'bg-health-primary text-white shadow-xs'
                  : 'hover:bg-gray-200/50 hover:text-gray-900'
              }`}
            >
              {type === 'ALL' ? 'All Alerts' : type.charAt(0) + type.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <span className="text-[10px] uppercase text-gray-400">Status:</span>
          <select
            value={readFilter}
            onChange={(e) => setReadFilter(e.target.value)}
            className="bg-white border border-gray-300 rounded px-2 py-1 text-xs text-gray-700 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">Show All</option>
            <option value="UNREAD">Unread Only</option>
          </select>
        </div>
      </div>

      {/* Notifications list grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-gray-400 flex items-center justify-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
          <span>Loading notifications log...</span>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="py-16 text-center text-gray-400 border border-dashed rounded-xl space-y-3">
          <Bell className="w-10 h-10 text-gray-200 mx-auto animate-pulse" />
          <p className="text-xs">No notifications found matching selected filters.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-150">
          {filteredNotifications.map((not) => (
            <div
              key={not.id}
              className={`py-4 flex items-start justify-between gap-4 transition-all relative pl-3.5 ${
                !not.read ? 'bg-emerald-50/20' : ''
              }`}
            >
              {/* Unread circle highlight indicator */}
              {!not.read && (
                <span className="absolute left-0 top-6 w-1.5 h-1.5 bg-emerald-600 rounded-full" />
              )}

              <div className="flex items-start space-x-3.5">
                <div className={`p-2 border rounded-lg flex-shrink-0 mt-0.5 ${getIconBg(not.type)}`}>
                  {getIcon(not.type)}
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 flex-wrap">
                    <h4 className={`text-xs font-bold text-gray-900 ${!not.read ? 'font-black' : ''}`}>
                      {not.title}
                    </h4>
                    <span className="text-[9px] text-gray-400 font-mono">
                      {new Date(not.createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        hour12: true
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-normal max-w-2xl">{not.message}</p>
                </div>
              </div>

              {/* Row Action buttons */}
              <div className="flex items-center space-x-1.5 flex-shrink-0">
                {!not.read && (
                  <button
                    type="button"
                    title="Mark as Read"
                    onClick={() => handleMarkRead(not.id)}
                    className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-emerald-700 transition-colors focus:outline-none"
                  >
                    <CheckSquare className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  title="Delete Alert"
                  onClick={() => handleDeleteNotification(not.id)}
                  className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-red-650 transition-colors focus:outline-none"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  )
}
