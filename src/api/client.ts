import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useLanguageStore } from '@/store/languageStore'

const API_URL = import.meta.env.VITE_API_URL || '/api/v1'

const MAX_RETRIES = 1
const RETRY_DELAY = 500

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 8000,
  withCredentials: true,
})

apiClient.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => Promise.reject(error),
)

let isRefreshing = false
let refreshQueue: Array<{ resolve: () => void; reject: (error: unknown) => void }> = []

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean; _retryCount?: number; _skipRetry?: boolean }

    if (originalRequest?._skipRetry) {
      return Promise.reject(error)
    }

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
        new Error(useLanguageStore.getState().t('error.networkError'))
      )
    }

    const isAuthRequest = ['/auth/login', '/auth/refresh', '/auth/logout'].some((path) => originalRequest.url?.includes(path))
    if (error.response.status === 401 && !isAuthRequest && !originalRequest._retry) {
      if (!isRefreshing) {
          isRefreshing = true
          originalRequest._retry = true
          try {
            await axios.post(`${API_URL}/auth/refresh`, undefined, { timeout: 5000, withCredentials: true })
            isRefreshing = false
            refreshQueue.forEach(({ resolve }) => resolve())
            refreshQueue = []
            return apiClient(originalRequest)
          } catch (refreshError) {
            isRefreshing = false
            refreshQueue.forEach(({ reject }) => reject(refreshError))
            refreshQueue = []
          }
      } else {
        return new Promise((resolve, reject) => {
          refreshQueue.push({
            resolve: () => resolve(apiClient(originalRequest)),
            reject,
          })
        })
      }
      if (typeof window !== 'undefined') window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)
