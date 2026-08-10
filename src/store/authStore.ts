import { create } from 'zustand'
import { User } from '@/types'
import { TokenStorage } from '@/services/token-storage'

interface AuthStore {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  /** true while we are still rehydrating the session from storage on first load */
  isInitialising: boolean
  error: string | null
  login: (user: User, token: string) => void
  logout: () => void
  setError: (error: string | null) => void
  updateProfile: (updatedFields: Partial<User>) => void
  /** Call once on app boot to restore session from localStorage */
  initialise: () => void
}

/**
 * Returns true only when the token looks like a real JWT
 * (three base64-url segments separated by dots).
 * Mock tokens produced by auth-api.ts start with "mock_jwt_" and are rejected.
 */
function isRealJwt(token: string): boolean {
  if (!token || token.startsWith('mock_jwt_')) return false
  const parts = token.split('.')
  return parts.length === 3
}

/**
 * Decode a JWT payload without verifying the signature.
 * Used client-side only to check expiry.
 */
function decodeJwtPayload(token: string): { exp?: number } | null {
  try {
    const payload = token.split('.')[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isInitialising: true,   // start as true — will be set false after restore attempt
  error: null,

  initialise: () => {
    const token = TokenStorage.getToken()
    const savedUser = TokenStorage.loadUser() as User | null

    // Validate: token must be a real JWT and not expired
    const tokenValid =
      token &&
      isRealJwt(token) &&
      (() => {
        const payload = decodeJwtPayload(token)
        if (!payload?.exp) return false
        return payload.exp * 1000 > Date.now()
      })()

    if (tokenValid && savedUser) {
      set({
        token,
        user: savedUser,
        isAuthenticated: true,
        isInitialising: false,
      })
    } else {
      // No valid session or token expired — clear everything stale
      TokenStorage.clearToken()
      set({ isInitialising: false })
    }
  },

  login: (user, token) => {
    TokenStorage.setToken(token)
    TokenStorage.saveUser(user)
    set({ user, token, isAuthenticated: true, error: null })
  },

  logout: () => {
    TokenStorage.clearToken()
    set({ user: null, token: null, isAuthenticated: false, error: null })
  },

  setError: (error) => set({ error }),

  updateProfile: (updatedFields) => {
    set((state) => {
      const updated = state.user ? { ...state.user, ...updatedFields } : null
      if (updated) TokenStorage.saveUser(updated)
      return { user: updated }
    })
  },
}))
