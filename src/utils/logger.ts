/**
 * Development Logger Utility
 * 
 * In development (import.meta.env.DEV), logs messages to the browser console.
 * In production builds, all methods are no-ops and stripped automatically by Vite/esbuild.
 */
const isDev = Boolean(import.meta.env.DEV)

export const logger = {
  log: (...args: unknown[]): void => {
    if (isDev) {
      console.log('[DEV]', ...args)
    }
  },
  info: (...args: unknown[]): void => {
    if (isDev) {
      console.info('[DEV INFO]', ...args)
    }
  },
  warn: (...args: unknown[]): void => {
    if (isDev) {
      console.warn('[DEV WARN]', ...args)
    }
  },
  error: (...args: unknown[]): void => {
    if (isDev) {
      console.error('[DEV ERROR]', ...args)
    }
  },
  debug: (...args: unknown[]): void => {
    if (isDev) {
      console.debug('[DEV DEBUG]', ...args)
    }
  },
}
