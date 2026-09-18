import React, { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AppRoutes from '@/routes'
import { useAuthStore } from '@/store/authStore'
import { GlobalToaster } from '@/components/ui/GlobalToaster'
import { useUIStore } from '@/store/uiStore'
import { useLanguageStore } from '@/store/languageStore'
import { AppErrorBoundary } from '@/components/ui/ErrorBoundary'
import { NetworkOfflineBanner } from '@/components/ui/NetworkOfflineBanner'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function AppShell() {
  const { initialise, isInitialising } = useAuthStore()
  const warningToast = useUIStore((s) => s.warningToast)
  const t = useLanguageStore((s) => s.t)

  useEffect(() => {
    initialise()
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (window.sessionStorage.getItem('epharmacy_auth_expired') === '1') {
      window.sessionStorage.removeItem('epharmacy_auth_expired')

      setTimeout(
        () =>
          warningToast(
            t('error.unauthorized'),
            'Your session expired. Please sign in again.',
          ),
        300,
      )
    }
  }, [warningToast, t])

  if (isInitialising) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <img
            src="/logo1.png"
            alt="Rwanda E-Pharmacy"
            className="h-14 w-auto object-contain"
          />

          <div className="w-6 h-6 border-2 border-health-primary border-t-transparent rounded-full animate-spin" />

          <span className="text-xs text-gray-400 font-medium">
            Loading session…
          </span>
        </div>
      </div>
    )
  }

  return (
    <>
      <NetworkOfflineBanner />
      <AppRoutes />
      <GlobalToaster />
    </>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppErrorBoundary>
          <AppShell />
        </AppErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  )
}