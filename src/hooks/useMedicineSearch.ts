import { useState, useCallback } from 'react'
import { Medicine, PharmacyStock } from '@/types'
import { MedicineApi } from '@/services/medicine-api'

export function useMedicineSearch() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<(PharmacyStock & { medicine: Medicine })[]>([])

  const executeSearch = useCallback(
    async (query: string, category: string, lat?: number, lng?: number, insuranceId?: string | null) => {
      setLoading(true)
      setError(null)
      try {
        const data = await MedicineApi.searchNearbyPharmacies(query, category, lat, lng, 10, insuranceId)
        
        // Sort by distance (nulls to the bottom)
        const rankedResults = [...data].sort((a, b) => {
          if (a.distance === 0 && b.distance !== 0) return 1;
          if (b.distance === 0 && a.distance !== 0) return -1;
          return a.distance - b.distance;
        })

        setResults(rankedResults)
      } catch (err: any) {
        setError(err.message || 'Failed to search pharmacies.')
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
    createPrescription: MedicineApi.createPrescription,
    createReservation: MedicineApi.createReservation,
    cancelReservation: MedicineApi.cancelReservation,
    getReservationHistory: MedicineApi.getReservationHistory,
  }
}
