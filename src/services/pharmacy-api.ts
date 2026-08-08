import { apiClient } from '@/api/client'

const unwrap = (response: any) => response?.data?.data ?? response?.data ?? []

export const PharmacyApi = {
  getDetails: async (pharmacyId: string) => unwrap(await apiClient.get(`/pharmacies/${pharmacyId}`)),

  getReservations: async (pharmacyId: string) =>
    unwrap(await apiClient.get(`/pharmacies/${pharmacyId}/reservations`)),

  updateReservationStatus: async (pharmacyId: string, reservationId: string, status: string) =>
    unwrap(await apiClient.patch(`/pharmacies/${pharmacyId}/reservations/${reservationId}`, { status })),

  getReport: async (pharmacyId: string) =>
    unwrap(await apiClient.get(`/reports/pharmacy/${pharmacyId}`)),

  getAuditLogs: async (pharmacyId: string, limit = 100) =>
    unwrap(await apiClient.get(`/audit-logs/pharmacy/${pharmacyId}?limit=${limit}`)),
}
