import { useEffect, useState } from 'react'
import { CheckCircle2, Loader2, ShieldCheck, XCircle } from 'lucide-react'
import { insuranceApi, PharmacyInsuranceOption } from '@/services/insurance-api'

export default function PharmacyInsurance() {
  const [options, setOptions] = useState<PharmacyInsuranceOption[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setError(null)
    try {
      setOptions(await insuranceApi.getPharmacyInsuranceOptions())
    } catch (err: any) {
      setError(err?.message || 'Unable to load insurance providers.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  const toggle = async (option: PharmacyInsuranceOption) => {
    setSaving(option.provider.id)
    setError(null)
    try {
      await insuranceApi.setPharmacyInsurance(option.provider.id, !option.enabled)
      setOptions((current) => current.map((item) =>
        item.provider.id === option.provider.id
          ? { ...item, enabled: !option.enabled }
          : item,
      ))
    } catch (err: any) {
      setError(err?.message || 'Unable to update this insurance agreement.')
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700"><ShieldCheck className="w-6 h-6" /></div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Insurance Partners</h1>
            <p className="mt-1 text-sm text-gray-500">Choose the insurance providers your pharmacy accepts.</p>
          </div>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-500"><Loader2 className="w-5 h-5 animate-spin" />Loading insurance providers...</div>
      ) : options.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center text-sm text-gray-500">No active insurance providers are registered yet.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {options.map((option) => (
            <div key={option.provider.id} className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 font-black text-slate-700">{option.provider.code.slice(0, 2)}</div>
                <div className="min-w-0">
                  <h2 className="truncate font-black text-gray-900">{option.provider.name}</h2>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{option.provider.code}</p>
                  <p className={`mt-1 flex items-center gap-1 text-xs font-bold ${option.enabled ? 'text-emerald-700' : 'text-gray-500'}`}>
                    {option.enabled ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    {option.enabled ? 'Accepted at this pharmacy' : 'Not accepted'}
                  </p>
                </div>
              </div>
              <button type="button" disabled={saving === option.provider.id} onClick={() => void toggle(option)} className={`shrink-0 rounded-xl px-4 py-2 text-xs font-black text-white transition-colors disabled:opacity-60 ${option.enabled ? 'bg-gray-600 hover:bg-gray-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                {saving === option.provider.id ? <Loader2 className="h-4 w-4 animate-spin" /> : option.enabled ? 'Disable' : 'Accept'}
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500">Accepting an insurer creates an active pharmacy agreement. Medicine coverage still depends on the insurer having an active tariff for that medicine.</p>
    </div>
  )
}
