import React from 'react'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  message: string
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction
}: EmptyStateProps) {
  return (
    <div className="py-12 px-6 text-center space-y-4 border border-dashed border-gray-300 rounded-xl bg-white max-w-md mx-auto">
      {icon && <div className="text-gray-300 flex justify-center">{icon}</div>}
      <div className="space-y-1">
        <h3 className="font-bold text-gray-700 text-sm">{title}</h3>
        <p className="text-xs text-gray-400 max-w-xs mx-auto leading-normal">{message}</p>
      </div>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="bg-health-primary hover:bg-health-secondary text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
