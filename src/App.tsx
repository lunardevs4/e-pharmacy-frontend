import React, { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AppRoutes from '@/routes'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { useLanguageStore } from '@/store/languageStore'
import { GlobalToaster, AppErrorBoundary, NetworkOfflineBanner } from '@/components/ui'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function AppShell() {
  const warningToast = useUIStore((s) => s.warningToast)
  const t = useLanguageStore((s) => s.t)

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
