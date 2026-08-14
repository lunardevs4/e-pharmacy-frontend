import { useState, useCallback } from 'react'
import { Medicine } from '@/types'
import { MedicineApi } from '@/services/medicine-api'

export function useMedicineSearch() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<Medicine[]>([])

  const executeSearch = useCallback(
    async (query: string, category: string, inStockOnly: boolean) => {
      setLoading(true)
      setError(null)
      try {
        const data = await MedicineApi.searchMedicines(query, category, inStockOnly)
        const normalizedQuery = query.trim().toLowerCase()
        const rankedResults = [...data].sort((a, b) => {
          const rank = (medicine: Medicine) => {
            if (!normalizedQuery) return 0

            const tradeName = medicine.name.toLowerCase()
            const genericName = medicine.genericName.toLowerCase()

            if (tradeName === normalizedQuery) return 4
            if (genericName === normalizedQuery) return 3
            if (tradeName.startsWith(normalizedQuery)) return 2
            if (genericName.startsWith(normalizedQuery)) return 1
            return 0
          }

          return rank(b) - rank(a)
        })

        setResults(rankedResults)
      } catch (err: any) {
        setError(err.message || 'Failed to search medicines.')
      } finally {
        setLoading(false)
      }
    },
    [],
  )

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
    getReservationHistory: MedicineApi.getReservationHistory,
  }
}
