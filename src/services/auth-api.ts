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
    category?: string
    ownershipType?: string
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
  const userObj = payload?.user || payload?.data || payload || {}
  const firstName = userObj.firstName || userObj.first_name || ''
  const lastName = userObj.lastName || userObj.last_name || ''
  const displayName = userObj.name || [firstName, lastName].filter(Boolean).join(' ') || userObj.email || 'User'
  const role = (userObj.role || 'PATIENT') as UserRole
  const username = userObj.username || userObj.email || [firstName, lastName].filter(Boolean).join('.').toLowerCase() || 'user'

  return {
    id: userObj.id || '',
    username,
    email: userObj.email,
    name: displayName,
    firstName,
    lastName,
    role,
    phone: userObj.phone,
    position: userObj.position,
    permissions: userObj.permissions || [],
    pharmacyId: userObj.pharmacyId,
    organizationId: userObj.organizationId,
    pharmacyName: userObj.pharmacyName,
    firstLogin: userObj.firstLogin ?? false,
    isActive: userObj.isActive ?? true,
    createdAt: userObj.createdAt,
    updatedAt: userObj.updatedAt,
    deletedAt: userObj.deletedAt ?? null,
    nid: userObj.nid,
    licenseNumber: userObj.licenseNumber,
    insuranceProvider: userObj.insuranceProvider,
    dob: userObj.dob || userObj.dateOfBirth,
    gender: userObj.gender,
    province: userObj.province,
    district: userObj.district,
    sector: userObj.sector,
    cell: userObj.cell,
    village: userObj.village,
    emergencyContact: userObj.emergencyContact,
    preferredPharmacy: userObj.preferredPharmacy,
    medicalNotes: userObj.medicalNotes,
    profilePhoto: userObj.profilePhoto,
    patient: userObj.patient ? {
      id: userObj.patient.id,
      userId: userObj.patient.userId,
      medicalProfile: userObj.patient.medicalProfile,
      address: userObj.patient.address,
      dateOfBirth: userObj.patient.dateOfBirth,
      gender: userObj.patient.gender,
      createdAt: userObj.patient.createdAt,
      updatedAt: userObj.patient.updatedAt,
    } : undefined,
    pharmacy: userObj.pharmacy ? {
      id: userObj.pharmacy.id,
      name: userObj.pharmacy.name,
      address: userObj.pharmacy.address,
      phone: userObj.pharmacy.phone,
      licenseNumber: userObj.pharmacy.licenseNumber,
      district: userObj.pharmacy.district,
      province: userObj.pharmacy.province,
      managerName: userObj.pharmacy.managerName,
      status: userObj.pharmacy.status,
      isActive: userObj.pharmacy.isActive,
      category: userObj.pharmacy.category,
      ownershipType: userObj.pharmacy.ownershipType,
      createdAt: userObj.pharmacy.createdAt,
      updatedAt: userObj.pharmacy.updatedAt,
    } : undefined,
  }
}

const normalizeAuthResponse = (payload: any): AuthResponse => {
  const data = payload?.data || payload
  return {
    accessToken: data?.accessToken || payload?.accessToken,
    refreshToken: data?.refreshToken || payload?.refreshToken,
    user: normalizeUser(data?.user || data),
  }
}

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
    fullname: string
    email: string
    phone: string
    passwordHash: string
  }): Promise<any> => {
    try {
      const response = await apiClient.post('/auth/register-pharmacy', {
        fullname: pharmacyData.fullname,
        email: pharmacyData.email,
        phone: pharmacyData.phone,
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

  updatePharmacy: async (pharmacyId: string, data: {
    name: string
    address: string
    licenseNumber: string
    category: string
    ownershipType: string
    province: string
    district: string
  }): Promise<any> => {
    try {
      const response = await apiClient.patch(`/pharmacies/${pharmacyId}`, data)
      return response.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
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
