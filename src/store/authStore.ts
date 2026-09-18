import { create } from 'zustand'
import { User } from '@/types'
import { AuthApi } from '@/services/auth-api'
import { TokenStorage } from '@/services/token-storage'

interface AuthStore {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isInitialising: boolean
  error: string | null
  login: (user: User, accessToken?: string, refreshToken?: string) => void
  logout: () => void
  expireSession: () => void
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
    const hasCachedToken = TokenStorage.isAuthenticated()
    if (!hasCachedToken) {
      set({ isInitialising: false })
      return
    }
    try {
      const session = await AuthApi.restoreSession()
      if (session?.user) {
        set({
          user: session.user as User,
          token: session.accessToken ?? TokenStorage.getToken(),
          isAuthenticated: true,
          isInitialising: false,
        })
        return
      }
    } catch {
      // Token is stale — clear it before reporting signed-out state.
      TokenStorage.clearToken()
    }
    set({ isInitialising: false })
  },

  login: (user, accessToken, refreshToken) => {
    if (accessToken) {
      TokenStorage.setTokens(accessToken, refreshToken)
    }
    set({
      user,
      token: accessToken ?? TokenStorage.getToken(),
      isAuthenticated: true,
      error: null,
    })
  },

  logout: () => {
    void AuthApi.logout()
    TokenStorage.clearToken()
    set({ user: null, token: null, isAuthenticated: false, error: null })
  },

  expireSession: () => {
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
