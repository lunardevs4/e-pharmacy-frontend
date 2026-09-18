import { describe, it, expect } from 'vitest'
import {
  normalizeError,
  isNetworkError,
  isTechnicalMessage,
  sanitizeErrorMessage,
  extractValidationErrors,
  getSearchErrorMessage,
  getReservationErrorMessage,
  getPrescriptionErrorMessage,
  getValidationFieldMessage,
} from '@/utils/error-handler'

describe('Centralized Error Handler - error-handler.ts', () => {
  describe('isTechnicalMessage & sanitizeErrorMessage', () => {
    it('detects and sanitizes Prisma and SQL database errors', () => {
      const prismaMsg = 'PrismaClientKnownRequestError: Unique constraint failed on the fields: (`email`)'
      expect(isTechnicalMessage(prismaMsg)).toBe(true)
      expect(sanitizeErrorMessage(prismaMsg)).toBe('A system error occurred. Please try again or contact support.')

      const sqlMsg = 'SELECT * FROM users WHERE id = 123; syntax error at or near'
      expect(isTechnicalMessage(sqlMsg)).toBe(true)
      expect(sanitizeErrorMessage(sqlMsg)).toBe('A system error occurred. Please try again or contact support.')
    })

    it('detects and sanitizes Axios and HTTP technical errors', () => {
      const axiosMsg = 'AxiosError: Request failed with status code 500 at createError'
      expect(isTechnicalMessage(axiosMsg)).toBe(true)
      expect(sanitizeErrorMessage(axiosMsg)).toBe('A system error occurred. Please try again or contact support.')
    })

    it('detects and sanitizes JavaScript runtime exceptions and stack traces', () => {
      const typeErrorMsg = 'TypeError: Cannot read properties of undefined (reading "map")'
      expect(isTechnicalMessage(typeErrorMsg)).toBe(true)
      expect(sanitizeErrorMessage(typeErrorMsg)).toBe('A system error occurred. Please try again or contact support.')

      const stackTrace = 'Error: Boom\n    at Object.<anonymous> (/app/src/index.ts:12:5)'
      expect(isTechnicalMessage(stackTrace)).toBe(true)
      expect(sanitizeErrorMessage(stackTrace)).toBe('A system error occurred. Please try again or contact support.')
    })

    it('preserves clean, patient-friendly error messages', () => {
      const cleanMsg = 'Invalid email or password. Please try again.'
      expect(isTechnicalMessage(cleanMsg)).toBe(false)
      expect(sanitizeErrorMessage(cleanMsg)).toBe(cleanMsg)
    })
  })

  describe('isNetworkError', () => {
    it('identifies offline and network disconnection errors', () => {
      expect(isNetworkError(new TypeError('Failed to fetch'))).toBe(true)
      expect(isNetworkError({ message: 'NetworkError when attempting to fetch resource.' })).toBe(true)
      expect(isNetworkError({ message: 'net::ERR_INTERNET_DISCONNECTED' })).toBe(true)
      expect(isNetworkError({ message: 'connect ECONNREFUSED 127.0.0.1:3000' })).toBe(true)
    })

    it('identifies timeout errors', () => {
      expect(isNetworkError({ code: 'ECONNABORTED', message: 'timeout of 10000ms exceeded' })).toBe(true)
    })

    it('returns false for regular HTTP errors', () => {
      expect(isNetworkError({ response: { status: 400, data: { message: 'Bad request' } } })).toBe(false)
      expect(isNetworkError({ response: { status: 500, data: { message: 'Internal error' } } })).toBe(false)
    })
  })

  describe('normalizeError', () => {
    it('normalizes network errors into actionable patient guidance', () => {
      const err = new TypeError('Failed to fetch')
      const result = normalizeError(err)

      expect(result.isNetwork).toBe(true)
      expect(result.message).toContain('connect')
      expect(result.statusCode).toBeUndefined()
    })

    it('normalizes HTTP 400 Bad Request with field errors if available', () => {
      const err = {
        response: {
          status: 400,
          data: {
            message: 'Validation failed',
            errors: [
              { field: 'quantity', message: 'Quantity must be at least 1' },
            ],
          },
        },
      }
      const result = normalizeError(err)
      expect(result.statusCode).toBe(400)
      expect(result.message).toBe('Validation failed')
      expect(result.validationErrors).toEqual([
        { field: 'quantity', message: 'Quantity must be at least 1' },
      ])
      expect(getValidationFieldMessage(result, 'quantity')).toBe('Quantity must be at least 1')
    })

    it('normalizes HTTP 401 Unauthorized', () => {
      const err = { response: { status: 401, data: {} } }
      const result = normalizeError(err)
      expect(result.statusCode).toBe(401)
      expect(result.message).toContain('session has expired')
    })

    it('normalizes HTTP 403 Forbidden', () => {
      const err = { response: { status: 403, data: {} } }
      const result = normalizeError(err)
      expect(result.statusCode).toBe(403)
      expect(result.message).toContain('do not have permission')
    })

    it('normalizes HTTP 404 Not Found', () => {
      const err = { response: { status: 404, data: {} } }
      const result = normalizeError(err)
      expect(result.statusCode).toBe(404)
      expect(result.message).toContain('could not be found')
    })

    it('normalizes HTTP 409 Conflict', () => {
      const err = {
        response: {
          status: 409,
          data: { message: 'This medicine was just reserved by another patient' },
        },
      }
      const result = normalizeError(err)
      expect(result.statusCode).toBe(409)
      expect(result.message).toBe('This medicine was just reserved by another patient')
    })

    it('normalizes HTTP 429 Rate Limit', () => {
      const err = { response: { status: 429, data: {} } }
      const result = normalizeError(err)
      expect(result.statusCode).toBe(429)
      expect(result.message).toContain('Too many requests')
    })

    it('normalizes HTTP 500 and hides raw internal details', () => {
      const err = {
        response: {
          status: 500,
          data: { message: 'InternalServerError: NullPointerException at Service.java:45' },
        },
      }
      const result = normalizeError(err)
      expect(result.statusCode).toBe(500)
      expect(result.message).toBe('Our servers are temporarily experiencing issues. Please try again shortly.')
    })
  })

  describe('extractValidationErrors', () => {
    it('extracts field errors from array of error objects', () => {
      const data = {
        errors: [
          { field: 'phone', message: 'Invalid phone format' },
          { field: 'password', message: 'Password is too short' },
        ],
      }
      const errors = extractValidationErrors(data)
      expect(errors).toEqual([
        { field: 'phone', message: 'Invalid phone format' },
        { field: 'password', message: 'Password is too short' },
      ])
    })

    it('extracts field errors from key-value object', () => {
      const data = {
        errors: {
          email: 'Email already exists',
        },
      }
      const errors = extractValidationErrors(data)
      expect(errors).toEqual([
        { field: 'email', message: 'Email already exists' },
      ])
    })

    it('returns empty array when no field errors exist', () => {
      expect(extractValidationErrors({ message: 'General error' })).toEqual([])
      expect(extractValidationErrors(null)).toEqual([])
    })
  })

  describe('Domain-specific helper functions', () => {
    it('getSearchErrorMessage formats search errors correctly', () => {
      const networkErr = new TypeError('Failed to fetch')
      const searchRes = getSearchErrorMessage(networkErr)
      expect(searchRes.isNetwork).toBe(true)
      expect(searchRes.message).toContain('connect')

      const serverErr = { response: { status: 500 } }
      const serverRes = getSearchErrorMessage(serverErr)
      expect(serverRes.isNetwork).toBe(false)
      expect(serverRes.message).toContain('try again shortly')
    })

    it('getReservationErrorMessage formats 409 conflict and network issues', () => {
      const conflictErr = { response: { status: 409 } }
      const res = getReservationErrorMessage(conflictErr)
      expect(res.isConflict).toBe(true)
      expect(res.message).toContain('no longer available')

      const netErr = new TypeError('Failed to fetch')
      const netRes = getReservationErrorMessage(netErr)
      expect(netRes.isNetwork).toBe(true)
      expect(netRes.message).toContain('connection issue')
    })

    it('getPrescriptionErrorMessage formats upload errors and network failures', () => {
      const netErr = new TypeError('Failed to fetch')
      const netRes = getPrescriptionErrorMessage(netErr)
      expect(netRes.isNetwork).toBe(true)
      expect(netRes.message).toContain('connection issue')

      const entityTooLarge = { response: { status: 413 } }
      const largeRes = getPrescriptionErrorMessage(entityTooLarge)
      expect(largeRes.message).toContain('exceeds the 10MB size limit')
    })
  })
})
