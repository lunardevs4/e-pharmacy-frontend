import React, { useState, useRef, useEffect } from 'react'
import { useLanguageStore, LanguageCode } from '@/store/languageStore'
import { ChevronDown, Check, Globe } from 'lucide-react'

const LANGUAGES: { code: LanguageCode; name: string; flag: string }[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'rw', name: 'Kinyarwanda', flag: '🇷🇼' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
]

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguageStore()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const current = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0]

  return (
    <div className="relative inline-block text-left font-sans" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-semibold text-xs rounded-lg shadow-sm transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer active:scale-95"
      >
        <Globe className="w-3.5 h-3.5 text-emerald-600" />
        <span className="text-sm leading-none" aria-hidden="true">{current.flag}</span>
        <span className="hidden sm:inline text-xs">{current.name}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 mt-1.5 w-40 bg-white border border-gray-150 rounded-xl shadow-xl z-[100] py-1 animate-fadeIn origin-top-right"
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              role="option"
              aria-selected={language === lang.code}
              onClick={() => {
                setLanguage(lang.code)
                setIsOpen(false)
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold hover:bg-emerald-50/50 hover:text-health-primary transition-colors text-left ${
                language === lang.code ? 'text-health-primary bg-emerald-50/30' : 'text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm leading-none" aria-hidden="true">{lang.flag}</span>
                <span>{lang.name}</span>
              </div>
              {language === lang.code && <Check className="w-3.5 h-3.5 text-health-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
