import React, { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { insuranceApi, InsuranceProvider } from '@/services/insurance-api'
import { MedicineApi } from '@/services/medicine-api'
import { Medicine } from '@/types'
import { getInsuranceTariff, saveInsuranceTariff } from '@/utils/insuranceCalculator'
import { CustomTariff } from '@/types/insurance'
import { Shield, Search, Check, Save, Loader2, AlertCircle, Sparkles, HelpCircle } from 'lucide-react'

export default function InsuranceTariffs() {
  const { user } = useAuthStore()
  const insurerName = user?.insuranceProvider || 'RSSB'

  const [insuranceId, setInsuranceId] = useState<string>('1') // default to RSSB ID
  const [insuranceName, setInsuranceName] = useState<string>('RSSB')
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [saveLoading, setSaveLoading] = useState<Record<string, boolean>>({})

  // Custom states for edit inputs inside rows
  const [tariffs, setTariffs] = useState<Record<string, CustomTariff>>({})
  const [successMsgs, setSuccessMsgs] = useState<Record<string, string>>({})
  const [errorMsgs, setErrorMsgs] = useState<Record<string, string>>({})

  // General Settings states
  const [defaultCoverage, setDefaultCoverage] = useState(80)
  const [generalSaveSuccess, setGeneralSaveSuccess] = useState(false)
  const [generalSaveError, setGeneralSaveError] = useState<string | null>(null)

  // Load insurance provider details and medicines
  useEffect(() => {
    const init = async () => {
      setLoading(true)
      try {
        const [providersList, medsList] = await Promise.all([
          insuranceApi.getProviders(),
          MedicineApi.searchMedicines('', '', false)
        ])

        const matched = providersList.find(p => p.code === insurerName || p.name === insurerName)
        const id = matched?.id || '1'
        const name = matched?.name || insurerName
        setInsuranceId(id)
        setInsuranceName(name)

        // Load general discount settings
        const savedSettings = localStorage.getItem(`epharmacy_provider_settings_${id}`)
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings)
          setDefaultCoverage(parsed.defaultCoveragePercentage ?? 80)
        } else {
          if (matched) {
            const pct = matched.defaultCoveragePercentage
            setDefaultCoverage(pct <= 1 ? Math.round(pct * 100) : pct)
          }
        }

        setMedicines(medsList)

        // Load tariffs from localStorage
        const initialTariffs: Record<string, CustomTariff> = {}
        for (const med of medsList) {
          const t = getInsuranceTariff(id, med.id)
          initialTariffs[med.id] = t || {
            medicineId: med.id,
            covered: false,
            coveragePercentage: 0,
            maximumCoveredPrice: null
          }
        }
        setTariffs(initialTariffs)
      } catch (err) {
        console.error('Failed to load tariff details', err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [insurerName])

  const handleToggleCovered = (medId: string) => {
    setTariffs(prev => {
      const current = prev[medId]
      return {
        ...prev,
        [medId]: {
          ...current,
          covered: !current.covered,
          // Initialize percentage if toggled to true and currently 0
          coveragePercentage: !current.covered && current.coveragePercentage === 0 ? defaultCoverage : current.coveragePercentage
        }
      }
    })
  }

  const handleSaveGeneralSettings = () => {
    setGeneralSaveSuccess(false)
    setGeneralSaveError(null)

    if (defaultCoverage < 0 || defaultCoverage > 100) {
      setGeneralSaveError('Discount / Coverage percentage must be between 0% and 100%.')
      return
    }

    localStorage.setItem(
      `epharmacy_provider_settings_${insuranceId}`,
      JSON.stringify({ defaultCoveragePercentage: defaultCoverage })
    )
    setGeneralSaveSuccess(true)
    setTimeout(() => setGeneralSaveSuccess(false), 3000)
  }

  const handlePercentageChange = (medId: string, value: string) => {
    const num = Math.min(100, Math.max(0, parseInt(value, 10) || 0))
    setTariffs(prev => ({
      ...prev,
      [medId]: {
        ...prev[medId],
        coveragePercentage: num
      }
    }))
  }

  const handleMaxPriceChange = (medId: string, value: string) => {
    const trimmed = value.trim()
    const num = trimmed === '' ? null : Math.max(0, parseFloat(trimmed) || 0)
    setTariffs(prev => ({
      ...prev,
      [medId]: {
        ...prev[medId],
        maximumCoveredPrice: num
      }
    }))
  }

  const handleSaveTariff = async (medId: string) => {
    setSaveLoading(prev => ({ ...prev, [medId]: true }))
    setSuccessMsgs(prev => ({ ...prev, [medId]: '' }))
    setErrorMsgs(prev => ({ ...prev, [medId]: '' }))

    try {
      const tariff = tariffs[medId]
      
      // Validation
      if (tariff.covered) {
        if (tariff.coveragePercentage < 0 || tariff.coveragePercentage > 100) {
          throw new Error('Coverage percentage must be between 0% and 100%.')
        }
        if (tariff.maximumCoveredPrice !== null && tariff.maximumCoveredPrice <= 0) {
          throw new Error('Maximum covered price must be a positive number if configured.')
        }
      }

      // Save to localStorage
      saveInsuranceTariff(insuranceId, medId, tariff)
      
      setSuccessMsgs(prev => ({ ...prev, [medId]: 'Saved!' }))
      setTimeout(() => {
        setSuccessMsgs(prev => ({ ...prev, [medId]: '' }))
      }, 2000)
    } catch (err: any) {
      setErrorMsgs(prev => ({ ...prev, [medId]: err.message || 'Failed' }))
    } finally {
      setSaveLoading(prev => ({ ...prev, [medId]: false }))
    }
  }

  const filteredMedicines = medicines.filter(
    m =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
        <div className="p-2.5 bg-emerald-50 text-health-primary rounded-lg">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{insuranceName} Medicine Discounts</h1>
          <p className="text-xs text-gray-500">
            Configure co-pay rules, discount percentages, and maximum covered tariffs for registry medicines.
          </p>
        </div>
      </div>

      {/* General Settings Panel */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-150 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <div>
              <h2 className="text-sm font-bold text-gray-900">General Insurance Discounts Settings</h2>
              <p className="text-[11px] text-gray-400">
                Configure your general baseline coverage and co-pay splits. Newly covered medicines will default to these rates.
              </p>
            </div>
          </div>
        </div>

        {generalSaveError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="font-semibold">{generalSaveError}</span>
          </div>
        )}

        {generalSaveSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span className="font-semibold">General settings saved successfully!</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              General Default Coverage Percentage (%)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                max="100"
                value={defaultCoverage}
                onChange={(e) => setDefaultCoverage(Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                className="block w-32 px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
              <span className="text-xs text-gray-500">
                Insurance pays <strong>{defaultCoverage}%</strong> of covered costs.
              </span>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              General Patient Co-pay Percentage (%)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                disabled
                value={100 - defaultCoverage}
                className="block w-32 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-400 font-mono"
              />
              <span className="text-xs text-gray-500">
                Patient pays <strong>{100 - defaultCoverage}%</strong> of covered costs.
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveGeneralSettings}
            className="flex items-center gap-1.5 px-4 py-2 bg-health-primary text-white font-bold text-xs rounded-lg hover:bg-health-secondary transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save General Settings</span>
          </button>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Filter Toolbar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="relative w-full sm:max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search registry by trade name, generic name, or category..."
              className="block w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div className="text-[10px] text-gray-400 font-bold uppercase">
            Showing {filteredMedicines.length} of {medicines.length} Medicines
          </div>
        </div>

        {/* Tariffs List */}
        {loading ? (
          <div className="py-32 flex justify-center items-center">
            <Loader2 className="w-8 h-8 animate-spin text-health-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 font-bold border-b border-gray-200">
                  <th className="p-4">Medication Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4">Coverage (%)</th>
                  <th className="p-4">Max Covered Price (RWF)</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredMedicines.map((m) => {
                  const tariff = tariffs[m.id] || {
                    medicineId: m.id,
                    covered: false,
                    coveragePercentage: 0,
                    maximumCoveredPrice: null
                  }
                  const isSaved = successMsgs[m.id]
                  const error = errorMsgs[m.id]
                  const isSaving = saveLoading[m.id]

                  return (
                    <tr key={m.id} className="hover:bg-gray-50/40 transition-colors">
                      <td className="p-4">
                        <span className="block font-bold text-gray-900 text-sm">{m.name}</span>
                        <span className="block text-[10px] text-gray-400 font-mono mt-0.5">{m.genericName}</span>
                      </td>
                      <td className="p-4 text-gray-500">{m.category}</td>
                      <td className="p-4">
                        <div className="flex justify-center">
                          <button
                            type="button"
                            onClick={() => handleToggleCovered(m.id)}
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border transition-all cursor-pointer ${
                              tariff.covered
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                : 'bg-red-50 border-red-200 text-red-800'
                            }`}
                          >
                            {tariff.covered ? 'Covered' : 'Not Covered'}
                          </button>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-1.5">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            disabled={!tariff.covered}
                            value={tariff.covered ? tariff.coveragePercentage : ''}
                            onChange={(e) => handlePercentageChange(m.id, e.target.value)}
                            placeholder="0"
                            className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:bg-gray-100 font-mono text-center"
                          />
                          <span className="text-gray-400 font-bold">%</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="relative w-36">
                          <input
                            type="number"
                            min="0"
                            disabled={!tariff.covered}
                            value={tariff.covered && tariff.maximumCoveredPrice !== null ? tariff.maximumCoveredPrice : ''}
                            onChange={(e) => handleMaxPriceChange(m.id, e.target.value)}
                            placeholder="Unlimited / No Cap"
                            className="w-full px-2 py-1 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:bg-gray-100 font-mono text-xs"
                          />
                          {tariff.covered && tariff.maximumCoveredPrice !== null && (
                            <span className="absolute right-2.5 top-[7px] text-[9px] font-bold text-gray-400">RWF</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {isSaved && (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-150 px-2 py-0.5 rounded animate-fade-in flex items-center gap-1">
                              <Check className="w-3 h-3" /> {isSaved}
                            </span>
                          )}
                          {error && (
                            <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-150 px-2 py-0.5 rounded flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> {error}
                            </span>
                          )}
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => handleSaveTariff(m.id)}
                            className="bg-health-primary hover:bg-health-secondary text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {isSaving ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <>
                                <Save className="w-3 h-3" />
                                <span>Save</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {filteredMedicines.length === 0 && !loading && (
              <div className="py-20 text-center text-gray-400">
                <Search className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm font-semibold">No medicines found in the system registry.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
