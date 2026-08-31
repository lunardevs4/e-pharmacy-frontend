import React, { useEffect, useRef } from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmationDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

export default function ConfirmationDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false
}: ConfirmationDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel()
      }
    };

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center px-4 py-6" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
      <div onClick={onCancel} className="portal-modal-backdrop absolute inset-0 bg-gray-900/50 backdrop-blur-xs transition-opacity" />

      <div ref={dialogRef} className="portal-modal-panel relative w-full max-w-sm bg-white rounded-xl border border-gray-250 shadow-2xl p-5 z-55 flex flex-col space-y-4 animate-scaleUp">
        <div className="flex items-start space-x-3.5">
          <div className="p-2 bg-red-50 text-red-700 rounded-full border border-red-100 flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1 flex-grow">
            <h3 id="dialog-title" className="font-black text-gray-900 text-sm">{title}</h3>
            <p className="text-xs text-gray-500 leading-normal">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-2 pt-2">
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-xs font-bold transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className="bg-red-650 hover:bg-red-750 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors focus:outline-none focus:ring-1 focus:ring-red-500 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
