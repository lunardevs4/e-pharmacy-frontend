import { create } from 'zustand'
import { ErrorSeverity, AppError, normalizeError } from '@/utils/error-handler'

export type ToastType = 'success' | ErrorSeverity

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  durationMs: number
  createdAt: number
  dismissible: boolean
  actionLabel?: string
  actionHref?: string
  actionOnClick?: () => void
}

interface UIStore {
  sidebarOpen: boolean
  notificationDrawerOpen: boolean
  toasts: Toast[]

  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleNotificationDrawer: () => void
  setNotificationDrawerOpen: (open: boolean) => void

  showToast: (toast: Omit<Toast, 'id' | 'createdAt'>) => string
  successToast: (title: string, message?: string, durationMs?: number) => string
  errorToast: (err: unknown, title?: string, fallbackMessage?: string) => string
  warningToast: (title: string, message?: string, durationMs?: number) => string
  infoToast: (title: string, message?: string, durationMs?: number) => string
  dismissToast: (id: string) => void
  clearToasts: () => void
}

const makeId = () => `toast-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`

const DEFAULT_DURATION = {
  success: 3000,
  info: 3500,
  warning: 4500,
  error: 5500,
  critical: 7000,
}

const severityToToastType = (severity: ErrorSeverity): ToastType => severity

const appErrorToToast = (
  err: AppError,
  titleOverride?: string,
  fallbackMessage?: string,
): Omit<Toast, 'id' | 'createdAt'> => {
  const type: ToastType = severityToToastType(err.severity)
  const title = titleOverride ?? (type === 'success'
    ? 'Success'
    : type === 'info'
    ? 'Information'
    : type === 'warning'
    ? 'Notice'
    : type === 'critical'
    ? 'System Unavailable'
    : 'Something went wrong')
  return {
    type,
    title,
    message: err.silent ? undefined : (err.message ?? fallbackMessage),
    durationMs: DEFAULT_DURATION[type] ?? 4000,
    dismissible: true,
  }
}

export const useUIStore = create<UIStore>((set, get) => ({
  sidebarOpen: false,
  notificationDrawerOpen: false,
  toasts: [],

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleNotificationDrawer: () => set((state) => ({ notificationDrawerOpen: !state.notificationDrawerOpen })),
  setNotificationDrawerOpen: (open) => set({ notificationDrawerOpen: open }),

  showToast: (toast) => {
    const id = makeId()
    const fullToast: Toast = { id, createdAt: Date.now(), ...toast }
    set((s) => ({ toasts: [...s.toasts, fullToast] }))
    if (toast.durationMs > 0) {
      window.setTimeout(() => get().dismissToast(id), toast.durationMs)
    }
    return id
  },

  successToast: (title, message, durationMs) =>
    get().showToast({
      type: 'success',
      title,
      message,
      durationMs: durationMs ?? DEFAULT_DURATION.success,
      dismissible: true,
    }),

  errorToast: (err, title, fallbackMessage) => {
    const normalized = normalizeError(err)
    const toast = appErrorToToast(normalized, title, fallbackMessage)
    if (normalized.silent) return ''
    return get().showToast(toast)
  },

  warningToast: (title, message, durationMs) =>
    get().showToast({
      type: 'warning',
      title,
      message,
      durationMs: durationMs ?? DEFAULT_DURATION.warning,
      dismissible: true,
    }),

  infoToast: (title, message, durationMs) =>
    get().showToast({
      type: 'info',
      title,
      message,
      durationMs: durationMs ?? DEFAULT_DURATION.info,
      dismissible: true,
    }),

  dismissToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  clearToasts: () => set({ toasts: [] }),
}))
