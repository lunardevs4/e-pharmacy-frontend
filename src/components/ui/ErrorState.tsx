import React from 'react'
import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  retryLabel?: string
  isNetwork?: boolean
  isRetrying?: boolean
  className?: string
}

export function ErrorState({
  title,
  message,
  onRetry,
  retryLabel = 'Try Again',
  isNetwork = false,
  isRetrying = false,
  className = ''
}: ErrorStateProps) {
  const displayTitle = title || (isNetwork ? 'Connection Problem' : 'Something went wrong')
  const displayMessage = message || (
    isNetwork
      ? "We couldn't connect to the server. Please check your internet connection and try again."
      : 'We encountered an error while loading this data.'
  )

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`flex flex-col items-center justify-center p-8 text-center space-y-4 ${className}`}
      data-testid="error-state"
    >
      <div className={`p-4 rounded-full border ${isNetwork ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-100'}`}>
        {isNetwork ? (
          <WifiOff className="w-10 h-10 text-amber-600" aria-hidden="true" />
        ) : (
          <AlertTriangle className="w-10 h-10 text-red-500" aria-hidden="true" />
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-black text-gray-900">{displayTitle}</h3>
        <p className="text-sm font-medium text-gray-600 max-w-sm mx-auto">{displayMessage}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          disabled={isRetrying}
          onClick={onRetry}
          className="mt-4 flex items-center space-x-2 px-4 py-2 bg-white border border-gray-250 rounded-lg hover:bg-gray-50 text-gray-800 text-sm font-bold transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-60 shadow-xs"
        >
          <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin text-emerald-600' : 'text-gray-500'}`} />
          <span>{isRetrying ? 'Retrying...' : retryLabel}</span>
        </button>
      )}
    </div>
  )
}
