import { InsuranceProvider } from '@/services/insurance-api'
import { InsurancePrices, CustomTariff } from '@/types/insurance'

export function getDefaultActiveInsurances(providers: InsuranceProvider[]): string[] {
  return providers
    .filter(p => p.code === 'RSSB' || p.code === 'MMI' || p.name === 'RSSB' || p.name === 'MMI')
    .map(p => p.id)
}

export function getActivePharmacyInsurances(pharmacyId: string, providers: InsuranceProvider[]): string[] {
  const data = localStorage.getItem(`epharmacy_active_insurances_${pharmacyId}`)
  if (data) {
    try {
      const parsed = JSON.parse(data)
      if (Array.isArray(parsed)) return parsed
    } catch {}
  }
  return getDefaultActiveInsurances(providers)
}

export function saveActivePharmacyInsurances(pharmacyId: string, insurances: string[]): void {
  localStorage.setItem(`epharmacy_active_insurances_${pharmacyId}`, JSON.stringify(insurances))
}

export function getPharmacyInsurancePrice(
  pharmacyId: string,
  medicineId: string,
  insuranceId: string | null,
  basePrice: number
): { price: number; isCustom: boolean } {
  const data = localStorage.getItem(`epharmacy_prices_${pharmacyId}_${medicineId}`)
  if (!data) {
    return { price: basePrice, isCustom: false }
  }
  
  let prices: Partial<InsurancePrices> = {}
  try {
    const parsed = JSON.parse(data)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      prices = parsed
    } else {
      return { price: basePrice, isCustom: false }
    }
  } catch {
    return { price: basePrice, isCustom: false }
  }
  
  if (!insuranceId || insuranceId === 'CASH' || insuranceId === 'None') {
    return { price: prices.CASH ?? basePrice, isCustom: prices.CASH !== undefined }
  }

  const insurancePrice = prices[insuranceId]
  if (insurancePrice !== undefined) {
    return { price: insurancePrice, isCustom: true }
  }
  
  return { price: prices.CASH ?? basePrice, isCustom: false }
}

export function getInsuranceTariff(insuranceId: string | null, medicineId: string): CustomTariff | null {
  if (!insuranceId || insuranceId === 'None') return null
  const data = localStorage.getItem(`epharmacy_tariffs_${insuranceId}`)
  if (!data) return null
  let tariffs: Record<string, CustomTariff> = {}
  try {
    const parsed = JSON.parse(data)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      tariffs = parsed
    } else {
      return null
    }
  } catch {
    return null
  }
  const tariff = tariffs[medicineId]
  if (!tariff) return null

  if (tariff.covered && (tariff.coveragePercentage === undefined || tariff.coveragePercentage === 0)) {
    const settingsStr = localStorage.getItem(`epharmacy_provider_settings_${insuranceId}`)
    let defaultCoverage = 80
    if (settingsStr) {
      try {
        const parsed = JSON.parse(settingsStr)
        if (parsed && typeof parsed === 'object' && typeof parsed.defaultCoveragePercentage === 'number') {
          defaultCoverage = parsed.defaultCoveragePercentage
        }
      } catch {}
    } else {
      if (insuranceId === '1') defaultCoverage = 85
      else if (insuranceId === '2') defaultCoverage = 90
      else if (insuranceId === '3') defaultCoverage = 75
      else if (insuranceId === '4') defaultCoverage = 70
    }
    return {
      ...tariff,
      coveragePercentage: defaultCoverage
    }
  }
  return tariff
}

export function saveInsuranceTariff(insuranceId: string, medicineId: string, tariff: CustomTariff): void {
  const key = `epharmacy_tariffs_${insuranceId}`
  const data = localStorage.getItem(key)
  let tariffs: Record<string, CustomTariff> = {}
  if (data) {
    try {
      const parsed = JSON.parse(data)
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        tariffs = parsed
      }
    } catch {}
  }
  tariffs[medicineId] = tariff
  localStorage.setItem(key, JSON.stringify(tariffs))
}

export function calculatePatientCopay(
  pharmacyPrice: number,
  tariff: CustomTariff | null
): {
  insurancePays: number
  patientPays: number
  coveragePercentage: number
  isCovered: boolean
} {
  if (!tariff || !tariff.covered) {
    return {
      insurancePays: 0,
      patientPays: pharmacyPrice,
      coveragePercentage: 0,
      isCovered: false
    }
  }

  const calculatedCoverage = (pharmacyPrice * tariff.coveragePercentage) / 100
  let insurancePays = calculatedCoverage

  if (tariff.maximumCoveredPrice !== null) {
    insurancePays = Math.min(calculatedCoverage, tariff.maximumCoveredPrice)
  }

  insurancePays = Math.round(insurancePays)
  const patientPays = Math.max(0, pharmacyPrice - insurancePays)

  return {
    insurancePays,
    patientPays,
    coveragePercentage: tariff.coveragePercentage,
    isCovered: true
  }
}
