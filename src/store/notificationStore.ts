
import { create } from 'zustand'
import { MedicineApi } from '@/services/medicine-api'

export interface AppNotification {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  createdAt: string
}

interface NotificationStore {
  items: AppNotification[]
  unreadCount: number
  load: (role: string) => Promise<void>
  markRead: (id: string, role: string) => Promise<void>
  markAllRead: (role: string) => Promise<void>
  remove: (id: string, role: string) => Promise<void>
  clearAll: (role: string) => Promise<void>
  add: (notif: AppNotification, role: string) => void
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  items: [],
  unreadCount: 0,

  load: async () => {
    const items = await MedicineApi.getNotifications()
    set({ items, unreadCount: items.filter(n => !n.read).length })
  },

  markRead: async (id) => {
    await MedicineApi.markNotificationRead(id)
    const items = get().items.map(n => n.id === id ? { ...n, read: true } : n)
    set({ items, unreadCount: items.filter(n => !n.read).length })
  },

  markAllRead: async () => {
    await MedicineApi.markAllNotificationsRead()
    const items = get().items.map(n => ({ ...n, read: true }))
    set({ items, unreadCount: 0 })
  },

  remove: async (id) => {
    await MedicineApi.deleteNotification(id)
    const items = get().items.filter(n => n.id !== id)
    set({ items, unreadCount: items.filter(n => !n.read).length })
  },

  clearAll: async () => {
    await MedicineApi.clearAllNotifications()
    set({ items: [], unreadCount: 0 })
  },

  add: (notif, role) => {
    const items = [notif, ...get().items]
    set({ items, unreadCount: items.filter(n => !n.read).length })
  },
}))
