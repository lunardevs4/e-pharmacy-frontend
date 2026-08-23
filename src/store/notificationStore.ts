
import { create } from 'zustand'

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
  load: (role: string) => void
  markRead: (id: string, role: string) => void
  markAllRead: (role: string) => void
  remove: (id: string, role: string) => void
  clearAll: (role: string) => void
  add: (notif: AppNotification, role: string) => void
}

const key = (role: string) => `epharmacy_notifications_${role.toLowerCase()}`

const SEEDS: Record<string, AppNotification[]> = {
  patient: [
    { id: 'pn-001', title: 'Reservation Ready', message: 'Your reservation RES-2026-001 for Artemether is ready for pickup at Bralirwa Pharmacy.', type: 'RESERVATION', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
    { id: 'pn-002', title: 'Pickup Reminder', message: 'Your reservation RES-2026-002 expires in 24 hours. Please collect your medicine before 2026-08-03.', type: 'RESERVATION', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString() },
    { id: 'pn-003', title: 'Insurance Claim Approved', message: 'RSSB approved your co-payment claim for Coartem. Your share: RWF 700.', type: 'BILLING', read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString() },
  ],
  pharmacy: [
    { id: 'ph-001', title: 'Critical Stock — Coartem', message: 'Artemether + Lumefantrine stock below 10-unit threshold. Reorder required.', type: 'SHORTAGE', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString() },
    { id: 'ph-002', title: 'New Reservation', message: 'Robert Uwera reserved Atenolol 50mg. Pickup deadline: 2026-08-04.', type: 'RESERVATION', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
    { id: 'ph-003', title: 'MOH Q3 Inspection', message: 'MOH compliance inspections from 10–14 August 2026. Ensure records are up to date.', type: 'MOH', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() },
    { id: 'ph-004', title: 'Claim Approved — CLM-2026-002', message: 'RSSB approved RWF 1,728 for Metformin. Payment in July batch.', type: 'BILLING', read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
  ],
  government: [
    { id: 'gv-001', title: 'National Shortage Alert', message: 'Coartem supply index in Northern Province dropped below 85% safety limit.', type: 'SHORTAGE', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
    { id: 'gv-002', title: 'New Pharmacy Application', message: 'Bugesera Community Pharmacy submitted a registration application awaiting MoH review.', type: 'SYSTEM', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
    { id: 'gv-003', title: 'Compliance Audit Due', message: '4 pharmacies have Q3 compliance audits overdue in Eastern Province.', type: 'MOH', read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString() },
  ],
  insurance: [
    { id: 'in-001', title: '6 Pending Claims', message: 'You have 6 insurance claims awaiting review and approval.', type: 'BILLING', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString() },
    { id: 'in-002', title: 'Payment Processed', message: 'July batch payout of RWF 2.1M processed to 2 pharmacies.', type: 'BILLING', read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString() },
  ],
  admin: [
    { id: 'ad-001', title: 'Failed Login Attempt', message: '3 failed login attempts from IP 41.217.204.99. Account temporarily flagged.', type: 'SECURITY', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString() },
    { id: 'ad-002', title: 'Medicine Pending Approval', message: 'Zithromax 250mg is awaiting admin approval in the medicine catalogue.', type: 'SYSTEM', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
    { id: 'ad-003', title: 'System Backup Complete', message: 'Automatic database backup completed successfully at 10:42.', type: 'SYSTEM', read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() },
  ],
}

function loadFromStorage(role: string): AppNotification[] {
  try {
    const raw = localStorage.getItem(key(role))
    if (raw) return JSON.parse(raw)
    // Seed default notifications on first load
    const seed = SEEDS[role.toLowerCase()] ?? []
    localStorage.setItem(key(role), JSON.stringify(seed))
    return seed
  } catch {
    return []
  }
}

function saveToStorage(role: string, items: AppNotification[]) {
  localStorage.setItem(key(role), JSON.stringify(items))
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  items: [],
  unreadCount: 0,

  load: (role) => {
    const items = loadFromStorage(role)
    set({ items, unreadCount: items.filter(n => !n.read).length })
  },

  markRead: (id, role) => {
    const items = get().items.map(n => n.id === id ? { ...n, read: true } : n)
    saveToStorage(role, items)
    set({ items, unreadCount: items.filter(n => !n.read).length })
  },

  markAllRead: (role) => {
    const items = get().items.map(n => ({ ...n, read: true }))
    saveToStorage(role, items)
    set({ items, unreadCount: 0 })
  },

  remove: (id, role) => {
    const items = get().items.filter(n => n.id !== id)
    saveToStorage(role, items)
    set({ items, unreadCount: items.filter(n => !n.read).length })
  },

  clearAll: (role) => {
    saveToStorage(role, [])
    set({ items: [], unreadCount: 0 })
  },

  add: (notif, role) => {
    const items = [notif, ...get().items]
    saveToStorage(role, items)
    set({ items, unreadCount: items.filter(n => !n.read).length })
  },
}))
