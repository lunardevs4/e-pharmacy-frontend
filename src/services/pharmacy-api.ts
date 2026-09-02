import { apiClient } from '@/api/client'

const unwrap = (response: any) =>
  response?.data?.data ?? response?.data ?? []

const isNetworkError = (err: any) =>
  !err?.response ||
  err?.code === 'ECONNABORTED' ||
  err?.message?.toLowerCase().includes('unreachable')

export const PharmacyApi = {
  getDetails: async (pharmacyId: string) => {
    try {
      return unwrap(await apiClient.get(`/pharmacies/${pharmacyId}`))
    } catch (err) {
      if (isNetworkError(err)) {
        return null
      }
      throw err
    }
  },
  getEmployees: async (pharmacyId: string) => {
    const response = await apiClient.get(`/pharmacies/${pharmacyId}/employees`)
    return unwrap(response)
  },

  removeEmployee: async (pharmacyId: string, employeeId: string) => {
    return unwrap(await apiClient.delete(`/pharmacies/${pharmacyId}/employees/${employeeId}`))
  },

  getReservations: async (pharmacyId: string) => {
    try {
      return unwrap(
        await apiClient.get(`/pharmacies/${pharmacyId}/reservations`)
      )
    } catch (err) {
      if (isNetworkError(err)) return []
      throw err
    }
  },

  updateReservationStatus: async (
    pharmacyId: string,
    reservationId: string,
    status: string
  ) => {
    try {
      return unwrap(
        await apiClient.patch(
          `/pharmacies/${pharmacyId}/reservations/${reservationId}`,
          { status }
        )
      )
    } catch (err) {
      if (isNetworkError(err)) {
        return { id: reservationId, status }
      }
      throw err
    }
  },

  getReport: async (pharmacyId: string) => {
    try {
      return unwrap(
        await apiClient.get(`/reports/pharmacy/${pharmacyId}`)
      )
    } catch (err) {
      if (isNetworkError(err)) {
        return { totalReservations: 0 }
      }
      throw err
    }
  },

  getAuditLogs: async (pharmacyId: string, limit = 100) => {
    try {
      return unwrap(
        await apiClient.get(
          `/audit-logs/pharmacy/${pharmacyId}?limit=${limit}`
        )
      )
    } catch (err) {
      if (isNetworkError(err)) return []
      throw err
    }
  },

  updateReservationStatusSimple: async (reservationId: string, status: string) => {
    try {
      const response = await apiClient.patch(`/reservations/${reservationId}`, { status })
      return response.data
    } catch (err) {
      if (isNetworkError(err)) {
        return { id: reservationId, status }
      }
      throw err
    }
  },
}
