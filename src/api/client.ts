import axios from 'axios'
import { TokenStorage } from '@/services/token-storage'
import { useAuthStore } from '@/store/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

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

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = TokenStorage.getRefreshToken()

      if (refreshToken) {
        if (!isRefreshing) {
          isRefreshing = true
          originalRequest._retry = true

          try {
            const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken })
            const payload = res.data?.data || res.data
            const accessToken = payload?.accessToken
            if (accessToken) {
              TokenStorage.setToken(accessToken)
              if (payload?.refreshToken) {
                TokenStorage.setRefreshToken(payload.refreshToken)
              }
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

      TokenStorage.clearToken()
      useAuthStore.getState().logout()
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  },
)

