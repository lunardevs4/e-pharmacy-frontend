import React from 'react'

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
