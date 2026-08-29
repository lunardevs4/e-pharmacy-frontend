import { Medicine, PharmacyStock, Reservation, Notification } from '@/types'
import { INSURANCE_COVERAGE_RATES } from '@/config/insurance-rates'
import { apiClient } from '@/api/client'

const extractArrayPayload = (payload: any): any[] => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.data)) return payload.data.data
  return []
}

const normalizePersonName = (...values: unknown[]): string => {
  const parts = values
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .join(' ')
    .trim()
    .split(/\s+/)

  return parts
    .filter((part, index) => index === 0 || part.toLowerCase() !== parts[index - 1].toLowerCase())
    .join(' ')
}

const normalizeReservation = (payload: any): Reservation => {
  const medicine = payload.medicine || {}
  const pharmacy = payload.pharmacy || {}
  const status = String(payload.status || 'PENDING').toUpperCase()

  return {
    id: payload.id,
    medicineId: medicine.id || payload.medicineId || '',
    medicineName: medicine.name || payload.medicineName || 'Medication',
    patientId: payload.patient?.id || payload.patientId || '',
    patientName:
      normalizePersonName(payload.patient?.user?.firstName, payload.patient?.user?.lastName) ||
      payload.patient?.user?.name ||
      payload.patient?.name ||
      'Patient',
    pharmacyId: pharmacy.id || payload.pharmacyId || '',
    pharmacyName: pharmacy.name || payload.pharmacyName || 'Pharmacy',
    quantity: payload.quantity ?? 1,
    insuranceProvider: payload.insuranceProvider || '',
    insuranceId: payload.insuranceId || '',
    prescriptionFileName: payload.prescriptionFileName,
    totalPrice: Number(payload.totalPrice ?? payload.price ?? 0),
    insurancePays: Number(payload.insurancePays ?? 0),
    patientPays: Number(payload.patientPays ?? payload.totalPrice ?? payload.price ?? 0),
    pickupDeadline: payload.pickupDeadline || payload.expiresAt || '',
    status: status as Reservation['status'],
    createdAt: payload.createdAt || payload.created_at || '',
  }
}

const normalizeNotification = (payload: any): Notification => ({
  id:
    payload.id ||
    payload.notificationId ||
    `notification-${Math.random().toString(36).slice(2, 8)}`,
  title: payload.title || payload.subject || 'Notification',
  message: payload.message || payload.body || 'You have a new update.',
  type: (
    payload.type ||
    payload.notificationType ||
    'SYSTEM'
  ).toUpperCase() as Notification['type'],
  read: payload.read ?? payload.isRead ?? false,
  createdAt: payload.createdAt || payload.created_at || new Date().toISOString(),
})

export const MedicineApi = {
  // Search catalog medicines (both national registry and dynamic custom-added ones)
  searchMedicines: async (
    query: string,
    category: string,
    inStockOnly: boolean,
  ): Promise<Medicine[]> => {
    const response = await apiClient.get('/medicines', {
      params: {
        page: 1,
        limit: 100,
        search: query || undefined,
        category: category || undefined,
      },
    })
    const payload = Array.isArray(response.data) ? response.data : response.data?.data || []
    return payload.map((item: any) => ({
      id: item.id,
      name: item.tradeName || item.name,
      genericName: item.genericName || '',
      tradeNames: [],
      category: item.category?.name || item.category || '',
      manufacturer: item.manufacturer?.name || '',
      prescriptionRequired: false,
      uses: '',
      dosage: '',
      warnings: '',
      sideEffects: '',
      interactions: '',
      storage: '',
    }))
  },

  // Get medicine details by ID
  getMedicineDetails: async (id: string): Promise<Medicine> => {
    const response = await apiClient.get(`/medicines/${id}`)
    const item = response.data
    return {
      id: item.id,
      name: item.tradeName || item.name,
      genericName: item.genericName || '',
      tradeNames: [],
      category: item.category?.name || '',
      manufacturer: item.manufacturer?.name || '',
      prescriptionRequired: false,
      uses: '',
      dosage: '',
      warnings: '',
      sideEffects: '',
      interactions: '',
      storage: '',
    }
  },

  getMedicines: async (page = 1, limit = 100, includeArchived = false): Promise<any[]> => {
    const response = await apiClient.get('/medicines', { params: { page, limit, includeArchived } })
    return Array.isArray(response.data) ? response.data : response.data?.data || []
  },

  getCategories: async (search?: string): Promise<any[]> => {
    const response = await apiClient.get('/categories', {
      params: search?.trim() ? { search: search.trim() } : undefined,
    })
    return Array.isArray(response.data) ? response.data : response.data?.data || []
  },

  getManufacturers: async (search?: string): Promise<any[]> => {
    const response = await apiClient.get('/manufacturers', {
      params: search?.trim() ? { search: search.trim() } : undefined,
    })
    return Array.isArray(response.data) ? response.data : response.data?.data || []
  },

  getPharmacyInventory: async (pharmacyId: string): Promise<any[]> => {
    const response = await apiClient.get(`/pharmacies/${pharmacyId}/inventory`)
    return Array.isArray(response.data) ? response.data : response.data?.data || []
  },

  createCategory: async (name: string): Promise<any> => {
    const response = await apiClient.post('/categories', { name })
    return response.data
  },

  createManufacturer: async (name: string): Promise<any> => {
    const response = await apiClient.post('/manufacturers', { name })
    return response.data
  },

  createMedicine: async (
    data:
      | {
          tradeName: string
          genericName: string
          categoryId?: string
          categoryName?: string
          manufacturerId?: string
          manufacturerName?: string
          initialBatch: {
            lotNumber: string
            batchNumber: string
            expiryDate: string
            unitCost: number
            unitSellingPrice: number
            initialStock: number
            storageConditions?: string
            minTemperature?: number
            maxTemperature?: number
          }
        }
      | {
          // Legacy catalogue callers are retained until their forms collect batch data.
          name: string
          genericName: string
          categoryId: string
          manufacturerId?: string
        },
  ): Promise<any> => {
    const response = await apiClient.post('/medicines', data)
    return response.data?.data || response.data
  },

  updateMedicine: async (
    id: string,
    data: {
      name?: string
      genericName?: string
      categoryId?: string
      manufacturerId?: string
      description?: string
      dosageForm?: string
      strength?: string
      imageUrl?: string
      isActive?: boolean
    },
  ): Promise<any> => {
    const response = await apiClient.patch(`/medicines/${id}`, data)
    return response.data
  },

  deleteMedicine: async (id: string): Promise<any> => {
    const response = await apiClient.delete(`/medicines/${id}`)
    return response.data
  },

  // Resolves pharmacy stock levels via the dedicated availability endpoint
  // (single request instead of N+1 per-pharmacy inventory fetches)
  getMedicineAvailability: async (
    medicineId: string,
    insuranceId?: string | null,
    latitude?: number,
    longitude?: number,
    radius?: number,
  ): Promise<PharmacyStock[]> => {
    const params: Record<string, any> = {}
    if (insuranceId) params.insuranceId = insuranceId
    if (latitude !== undefined) params.latitude = latitude
    if (longitude !== undefined) params.longitude = longitude
    if (radius !== undefined) params.radius = radius

    try {
      const response = await apiClient.get(`/medicines/${medicineId}/availability`, { params })
      const payload = response?.data?.data ?? response?.data ?? {}
      const items = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : []

      return items.map((item: any) => ({
        pharmacyId: item.pharmacy?.id || '',
        pharmacyName: item.pharmacy?.name || 'Pharmacy',
        rating: 0,
        isOpen: true,
        distance:
          item.distance !== null && item.distance !== undefined
            ? Math.round(item.distance * 10) / 10
            : 0,
        price: Number(item.price || 0),
        stock: Number(item.quantity || 0),
        stockStatus:
          item.quantity === 0
            ? 'OUT_OF_STOCK'
            : item.quantity < 10
              ? 'ALMOST_OUT'
              : item.quantity < 35
                ? 'LIMITED'
                : 'HIGH',
        insuranceAccepted: item.insuranceCoverage?.hasAgreement ? [item.insuranceCoverage.insuranceCode] : [],
        lat: Number(item.pharmacy?.latitude || 0),
        lng: Number(item.pharmacy?.longitude || 0),
        locationText: item.pharmacy?.address || '',
        insuranceCoverage: item.insuranceCoverage,
      }))
    } catch {
      // Return empty array on failure - the retry mechanism will handle transient errors
      return []
    }
  },

  // Update dynamic pharmacy stock levels (for pharmacy manager pages)
  updatePharmacyInventory: async (
    pharmacyId: string,
    medicineId: string,
    price: number,
    stock: number,
    isOpen?: boolean,
  ): Promise<boolean> => {
    const response = await apiClient.get(`/pharmacies/${pharmacyId}/inventory`)
    const inventory = Array.isArray(response.data) ? response.data : response.data?.data || []
    const existing = inventory.find(
      (item: any) => item.medicineId === medicineId || item.medicine?.id === medicineId,
    )
    if (existing?.id)
      await apiClient.patch(`/pharmacies/${pharmacyId}/inventory/${existing.id}`, {
        quantity: stock,
        price,
      })
    else
      await apiClient.post(`/pharmacies/${pharmacyId}/inventory`, {
        medicineId,
        quantity: stock,
        price,
      })
    return true
  },

  // Import inventory from a CSV or Excel spreadsheet (row-level validation report)
  importInventorySpreadsheet: async (
    pharmacyId: string,
    file: File,
  ): Promise<{
    total: number
    imported: number
    failed: number
    errors: { row: number; error: string; data: any }[]
  }> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post(
      `/pharmacies/${pharmacyId}/inventory/import`,
      formData,
      {
        // Spreadsheet imports can take longer than the short timeout used by
        // ordinary API requests because each row is validated and persisted.
        timeout: 120000,
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    )
    return response?.data?.data ?? response?.data
  },

  // Calculate dynamic insurance cost splits
  calculateInsuranceCoverage: async (
    provider: string,
    basePrice: number,
  ): Promise<{ percent: number; insurancePays: number; patientPays: number }> => {
    const rate = INSURANCE_COVERAGE_RATES[provider] ?? 0.0
    const insurancePays = Math.round(basePrice * rate)
    const patientPays = basePrice - insurancePays

    return {
      percent: Math.round(rate * 100),
      insurancePays,
      patientPays,
    }
  },

  uploadPrescription: async (
    file: File,
    onProgress: (percent: number) => void,
  ): Promise<{ fileUrl: string; fileName: string }> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post('/upload/prescription', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(percentCompleted)
        }
      },
    })
    return {
      fileUrl: response.data.fileUrl,
      fileName: file.name,
    }
  },

  createPrescription: async (data: {
    documentUrl: string
    pharmacyId: string
    medicineId: string
    quantity: number
    dosage?: string
    frequency?: string
    duration?: string
    notes?: string
  }): Promise<any> => {
    const response = await apiClient.post('/prescriptions', {
      documentUrl: data.documentUrl,
      pharmacyId: data.pharmacyId,
      notes: data.notes,
      medicines: [{
        medicineId: data.medicineId,
        dosage: data.dosage || 'As directed by prescriber',
        frequency: data.frequency || 'As directed by prescriber',
        duration: data.duration || 'As directed by prescriber',
        quantity: data.quantity,
      }],
    })
    return response.data
  },

  // Create pickup reservation
  // Note: the backend Reservation schema has no insurance columns — coverage
  // splits are display-only on the client, so only whitelisted fields are sent.
  createReservation: async (data: {
    medicineId: string
    pharmacyId: string
    quantity: number
    expiresAt?: string
  }): Promise<Reservation> => {
    const expiresAt = data.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    const response = await apiClient.post('/reservations', {
      medicineId: data.medicineId,
      pharmacyId: data.pharmacyId,
      quantity: data.quantity,
      expiresAt,
    })
    return normalizeReservation(response.data)
  },

  // Cancel reservation
  cancelReservation: async (id: string): Promise<boolean> => {
    await apiClient.patch(`/reservations/${id}/cancel`)
    return true
  },

  // Fetch reservations history
  getReservationHistory: async (): Promise<Reservation[]> => {
    const response = await apiClient.get('/reservations')
    const payload = Array.isArray(response.data) ? response.data : response.data?.data || []
    return (payload as any[]).map(normalizeReservation)
  },

  getPatientDashboardReport: async (): Promise<any> => {
    const response = await apiClient.get('/reports/patient/me')
    return response.data
  },

  getPharmacyDashboardData: async (pharmacyId: string): Promise<any> => {
    const [reservationsRes, inventoryRes, reportRes] = await Promise.all([
      apiClient.get(`/pharmacies/${pharmacyId}/reservations`),
      apiClient.get(`/pharmacies/${pharmacyId}/inventory`),
      apiClient.get(`/reports/pharmacy/${pharmacyId}`),
    ])
    const reservations = (
      Array.isArray(reservationsRes.data) ? reservationsRes.data : reservationsRes.data?.data || []
    ).map(normalizeReservation)
    const inventory = Array.isArray(inventoryRes.data)
      ? inventoryRes.data
      : inventoryRes.data?.data || []
    const report = reportRes.data || {}
    return { reservations, inventory, report }
  },

  // Fetch notifications log
  getNotifications: async (): Promise<Notification[]> => {
    const response = await apiClient.get('/notifications')
    const payload = Array.isArray(response.data) ? response.data : response.data?.data || []
    return (payload as any[]).map(normalizeNotification)
  },

  markNotificationRead: async (id: string): Promise<boolean> => {
    await apiClient.patch(`/notifications/${id}/read`)
    return true
  },

  markAllNotificationsRead: async (): Promise<boolean> => {
    await apiClient.patch('/notifications/read-all')
    return true
  },

  deleteNotification: async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/notifications/${id}`)
      return true
    } catch (error) {
      return false
    }
  },

  clearAllNotifications: async (): Promise<boolean> => {
    try {
      await apiClient.delete('/notifications')
      return true
    } catch (error) {
      return false
    }
  },

  // Favourite Medicines list
  getFavouriteMedicines: async (): Promise<string[]> => {
    const key = 'epharmacy_fav_medicines'
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  },

  saveFavouriteMedicine: async (medicineId: string, isFav: boolean): Promise<boolean> => {
    const key = 'epharmacy_fav_medicines'
    const list = await MedicineApi.getFavouriteMedicines()
    let updated = [...list]
    if (isFav) {
      if (!updated.includes(medicineId)) updated.push(medicineId)
    } else {
      updated = updated.filter((id) => id !== medicineId)
    }
    localStorage.setItem(key, JSON.stringify(updated))
    return true
  },

  // Favourite Pharmacies list
  getFavouritePharmacies: async (): Promise<string[]> => {
    const key = 'epharmacy_fav_pharmacies'
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  },

  saveFavouritePharmacy: async (pharmacyId: string, isFav: boolean): Promise<boolean> => {
    const key = 'epharmacy_fav_pharmacies'
    const list = await MedicineApi.getFavouritePharmacies()
    let updated = [...list]
    if (isFav) {
      if (!updated.includes(pharmacyId)) updated.push(pharmacyId)
    } else {
      updated = updated.filter((id) => id !== pharmacyId)
    }
    localStorage.setItem(key, JSON.stringify(updated))
    return true
  },

  // Search History tracking (Max 20 searches)
  getSearchHistory: async (): Promise<any[]> => {
    const key = 'epharmacy_search_history'
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  },

  saveSearchHistory: async (query: string, category: string): Promise<boolean> => {
    if (!query.trim()) return false
    const key = 'epharmacy_search_history'
    const list = await MedicineApi.getSearchHistory()

    // Filter duplicates of same query string
    const filtered = list.filter((item) => item.query.toLowerCase() !== query.toLowerCase())

    const newItem = {
      id: `sh-${Math.random().toString(36).substring(2, 9)}`,
      query,
      category: category || 'All',
      timestamp: new Date().toISOString(),
    }

    const updated = [newItem, ...filtered].slice(0, 20)
    localStorage.setItem(key, JSON.stringify(updated))
    return true
  },

  clearSearchHistory: async (): Promise<boolean> => {
    const key = 'epharmacy_search_history'
    localStorage.setItem(key, JSON.stringify([]))
    return true
  },

  // Medicine Reminders System
  getReminders: async (): Promise<any[]> => {
    const response = await apiClient.get('/reminders')
    const payload = Array.isArray(response.data) ? response.data : response.data?.data || []
    return payload.map((item: any) => ({
      id: item.id,
      medicineId: item.medicineId,
      medicineName: item.medicineName || 'Medication',
      times: item.times || [], // Array of time strings like ["08:00", "12:00", "20:00"]
      frequency: item.frequency || 'daily', // daily, weekly, as_needed
      startDate: item.startDate,
      endDate: item.endDate,
      notes: item.notes || '',
      isActive: item.isActive !== false,
      lastTaken: item.lastTaken,
      nextDose: item.nextDose,
      pharmacistInstructions: item.pharmacistInstructions || '',
    }))
  },

  createReminder: async (data: {
    medicineId: string
    medicineName: string
    times: string[] // Array of time strings in HH:MM format
    frequency: 'daily' | 'weekly' | 'as_needed'
    startDate: string
    endDate?: string
    notes?: string
    pharmacistInstructions?: string
  }): Promise<any> => {
    const response = await apiClient.post('/reminders', data)
    return response.data?.data || response.data
  },

  updateReminder: async (id: string, data: {
    times?: string[]
    frequency?: string
    startDate?: string
    endDate?: string
    notes?: string
    isActive?: boolean
    pharmacistInstructions?: string
  }): Promise<boolean> => {
    await apiClient.patch(`/reminders/${id}`, data)
    return true
  },

  deleteReminder: async (id: string): Promise<boolean> => {
    await apiClient.delete(`/reminders/${id}`)
    return true
  },

  markReminderTaken: async (id: string, time: string): Promise<boolean> => {
    await apiClient.post(`/reminders/${id}/take`, { time })
    return true
  },

  // Medicine Purchase History
  getMedicineHistory: async (): Promise<any[]> => {
    const response = await apiClient.get('/reports/patient/me')
    const report = response.data || {}
    const prescriptions = Array.isArray(report.prescriptions) ? report.prescriptions : []
    const reservations = Array.isArray(report.reservations) ? report.reservations : []

    return reservations
      .filter((item: any) => String(item.status || '').toUpperCase() === 'COLLECTED')
      .map((item: any) => {
        const medicine = item.medicine || {}
        const pharmacy = item.pharmacy || {}
        const relatedPrescription = prescriptions.find((prescription: any) =>
          prescription.pharmacyId === item.pharmacyId &&
          prescription.medicines?.some((medicineItem: any) => medicineItem.medicineId === item.medicineId),
        )
        const unitPrice = Number(item.unitPrice ?? item.price ?? 0)
        const totalPrice = Number(item.totalPrice ?? unitPrice * Number(item.quantity || 0))

        return {
          id: item.id,
          medicineName: medicine.tradeName || medicine.name || item.medicineName || 'Medication',
          genericName: medicine.genericName || '',
          pharmacyName: pharmacy.name || item.pharmacyName || 'Pharmacy',
          quantity: Number(item.quantity || 0),
          price: unitPrice,
          insuranceProvider: item.insuranceProvider || '',
          patientPays: Number(item.patientPays ?? totalPrice),
          purchaseDate: item.updatedAt || item.createdAt || '',
          prescriptionRequired: Boolean(relatedPrescription),
          pharmacistNotes: relatedPrescription?.notes || '',
        }
      })
  },

  // Late pickup notifications
  checkLatePickups: async (): Promise<any[]> => {
    const response = await apiClient.get('/reservations/late')
    const payload = Array.isArray(response.data) ? response.data : response.data?.data || []
    return payload.map((item: any) => ({
      reservationId: item.id,
      medicineName: item.medicineName,
      pharmacyName: item.pharmacyName,
      pickupDeadline: item.pickupDeadline,
      hoursLate: item.hoursLate || 0,
      status: item.status,
    }))
  },
}
