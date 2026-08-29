import React, { useState, useEffect } from 'react'
import { Users, Search, Shield, Loader2, RefreshCw, AlertTriangle, UserPlus, X, CheckCircle2 } from 'lucide-react'
import { insuranceApi, InsuredPatient, InsuranceProvider } from '@/services/insurance-api'
import { useAuthStore } from '@/store/authStore'

const STATUS_STYLE: Record<string, string> = {
  ACTIVE:    'text-emerald-700 bg-emerald-50 border-emerald-200',
  INACTIVE:  'text-gray-500 bg-gray-100 border-gray-200',
  SUSPENDED: 'text-red-700 bg-red-50 border-red-200',
}

interface RegisterForm {
  insuranceId: string
  policyNumber: string
  nationalId: string
  fullName: string
  dateOfBirth: string
  gender: string
  phone: string
  coveragePercentage: number
  startDate: string
  endDate: string
}

const EMPTY_FORM: RegisterForm = {
  insuranceId: '',
  policyNumber: '',
  nationalId: '',
  fullName: '',
  dateOfBirth: '',
  gender: '',
  phone: '',
  coveragePercentage: 80,
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
}

export default function InsurancePatients() {
  const { user } = useAuthStore()
  const [patients, setPatients] = useState<InsuredPatient[]>([])
  const [providers, setProviders] = useState<InsuranceProvider[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<RegisterForm>(EMPTY_FORM)
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const loadPatients = async () => {
    setIsLoading(true)
    setErrorMsg(null)
    try {
      const allProviders = await insuranceApi.getProviders()
      setProviders(allProviders)

      const insurer = user?.insuranceProvider || ''
      const matchedProvider = allProviders.find(
        p => p.code === insurer || p.name === insurer
      )
      const insuranceId = matchedProvider?.id

      const response = await insuranceApi.getPatients({ insuranceId, limit: 100 })
      const patientsArray = Array.isArray(response?.data) ? response.data : []
      setPatients(patientsArray)
    } catch (error: any) {
      setErrorMsg(error?.message || 'Unable to load patients from backend.')
      setPatients([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPatients()
  }, [])

  // Pre-fill insuranceId when modal opens
  const openModal = () => {
    const insurer = user?.insuranceProvider || ''
    const matched = providers.find(p => p.code === insurer || p.name === insurer)
    setForm({ ...EMPTY_FORM, insuranceId: matched?.id || (providers[0]?.id ?? '') })
    setFormError(null)
    setShowModal(true)
  }

  const handleFieldChange = (field: keyof RegisterForm, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!form.insuranceId || !form.policyNumber || !form.nationalId || !form.fullName) {
      setFormError('Insurance provider, policy number, national ID and full name are required.')
      return
    }

    setIsSaving(true)
    try {
      await insuranceApi.registerPatient({
        insuranceId: form.insuranceId,
        policyNumber: form.policyNumber.trim(),
        nationalId: form.nationalId.trim(),
        fullName: form.fullName.trim(),
        dateOfBirth: form.dateOfBirth || undefined,
        gender: form.gender || undefined,
        phone: form.phone || undefined,
        coveragePercentage: Number(form.coveragePercentage),
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
      })
      setToastMsg(`Patient "${form.fullName}" registered successfully!`)
      setTimeout(() => setToastMsg(null), 4000)
      setShowModal(false)
      await loadPatients()
    } catch (error: any) {
      setFormError(error?.response?.data?.message || error?.message || 'Failed to register patient.')
    } finally {
      setIsSaving(false)
    }
  }

  const filtered = Array.isArray(patients) ? patients.filter(p => {
    const q = search.toLowerCase()
    return (
      p.fullName?.toLowerCase().includes(q) ||
      p.nationalId?.includes(q) ||
      p.policyNumber?.toLowerCase().includes(q)
    )
  }) : []

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">

      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg shadow-xl text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2 text-red-800 text-xs">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center space-x-2">
        <Users className="w-5 h-5 text-emerald-700" aria-hidden="true" />
        <div>
          <h1 className="text-xl font-black text-gray-900">Patients &amp; Policyholders</h1>
          <p className="text-xs text-gray-500">List of insured citizens. Manage policies and verify health insurance ID status.</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={loadPatients}
            disabled={isLoading}
            className="flex items-center space-x-1.5 border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 font-bold px-3 py-2 rounded-lg text-xs transition-colors disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            <span>{isLoading ? 'Loading...' : 'Refresh'}</span>
          </button>
          <button
            id="register-patient-btn"
            onClick={openModal}
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition-colors shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register Patient</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow max-w-sm">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" aria-hidden="true" />
            <input
              type="search"
              aria-label="Search policyholders"
              placeholder="Search name, NID, or policy ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
            />
          </div>
          <span className="text-xs text-gray-400 font-semibold self-center">
            {filtered.length} patient{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs" aria-label="Insured policyholders">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                <th scope="col" className="px-5 py-3">Patient</th>
                <th scope="col" className="px-5 py-3">National ID</th>
                <th scope="col" className="px-5 py-3">Phone</th>
                <th scope="col" className="px-5 py-3">Insurer</th>
                <th scope="col" className="px-5 py-3">Policy ID</th>
                <th scope="col" className="px-5 py-3 text-center">Coverage</th>
                <th scope="col" className="px-5 py-3 text-center">Active Claims</th>
                <th scope="col" className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {isLoading ? (
                <tr><td colSpan={8} className="text-center py-10 text-gray-400 text-xs">Loading patients...</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center space-x-2">
                      <div
                        aria-hidden="true"
                        className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-600 flex-shrink-0"
                      >
                        {p.fullName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                      </div>
                      <span className="font-bold text-gray-900">{p.fullName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-mono text-gray-500">{p.nationalId}</td>
                  <td className="px-5 py-3 text-gray-600">{p.phone || '—'}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center space-x-1 font-bold text-gray-700">
                      <Shield className="w-3 h-3 text-emerald-600" aria-hidden="true" />
                      <span>{p.insurance?.name || 'Unknown'}</span>
                    </span>
                  </td>
                  <td className="px-5 py-3 font-mono text-gray-700">{p.policyNumber}</td>
                  <td className="px-5 py-3 text-center font-black text-emerald-700">{p.coveragePercentage ?? 0}%</td>
                  <td className="px-5 py-3 text-center font-black text-gray-900">{p.claims?.length ?? 0}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex text-[10px] font-bold border px-2 py-0.5 rounded ${STATUS_STYLE[p.status] ?? STATUS_STYLE.INACTIVE}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400 text-xs">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="w-8 h-8 text-gray-300" />
                      <p className="font-semibold">No policyholders found.</p>
                      <p className="text-gray-400">
                        Click <span className="font-bold text-emerald-600">Register Patient</span> to add the first one.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Register Patient Modal ── */}
      {showModal && (
        <div
          id="register-patient-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="portal-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        >
          <div className="portal-modal-panel bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-emerald-50 rounded-lg">
                  <UserPlus className="w-4 h-4 text-emerald-600" />
                </div>
                <h2 id="modal-title" className="text-sm font-black text-gray-900">Register Insured Patient</h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                aria-label="Close modal"
                className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleRegister} className="portal-form px-6 py-5 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2 text-red-700 text-xs">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Insurance Provider */}
              <div>
                <label htmlFor="reg-insuranceId" className="block text-[10px] font-black uppercase text-gray-500 mb-1">
                  Insurance Provider <span className="text-red-500">*</span>
                </label>
                <select
                  id="reg-insuranceId"
                  required
                  value={form.insuranceId}
                  onChange={e => handleFieldChange('insuranceId', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                >
                  <option value="">Select provider…</option>
                  {providers.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                  ))}
                </select>
              </div>

              {/* Full Name + NID */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="reg-fullName" className="block text-[10px] font-black uppercase text-gray-500 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="reg-fullName"
                    required
                    type="text"
                    placeholder="Uwase Amelia"
                    value={form.fullName}
                    onChange={e => handleFieldChange('fullName', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>
                <div>
                  <label htmlFor="reg-nationalId" className="block text-[10px] font-black uppercase text-gray-500 mb-1">
                    National ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="reg-nationalId"
                    required
                    type="text"
                    placeholder="1199070000000 00"
                    value={form.nationalId}
                    onChange={e => handleFieldChange('nationalId', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-semibold"
                  />
                </div>
              </div>

              {/* Policy Number */}
              <div>
                <label htmlFor="reg-policyNumber" className="block text-[10px] font-black uppercase text-gray-500 mb-1">
                  Policy Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="reg-policyNumber"
                  required
                  type="text"
                  placeholder="MMI-2024-000001"
                  value={form.policyNumber}
                  onChange={e => handleFieldChange('policyNumber', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-semibold"
                />
              </div>

              {/* Phone + Gender */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="reg-phone" className="block text-[10px] font-black uppercase text-gray-500 mb-1">Phone</label>
                  <input
                    id="reg-phone"
                    type="tel"
                    placeholder="+250 7XX XXX XXX"
                    value={form.phone}
                    onChange={e => handleFieldChange('phone', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>
                <div>
                  <label htmlFor="reg-gender" className="block text-[10px] font-black uppercase text-gray-500 mb-1">Gender</label>
                  <select
                    id="reg-gender"
                    value={form.gender}
                    onChange={e => handleFieldChange('gender', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  >
                    <option value="">Select…</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label htmlFor="reg-dob" className="block text-[10px] font-black uppercase text-gray-500 mb-1">Date of Birth</label>
                <input
                  id="reg-dob"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={e => handleFieldChange('dateOfBirth', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
              </div>

              {/* Coverage + Start/End Dates */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="reg-coverage" className="block text-[10px] font-black uppercase text-gray-500 mb-1">Coverage %</label>
                  <input
                    id="reg-coverage"
                    type="number"
                    min={0}
                    max={100}
                    value={form.coveragePercentage}
                    onChange={e => handleFieldChange('coveragePercentage', Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>
                <div>
                  <label htmlFor="reg-startDate" className="block text-[10px] font-black uppercase text-gray-500 mb-1">Start Date</label>
                  <input
                    id="reg-startDate"
                    type="date"
                    value={form.startDate}
                    onChange={e => handleFieldChange('startDate', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>
                <div>
                  <label htmlFor="reg-endDate" className="block text-[10px] font-black uppercase text-gray-500 mb-1">End Date</label>
                  <input
                    id="reg-endDate"
                    type="date"
                    value={form.endDate}
                    onChange={e => handleFieldChange('endDate', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="register-patient-submit"
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center space-x-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold rounded-lg text-xs transition-colors"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                  <span>{isSaving ? 'Registering…' : 'Register Patient'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
