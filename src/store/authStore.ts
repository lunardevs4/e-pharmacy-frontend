import { create } from 'zustand'
import { User } from '@/types'
import { AuthApi } from '@/services/auth-api'

interface AuthStore {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isInitialising: boolean
  error: string | null
  login: (user: User) => void
  logout: () => void
  setError: (error: string | null) => void
  updateProfile: (updatedFields: Partial<User>) => void
  initialise: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isInitialising: true,   // start as true — will be set false after restore attempt
  error: null,

  initialise: async () => {
    try {
      const session = await AuthApi.restoreSession()
      if (session?.user) {
        set({ user: session.user as User, isAuthenticated: true, isInitialising: false })
        return
      }
    } catch {
      // An absent or expired HttpOnly cookie means there is no active session.
    }
    set({ isInitialising: false })
  },

  login: (user) => {
    set({ user, token: null, isAuthenticated: true, error: null })
  },

  logout: () => {
    void AuthApi.logout()
    set({ user: null, token: null, isAuthenticated: false, error: null })
  },

  setError: (error) => set({ error }),

  updateProfile: (updatedFields) => {
    set((state) => {
      const updated = state.user ? { ...state.user, ...updatedFields } : null
      return { user: updated }
    })
  },
}))
