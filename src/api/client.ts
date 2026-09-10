import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useLanguageStore } from '@/store/languageStore'

const API_URL = import.meta.env.VITE_API_URL || '/api/v1'

const MAX_RETRIES = 1
const RETRY_DELAY = 500
const CSRF_HEADER = 'X-CSRF-Token'
let csrfToken: string | null = null
let csrfTokenPromise: Promise<string | null> | null = null

async function ensureCsrfToken() {
  if (csrfToken) return csrfToken
  if (!csrfTokenPromise) {
    csrfTokenPromise = axios.get(`${API_URL}/auth/csrf-token`, {
      timeout: 5000,
      withCredentials: true,
    }).then((response) => {
      const payload = response.data?.data || response.data
      csrfToken = typeof payload?.csrfToken === 'string' ? payload.csrfToken : null
      return csrfToken
    }).finally(() => {
      csrfTokenPromise = null
    })
  }
  return csrfTokenPromise
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 8000,
  withCredentials: true,
})

apiClient.interceptors.request.use(
  async (config) => {
    const method = (config.method || 'get').toUpperCase()
    if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      const token = await ensureCsrfToken()
      if (token) {
        config.headers = config.headers || {}
        config.headers[CSRF_HEADER] = token
      }
    }
    return config
  },
  (error) => Promise.reject(error),
)

let isRefreshing = false
let refreshQueue: Array<{ resolve: () => void; reject: (error: unknown) => void }> = []

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
      _retryCount?: number
      _skipRetry?: boolean
      _skipAuthRefresh?: boolean
    }

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
    if (error.response.status === 401 && !isAuthRequest && !originalRequest._skipAuthRefresh && !originalRequest._retry) {
      if (!isRefreshing) {
          isRefreshing = true
          originalRequest._retry = true
          try {
            const token = await ensureCsrfToken()
            await axios.post(`${API_URL}/auth/refresh`, undefined, {
              timeout: 5000,
              withCredentials: true,
              headers: token ? { [CSRF_HEADER]: token } : undefined,
            })
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
      // Let the caller handle an unauthenticated response. In particular, the
      // startup session probe must be allowed to resolve so public routes can
      // render when no authentication cookie exists.
    }
    return Promise.reject(error)
  },
)
