import { useState, useCallback } from 'react'
import { Medicine } from '@/types'
import { MedicineApi } from '@/services/medicine-api'

export function useMedicineSearch() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<Medicine[]>([])

  const executeSearch = useCallback(async (
    query: string, 
    category: string, 
    inStockOnly: boolean
  ) => {
    setLoading(true)
    setError(null)
    try {
      const data = await MedicineApi.searchMedicines(query, category, inStockOnly)
      setResults(data)
    } catch (err: any) {
      setError(err.message || 'Failed to search medicines.')
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    results,
    executeSearch,
    getMedicineDetails: MedicineApi.getMedicineDetails,
    getMedicineAvailability: MedicineApi.getMedicineAvailability,
    calculateInsuranceCoverage: MedicineApi.calculateInsuranceCoverage,
    uploadPrescription: MedicineApi.uploadPrescription,
    createReservation: MedicineApi.createReservation,
    cancelReservation: MedicineApi.cancelReservation,
    getReservationHistory: MedicineApi.getReservationHistory
  }
}
