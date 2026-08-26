import axios, { AxiosError } from 'axios'
import { TokenStorage } from '@/services/token-storage'
import { useAuthStore } from '@/store/authStore'

const API_URL = import.meta.env.VITE_API_URL || '/api/v1'

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  // 8-second timeout so network errors surface quickly instead of hanging
  timeout: 8000,
})

// ── Request interceptor: attach Bearer token ──────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = TokenStorage.getToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

let isRefreshing = false
let refreshQueue: Array<(token: string) => void> = []

// ── Response interceptor: handle errors globally ─────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Network error (no response) — server not reachable / CORS / offline
    if (!error.response) {
      // Don't redirect; let the calling service handle it gracefully
      return Promise.reject(
        new Error('Network error — the API server is unreachable. Running in offline/demo mode.')
      )
    }

    const originalRequest = error.config as any

    // 401 handling with refresh token queue
    if (error.response.status === 401 && !originalRequest._retry) {
      const refreshToken = TokenStorage.getRefreshToken()

      if (refreshToken) {
        if (!isRefreshing) {
          isRefreshing = true
          originalRequest._retry = true
          try {
            const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken }, { timeout: 5000 })
            const payload = res.data?.data || res.data
            const accessToken = payload?.accessToken
            if (accessToken) {
              TokenStorage.setToken(accessToken)
              if (payload?.refreshToken) TokenStorage.setRefreshToken(payload.refreshToken)
              isRefreshing = false
              refreshQueue.forEach((cb) => cb(accessToken))
              refreshQueue = []
              return apiClient(originalRequest)
            }
          } catch {
            isRefreshing = false
            refreshQueue = []
          }
        } else {
          return new Promise((resolve) => {
            refreshQueue.push((token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`
              resolve(apiClient(originalRequest))
            })
          })
        }
      }

      // Refresh failed or no refresh token — log out silently
      TokenStorage.clearToken()
      useAuthStore.getState().logout()
      if (typeof window !== 'undefined') window.location.href = '/login'
    }

    return Promise.reject(error)
  },
)
