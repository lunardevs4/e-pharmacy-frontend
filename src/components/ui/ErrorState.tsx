import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({ 
  title = 'Something went wrong', 
  message = 'We encountered an error while loading this data.', 
  onRetry,
  className = ''
}: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center space-y-4 ${className}`} data-testid="error-state">
      <div className="p-4 bg-red-50 rounded-full border border-red-100">
        <AlertTriangle className="w-10 h-10 text-red-500" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-black text-gray-900">{title}</h3>
        <p className="text-sm font-medium text-red-600/80 max-w-sm mx-auto">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 text-sm font-bold transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  )
}
