import React, { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AppRoutes from '@/routes'
import { useAuthStore } from '@/store/authStore'

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

  useEffect(() => {
    initialise()
  }, [])

  if (isInitialising) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <img src="/logo1.png" alt="Rwanda E-Pharmacy" className="h-14 w-auto object-contain" />
          <div className="w-6 h-6 border-2 border-health-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-gray-400 font-medium">Loading session…</span>
        </div>
      </div>
    )
  }

  return <AppRoutes />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
