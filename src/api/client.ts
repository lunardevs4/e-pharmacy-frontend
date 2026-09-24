import axios, { AxiosError, AxiosHeaders, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { TokenStorage } from '@/services/token-storage'
import { useAuthStore } from '@/store/authStore'
import { useLanguageStore } from '@/store/languageStore'
import { normalizeError, AppErrorClass, AppError } from '@/utils/error-handler'

const API_URL = import.meta.env.VITE_API_URL || '/api/v1'

const MAX_RETRIES = 3
const RETRY_DELAY = 1000

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const isIdempotent = (method?: string): boolean => {
  if (!method) return true
  return ['GET', 'HEAD', 'OPTIONS', 'PUT', 'DELETE'].includes(method.toUpperCase())
}

const shouldRetry = (error: AxiosError, retryCount: number): boolean => {
  if (retryCount >= MAX_RETRIES) return false
  const cfg = error.config as InternalAxiosRequestConfig & { _skipRetry?: boolean }
  if (cfg?._skipRetry) return false
  if (error.code === 'ERR_CANCELED') return false

  if (!error.response) {
    return isIdempotent(cfg?.method) || error.code === 'ECONNABORTED'
  }

  const status = error.response.status
  if (status >= 500 && status !== 501) {
    return isIdempotent(cfg?.method) || status === 502 || status === 503 || status === 504
  }
  if (status === 408 || status === 425 || status === 429) return true

  return false
}

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 12000,
  // Authentication is stored in HTTP-only cookies by the API. Tell the
  // browser to include those cookies on cross-origin localhost requests.
  withCredentials: true,
})

let csrfToken: string | null = null
let csrfTokenRequest: Promise<string> | null = null

const getCsrfToken = async (): Promise<string> => {
  if (csrfToken) return csrfToken
  if (!csrfTokenRequest) {
    csrfTokenRequest = axios
      .get(`${API_URL}/auth/csrf-token`, {
        timeout: 6000,
        withCredentials: true,
      })
      .then((response) => {
        const payload = response.data?.data || response.data
        const token = payload?.csrfToken
        if (!token) throw new Error('CSRF token was not returned by the API')
        csrfToken = token
        return token
      })
      .finally(() => {
        csrfTokenRequest = null
      })
  }
  return csrfTokenRequest
}

// Several portal surfaces can request the same read during one render pass
// (for example, a dashboard and its shared navigation). Share only identical
// in-flight GETs; do not cache responses or deduplicate state-changing calls.
const pendingGets = new Map<string, ReturnType<typeof apiClient.get>>()
const rawGet = apiClient.get.bind(apiClient)
const sharedGetTtlMs = 15_000
const sharedGetCache = new Map<string, { response: AxiosResponse; expiresAt: number }>()
const sharedGetWaiters = new Map<string, Array<(response: AxiosResponse) => void>>()
const sharedCacheChannel = typeof BroadcastChannel !== 'undefined'
  ? new BroadcastChannel('epharmacy-api-cache')
  : null

const isShareableGet = (url: string, config?: { responseType?: string }) =>
  !url.includes('/auth/') && (!config?.responseType || config.responseType === 'json')

const clearSharedGetCache = () => {
  sharedGetCache.clear()
}

if (sharedCacheChannel) {
  sharedCacheChannel.onmessage = (event: MessageEvent) => {
    const message = event.data
    if (message?.type === 'invalidate') {
      clearSharedGetCache()
      return
    }
    if (message?.type === 'get-request' && typeof message.key === 'string') {
      const cached = sharedGetCache.get(message.key)
      if (cached && cached.expiresAt > Date.now()) {
        sharedCacheChannel.postMessage({
          type: 'get-response',
          key: message.key,
          data: cached.response.data,
          status: cached.response.status,
          statusText: cached.response.statusText,
          headers: AxiosHeaders.from(cached.response.headers as Record<string, string>).toJSON(),
        })
      }
      return
    }
    if (message?.type !== 'get-response' || typeof message.key !== 'string') return

    const response: AxiosResponse = {
      data: message.data,
      status: message.status || 200,
      statusText: message.statusText || 'OK',
      headers: AxiosHeaders.from(message.headers || {}),
      config: {} as InternalAxiosRequestConfig,
    }
    sharedGetCache.set(message.key, { response, expiresAt: Date.now() + sharedGetTtlMs })
    sharedGetWaiters.get(message.key)?.splice(0).forEach((resolve) => resolve(response))
    sharedGetWaiters.delete(message.key)
  }
}

const getSharedResponse = (key: string) => {
  const cached = sharedGetCache.get(key)
  if (cached && cached.expiresAt > Date.now()) return Promise.resolve(cached.response)
  sharedGetCache.delete(key)

  return new Promise<AxiosResponse | null>((resolve) => {
    const waiters = sharedGetWaiters.get(key) || []
    const waiter = (response: AxiosResponse) => resolve(response)
    waiters.push(waiter)
    sharedGetWaiters.set(key, waiters)
    window.setTimeout(() => {
      const current = sharedGetWaiters.get(key)
      if (!current) return
      const index = current.indexOf(waiter)
      if (index >= 0) current.splice(index, 1)
      if (current.length === 0) sharedGetWaiters.delete(key)
      resolve(null)
    }, 50)
    sharedCacheChannel?.postMessage({ type: 'get-request', key })
  })
}

apiClient.get = ((url: string, config?: Parameters<typeof apiClient.get>[1]) => {
  const requestConfig = config as (typeof config & { _skipDedupe?: boolean }) | undefined
  if (requestConfig?._skipDedupe || !isShareableGet(url, requestConfig)) {
    return rawGet(url, config)
  }

  const key = `${url}|${JSON.stringify(config?.params ?? null)}`
  const pending = pendingGets.get(key)
  if (pending) return pending

  const request = getSharedResponse(key).then((sharedResponse) => {
    if (sharedResponse) return sharedResponse
    return rawGet(url, config).then((response) => {
      sharedGetCache.set(key, { response, expiresAt: Date.now() + sharedGetTtlMs })
      sharedCacheChannel?.postMessage({
        type: 'get-response',
        key,
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: AxiosHeaders.from(response.headers as Record<string, string>).toJSON(),
      })
      return response
    })
  }).finally(() => {
    pendingGets.delete(key)
  })
  pendingGets.set(key, request)
  return request
}) as typeof apiClient.get

apiClient.interceptors.request.use(
  async (config) => {
    const method = (config.method || 'get').toUpperCase()
    if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      clearSharedGetCache()
      sharedCacheChannel?.postMessage({ type: 'invalidate' })

      const requestUrl = config.url || ''
      const isCsrfExempt =
        requestUrl.endsWith('/auth/login') || requestUrl.endsWith('/auth/register')
      if (!isCsrfExempt && config.headers) {
        config.headers['X-CSRF-Token'] = await getCsrfToken()
      }
    }
    const token = TokenStorage.getToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    const corrId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
    if (config.headers) {
      ;(config.headers as any)['X-Request-ID'] = corrId
    }
    return config
  },
  (error) => Promise.reject(normalizeError(error)),
)

let isRefreshing = false
let refreshQueue: Array<(token: string) => void> = []

const unwrapData = (response: AxiosResponse): any => {
  const payload = response.data
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data
  }
  return payload
}

apiClient.interceptors.response.use(
  (response) => {
    ;(response as any).unwrappedData = unwrapData(response)
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
      _retryCount?: number
      _skipRetry?: boolean
    }

    if ((error as any)?.userFriendly === true) {
      return Promise.reject(error)
    }

    const retryCount = originalRequest?._retryCount || 0
    if (shouldRetry(error, retryCount) && originalRequest && !originalRequest._retry) {
      originalRequest._retryCount = retryCount + 1
      const delay = RETRY_DELAY * Math.pow(2, retryCount) + Math.floor(Math.random() * 200)
      try {
        await sleep(delay)
        return apiClient(originalRequest)
      } catch {
        // fall through to error normalization
      }
    }

    const isLoginRequest = !!originalRequest?.url?.includes('/auth/login')
    const status = error.response?.status

    if (status === 401 && !isLoginRequest && !originalRequest?._retry) {
      const refreshToken = TokenStorage.getRefreshToken()

      if (refreshToken) {
        if (!isRefreshing) {
          isRefreshing = true
          originalRequest._retry = true
          try {
            const csrfTokenForRefresh = await getCsrfToken()
            const res = await axios.post(
              `${API_URL}/auth/refresh`,
              {},
              { 
                timeout: 6000, 
                withCredentials: true,
                headers: { 'X-CSRF-Token': csrfTokenForRefresh }
              },
            )
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
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('epharmacy_auth_expired', '1')
        window.location.href = '/login'
      }
    }

    if (!error.response) {
      const t = useLanguageStore.getState().t
      const isTimeout = error.code === 'ECONNABORTED' || error.message?.toLowerCase().includes('timeout')
      const isCancelled = error.code === 'ERR_CANCELED'
      const i18nKey = isCancelled ? 'error.requestCancelled' : isTimeout ? 'error.timeout' : 'error.networkError'
      const appErr = new AppErrorClass({
        message: t(i18nKey),
        i18nKey,
        severity: isCancelled ? 'info' : 'error',
        statusCode: undefined,
        isNetwork: !isCancelled,
        retryable: !isCancelled,
        silent: isCancelled,
        originalError: error,
      })
      return Promise.reject(appErr)
    }

    const normalized: AppError = normalizeError(error)

    if (status === 403 || (status === 401 && isLoginRequest)) {
      normalized.isAuth = true
    }

    if (typeof window !== 'undefined' && import.meta.env.DEV) {
      console.warn('[API Error]', {
        status: normalized.statusCode,
        message: normalized.message,
        url: originalRequest?.url,
        validationErrors: normalized.validationErrors,
      })
    }

    return Promise.reject(normalized)
  },
)

/** Normalize the backend's { success, data, message, meta } response envelope. */
export const unwrap = <T = any>(response: AxiosResponse | unknown): T => {
  if ((response as any)?.unwrappedData !== undefined) {
    return (response as any).unwrappedData as T
  }

  const payload = (response as any)?.data ?? response
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data as T
  }
  return payload as T
}

export const unwrapList = <T = any>(response: AxiosResponse | unknown): T[] => {
  const payload = unwrap<any>(response)
  if (Array.isArray(payload)) return payload as T[]
  if (Array.isArray(payload?.data)) return payload.data as T[]
  return []
}
