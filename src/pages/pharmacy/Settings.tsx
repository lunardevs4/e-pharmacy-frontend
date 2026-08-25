import React, { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { insuranceApi, InsuranceProvider } from '@/services/insurance-api'
import { getActivePharmacyInsurances, saveActivePharmacyInsurances } from '@/utils/insuranceCalculator'
import PharmacyProfile from './Profile'
import { Shield, Check, Loader2, Save, AlertCircle } from 'lucide-react'

export default function PharmacySettings() {
  const { user } = useAuthStore()
  const pharmacyId = user?.pharmacyId || user?.pharmacy?.id || 'ph-001'

  const [activeTab, setActiveTab] = useState<'profile' | 'agreements'>('profile')
  const [providers, setProviders] = useState<InsuranceProvider[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Load all registered insurance providers and existing working agreements
  useEffect(() => {
    if (activeTab === 'agreements') {
      setLoading(true)
      setErrorMsg(null)
      insuranceApi
        .getProviders()
        .then((data) => {
          const activeProviders = (data || []).filter((p) => p.isActive !== false)
          setProviders(activeProviders)
          const activeAgreements = getActivePharmacyInsurances(pharmacyId, activeProviders)
          setSelectedIds(activeAgreements)
        })
        .catch((err) => {
          console.error(err)
          setErrorMsg('Failed to load insurance providers from the system.')
        })
        .finally(() => setLoading(false))
    }
  }, [activeTab, pharmacyId])

  const handleToggleInsurance = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const handleSaveAgreements = () => {
    setSaveLoading(true)
    setSuccessMsg(null)
    setErrorMsg(null)
    try {
      saveActivePharmacyInsurances(pharmacyId, selectedIds)
      
      // Save details to audit logs if possible
      const logs = JSON.parse(localStorage.getItem('pharmacy_audit_logs') || '[]')
      logs.unshift({
        time: new Date().toLocaleString(),
        staff: user?.name || 'Eric Mugisha',
        role: user?.role || 'Pharmacy Manager',
        action: `Updated working insurance agreements (Enabled ${selectedIds.length} providers)`,
        ip: '197.243.12.90',
        status: 'Success',
      })
      localStorage.setItem('pharmacy_audit_logs', JSON.stringify(logs))

      setSuccessMsg('Insurance working agreements saved successfully!')
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save agreements.')
    } finally {
      setSaveLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Pharmacy Portal Settings</h1>
        
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-white text-health-primary shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Organisation Profile
          </button>
          <button
            onClick={() => setActiveTab('agreements')}
            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
              activeTab === 'agreements'
                ? 'bg-white text-health-primary shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Working Insurances
          </button>
        </div>
      </div>

      {activeTab === 'profile' ? (
        <PharmacyProfile />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-health-primary" />
              <span>Insurance Working Agreements</span>
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Select the active registered insurance providers your pharmacy works with.
              Patients will be able to search and calculate co-pay rates according to your selections.
            </p>
          </div>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3 text-red-800 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start space-x-3 text-emerald-800 text-sm">
              <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}

          {loading ? (
            <div className="py-20 flex justify-center items-center">
              <Loader2 className="w-8 h-8 animate-spin text-health-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {providers.map((p) => {
                  const isChecked = selectedIds.includes(p.id)
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleToggleInsurance(p.id)}
                      className={`border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all ${
                        isChecked
                          ? 'border-health-primary bg-emerald-50/20'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="block font-bold text-sm text-gray-900">{p.name}</span>
                        <span className="block text-[10px] text-gray-400 font-medium">
                          Code: {p.code} &bull; Default Copay: {Math.round(p.defaultCopayPercentage * 100)}%
                        </span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                          isChecked
                            ? 'bg-health-primary border-health-primary text-white'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  )
                })}
              </div>

              {providers.length === 0 && !loading && (
                <p className="text-center py-10 text-gray-400 text-sm">
                  No active insurance providers registered in the system.
                </p>
              )}

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="button"
                  disabled={saveLoading}
                  onClick={handleSaveAgreements}
                  className="bg-health-primary hover:bg-health-secondary text-white font-bold text-xs px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {saveLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Agreements...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Agreements</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
