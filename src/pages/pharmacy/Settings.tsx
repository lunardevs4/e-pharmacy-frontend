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

  // Load all registered insurance providers and existing Working agreements from backend
  useEffect(() => {
    if (activeTab === 'agreements') {
      setLoading(true)
      setErrorMsg(null)
      Promise.all([
        insuranceApi.getProviders(),
        fetch(`/api/v1/pharmacies/${pharmacyId}/insurance`).then(r => r.json())
      ])
        .then(([providersData, agreementsData]) => {
          const activeProviders = (providersData || []).filter((p) => p.isActive !== false)
          setProviders(activeProviders)
          // Get IDs of insurance providers with active agreements
          const activeAgreementIds = (agreementsData?.data || agreementsData || [])
            .filter((a: any) => a.status === 'ACTIVE')
            .map((a: any) => a.insuranceId)
          setSelectedIds(activeAgreementIds)
        })
        .catch((err) => {
          console.error(err)
          setErrorMsg('Failed to load insurance providers or agreements from the system.')
        })
        .finally(() => setLoading(false))
    }
  }, [activeTab, pharmacyId])

  const handleToggleInsurance = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const handleSaveAgreements = async () => {
    setSaveLoading(true)
    setSuccessMsg(null)
    setErrorMsg(null)
    try {
      // Get existing agreements from pharmacy endpoint
      const agreementsResponse = await fetch(`/api/v1/pharmacies/${pharmacyId}/insurance`)
      const agreementsData = await agreementsResponse.json()
      const existingAgreements = agreementsData?.data || agreementsData || []
      
      // Create new agreements for selected providers that don't have one
      const createPromises = selectedIds
        .filter(id => !existingAgreements.find((a: any) => a.insuranceId === id))
        .map(insuranceId => 
          fetch(`/api/v1/pharmacies/${pharmacyId}/insurance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              insuranceId,
              contractNumber: `AGR-${pharmacyId}-${insuranceId}-${Date.now()}`,
              discountRate: 0,
              startDate: new Date().toISOString(),
            }),
          })
        )
      
      // Deactivate agreements for providers that were deselected
      const deactivatePromises = existingAgreements
        .filter((a: any) => a.status === 'ACTIVE' && !selectedIds.includes(a.insuranceId))
        .map((a: any) => 
          fetch(`/api/v1/pharmacies/${pharmacyId}/insurance/${a.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'INACTIVE' }),
          })
        )
      
      // Reactivate agreements for providers that were re-selected
      const reactivatePromises = existingAgreements
        .filter((a: any) => a.status !== 'ACTIVE' && selectedIds.includes(a.insuranceId))
        .map((a: any) => 
          fetch(`/api/v1/pharmacies/${pharmacyId}/insurance/${a.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'ACTIVE' }),
          })
        )
      
      await Promise.all([...createPromises, ...deactivatePromises, ...reactivatePromises])
      
      setSuccessMsg('Insurance working agreements saved successfully!')
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save agreements to backend.')
    } finally {
      setSaveLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Pharmacy Portal Profile</h1>
        
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
