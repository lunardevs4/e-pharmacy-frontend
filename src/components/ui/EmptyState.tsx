import React from 'react'
import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ 
  icon = <Inbox className="w-12 h-12 text-gray-300" />, 
  title, 
  description, 
  action, 
  className = '' 
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center space-y-4 ${className}`} data-testid="empty-state">
      <div className="p-4 bg-gray-50 rounded-full border border-gray-100">
        {icon}
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-black text-gray-900">{title}</h3>
        {description && <p className="text-sm font-medium text-gray-500 max-w-sm mx-auto">{description}</p>}
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  )
}
