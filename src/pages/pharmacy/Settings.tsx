import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { PharmacyApi } from '@/services/pharmacy-api'
import {
  Check,
  Clock3,
  ExternalLink,
  Globe2,
  KeyRound,
  Loader2,
  MapPin,
  Save,
  ShieldCheck,
  Store,
  Users,
  X,
} from 'lucide-react'

type Tab = 'profile' | 'staff' | 'operations' | 'security'
type Preferences = {
  lowStockThreshold: number
  expiryWarningDays: number
  reservationDuration: number
  autoExpire: boolean
  language: 'English' | 'Français' | 'Kinyarwanda'
  twoFactor: boolean
}
const defaults: Preferences = {
  lowStockThreshold: 10,
  expiryWarningDays: 30,
  reservationDuration: 24,
  autoExpire: true,
  language: 'English',
  twoFactor: false,
}
const tabs: Array<{ id: Tab; label: string; icon: React.ElementType }> = [
  { id: 'profile', label: 'Pharmacy profile', icon: Store },
  { id: 'staff', label: 'Staff & account', icon: Users },
  { id: 'operations', label: 'Inventory & reservations', icon: Clock3 },
  { id: 'security', label: 'Security & preferences', icon: ShieldCheck },
]
const input =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-health-primary focus:ring-1 focus:ring-health-primary'

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-5 rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
      <div>
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
        {description && <p className="mt-1 text-xs text-gray-500">{description}</p>}
      </div>
      {children}
    </section>
  )
}
function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
  description?: string
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-gray-100 p-3 transition hover:bg-gray-50">
      <span>
        <span className="block text-sm font-semibold text-gray-800">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-gray-500">{description}</span>}
      </span>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-health-primary' : 'bg-gray-300'}`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${checked ? 'left-6' : 'left-1'}`}
        />
      </span>
    </label>
  )
}

export default function PharmacySettings() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const pharmacyId = user?.pharmacyId || user?.pharmacy?.id
  const storageKey = `pharmacy-settings-${pharmacyId || 'unknown'}`
  const [tab, setTab] = useState<Tab>('profile')
  const [pharmacy, setPharmacy] = useState<any>(user?.pharmacy || {})
  const [preferences, setPreferences] = useState<Preferences>(defaults)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    province: '',
    district: '',
    latitude: '',
    longitude: '',
    licenseNumber: '',
    licenseUrl: '',
    openingHours: '08:00 - 18:00',
  })
  useEffect(() => {
    if (!pharmacyId) return
    PharmacyApi.getDetails(pharmacyId)
      .then((data: any) => {
        if (!data) return
        setPharmacy(data)
        setForm((current) => ({
          ...current,
          ...data,
          email: data.owner?.email || user?.email || '',
        }))
      })
      .catch(() => setError('Unable to load pharmacy profile.'))
    try {
      setPreferences({ ...defaults, ...JSON.parse(localStorage.getItem(storageKey) || '{}') })
    } catch {
      /* defaults */
    }
  }, [pharmacyId, storageKey, user?.email])
  const setField = (field: string, value: string) =>
    setForm((current) => ({ ...current, [field]: value }))
  const setPref = <K extends keyof Preferences>(field: K, value: Preferences[K]) =>
    setPreferences((current) => ({ ...current, [field]: value }))
  const save = async () => {
    setSaving(true)
    setMessage(null)
    setError(null)
    try {
      if (tab === 'profile' && pharmacyId) {
        const updated = await PharmacyApi.updateDetails(pharmacyId, {
          name: form.name,
          address: form.address,
          phone: form.phone,
          province: form.province,
          district: form.district,
          latitude: form.latitude || undefined,
          longitude: form.longitude || undefined,
          licenseNumber: form.licenseNumber,
          licenseUrl: form.licenseUrl,
        })
        setPharmacy(updated)
        setForm((current) => ({ ...current, ...updated }))
      } else localStorage.setItem(storageKey, JSON.stringify(preferences))
      setMessage('Settings saved successfully.')
      window.setTimeout(() => setMessage(null), 3000)
    } catch (err: any) {
      setError(err?.message || 'Unable to save settings.')
    } finally {
      setSaving(false)
    }
  }
  const Field = ({ name, label }: { name: string; label: string }) => (
    <label className="text-xs font-bold text-gray-600">
      {label}
      <input
        className={`${input} mt-1.5`}
        value={(form as any)[name] || ''}
        onChange={(e) => setField(name, e.target.value)}
      />
    </label>
  )
  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-16">
      <div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-xl font-black text-health-primary">
              {(form.name || 'P').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-health-primary">
                Pharmacy administration
              </p>
              <h1 className="mt-1 text-2xl font-bold text-gray-900">Settings</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage how your pharmacy appears and operates.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold text-gray-600 sm:self-center">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {pharmacy?.status || 'Profile setup'}
          </div>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <nav className="h-fit rounded-xl border border-gray-200 bg-white p-2">
          <p className="px-3 pb-2 pt-2 text-[10px] font-black uppercase tracking-wider text-gray-400">
            Settings
          </p>
          {tabs.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setTab(item.id)
                  setMessage(null)
                  setError(null)
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition ${tab === item.id ? 'bg-emerald-50 text-health-primary' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-md ${tab === item.id ? 'bg-white text-health-primary' : 'bg-gray-100 text-gray-500'}`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                {item.label}
                {tab === item.id && (
                  <span className="absolute bottom-2 right-3 top-2 w-1 rounded-full bg-health-primary" />
                )}
              </button>
            )
          })}
        </nav>
        <div className="space-y-5">
          <div className="flex flex-col gap-3 border-b border-gray-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-health-primary">
                Manage
              </p>
              <h2 className="mt-1 text-lg font-bold text-gray-900">
                {tabs.find((item) => item.id === tab)?.label}
              </h2>
            </div>
            {tab !== 'staff' && (
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-health-primary px-4 py-2.5 text-xs font-bold text-white transition hover:bg-health-secondary disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save changes
              </button>
            )}
          </div>
          {message && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
              <Check className="h-4 w-4" />
              {message}
            </div>
          )}
          {error && (
            <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
              <span>{error}</span>
              <button type="button" onClick={() => setError(null)}>
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {tab === 'profile' && (
            <div className="space-y-5">
              <Section
                title="Pharmacy profile"
                description="This information is shown to patients when they find your pharmacy."
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field name="name" label="Pharmacy name" />
                  <Field name="phone" label="Phone" />
                  <Field name="email" label="Email" />
                  <Field name="licenseNumber" label="License number" />
                  <Field name="province" label="Province" />
                  <Field name="district" label="District" />
                  <Field name="address" label="Address" />
                  <Field name="licenseUrl" label="Logo / license URL" />
                  <label className="text-xs font-bold text-gray-600 md:col-span-2">
                    Description
                    <textarea
                      className={`${input} mt-1.5 min-h-24`}
                      value={form.description}
                      onChange={(e) => setField('description', e.target.value)}
                    />
                  </label>
                </div>
              </Section>
              <Section
                title="Location & opening hours"
                description="Help patients plan their visit and find you on a map."
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field name="latitude" label="Latitude" />
                  <Field name="longitude" label="Longitude" />
                  <label className="text-xs font-bold text-gray-600 md:col-span-2">
                    Opening hours
                    <input
                      className={`${input} mt-1.5`}
                      value={form.openingHours}
                      onChange={(e) => setField('openingHours', e.target.value)}
                      placeholder="Mon–Fri 08:00–18:00; Sat 09:00–13:00"
                    />
                  </label>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  License status:{' '}
                  <span className="font-bold text-gray-700">
                    {pharmacy?.status || 'Pending verification'}
                  </span>
                </div>
              </Section>
            </div>
          )}

          {tab === 'staff' && (
            <div className="space-y-5">
              <Section title="Owner information">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-bold text-gray-500">Owner name</p>
                    <p className="mt-1 text-sm font-semibold">
                      {[user?.firstName, user?.lastName].filter(Boolean).join(' ') || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500">Owner email</p>
                    <p className="mt-1 text-sm font-semibold">
                      {user?.email || pharmacy?.owner?.email || '—'}
                    </p>
                  </div>
                </div>
              </Section>
              <Section
                title="Staff members"
                description="Manage staff roles, invitations, and access from the staff workspace."
              >
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/pharmacy/staff')}
                    className="inline-flex items-center gap-2 rounded-lg bg-health-primary px-4 py-2.5 text-xs font-bold text-white"
                  >
                    <Users className="h-4 w-4" />
                    Manage staff
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/change-password')}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-700"
                  >
                    <KeyRound className="h-4 w-4" />
                    Change password
                  </button>
                </div>
              </Section>
            </div>
          )}

          {tab === 'operations' && (
            <Section
              title="Inventory & reservations"
              description="Set the defaults used by stock and reservation workflows."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-xs font-bold text-gray-600">
                  Low-stock threshold
                  <input
                    type="number"
                    min="0"
                    className={`${input} mt-1.5`}
                    value={preferences.lowStockThreshold}
                    onChange={(e) =>
                      setPref('lowStockThreshold', Math.max(0, Number(e.target.value)))
                    }
                  />
                </label>
                <label className="text-xs font-bold text-gray-600">
                  Expiry warning period (days)
                  <input
                    type="number"
                    min="1"
                    className={`${input} mt-1.5`}
                    value={preferences.expiryWarningDays}
                    onChange={(e) =>
                      setPref('expiryWarningDays', Math.max(1, Number(e.target.value)))
                    }
                  />
                </label>
                <label className="text-xs font-bold text-gray-600">
                  Reservation duration (hours)
                  <input
                    type="number"
                    min="1"
                    className={`${input} mt-1.5`}
                    value={preferences.reservationDuration}
                    onChange={(e) =>
                      setPref('reservationDuration', Math.max(1, Number(e.target.value)))
                    }
                  />
                </label>
              </div>
              <Toggle
                checked={preferences.autoExpire}
                onChange={(v) => setPref('autoExpire', v)}
                label="Automatically expire reservations"
                description="Release reserved stock when the reservation duration has elapsed."
              />
            </Section>
          )}

          {tab === 'security' && (
            <div className="space-y-5">
              <Section
                title="Security"
                description="Protect staff accounts and review access to your pharmacy."
              >
                <Toggle
                  checked={preferences.twoFactor}
                  onChange={(v) => setPref('twoFactor', v)}
                  label="Two-factor authentication"
                  description="Require an additional verification step at sign in."
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => navigate('/change-password')}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4 text-left"
                  >
                    <span>
                      <span className="block text-sm font-bold">Change password</span>
                      <span className="text-xs text-gray-500">
                        Update your owner account password.
                      </span>
                    </span>
                    <KeyRound className="h-4 w-4 text-health-primary" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setMessage(
                        'Sign out of all devices is ready to be connected to the session service.',
                      )
                    }
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4 text-left"
                  >
                    <span>
                      <span className="block text-sm font-bold">Sign out all devices</span>
                      <span className="text-xs text-gray-500">
                        End active sessions across devices.
                      </span>
                    </span>
                    <ShieldCheck className="h-4 w-4 text-health-primary" />
                  </button>
                </div>
              </Section>
              <Section title="Preferences">
                <label className="max-w-sm text-xs font-bold text-gray-600">
                  Language
                  <select
                    className={`${input} mt-1.5`}
                    value={preferences.language}
                    onChange={(e) => setPref('language', e.target.value as Preferences['language'])}
                  >
                    <option>English</option>
                    <option>Français</option>
                    <option>Kinyarwanda</option>
                  </select>
                </label>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Globe2 className="h-4 w-4" />
                  Your language preference applies to this pharmacy account.
                </div>
              </Section>
              <Section title="Access history">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Review sessions and login history in the audit workspace.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/pharmacy/audit')}
                    className="inline-flex items-center gap-2 text-xs font-bold text-health-primary"
                  >
                    Open audit trail <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>
              </Section>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
