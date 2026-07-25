import { create } from 'zustand'
import { User } from '@/types'
import { TokenStorage } from '@/services/token-storage'

interface AuthStore {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (user: User, token: string) => void
  logout: () => void
  setError: (error: string | null) => void
  setLoading: (isLoading: boolean) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: TokenStorage.getToken(),
  isAuthenticated: !!TokenStorage.getToken(),
  isLoading: false,
  error: null,
  login: (user, token) => {
    TokenStorage.setToken(token)
    set({ user, token, isAuthenticated: true, error: null })
  },
  logout: () => {
    TokenStorage.clearToken()
    set({ user: null, token: null, isAuthenticated: false, error: null })
  },
  setError: (error) => set({ error }),
  setLoading: (isLoading) => set({ isLoading }),
}))
