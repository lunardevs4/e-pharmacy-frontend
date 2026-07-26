import axios from 'axios'
import { TokenStorage } from '@/services/token-storage'
import { useAuthStore } from '@/store/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'https://api.epharmacy.gov.rw/v1'

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor: Attach bearer token if present
apiClient.interceptors.request.use(
  (config) => {
    const token = TokenStorage.getToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Global state/flag to prevent redundant token refresh calls
let isRefreshing = false
let refreshQueue: Array<(token: string) => void> = []

// Response Interceptor: Handle errors globally & intercept for refresh token
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Handle session expiry (401 Unauthorized)
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      const refreshToken = TokenStorage.getRefreshToken()
      
      if (refreshToken) {
        if (!isRefreshing) {
          isRefreshing = true
          originalRequest._retry = true
          
          try {
            // Placeholder: When backend refresh token API is ready:
            // const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken })
            // const { accessToken, newRefreshToken } = res.data
            // TokenStorage.setToken(accessToken)
            // TokenStorage.setRefreshToken(newRefreshToken)
            // isRefreshing = false
            // refreshQueue.forEach(cb => cb(accessToken))
            // refreshQueue = []
            // return apiClient(originalRequest)
          } catch (refreshErr) {
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

      // If no refresh token or refresh fails, perform full session logout
      TokenStorage.clearToken()
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    
    return Promise.reject(error)
  },
)

