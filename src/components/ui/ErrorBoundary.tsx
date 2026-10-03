import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class AppErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by AppErrorBoundary:', error, errorInfo)
    const isChunkError =
      error?.message?.includes('dynamically imported module') ||
      error?.message?.includes('Failed to fetch') ||
      error?.name === 'ChunkLoadError'

    if (isChunkError && typeof window !== 'undefined') {
      const hasReloaded = window.sessionStorage.getItem('epharmacy_eb_retry')
      if (!hasReloaded) {
        window.sessionStorage.setItem('epharmacy_eb_retry', 'true')
        window.location.reload()
      }
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined })
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 shadow-xl p-6 sm:p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-100">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-gray-900">Something went wrong</h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                An unexpected error occurred while rendering this page.
              </p>
              {this.state.error && (
                <div className="mt-3 p-3 bg-red-50/50 border border-red-150 rounded-lg text-left overflow-x-auto">
                  <p className="text-[11px] font-mono text-red-700 font-semibold break-words">
                    {this.state.error.message}
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={this.handleReset}
              className="w-full inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-health-primary hover:bg-emerald-900 text-white font-bold text-xs rounded-xl transition-colors shadow-sm cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Page</span>
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default AppErrorBoundary
