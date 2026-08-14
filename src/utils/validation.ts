/**
 * Email validation utilities
 * Ensures users provide valid, real email addresses
 */

/**
 * Regex pattern for email validation
 * - Allows alphanumeric, dots, hyphens, underscores, and plus signs in local part
 * - Requires valid domain with at least one dot
 * - Supports common TLDs (2+ characters)
 * - Blocks obvious disposable domains
 */
const EMAIL_REGEX = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

/**
 * List of known disposable/temporary email domains to reject
 */
const DISPOSABLE_EMAIL_DOMAINS = [
  'tempmail.com',
  'guerrillamail.com',
  '10minutemail.com',
  'throwaway.email',
  'mailinator.com',
  'temp-mail.org',
  'trash-mail.com',
  'fakeinbox.com',
  'yopmail.com',
  'maildrop.cc',
  'sharklasers.com',
  'spam4.me',
  'trashmail.com',
  'temp-email.net',
  'mintemail.com',
  'tempail.com',
  '10minutemail.info',
  'temp.email',
  'dispostable.com',
  'guerrillamail.info',
]

/**
 * Validates email format using regex
 * @param email - Email address to validate
 * @returns true if email format is valid, false otherwise
 */
export const isValidEmailFormat = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false
  const trimmedEmail = email.trim().toLowerCase()
  return EMAIL_REGEX.test(trimmedEmail)
}

/**
 * Checks if email uses a known disposable/temporary domain
 * @param email - Email address to check
 * @returns true if email is from a disposable domain, false otherwise
 */
export const isDisposableEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false
  const domain = email.trim().toLowerCase().split('@')[1]
  return domain ? DISPOSABLE_EMAIL_DOMAINS.includes(domain) : false
}

/**
 * Comprehensive email validation
 * Checks format, domain validity, and disposable email status
 * @param email - Email address to validate
 * @returns Object with validation result and error message if invalid
 */
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email is required' }
  }

  const trimmedEmail = email.trim()

  if (!trimmedEmail) {
    return { isValid: false, error: 'Email cannot be empty' }
  }

  if (trimmedEmail.length > 254) {
    return { isValid: false, error: 'Email address is too long (max 254 characters)' }
  }

  if (!isValidEmailFormat(trimmedEmail)) {
    return { isValid: false, error: 'Please enter a valid email address format' }
  }

  if (isDisposableEmail(trimmedEmail)) {
    return { 
      isValid: false, 
      error: 'Please use a real email address, not a temporary or disposable email service' 
    }
  }

  return { isValid: true }
}

/**
 * Validates email and returns just the boolean
 * Useful for quick checks
 * @param email - Email address to validate
 * @returns true if email is valid and real, false otherwise
 */
export const isValidRealEmail = (email: string): boolean => {
  return validateEmail(email).isValid
}

/**
 * Gets detailed error message for invalid email
 * @param email - Email address to validate
 * @returns Error message string, or undefined if valid
 */
export const getEmailErrorMessage = (email: string): string | undefined => {
  return validateEmail(email).error
}
