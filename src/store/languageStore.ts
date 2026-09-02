import { create } from 'zustand'
import { en } from '@/locales/en'
import { rw } from '@/locales/rw'
import { fr } from '@/locales/fr'

export type LanguageCode = 'en' | 'rw' | 'fr'

const DICTIONARIES = {
  en,
  rw,
  fr
}

interface LanguageState {
  language: LanguageCode
  setLanguage: (lang: LanguageCode) => void
  t: (key: keyof typeof en | string, variables?: Record<string, string | number>) => string
  formatStatus: (status: string | null | undefined) => string
}

const getStoredLanguage = (): LanguageCode => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return (localStorage.getItem('epharmacy_language') as LanguageCode) || 'en'
  }
  return 'en'
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  language: getStoredLanguage(),

  setLanguage: (lang) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('epharmacy_language', lang)
    }
    set({ language: lang })
  },

  t: (key, variables) => {
    const lang = get().language
    const dict = DICTIONARIES[lang] || DICTIONARIES.en
    let text = (dict as any)[key] || (DICTIONARIES.en as any)[key] || key

    if (variables) {
      Object.entries(variables).forEach(([k, v]) => {
        text = text.replace(new RegExp(`{{${k}}}`, 'g'), String(v))
      })
    }
    return text
  },

  formatStatus: (status) => {
    if (!status) return '—'
    const normalized = String(status).trim().toLowerCase().replace(/[\s-]+/g, '_')
    const key = `status.${normalized}`
    const lang = get().language
    const dict = DICTIONARIES[lang] || DICTIONARIES.en
    if ((dict as any)[key]) return (dict as any)[key]
    if ((DICTIONARIES.en as any)[key]) return (DICTIONARIES.en as any)[key]
    
    // Fallback: capitalize words
    return String(status).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  }
}))
