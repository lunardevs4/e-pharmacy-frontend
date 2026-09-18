import React from 'react'
import { AlertTriangle, RefreshCw, Wifi, Server } from 'lucide-react'

export function LoadingSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-grow">
          <LoadingSkeleton className="h-4 w-1/3" />
          <LoadingSkeleton className="h-3 w-1/2" />
        </div>
        <LoadingSkeleton className="h-8 w-24" />
      </div>
      <div className="space-y-1 pt-2">
        <LoadingSkeleton className="h-3 w-full" />
        <LoadingSkeleton className="h-3 w-5/6" />
      </div>
    </div>
  )
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center space-x-4 py-3 border-b border-gray-100">
      <LoadingSkeleton className="h-8 w-8 rounded-full flex-shrink-0" />
      <div className="flex-grow space-y-2">
        <LoadingSkeleton className="h-3.5 w-1/4" />
        <LoadingSkeleton className="h-3 w-1/2" />
      </div>
      <LoadingSkeleton className="h-6 w-16" />
    </div>
  )
}

export interface ErrorFallbackProps {
  title?: string
  message?: string
  onRetry?: () => void
  retryLabel?: string
  isNetwork?: boolean
  isServer?: boolean
  isRetrying?: boolean
  compact?: boolean
  className?: string
}

export function ErrorFallback({
  title,
  message,
  onRetry,
  retryLabel = 'Retry',
  isNetwork,
  isServer,
  isRetrying = false,
  compact,
  className = '',
}: ErrorFallbackProps) {
  const Icon = isNetwork ? Wifi : isServer ? Server : AlertTriangle

  if (compact) {
    return (
      <div
        role="alert"
        aria-live="polite"
        className={`bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5 flex items-center justify-between gap-3 ${className}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            {title && <p className="text-[11px] font-black text-red-800 truncate">{title}</p>}
            {message && <p className="text-[10px] font-semibold text-red-700 truncate">{message}</p>}
          </div>
        </div>
        {onRetry && (
          <button
            type="button"
            disabled={isRetrying}
            onClick={onRetry}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-100 hover:bg-red-200 text-red-800 text-[10px] font-black transition-colors flex-shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>{isRetrying ? 'Retrying...' : retryLabel}</span>
          </button>
        )}
      </div>
    )
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`bg-white border ${isNetwork ? 'border-amber-200' : 'border-red-150'} rounded-xl p-6 sm:p-8 shadow-xs ${className}`}
    >
      <div className="flex flex-col items-center text-center gap-4 max-w-md mx-auto">
        <div className={`p-3.5 rounded-2xl ${isNetwork ? 'bg-amber-50 border border-amber-150' : 'bg-red-50 border border-red-150'}`}>
          <Icon className={`w-7 h-7 ${isNetwork ? 'text-amber-600' : 'text-red-600'}`} aria-hidden="true" />
        </div>
        <div className="space-y-1.5">
          <h3 className={`text-sm font-black ${isNetwork ? 'text-amber-950' : 'text-red-900'}`}>
            {title ?? (isNetwork ? "We couldn't connect to our servers" : isServer ? "Something isn't working right now" : 'Something went wrong')}
          </h3>
          <p className={`text-xs font-semibold ${isNetwork ? 'text-amber-800' : 'text-red-700'} leading-relaxed`}>
            {message ??
              (isNetwork
                ? 'Please check your internet connection and retry. Your mobile data or Wi-Fi may be unavailable.'
                : isServer
                ? 'We are aware of this issue and looking into it. Please try again in a few moments.'
                : 'Please try again. If this keeps happening, contact support.')}
          </p>
        </div>
        {onRetry && (
          <button
            type="button"
            disabled={isRetrying}
            onClick={onRetry}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-xs font-black transition-colors shadow-sm disabled:opacity-60 ${
              isNetwork ? 'bg-amber-600 hover:bg-amber-700' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>{isRetrying ? 'Retrying...' : retryLabel}</span>
          </button>
        )}
      </div>
    </div>
  )
}
