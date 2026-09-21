import { AxiosError } from 'axios'
import { useLanguageStore } from '@/store/languageStore'

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical'

export interface ValidationFieldError {
  field: string
  message: string
}

export interface AppError {
  message: string
  i18nKey: string
  severity: ErrorSeverity
  statusCode?: number
  validationErrors?: ValidationFieldError[]
  isNetwork: boolean
  isAuth: boolean
  isServer: boolean
  isValidation: boolean
  isTimeout?: boolean
  originalError: unknown
  userFriendly: boolean
  retryable: boolean
  silent: boolean
}

const t = (key: string, vars?: Record<string, string | number>) =>
  useLanguageStore.getState().t(key, vars)

const defaultMessage = (fallback: string) =>
  t('error.requestFailed') || fallback

export const isTechnicalMessage = (message: unknown): boolean => {
  if (typeof message !== 'string') return false
  return /axioserror|network\s*error|prisma|syntax\s*error|typeerror|type\s*error|referenceerror|reference\s*error|database|sql|column|foreign\s*key|constraint|relation|table|undefined\s*is\s*not|cannot\s*read\s*propert|econnrefused|enotfound|internal\s*server\s*error|stack\s*trace|\bat\s+(?:async\s+)?[a-zA-Z0-9_$.<>]+\s*\(|\bat\s+(?:\/|[a-zA-Z]:\\|\w+\.\w+:\d+)|nest\.js|controller|queryfailed|nullpointer|etimedout|status\s*code\s*\d{3}|cannot\s*(get|post|put|patch|delete|options)\s+\/|throttlerexception|unhandledrejection/i.test(
    message,
  )
}

const buildAppError = (partial: Partial<AppError> & { message: string }): AppError => ({
  message: partial.message,
  i18nKey: partial.i18nKey ?? 'error.requestFailed',
  severity: partial.severity ?? 'error',
  statusCode: partial.statusCode,
  validationErrors: partial.validationErrors,
  isNetwork: partial.isNetwork ?? false,
  isAuth: partial.isAuth ?? false,
  isServer: partial.isServer ?? false,
  isValidation: partial.isValidation ?? false,
  isTimeout: partial.isTimeout ?? false,
  originalError: partial.originalError,
  userFriendly: partial.userFriendly ?? true,
  retryable: partial.retryable ?? true,
  silent: partial.silent ?? false,
})

const extractBackendMessage = (data: any): string | null => {
  if (!data) return null
  let msg: string | null = null
  if (typeof data.message === 'string') msg = data.message
  else if (Array.isArray(data.message) && data.message.length > 0) {
    const first = data.message[0]
    if (typeof first === 'string') msg = first
    else if (typeof first?.message === 'string') msg = first.message
  } else if (typeof data.error === 'string') msg = data.error
  else if (typeof data.error === 'object' && data.error !== null && typeof data.error.message === 'string') msg = data.error.message
  else if (typeof data.msg === 'string') msg = data.msg
  else if (data.data && typeof data.data.message === 'string') msg = data.data.message

  if (msg && !isTechnicalMessage(msg)) {
    return msg
  }
  return null
}

export const sanitizeErrorMessage = (message: unknown, fallback = 'A system error occurred. Please try again or contact support.'): string => {
  if (typeof message !== 'string' || isTechnicalMessage(message)) {
    return fallback
  }
  return message
}

export const isNetworkError = (err: unknown): boolean => {
  if (!err) return false
  const errObj = err as any
  if (errObj && typeof errObj === 'object' && 'response' in errObj && errObj.response) {
    return false
  }
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return true
  
  if (err instanceof Error) {
    if (
      err.name === 'TypeError' &&
      (err.message.includes('fetch') || err.message.includes('Network') || err.message.includes('Failed to fetch'))
    ) {
      return true
    }
    if (/network|offline|econnrefused|internet|disconnected|err_internet|socket|abort/i.test(err.message)) {
      return true
    }
  }

  if (errObj.code === 'ECONNABORTED' || errObj.code === 'ERR_NETWORK' || errObj.code === 'ETIMEDOUT') {
    return true
  }
  if (typeof errObj.message === 'string' && /network|offline|econnrefused|failed to fetch|timeout|abort|disconnected|err_internet/i.test(errObj.message)) {
    return true
  }
  return false
}

export const extractValidationErrors = (data: any): ValidationFieldError[] => {
  const errors: ValidationFieldError[] = []
  if (!data) return errors

  const candidates = [
    data?.errors,
    data?.validationErrors,
    data?.fieldErrors,
    data?.data?.errors,
    data?.error?.details,
    Array.isArray(data?.message) ? data.message : null,
  ]

  for (const c of candidates) {
    if (!c) continue
    if (Array.isArray(c)) {
      for (const item of c) {
        if (typeof item === 'object' && item !== null) {
          const field = item.field ?? item.property ?? item.path ?? ''
          const message = item.message ?? item.msg ?? item.error ?? ''
          if (message && !isTechnicalMessage(message)) {
            errors.push({ field: String(field), message: String(message) })
          }
        } else if (typeof item === 'string' && !isTechnicalMessage(item)) {
          errors.push({ field: '', message: item })
        }
      }
    } else if (typeof c === 'object') {
      for (const [field, value] of Object.entries(c)) {
        const messages = Array.isArray(value) ? value : [value]
        for (const m of messages) {
          if (typeof m === 'string' && !isTechnicalMessage(m)) {
            errors.push({ field, message: m })
          }
        }
      }
    }
  }
  return errors
}

const statusCodeToI18n = (status: number): { key: string; severity: ErrorSeverity; auth: boolean } => {
  switch (status) {
    case 400:
      return { key: 'error.badRequest', severity: 'warning', auth: false }
    case 401:
      return { key: 'error.unauthorized', severity: 'error', auth: true }
    case 403:
      return { key: 'error.forbidden', severity: 'error', auth: true }
    case 404:
      return { key: 'error.notFound', severity: 'warning', auth: false }
    case 409:
      return { key: 'error.conflict', severity: 'warning', auth: false }
    case 413:
      return { key: 'error.payloadTooLarge', severity: 'error', auth: false }
    case 415:
      return { key: 'error.unsupportedMediaType', severity: 'error', auth: false }
    case 422:
      return { key: 'error.validation', severity: 'warning', auth: false }
    case 429:
      return { key: 'error.tooManyRequests', severity: 'warning', auth: false }
    case 500:
      return { key: 'error.internalServerError', severity: 'critical', auth: false }
    case 502:
      return { key: 'error.badGateway', severity: 'critical', auth: false }
    case 503:
      return { key: 'error.serviceUnavailable', severity: 'critical', auth: false }
    case 504:
      return { key: 'error.gatewayTimeout', severity: 'critical', auth: false }
    default:
      if (status >= 400 && status < 500) return { key: 'error.clientError', severity: 'error', auth: false }
      if (status >= 500) return { key: 'error.serverError', severity: 'critical', auth: false }
      return { key: 'error.requestFailed', severity: 'error', auth: false }
  }
}

export const normalizeError = (err: unknown, options: Partial<{ silent: boolean }> = {}): AppError => {
  if (err === null || err === undefined) {
    return buildAppError({
      message: defaultMessage('An unknown error occurred.'),
      i18nKey: 'error.requestFailed',
      severity: 'error',
      originalError: err,
      silent: options.silent,
    })
  }

  if ((err as AppError).userFriendly !== undefined && typeof (err as AppError).message === 'string') {
    const isTech = isTechnicalMessage((err as AppError).message)
    if (isTech) {
      const fallbackKey = (err as AppError).isNetwork ? 'error.networkError' : 'error.requestFailed'
      return {
        ...(err as AppError),
        message: t(fallbackKey) || "We couldn't connect to the server. Please check your internet connection and try again.",
        silent: options.silent ?? (err as AppError).silent,
      }
    }
    return { ...(err as AppError), silent: options.silent ?? (err as AppError).silent }
  }

  const isOffline = (typeof navigator !== 'undefined' && navigator.onLine === false) || isNetworkError(err)

  const axiosErr = err as any
  const hasResponse = axiosErr && typeof axiosErr === 'object' && 'response' in axiosErr && axiosErr.response

  if (axiosErr.isAxiosError || (axiosErr.config && axiosErr.request) || hasResponse) {
    const response = axiosErr.response
    const status = response?.status
    const data = response?.data

    if (!response) {
      const code = axiosErr.code
      const timeout = code === 'ECONNABORTED' || code === 'ETIMEDOUT' || axiosErr.message?.toLowerCase().includes('timeout')
      const cancelled = code === 'ERR_CANCELED' || axiosErr.message?.toLowerCase().includes('cancel')
      const i18nKey = cancelled ? 'error.requestCancelled' : timeout ? 'error.timeout' : 'error.networkError'
      const fallbackMsg = cancelled
        ? 'Request cancelled.'
        : timeout
        ? 'The request took too long. Please try again.'
        : "We couldn't connect to the server. Please check your internet connection and try again."

      return buildAppError({
        message: t(i18nKey) || fallbackMsg,
        i18nKey,
        severity: cancelled ? 'info' : 'error',
        statusCode: undefined,
        isNetwork: !cancelled,
        isTimeout: timeout,
        retryable: !cancelled,
        originalError: err,
        silent: options.silent ?? cancelled,
      })
    }

    const backendMsg = extractBackendMessage(data)
    const validationErrors = extractValidationErrors(data)
    const safeStatus = typeof status === 'number' ? status : 0
    const { key, severity, auth } = statusCodeToI18n(safeStatus)
    const isValidation = safeStatus === 400 || safeStatus === 422 || validationErrors.length > 0

    let resolvedMessage = backendMsg
    if (!resolvedMessage) {
      if (safeStatus === 401) resolvedMessage = 'Your session has expired. Please sign in again.'
      else if (safeStatus === 403) resolvedMessage = 'You do not have permission to perform this action.'
      else if (safeStatus === 404) resolvedMessage = 'The requested resource could not be found.'
      else if (safeStatus === 429) resolvedMessage = 'Too many requests. Please wait a moment before trying again.'
      else if (safeStatus >= 500) resolvedMessage = 'Our servers are temporarily experiencing issues. Please try again shortly.'
      else resolvedMessage = t(key) || defaultMessage('An unexpected error occurred.')
    }

    return buildAppError({
      message: resolvedMessage,
      i18nKey: key,
      severity,
      statusCode: safeStatus,
      validationErrors: isValidation ? validationErrors : undefined,
      isAuth: auth || safeStatus === 401 || safeStatus === 403,
      isServer: safeStatus >= 500,
      isNetwork: false,
      isValidation,
      retryable: !isValidation && !auth && safeStatus !== 404 && safeStatus !== 409,
      originalError: err,
      silent: options.silent,
    })
  }

  if (isOffline || isNetworkError(err)) {
    const isTimeout = /timeout|timed\s*out/i.test(err instanceof Error ? err.message : String(err))
    const i18nKey = isTimeout ? 'error.timeout' : 'error.networkError'
    const fallbackMsg = isTimeout
      ? 'The request took too long. Please try again.'
      : "Unable to connect. Please check your internet connection and try again."

    return buildAppError({
      message: t(i18nKey) || fallbackMsg,
      i18nKey,
      severity: 'error',
      isNetwork: true,
      isTimeout,
      retryable: true,
      originalError: err,
      silent: options.silent,
    })
  }

  if (err instanceof Error) {
    const isNetworkErr =
      err.message === 'Network Error' ||
      err.message === t('error.networkError') ||
      /network|offline|econnrefused|internet/i.test(err.message)
    const isTimeout = /timeout|timed\s*out/i.test(err.message)
    const isAuth = /(session|token|expired|invalid|unauthorized|forbidden|credential)/i.test(err.message)

    if (isNetworkErr || isTimeout) {
      const i18nKey = isTimeout ? 'error.timeout' : 'error.networkError'
      const msg = isTimeout
        ? 'The request took too long. Please try again.'
        : "We couldn't connect to the server. Please check your internet connection and try again."
      return buildAppError({
        message: t(i18nKey) || msg,
        i18nKey,
        severity: 'error',
        isNetwork: true,
        isTimeout,
        retryable: true,
        originalError: err,
        silent: options.silent,
      })
    }

    if (isTechnicalMessage(err.message)) {
      return buildAppError({
        message: defaultMessage('An unexpected error occurred. Please try again.'),
        i18nKey: 'error.requestFailed',
        severity: 'error',
        isServer: true,
        originalError: err,
        silent: options.silent,
      })
    }

    return buildAppError({
      message: err.message || defaultMessage('An error occurred.'),
      i18nKey: isAuth ? 'error.unauthorized' : 'error.requestFailed',
      severity: isAuth ? 'error' : 'error',
      isAuth,
      originalError: err,
      silent: options.silent,
    })
  }

  if (typeof err === 'string') {
    if (isTechnicalMessage(err)) {
      return buildAppError({
        message: defaultMessage('An unexpected error occurred. Please try again.'),
        i18nKey: 'error.requestFailed',
        severity: 'error',
        originalError: err,
        silent: options.silent,
      })
    }
    return buildAppError({
      message: err,
      i18nKey: 'error.requestFailed',
      severity: 'error',
      originalError: err,
      silent: options.silent,
    })
  }

  return buildAppError({
    message: defaultMessage('An unexpected error occurred.'),
    i18nKey: 'error.requestFailed',
    severity: 'critical',
    originalError: err,
    silent: options.silent,
  })
}

export const getValidationFieldMessage = (
  error: AppError | null | undefined,
  field: string,
): string | null => {
  if (!error?.validationErrors?.length) return null
  const match = error.validationErrors.find(
    (e) => e.field.toLowerCase() === field.toLowerCase(),
  )
  return match?.message ?? null
}

export const getAllValidationFieldMessages = (
  error: AppError | null | undefined,
  field: string,
): string[] => {
  if (!error?.validationErrors?.length) return []
  return error.validationErrors
    .filter((e) => e.field.toLowerCase() === field.toLowerCase())
    .map((e) => e.message)
    .filter(Boolean)
}

export const getUserFacingMessage = (err: unknown, fallback?: string): string => {
  const normalized = normalizeError(err, { silent: true })
  if (normalized.validationErrors?.length) {
    const top = normalized.validationErrors
      .slice(0, 3)
      .map((ve) => (ve.field ? `${ve.field}: ${ve.message}` : ve.message))
      .join(' · ')
    return top || normalized.message
  }
  return normalized.message || fallback || t('error.requestFailed')
}

export const getErrorTitle = (err: unknown, fallbackTitle?: string): string => {
  const normalized = normalizeError(err, { silent: true })
  if (normalized.isAuth) return 'Session Issue'
  if (normalized.isNetwork) return 'Connection Issue'
  if (normalized.isValidation) return 'Check Your Input'
  if (normalized.isServer) return 'Server Issue'
  return fallbackTitle ?? (normalized.severity === 'warning' ? 'Notice' : 'Something went wrong')
}

export const getSearchErrorMessage = (err: unknown): { title: string; message: string; isNetwork: boolean; isTimeout: boolean } => {
  const normalized = normalizeError(err, { silent: true })
  if (normalized.isNetwork) {
    return {
      title: normalized.isTimeout ? 'Search Timeout' : 'Connection Issue',
      message: normalized.isTimeout
        ? 'The search request took too long to complete. Please try again.'
        : "We couldn't connect to the medicine registry. Please check your internet connection and try again.",
      isNetwork: true,
      isTimeout: !!normalized.isTimeout,
    }
  }
  return {
    title: 'Search Unavailable',
    message: normalized.message || "We couldn't complete your search right now. Please try again shortly.",
    isNetwork: false,
    isTimeout: false,
  }
}

export const getReservationErrorMessage = (err: unknown): { title: string; message: string; isNetwork: boolean; isConflict: boolean } => {
  const normalized = normalizeError(err, { silent: true })
  if (normalized.isNetwork) {
    return {
      title: 'Connection Issue',
      message: "We couldn't complete your reservation due to a connection issue. Please check your internet and try again.",
      isNetwork: true,
      isConflict: false,
    }
  }
  if (normalized.statusCode === 409 || normalized.i18nKey === 'error.conflict' || normalized.i18nKey === 'error.noPharmacyStock') {
    return {
      title: 'Stock Conflict',
      message: 'This medication is no longer available in the requested quantity at this pharmacy. Please adjust the quantity or choose another pharmacy.',
      isNetwork: false,
      isConflict: true,
    }
  }
  return {
    title: 'Reservation Failed',
    message: normalized.message || 'Unable to create your reservation. Please review your selection and try again.',
    isNetwork: false,
    isConflict: false,
  }
}

export const getPrescriptionErrorMessage = (err: unknown): { title: string; message: string; isNetwork: boolean } => {
  const normalized = normalizeError(err, { silent: true })
  if (normalized.isNetwork) {
    return {
      title: 'Upload Interrupted',
      message: "We couldn't upload your prescription due to a connection issue. Please check your internet connection and try again.",
      isNetwork: true,
    }
  }
  if (normalized.statusCode === 413 || normalized.i18nKey === 'error.payloadTooLarge') {
    return {
      title: 'File Too Large',
      message: 'The prescription file exceeds the 10MB size limit. Please choose a smaller file.',
      isNetwork: false,
    }
  }
  if (normalized.statusCode === 415 || normalized.i18nKey === 'error.unsupportedMediaType') {
    return {
      title: 'Unsupported File Format',
      message: 'Please upload a valid prescription file in PDF, JPG, or PNG format.',
      isNetwork: false,
    }
  }
  return {
    title: 'Upload Failed',
    message: normalized.message || 'Unable to process your prescription document. Please try again.',
    isNetwork: false,
  }
}

export const listValidationErrors = (err: unknown): string[] => {
  const normalized = normalizeError(err, { silent: true })
  return normalized.validationErrors?.length
    ? normalized.validationErrors.map(
      (ve) => (ve.field ? `${ve.field}: ${ve.message}` : ve.message),
    )
    : []
}

export const logError = (err: unknown, context?: string): void => {
  if (typeof window === 'undefined') return
  const normalized = normalizeError(err, { silent: true })
  const prefix = context ? `[${context}]` : '[Error]'
  try {
    if (import.meta.env?.DEV) {
      console.error(prefix, normalized, normalized.originalError)
    } else {
      console.error(prefix, normalized.message)
    }
  } catch {
    console.error(prefix, err)
  }
}

export const logSilent = (err: unknown, context?: string): void => {
  logError(err, context ? `${context}/silent` : 'silent')
}

export class AppErrorClass extends Error implements AppError {
  i18nKey: string
  severity: ErrorSeverity
  statusCode?: number
  validationErrors?: ValidationFieldError[]
  isNetwork: boolean
  isAuth: boolean
  isServer: boolean
  isValidation: boolean
  isTimeout?: boolean
  originalError: unknown
  userFriendly: boolean
  retryable: boolean
  silent: boolean

  constructor(params: Partial<AppError> & { message: string }) {
    super(params.message)
    this.name = 'AppErrorClass'
    this.i18nKey = params.i18nKey ?? 'error.requestFailed'
    this.severity = params.severity ?? 'error'
    this.statusCode = params.statusCode
    this.validationErrors = params.validationErrors
    this.isNetwork = params.isNetwork ?? false
    this.isAuth = params.isAuth ?? false
    this.isServer = params.isServer ?? false
    this.isValidation = params.isValidation ?? false
    this.isTimeout = params.isTimeout ?? false
    this.originalError = params.originalError
    this.userFriendly = params.userFriendly ?? true
    this.retryable = params.retryable ?? true
    this.silent = params.silent ?? false
  }
}
