import React from 'react'
import { useUIStore, ToastType } from '@/store/uiStore'
import {
  CheckCircle2, AlertTriangle, AlertCircle, Info, X,
  ChevronRight,
} from 'lucide-react'

const toastStyles: Record<ToastType, { border: string; bg: string; title: string; message: string; ring: string }> = {
  success: {
    border: 'border-emerald-250',
    bg: 'bg-emerald-50',
    title: 'text-emerald-900',
    message: 'text-emerald-800',
    ring: 'ring-emerald-500/20',
  },
  info: {
    border: 'border-blue-200',
    bg: 'bg-blue-50',
    title: 'text-blue-900',
    message: 'text-blue-800',
    ring: 'ring-blue-500/20',
  },
  warning: {
    border: 'border-amber-250',
    bg: 'bg-amber-50',
    title: 'text-amber-900',
    message: 'text-amber-800',
    ring: 'ring-amber-500/20',
  },
  error: {
    border: 'border-red-250',
    bg: 'bg-red-50',
    title: 'text-red-900',
    message: 'text-red-800',
    ring: 'ring-red-500/20',
  },
  critical: {
    border: 'border-rose-300',
    bg: 'bg-rose-50',
    title: 'text-rose-900',
    message: 'text-rose-800',
    ring: 'ring-rose-500/30',
  },
}

const ToastIcon: React.FC<{ type: ToastType }> = ({ type }) => {
  const className = 'w-5 h-5 flex-shrink-0 mt-0.5'
  switch (type) {
    case 'success':
      return <CheckCircle2 className={`${className} text-emerald-600`} />
    case 'warning':
      return <AlertTriangle className={`${className} text-amber-600`} />
    case 'info':
      return <Info className={`${className} text-blue-600`} />
    case 'critical':
    case 'error':
    default:
      return <AlertCircle className={`${className} text-red-600`} />
  }
}

export const GlobalToaster: React.FC = () => {
  const toasts = useUIStore((s) => s.toasts)
  const dismissToast = useUIStore((s) => s.dismissToast)

  return (
    <div
      role="region"
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed top-16 right-3 sm:right-6 z-[9998] flex flex-col gap-2.5 w-full max-w-[calc(100vw-1.5rem)] sm:max-w-sm"
    >
      {toasts.map((toast) => {
        const style = toastStyles[toast.type] ?? toastStyles.error
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto relative rounded-xl border ${style.border} ${style.bg} shadow-lg ring-1 ${style.ring} animate-fadeIn overflow-hidden`}
          >
            <div className="flex items-start gap-3 p-3.5 pr-8">
              <ToastIcon type={toast.type} />
              <div className="flex-1 min-w-0 space-y-0.5">
                <p className={`text-xs font-black leading-snug ${style.title}`}>{toast.title}</p>
                {toast.message && (
                  <p className={`text-[11px] font-semibold leading-relaxed break-words ${style.message}`}>
                    {toast.message}
                  </p>
                )}
                {toast.actionLabel && (
                  toast.actionHref ? (
                    <a
                      href={toast.actionHref}
                      className="inline-flex items-center gap-0.5 mt-1 text-[10px] font-black text-health-primary hover:underline"
                    >
                      {toast.actionLabel}
                      <ChevronRight className="w-3 h-3" />
                    </a>
                  ) : toast.actionOnClick ? (
                    <button
                      type="button"
                      onClick={toast.actionOnClick}
                      className="inline-flex items-center gap-0.5 mt-1 text-[10px] font-black text-health-primary hover:underline"
                    >
                      {toast.actionLabel}
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  ) : null
                )}
              </div>
              {toast.dismissible && (
                <button
                  type="button"
                  onClick={() => dismissToast(toast.id)}
                  aria-label="Dismiss notification"
                  className="absolute top-2 right-2 p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-white/50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default GlobalToaster
