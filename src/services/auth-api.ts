import { UserRole } from '@/types'
import { apiClient } from '@/api/client'
import { TokenStorage } from '@/services/token-storage'

export interface AuthUser {
  id: string
  username: string
  email?: string
  name: string
  firstName?: string
  lastName?: string
  role: UserRole
  phone?: string
  position?: string
  permissions?: string[]
  pharmacyId?: string
  organizationId?: string
  pharmacyName?: string
  firstLogin: boolean
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
  nid?: string
  licenseNumber?: string
  insuranceProvider?: string
  dob?: string
  gender?: string
  province?: string
  district?: string
  sector?: string
  cell?: string
  village?: string
  emergencyContact?: string
  preferredPharmacy?: string
  medicalNotes?: string
  profilePhoto?: string
  patient?: {
    id?: string
    userId?: string
    medicalProfile?: string | null
    address?: string | null
    dateOfBirth?: string | null
    gender?: string | null
    createdAt?: string
    updatedAt?: string
  }
  pharmacy?: {
    id?: string
    name?: string
    address?: string
    phone?: string
    licenseNumber?: string
    district?: string
    province?: string
    managerName?: string
    status?: string
    isActive?: boolean
    createdAt?: string
    updatedAt?: string
  }
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

const CURRENT_USER_KEY = 'epharmacy_current_session_user'

const normalizeUser = (payload: any): AuthUser => {
  const firstName = payload.firstName || payload.first_name || ''
  const lastName = payload.lastName || payload.last_name || ''
  const displayName = payload.name || [firstName, lastName].filter(Boolean).join(' ') || payload.email || 'User'
  const role = (payload.role || 'PATIENT') as UserRole
  const username = payload.username || payload.email || [firstName, lastName].filter(Boolean).join('.').toLowerCase() || 'user'

  return {
    id: payload.id || '',
    username,
    email: payload.email,
    name: displayName,
    firstName,
    lastName,
    role,
    phone: payload.phone,
    position: payload.position,
    permissions: payload.permissions || [],
    pharmacyId: payload.pharmacyId,
    organizationId: payload.organizationId,
    pharmacyName: payload.pharmacyName,
    firstLogin: payload.firstLogin ?? false,
    isActive: payload.isActive ?? true,
    createdAt: payload.createdAt,
    updatedAt: payload.updatedAt,
    deletedAt: payload.deletedAt ?? null,
    nid: payload.nid,
    licenseNumber: payload.licenseNumber,
    insuranceProvider: payload.insuranceProvider,
    dob: payload.dob || payload.dateOfBirth,
    gender: payload.gender,
    province: payload.province,
    district: payload.district,
    sector: payload.sector,
    cell: payload.cell,
    village: payload.village,
    emergencyContact: payload.emergencyContact,
    preferredPharmacy: payload.preferredPharmacy,
    medicalNotes: payload.medicalNotes,
    profilePhoto: payload.profilePhoto,
    patient: payload.patient ? {
      id: payload.patient.id,
      userId: payload.patient.userId,
      medicalProfile: payload.patient.medicalProfile,
      address: payload.patient.address,
      dateOfBirth: payload.patient.dateOfBirth,
      gender: payload.patient.gender,
      createdAt: payload.patient.createdAt,
      updatedAt: payload.patient.updatedAt,
    } : undefined,
    pharmacy: payload.pharmacy ? {
      id: payload.pharmacy.id,
      name: payload.pharmacy.name,
      address: payload.pharmacy.address,
      phone: payload.pharmacy.phone,
      licenseNumber: payload.pharmacy.licenseNumber,
      district: payload.pharmacy.district,
      province: payload.pharmacy.province,
      managerName: payload.pharmacy.managerName,
      status: payload.pharmacy.status,
      isActive: payload.pharmacy.isActive,
      createdAt: payload.pharmacy.createdAt,
      updatedAt: payload.pharmacy.updatedAt,
    } : undefined,
  }
}

const normalizeAuthResponse = (payload: any): AuthResponse => ({
  accessToken: payload.accessToken,
  refreshToken: payload.refreshToken,
  user: normalizeUser(payload.user || payload),
})

const getErrorMessage = (error: any): string => {
  if (error?.response?.data?.message) {
    return error.response.data.message
  }

  if (error?.response?.data?.error) {
    return error.response.data.error
  }

  return error?.message || 'Request failed.'
}

export const AuthApi = {
  login: async (identifier: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post('/auth/login', { email: identifier, password })
      
      const normalized = normalizeAuthResponse(response.data)
      TokenStorage.setToken(normalized.accessToken)
      TokenStorage.setRefreshToken(normalized.refreshToken)
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(normalized))
      return normalized
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  registerPatient: async (userData: {
    fullName: string
    phone: string
    username: string
    email?: string
    password: string
    nid?: string
    dob?: string
    gender?: string
    province?: string
    district?: string
    sector?: string
    cell?: string
    village?: string
    gpsCoords?: { lat: number; lng: number } | null
  }): Promise<AuthResponse> => {
    const [firstName, ...rest] = userData.fullName.trim().split(/\s+/)
    const lastName = rest.join(' ') || 'User'
    const email = userData.email?.trim() || `${userData.username.toLowerCase()}@epharmacy.local`

    try {
      const response = await apiClient.post('/auth/register', {
        email,
        phone: userData.phone,
        password: userData.password,
        firstName,
        lastName,
      })
      const normalized = normalizeAuthResponse(response.data)
      TokenStorage.setToken(normalized.accessToken)
      TokenStorage.setRefreshToken(normalized.refreshToken)
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(normalized))
      return normalized
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  registerPharmacy: async (pharmacyData: {
    pharmacyName: string
    tradingName?: string
    licenseNumber?: string
    businessRegistrationNumber?: string
    tin?: string
    category?: string
    ownershipType?: string
    officialEmail: string
    officialPhone: string
    username?: string
    passwordHash: string
    province: string
    district: string
    sector: string
    cell: string
    village: string
    gpsCoords?: { lat: number; lng: number } | null
    pharmacistName: string
    pharmacistNid?: string
    pharmacistLicense?: string
    pharmacistPhone?: string
    pharmacistEmail?: string
    documents?: Array<{ name: string; fileType: string; fileSize: number }>
  }): Promise<any> => {
    try {
      const response = await apiClient.post('/auth/register-pharmacy', {
        pharmacyName: pharmacyData.pharmacyName,
        licenseNumber: pharmacyData.licenseNumber || 'PENDING',
        district: pharmacyData.district,
        province: pharmacyData.province,
        address: [pharmacyData.province, pharmacyData.district, pharmacyData.sector, pharmacyData.cell, pharmacyData.village].filter(Boolean).join(', '),
        managerName: pharmacyData.pharmacistName,
        email: pharmacyData.officialEmail,
        phone: pharmacyData.officialPhone,
        password: pharmacyData.passwordHash,
      })
      return response.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  getAllPharmacies: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/pharmacies')
      const payload = response.data
      if (Array.isArray(payload)) return payload
      if (Array.isArray(payload?.data)) return payload.data
      return []
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  getGovernmentSummary: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/government/summary')
      return response.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  getGovernmentMedicineAvailability: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/government/medicine-availability')
      return response.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  getGovernmentLowStock: async (threshold = 10): Promise<any[]> => {
    try {
      const response = await apiClient.get(`/government/low-stock?threshold=${threshold}`)
      return response.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  getGovernmentReservationStats: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/government/reservation-stats')
      return response.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  getInsuranceReport: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/reports/insurance')
      return response.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  approvePharmacy: async (pharmacyId: string): Promise<any> => {
    try {
      const response = await apiClient.patch(`/pharmacies/${pharmacyId}/approve`, { status: 'APPROVED' })
      return response.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  rejectPharmacy: async (pharmacyId: string, notes?: string): Promise<any> => {
    try {
      const response = await apiClient.patch(`/pharmacies/${pharmacyId}/approve`, { status: 'REJECTED' })
      return response.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  suspendPharmacy: async (pharmacyId: string, notes?: string): Promise<any> => {
    try {
      const response = await apiClient.patch(`/pharmacies/${pharmacyId}/approve`, { status: 'REJECTED' })
      return response.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  reactivatePharmacy: async (pharmacyId: string): Promise<any> => {
    try {
      const response = await apiClient.patch(`/pharmacies/${pharmacyId}/approve`, { status: 'APPROVED' })
      return response.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  requestMoreInformation: async (pharmacyId: string, details: string): Promise<any> => {
    try {
      const response = await apiClient.patch(`/pharmacies/${pharmacyId}/approve`, { status: 'PENDING' })
      return response.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  getRegistrationStatus: async (identifier: string): Promise<any> => {
    try {
      const response = await apiClient.get('/pharmacies')
      const list = Array.isArray(response.data) ? response.data : response.data?.data || []
      return list.find((item: any) => item.name?.toLowerCase().includes(identifier.toLowerCase()) || item.owner?.email?.toLowerCase().includes(identifier.toLowerCase())) || null
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  restoreSession: async (): Promise<AuthResponse | null> => {
    const session = localStorage.getItem(CURRENT_USER_KEY)
    if (!session) return null
    try {
      return JSON.parse(session)
    } catch {
      return null
    }
  },

  refreshToken: async (token: string): Promise<{ accessToken: string }> => {
    try {
      const response = await apiClient.post('/auth/refresh', { refreshToken: token })
      return { accessToken: response.data.accessToken }
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  logout: async (): Promise<void> => {
    try {
      const refreshToken = TokenStorage.getRefreshToken()
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken })
      }
    } finally {
      TokenStorage.clearToken()
      localStorage.removeItem(CURRENT_USER_KEY)
    }
  },

  changePassword: async (emailOrUsername: string, currentPass: string, newPass: string): Promise<void> => {
    try {
      await apiClient.post('/auth/change-password', {
        currentPassword: currentPass,
        newPassword: newPass,
      })
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  requestPasswordReset: async (_identifier: string): Promise<void> => {
    return Promise.resolve()
  },

  verifyResetOTP: async (_identifier: string, _otp: string): Promise<void> => {
    return Promise.resolve()
  },

  resetPassword: async (_identifier: string, _newPass: string): Promise<void> => {
    return Promise.resolve()
  },

  getCurrentUser: async (): Promise<any> => {
    const session = localStorage.getItem(CURRENT_USER_KEY)
    if (!session) throw new Error('No active session.')
    return JSON.parse(session).user
  },

  updateProfile: async (_emailOrUsername: string, updatedFields: any): Promise<any> => {
    try {
      const response = await apiClient.put('/users/profile', {
        firstName: updatedFields.firstName,
        lastName: updatedFields.lastName,
        phone: updatedFields.phone,
      })
      const normalized = normalizeUser(response.data)
      const current = localStorage.getItem(CURRENT_USER_KEY)
      if (current) {
        const parsed = JSON.parse(current)
        parsed.user = normalized
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(parsed))
      }
      return normalized
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  uploadProfilePhoto: async (file: File): Promise<{ profilePhoto: string }> => {
    return { profilePhoto: URL.createObjectURL(file) }
  },

  getProfile: async (_emailOrUsername: string): Promise<any> => {
    try {
      const response = await apiClient.get('/users/profile')
      return normalizeUser(response.data)
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },
}
