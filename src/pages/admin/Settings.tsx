import React, { useState, useEffect } from 'react'
import { User, Save, CheckCircle2, Globe, Clock, Shield, Server, Loader2, ShieldAlert } from 'lucide-react'
import { apiClient } from '@/api/client'

interface SystemSettings {
  apiUrl: string
  sessionTimeout: number
  maintenanceMode: boolean
  twoFactorEnabled: boolean
}

export default function AdminSettings() {
  const [apiUrl, setApiUrl] = useState('')
  const [sessionTimeout, setSessionTimeout] = useState('30')
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [twoFactor, setTwoFactor] = useState(true)
  const [saved, setSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const loadSettings = async () => {
    setIsLoading(true)
    setErrorMsg(null)
    try {
      const response = await apiClient.get('/admin/settings')
      const settings = response.data || {}
      if (settings.apiUrl) setApiUrl(settings.apiUrl)
      if (settings.sessionTimeout) setSessionTimeout(String(settings.sessionTimeout))
      if (typeof settings.maintenanceMode === 'boolean') setMaintenanceMode(settings.maintenanceMode)
      if (typeof settings.twoFactorEnabled === 'boolean') setTwoFactor(settings.twoFactorEnabled)
    } catch (error: any) {
      console.warn('Could not load settings, using defaults:', error)
      setErrorMsg('Could not load settings from backend. Using default values.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setErrorMsg(null)
    try {
      await apiClient.put('/admin/settings', {
        apiUrl,
        sessionTimeout: parseInt(sessionTimeout, 10),
        maintenanceMode,
        twoFactorEnabled: twoFactor,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error: any) {
      setErrorMsg(error?.message || 'Failed to save settings. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto pb-16">
        <div className="h-10 bg-gray-200 rounded-xl animate-pulse" />
        <div className="h-32 bg-gray-200 rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-16">

      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center space-x-2">
        <User className="w-5 h-5 text-emerald-700" aria-hidden="true" />
        <div>
          <h1 className="text-xl font-black text-gray-900">System Profile</h1>
          <p className="text-xs text-gray-500">Platform-wide configuration. Changes take effect immediately.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-3 flex items-center space-x-2 text-xs font-bold">
          <Shield className="w-4 h-4" aria-hidden="true" />
          <span>{errorMsg}</span>
        </div>
      )}

      {saved && (
        <div role="status" aria-live="polite" className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 flex items-center space-x-2 text-xs font-bold">
          <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
          <span>Profile saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="portal-form space-y-5">

        {/* API Config */}
        <section aria-labelledby="api-section" className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
            <Globe className="w-4 h-4 text-emerald-700" aria-hidden="true" />
            <h2 id="api-section" className="text-sm font-black text-gray-900">API Configuration</h2>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="api-url" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Backend API Base URL
            </label>
            <input
              id="api-url"
              type="url"
              value={apiUrl}
              onChange={e => setApiUrl(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
            <p className="text-[10px] text-gray-400">Changes to this URL require a full deployment restart.</p>
          </div>
        </section>

        {/* Session & Security */}
        <section aria-labelledby="security-section" className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
            <Shield className="w-4 h-4 text-emerald-700" aria-hidden="true" />
            <h2 id="security-section" className="text-sm font-black text-gray-900">Security & Sessions</h2>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="session-timeout" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Session Timeout (minutes)
            </label>
            <input
              id="session-timeout"
              type="number"
              min="5"
              max="120"
              value={sessionTimeout}
              onChange={e => setSessionTimeout(e.target.value)}
              className="w-32 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-800">Two-Factor Authentication (2FA)</p>
              <p className="text-[10px] text-gray-400">Require OTP for all ADMIN and GOVERNMENT logins</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={twoFactor}
              onClick={() => setTwoFactor(p => !p)}
              className={`relative w-11 h-6 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 ${twoFactor ? 'bg-emerald-600' : 'bg-gray-300'}`}
            >
              <span aria-hidden="true" className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${twoFactor ? 'translate-x-5' : ''}`} />
              <span className="sr-only">{twoFactor ? 'Disable' : 'Enable'} two-factor authentication</span>
            </button>
          </div>
        </section>

        {/* Maintenance */}
        <section aria-labelledby="maintenance-section" className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
            <Server className="w-4 h-4 text-emerald-700" aria-hidden="true" />
            <h2 id="maintenance-section" className="text-sm font-black text-gray-900">Maintenance</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-800">Maintenance Mode</p>
              <p className="text-[10px] text-gray-400">Blocks all non-admin access. Shows maintenance banner.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={maintenanceMode}
              onClick={() => setMaintenanceMode(p => !p)}
              className={`relative w-11 h-6 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 ${maintenanceMode ? 'bg-red-500' : 'bg-gray-300'}`}
            >
              <span aria-hidden="true" className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${maintenanceMode ? 'translate-x-5' : ''}`} />
              <span className="sr-only">{maintenanceMode ? 'Disable' : 'Enable'} maintenance mode</span>
            </button>
          </div>
          {maintenanceMode && (
            <p role="alert" className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 font-semibold">
              ⚠ Maintenance mode is ON. All patient, pharmacy, insurance, and government portals are inaccessible.
            </p>
          )}
        </section>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full bg-health-primary hover:bg-health-secondary text-white font-bold py-2.5 rounded-xl text-sm transition-colors shadow-sm flex items-center justify-center space-x-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Save className="w-4 h-4" aria-hidden="true" />}
          <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
        </button>
      </form>
    </div>
  )
}
