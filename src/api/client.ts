import axios, { AxiosError, AxiosHeaders, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
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

const getFriendlyStatusMessage = (status: number) => {
  const key = status === 400 || status === 422
    ? 'error.invalidRequest'
    : status === 401
      ? 'error.sessionExpired'
      : status === 403
        ? 'error.forbidden'
        : status === 404
          ? 'error.notFound'
          : status === 409
            ? 'error.conflict'
            : status === 429
              ? 'error.rateLimited'
              : status >= 500
                ? 'error.serverUnavailable'
                : 'error.requestFailed'
  return useLanguageStore.getState().t(key)
}

const hasTechnicalMessage = (message: unknown) =>
  typeof message === 'string' &&
  /throttlerexception|cannot (get|post|put|patch|delete|options)\s+\//i.test(message)

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 8000,
  withCredentials: true,
  xsrfCookieName: '__Host-epharmacy_csrf',
  xsrfHeaderName: CSRF_HEADER,
})

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
    }
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
      _skipDedupe?: boolean
    }

    if (originalRequest?._skipRetry) {
      return Promise.reject(error)
    }

    if (error.response) {
      const status = error.response.status
      const errData = error.response.data?.error || error.response.data
      const code = errData?.code

      if (status === 503 && (code === 'SYSTEM_MAINTENANCE' || code === 'SYSTEM_EMERGENCY_LOCKDOWN')) {
        const user = (await import('@/store/authStore')).useAuthStore.getState().user
        if (user?.role !== 'ADMIN') {
          try {
            sessionStorage.setItem('maintenance_info', JSON.stringify({
              code,
              message: errData.message,
              reason: errData.reason,
              estimatedEndTime: errData.estimatedEndTime,
              updatedAt: errData.updatedAt,
            }))
          } catch {
            // ignore session storage quota errors
          }
          if (window.location.pathname !== '/maintenance') {
            window.location.href = '/maintenance'
          }
        }
      } else if (status === 400 || status === 401 || status === 403 || status === 404 ||
          status === 409 || status === 422 || status === 429 || status >= 500 ||
          hasTechnicalMessage(error.message)) {
        error.message = getFriendlyStatusMessage(status)
      }
    }

    if (!error.response && originalRequest && !originalRequest._retry) {
      const retryCount = originalRequest._retryCount || 0
      if (retryCount < MAX_RETRIES) {
        originalRequest._retryCount = retryCount + 1
        originalRequest._skipDedupe = true
        await sleep(RETRY_DELAY * Math.pow(2, retryCount))
        return apiClient(originalRequest)
      }
    }

    if (error.response && error.response.status >= 500 && originalRequest && !originalRequest._retry) {
      const retryCount = originalRequest._retryCount || 0
      if (retryCount < MAX_RETRIES) {
        originalRequest._retryCount = retryCount + 1
        originalRequest._skipDedupe = true
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
            originalRequest._skipDedupe = true
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
    if (
      error.response.status === 401 &&
      !isAuthRequest &&
      !originalRequest._skipAuthRefresh
    ) {
      window.dispatchEvent(new Event('auth:expired'))
    }
    return Promise.reject(error)
  },
)
