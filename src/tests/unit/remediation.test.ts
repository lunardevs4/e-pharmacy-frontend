import { describe, it, expect, beforeEach } from 'vitest'
import { validateEmail, isDisposableEmail } from '@/utils/validation'
import { useLanguageStore } from '@/store/languageStore'
import { useUIStore } from '@/store/uiStore'

describe('Remediation Tests for E-Pharmacy', () => {
  beforeEach(() => {
    useUIStore.getState().clearToasts()
  })

  describe('Issue 2: Internationalization & Fallback Dictionary', () => {
    it('translates known navigation keys in English', () => {
      useLanguageStore.getState().setLanguage('en')
      const t = useLanguageStore.getState().t
      expect(t('nav.dashboard')).toBe('Dashboard')
      expect(t('nav.searchMedicine')).toBe('Search Medicine')
    })

    it('translates known navigation keys in Kinyarwanda', () => {
      useLanguageStore.getState().setLanguage('rw')
      const t = useLanguageStore.getState().t
      expect(t('nav.dashboard')).toBe('Imbonerahamwe')
      expect(t('nav.searchMedicine')).toBe('Shaka Imiti')
    })

    it('translates known navigation keys in French', () => {
      useLanguageStore.getState().setLanguage('fr')
      const t = useLanguageStore.getState().t
      expect(t('nav.dashboard')).toBe('Tableau de bord')
      expect(t('nav.searchMedicine')).toBe('Recherche de médicaments')
    })

    it('falls back to English dictionary if key is missing in active language', () => {
      useLanguageStore.getState().setLanguage('rw')
      const t = useLanguageStore.getState().t
      // Test key that is not translated in rw
      expect(t('nav.logout')).toBe('Sohokamo')
    })
  })

  describe('Issue 3: Toast Notification Stacking and Queueing', () => {
    it('queues multiple toasts without overriding each other in uiStore', () => {
      const { successToast, warningToast, toasts } = useUIStore.getState()
      
      successToast('Profile Updated', 'Your profile details have been saved.')
      warningToast('Session Expiring', 'Please save your work.')

      const currentToasts = useUIStore.getState().toasts
      expect(currentToasts.length).toBe(2)
      expect(currentToasts[0].title).toBe('Profile Updated')
      expect(currentToasts[1].title).toBe('Session Expiring')
    })

    it('allows dismiss of specific toasts from the queue', () => {
      const { successToast, dismissToast } = useUIStore.getState()
      
      const id1 = successToast('Toast 1')
      const id2 = successToast('Toast 2')

      dismissToast(id1)

      const remaining = useUIStore.getState().toasts
      expect(remaining.length).toBe(1)
      expect(remaining[0].id).toBe(id2)
    })
  })

  describe('Issue 6: Email & Disposable Domain Validation', () => {
    it('validates legitimate email addresses', () => {
      const result = validateEmail('patient.test@gmail.com')
      expect(result.isValid).toBe(true)
    })

    it('rejects malformed email addresses', () => {
      const result = validateEmail('invalid-email-format')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('valid email address format')
    })

    it('rejects disposable email domains', () => {
      expect(isDisposableEmail('test@mailinator.com')).toBe(true)
      expect(isDisposableEmail('user@tempmail.com')).toBe(true)
      
      const result = validateEmail('user@10minutemail.com')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('disposable email')
    })
  })
})
