import { AxiosError } from 'axios'
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

type ApiObject = Record<string, unknown>

type UpdateProfileFields = {
  firstName?: string
  lastName?: string
  phone?: string
  email?: string
  insuranceProvider?: string
  province?: string
  district?: string
  sector?: string
  cell?: string
  village?: string
  emergencyContact?: string
  preferredPharmacy?: string
  medicalNotes?: string
  profilePhoto?: string
}

const CURRENT_USER_KEY = 'epharmacy_current_session_user'


const toString = (value: unknown): string | undefined => (typeof value === 'string' ? value : undefined)

const toStringArray = (value: unknown): string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string') ? value : []

const getObject = (value: unknown): ApiObject =>
  typeof value === 'object' && value !== null ? (value as ApiObject) : {}

const normalizeUser = (payload: unknown): AuthUser => {
  const raw = getObject(payload)
  const userObj = getObject(raw.user ?? raw.data ?? raw)
  const firstName = toString(userObj.firstName) || toString(userObj.first_name) || ''
  const lastName = toString(userObj.lastName) || toString(userObj.last_name) || ''
  const displayName =
    toString(userObj.name) || [firstName, lastName].filter(Boolean).join(' ') || toString(userObj.email) || 'User'
  const role = typeof userObj.role === 'string' ? (userObj.role.toUpperCase() as UserRole) : 'PATIENT'
  const username =
    toString(userObj.username) || toString(userObj.email) || [firstName, lastName].filter(Boolean).join('.').toLowerCase() || 'user'
  const patientObj = getObject(userObj.patient)
  const pharmacyObj = getObject(userObj.pharmacy ?? getObject(userObj.pharmacyOwner).pharmacy)

  return {
    id: toString(userObj.id) || '',
    username,
    email: toString(userObj.email),
    name: displayName,
    firstName,
    lastName,
    role,
    phone: toString(userObj.phone),
    position: toString(userObj.position),
    permissions: toStringArray(userObj.permissions),
    pharmacyId: toString(userObj.pharmacyId),
    pharmacyName: toString(userObj.pharmacyName),
    firstLogin: typeof userObj.firstLogin === 'boolean' ? userObj.firstLogin : false,
    isActive: typeof userObj.isActive === 'boolean' ? userObj.isActive : true,
    createdAt: toString(userObj.createdAt),
    updatedAt: toString(userObj.updatedAt),
    deletedAt: userObj.deletedAt === null ? null : toString(userObj.deletedAt),
    nid: toString(userObj.nid),
    licenseNumber: toString(userObj.licenseNumber),
    insuranceProvider: toString(userObj.insuranceProvider),
    dob: toString(userObj.dob) || toString(userObj.dateOfBirth),
    gender: toString(userObj.gender),
    province: toString(userObj.province),
    district: toString(userObj.district),
    sector: toString(userObj.sector),
    cell: toString(userObj.cell),
    village: toString(userObj.village),
    emergencyContact: toString(userObj.emergencyContact),
    preferredPharmacy: toString(userObj.preferredPharmacy),
    medicalNotes: toString(userObj.medicalNotes),
    profilePhoto: toString(userObj.profilePhoto),
    patient:
      Object.keys(patientObj).length > 0
        ? {
            id: toString(patientObj.id),
            userId: toString(patientObj.userId),
            medicalProfile:
              patientObj.medicalProfile === null ? null : toString(patientObj.medicalProfile),
            address: patientObj.address === null ? null : toString(patientObj.address),
            dateOfBirth: patientObj.dateOfBirth === null ? null : toString(patientObj.dateOfBirth),
            gender: patientObj.gender === null ? null : toString(patientObj.gender),
            createdAt: toString(patientObj.createdAt),
            updatedAt: toString(patientObj.updatedAt),
          }
        : undefined,
    pharmacy:
      Object.keys(pharmacyObj).length > 0
        ? {
            id: toString(pharmacyObj.id),
            name: toString(pharmacyObj.name),
            address: toString(pharmacyObj.address),
            phone: toString(pharmacyObj.phone),
            licenseNumber: toString(pharmacyObj.licenseNumber),
            district: toString(pharmacyObj.district),
            province: toString(pharmacyObj.province),
            managerName: toString(pharmacyObj.managerName),
            status: toString(pharmacyObj.status),
            isActive: typeof pharmacyObj.isActive === 'boolean' ? pharmacyObj.isActive : undefined,
            category: toString(pharmacyObj.category),
            ownershipType: toString(pharmacyObj.ownershipType),
            createdAt: toString(pharmacyObj.createdAt),
            updatedAt: toString(pharmacyObj.updatedAt),
          }
        : undefined,
  }
}

const normalizeAuthResponse = (payload: unknown): AuthResponse => {
  const raw = getObject(payload)
  const data = getObject(raw.data ?? payload)

  return {
    accessToken: toString(data.accessToken) || '',
    refreshToken: toString(data.refreshToken) || '',
    user: normalizeUser(data.user ?? data),
  }
}

const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error !== null) {
    const axiosError = error as AxiosError
    const responseData = axiosError.response?.data as ApiObject | undefined
    if (responseData?.message) {
      // NestJS returns message as string or string[]
      if (typeof responseData.message === 'string') return responseData.message
      if (Array.isArray(responseData.message)) return (responseData.message as string[]).join(' · ')
    }
    if (responseData?.error && typeof responseData.error === 'string') return responseData.error
    if (axiosError.response?.status === 400) return 'Invalid credentials or request. Please check your input.'
    if (axiosError.response?.status === 401) return 'Incorrect username or password.'
    if (axiosError.response?.status === 403) return 'Access denied.'
    if (axiosError.response?.status === 404) return 'Account not found.'
  }
  if (error instanceof Error) return error.message
  return 'Request failed. Please try again.'
}


export const AuthApi = {
  verifyEmail: async (token: string): Promise<{ message: string }> => {
    try { const response = await apiClient.get('/auth/verify-email', { params: { token } }); return response.data?.data || response.data }
    catch (error) { throw new Error(getErrorMessage(error)) }
  },
  resendVerification: async (email: string): Promise<{ message: string }> => {
    try { const response = await apiClient.post('/auth/resend-verification', { email }); return response.data?.data || response.data }
    catch (error) { throw new Error(getErrorMessage(error)) }
  },
  createStaff: async (pharmacyId: string, data: { firstName: string; lastName: string; email: string; phone: string; role: string; position: string }) => {
    const response = await apiClient.post(`/auth/pharmacies/${pharmacyId}/staff`, data)
    return response.data
  },
  createGovernmentUser: async (data: { firstName: string; lastName: string; email: string; phone: string; role: string; position?: string }) => {
    try {
      const response = await apiClient.post('/auth/managed-users/government', data)
      return response.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },
  createInsuranceUser: async (data: { firstName: string; lastName: string; email: string; phone: string; role: string; position?: string }) => {
    try {
      const response = await apiClient.post('/auth/managed-users/insurance', data)
      return response.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },
  createPatientUser: async (userData: {
    fullName: string
    phone: string
    email: string
    password: string
  }): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post('/auth/register', {
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
        firstName: userData.fullName.split(/\s+/)[0],
        lastName: userData.fullName.split(/\s+/).slice(1).join(' ') || 'Patient',
      })
      return normalizeAuthResponse(response.data)
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error))
    }
  },
  listPendingPharmacies: async (): Promise<unknown[]> => {
    try {
      const response = await apiClient.get('/auth/pharmacies/pending')
      return Array.isArray(response.data) ? response.data : response.data?.data || []
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post('/auth/login', { email, password })
      const normalized = normalizeAuthResponse(response.data)
      TokenStorage.setToken(normalized.accessToken)
      TokenStorage.setRefreshToken(normalized.refreshToken)
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(normalized))
      return normalized
    } catch (error: unknown) {
      const msg = getErrorMessage(error)
      throw new Error(msg)
    }
  },


  registerPatient: async (userData: {
    fullName: string
    phone: string
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
    const email = userData.email?.trim() || `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/\s+/g, '.')}@epharmacy.local`


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
  }): Promise<unknown> => {
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


  registerInsurance: async (insuranceData: {
    fullname: string
    email: string
    phone: string
    passwordHash: string
  }): Promise<unknown> => {
    try {
      const response = await apiClient.post('/auth/register-insurance', {
        fullname: insuranceData.fullname,
        email: insuranceData.email,
        phone: insuranceData.phone,
        password: insuranceData.passwordHash,
      })
      return response.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },


  getAllPharmacies: async (): Promise<unknown[]> => {
    try {
      const response = await apiClient.get('/pharmacies')
      console.log("PHARMACIES API RESPONSE: ",response.data)
      const payload = response.data


      if (Array.isArray(payload)) return payload
      if (Array.isArray(payload?.data)) return payload.data
      if (Array.isArray(payload?.data?.data)) return payload.data.data
      return []
    } catch (error: unknown) {
      console.error("Error fetching pharmacies: ", error)
      throw new Error(getErrorMessage(error))
    }
  },


  getGovernmentSummary: async (): Promise<unknown> => {
    try {
      const response = await apiClient.get('/government/summary')
      return response.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },


  getGovernmentMedicineAvailability: async (): Promise<unknown[]> => {
    try {
      const response = await apiClient.get('/government/medicine-availability')
      return Array.isArray(response.data) ? response.data : []
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error))
    }
  },


  getGovernmentLowStock: async (threshold = 10): Promise<unknown[]> => {
    try {
      const response = await apiClient.get(`/government/low-stock?threshold=${threshold}`)
      const payload= response.data
      if (Array.isArray(payload)) return payload
      if (Array.isArray(payload?.data)) return payload.data
      return []
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  getGovernmentDistrictCoverage: async (): Promise<unknown[]> => {
    try {
      const response = await apiClient.get('/government/district-coverage')
      const payload = response.data
      if (Array.isArray(payload)) return payload
      if (Array.isArray(payload?.data)) return payload.data
      return []
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  getGovernmentReservationStats: async (): Promise<unknown[]> => {
    try {
      const response = await apiClient.get('/government/reservation-stats')
      const payload= response.data
      if(Array.isArray(payload)) return payload;
      if(Array.isArray(payload?.data)) return payload.data;
      return []
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error))
    }
  },


  getGovernmentAuditLogs: async (page = 1, limit = 25, entityType?: string, action?: string): Promise<unknown> => {
    try {
      const params: Record<string, unknown> = { page, limit }
      if (entityType) params.entityType = entityType
      if (action) params.action = action
      const response = await apiClient.get('/audit-logs', { params })
      return response.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },


  getInsuranceReport: async (): Promise<unknown> => {
    try {
      const response = await apiClient.get('/reports/insurance')
      return response.data
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error))
    }
  },


  approvePharmacy: async (pharmacyId: string): Promise<unknown> => {
    try {
      const response = await apiClient.patch(`/pharmacies/${pharmacyId}/approve`, { status: 'APPROVED' })
      return response.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },


  rejectPharmacy: async (pharmacyId: string): Promise<unknown> => {
    try {
      const response = await apiClient.patch(`/pharmacies/${pharmacyId}/approve`, { status: 'REJECTED' })
      return response.data
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error))
    }
  },


  reactivatePharmacy: async (pharmacyId: string): Promise<unknown> => {
    try {
      const response = await apiClient.patch(`/pharmacies/${pharmacyId}/approve`, { status: 'APPROVED' })
      return response.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },


  getGovernmentReport: async (startDate?: string, endDate?: string): Promise<unknown> => {
    try {
      const query: string[] = []
      if (startDate) query.push(`startDate=${encodeURIComponent(startDate)}`)
      if (endDate) query.push(`endDate=${encodeURIComponent(endDate)}`)
      const url = `/reports/government${query.length ? `?${query.join('&')}` : ''}`
      const response = await apiClient.get(url)
      return response.data
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error))
    }
  },

  getPlatformReport: async (): Promise<unknown> => {
    try {
      const response = await apiClient.get('/reports/platform')
      return response.data
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error))
    }
  },


  requestMoreInformation: async (pharmacyId: string, details: string): Promise<unknown> => {
    try {
      const response = await apiClient.patch(`/pharmacies/${pharmacyId}/approve`, {
        status: 'MORE_INFO_REQUESTED',
        details,
      })
      return response.data
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error))
    }
  },


  getRegistrationStatus: async (email: string): Promise<unknown> => {
    try {
      const response = await apiClient.get('/pharmacies')
      const list: unknown[] = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.data)
        ? response.data.data
        : []

      return (
        list.find((item) => {
          const candidate = getObject(item)
          const name = toString(candidate.name)
          const owner = getObject(candidate.owner)
          const ownerEmail = toString(owner.email)
          return (
            name?.toLowerCase().includes(email.toLowerCase()) ||
            ownerEmail?.toLowerCase().includes(email.toLowerCase())
          )
        }) || null
      )
    } catch (error: unknown) {
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


  requestPasswordReset: async (email: string): Promise<void> => {
    void email
    return Promise.resolve()
  },


  verifyResetOTP: async (email: string, otp: string): Promise<void> => {
    void email
    void otp
    return Promise.resolve()
  },


  resetPassword: async (email: string, newPass: string): Promise<void> => {
    void email
    void newPass
    return Promise.resolve()
  },


  getCurrentUser: async (): Promise<AuthUser> => {
    const session = localStorage.getItem(CURRENT_USER_KEY)
    if (!session) throw new Error('No active session.')
    const payload = JSON.parse(session) as AuthResponse
    return payload.user
  },


  updateProfile: async (_emailOrUsername: string, updatedFields: UpdateProfileFields): Promise<AuthUser> => {
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
  }): Promise<unknown> => {
    try {
      const response = await apiClient.patch(`/pharmacies/${pharmacyId}`, data)
      return response.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },


  getProfile: async (_emailOrUsername: string): Promise<AuthUser> => {
    void _emailOrUsername
    try {
      const response = await apiClient.get('/users/profile')
      return normalizeUser(response.data)
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error))
    }
  },

  /**
   * Re-fetches the current user profile from the backend and updates both the
   * persisted session and the auth store. Used by the pharmacy registration
   * gate to pick up MOH approval status changes.
   */
  refreshSession: async (): Promise<AuthUser> => {
    const latest = await AuthApi.getProfile('')
    const session = localStorage.getItem(CURRENT_USER_KEY)
    if (session) {
      try {
        const parsed = JSON.parse(session) as AuthResponse
        parsed.user = latest
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(parsed))
      } catch {
        // Session payload unreadable — leave as-is; store update below still applies
      }
    }
    return latest
  },

  // Insurance-specific API functions
  getInsuranceClaims: async (): Promise<unknown[]> => {
    try {
      const response = await apiClient.get('/insurance/claims')
      const payload = Array.isArray(response.data) ? response.data : response.data?.data || []
      return payload
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error))
    }
  },

  getInsurancePatients: async (): Promise<unknown[]> => {
    try {
      const response = await apiClient.get('/insurance/patients')
      const payload = Array.isArray(response.data) ? response.data : response.data?.data || []
      return payload
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error))
    }
  },

  getInsurancePayments: async (): Promise<unknown[]> => {
    try {
      const response = await apiClient.get('/insurance/payments')
      const payload = Array.isArray(response.data) ? response.data : response.data?.data || []
      return payload
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error))
    }
  },

  updateInsuranceClaimStatus: async (claimId: string, status: string): Promise<unknown> => {
    try {
      const response = await apiClient.patch(`/insurance/claims/${claimId}`, { status })
      return response.data
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error))
    }
  },

  processInsurancePayment: async (paymentId: string): Promise<unknown> => {
    try {
      const response = await apiClient.post(`/insurance/payments/${paymentId}/process`)
      return response.data
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error))
    }
  },
}



