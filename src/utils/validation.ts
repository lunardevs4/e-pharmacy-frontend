const EMAIL_REGEX = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
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

export const isValidEmailFormat = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false
  const trimmedEmail = email.trim().toLowerCase()
  return EMAIL_REGEX.test(trimmedEmail)
}

export const isDisposableEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false
  const domain = email.trim().toLowerCase().split('@')[1]
  return domain ? DISPOSABLE_EMAIL_DOMAINS.includes(domain) : false
}

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

export const isValidRealEmail = (email: string): boolean => {
  return validateEmail(email).isValid
}

export const getEmailErrorMessage = (email: string): string | undefined => {
  return validateEmail(email).error
}
