import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { TokenStorage } from '@/services/token-storage'
import { useAuthStore } from '@/store/authStore'

const API_URL = import.meta.env.VITE_API_URL || '/api/v1'

const MAX_RETRIES = 3
const RETRY_DELAY = 1000

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 8000,
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
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean; _retryCount?: number; _skipRetry?: boolean }

    // Registration creates a database record before sending email. Retrying a
    // timed-out POST can therefore create a duplicate request while the first
    // request is still finishing.
    if (originalRequest?._skipRetry) {
      return Promise.reject(error)
    }

    // Retry logic for network errors and 5xx errors
    if (!error.response && originalRequest && !originalRequest._retry) {
      const retryCount = originalRequest._retryCount || 0
      if (retryCount < MAX_RETRIES) {
        originalRequest._retryCount = retryCount + 1
        await sleep(RETRY_DELAY * Math.pow(2, retryCount))
        return apiClient(originalRequest)
      }
    }

    if (error.response && error.response.status >= 500 && originalRequest && !originalRequest._retry) {
      const retryCount = originalRequest._retryCount || 0
      if (retryCount < MAX_RETRIES) {
        originalRequest._retryCount = retryCount + 1
        await sleep(RETRY_DELAY * Math.pow(2, retryCount))
        return apiClient(originalRequest)
      }
    }

    if (!error.response) {
      return Promise.reject(
        new Error('Oopss Something went wrong. Please try again.')
      )
    }

    const isLoginRequest = originalRequest.url?.includes('/auth/login')
    if (error.response.status === 401 && !isLoginRequest && !originalRequest._retry) {
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
      TokenStorage.clearToken()
      useAuthStore.getState().logout()
      if (typeof window !== 'undefined') window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)
