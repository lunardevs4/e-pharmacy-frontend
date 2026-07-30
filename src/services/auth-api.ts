import { UserRole } from '@/types'

export interface AuthUser {
  id: string
  username: string
  email?: string
  name: string
  role: UserRole
  position?: string
  permissions?: string[]
  pharmacyId?: string
  pharmacyName?: string
  firstLogin: boolean
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

// Internal mock user structure
interface MockAccount {
  id: string
  username: string
  email?: string
  name: string
  role: UserRole
  position?: string
  permissions: string[]
  pharmacyId?: string
  pharmacyName?: string
  firstLogin: boolean
  passwordHash: string
}

// Simulated backend database of accounts
const MOCK_ACCOUNTS: Record<string, MockAccount> = {
  'staff': {
    id: 'usr_staff_001',
    username: 'staff',
    email: 'staff@epharmacy.rw',
    name: 'Olivier Mugisha',
    role: 'PHARMACY',
    position: 'Pharmacist',
    permissions: ['VIEW_RESERVATIONS', 'CONFIRM_RESERVATION', 'DISPENSE_MEDICINE', 'VIEW_INVENTORY'],
    pharmacyId: 'ph-001',
    pharmacyName: 'Kigali National Pharmacy',
    firstLogin: true, // Forces first time password change
    passwordHash: 'TempPass123!',
  },
  'patient': {
    id: 'usr_pat_002',
    username: 'patient',
    email: 'patient@epharmacy.rw',
    name: 'Jean Paul Habimana',
    role: 'PATIENT',
    permissions: ['SEARCH_MEDICINES', 'CREATE_RESERVATION', 'CANCEL_RESERVATION', 'VIEW_OWN_HISTORY'],
    firstLogin: false,
    passwordHash: 'PatientPass123!',
  },
  'manager': {
    id: 'usr_man_003',
    username: 'manager',
    email: 'manager@epharmacy.rw',
    name: 'Dr. Jeanne d\'Arc',
    role: 'PHARMACY',
    position: 'Pharmacy Manager',
    permissions: ['MANAGE_INVENTORY', 'UPDATE_PRICING', 'MANAGE_STAFF', 'VIEW_PHARMACY_REPORTS', 'VIEW_RESERVATIONS', 'CONFIRM_RESERVATION', 'DISPENSE_MEDICINE', 'VIEW_INVENTORY'],
    pharmacyId: 'ph-001',
    pharmacyName: 'Kigali National Pharmacy',
    firstLogin: false,
    passwordHash: 'ManagerPass123!',
  },
  'government': {
    id: 'usr_gov_004',
    username: 'government',
    email: 'government@epharmacy.rw',
    name: 'Hon. Claudine Uwera',
    role: 'GOVERNMENT',
    position: 'Health Director',
    permissions: ['VIEW_NATIONAL_ANALYTICS', 'GENERATE_EPIDEMIOLOGY_REPORTS'],
    firstLogin: false,
    passwordHash: 'GovPass123!',
  },
  'admin': {
    id: 'usr_adm_005',
    username: 'admin',
    email: 'admin@epharmacy.rw',
    name: 'Admin Strator',
    role: 'ADMIN',
    position: 'System Administrator',
    permissions: ['MANAGE_USERS', 'MANAGE_ROLES', 'VIEW_AUDIT_LOGS', 'CONFIGURE_SYSTEM'],
    firstLogin: false,
    passwordHash: 'AdminPass123!',
  },
}

// Local storage keys
const DYNAMIC_USERS_KEY = 'epharmacy_registered_users'
const CURRENT_USER_KEY = 'epharmacy_current_session_user'

const getDynamicUsers = (): Record<string, MockAccount> => {
  const data = localStorage.getItem(DYNAMIC_USERS_KEY)
  return data ? JSON.parse(data) : {}
}

export const AuthApi = {
  /**
   * Simulates credentials authentication against backend NestJS API
   */
  login: async (identifier: string, password: string): Promise<AuthResponse> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const idClean = identifier.toLowerCase().trim()
        const dynamicUsers = getDynamicUsers()
        
        // Lookup in static mock accounts and dynamic accounts
        let account = Object.values(MOCK_ACCOUNTS).find(
          (acc) => acc.username.toLowerCase() === idClean || acc.email?.toLowerCase() === idClean
        )

        if (!account) {
          account = Object.values(dynamicUsers).find(
            (acc) => acc.username.toLowerCase() === idClean || acc.email?.toLowerCase() === idClean
          )
        }

        if (!account || account.passwordHash !== password) {
          reject(new Error('Invalid username/email or password. Please verify your credentials.'))
          return
        }

        const authUser: AuthUser = {
          id: account.id,
          username: account.username,
          email: account.email,
          name: account.name,
          role: account.role,
          position: account.position,
          permissions: account.permissions,
          pharmacyId: account.pharmacyId,
          pharmacyName: account.pharmacyName,
          firstLogin: account.firstLogin,
        }

        const response: AuthResponse = {
          accessToken: `mock_jwt_access_token_for_${account.id}`,
          refreshToken: `mock_jwt_refresh_token_for_${account.id}`,
          user: authUser,
        }

        // Cache session in local storage for session restoration
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(response))

        resolve(response)
      }, 1000)
    })
  },

  /**
   * Simulated Registration for Patient Citizens
   */
  register: async (userData: {
    fullName: string
    nid: string
    dob: string
    gender: string
    phone: string
    username: string
    email?: string
    password: string
    province: string
    district: string
    sector: string
    cell: string
    village: string
    gpsCoords?: { lat: number; lng: number } | null
  }): Promise<AuthResponse> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const dynamicUsers = getDynamicUsers()
        const usernameClean = userData.username.toLowerCase().trim()
        const emailClean = userData.email?.toLowerCase().trim()

        // Check uniqueness across static and dynamic databases
        const usernameExists = 
          Object.values(MOCK_ACCOUNTS).some((acc) => acc.username.toLowerCase() === usernameClean) ||
          Object.values(dynamicUsers).some((acc) => acc.username.toLowerCase() === usernameClean)

        if (usernameExists) {
          reject(new Error('Username is already taken by another account.'))
          return
        }

        if (emailClean) {
          const emailExists =
            Object.values(MOCK_ACCOUNTS).some((acc) => acc.email?.toLowerCase() === emailClean) ||
            Object.values(dynamicUsers).some((acc) => acc.email?.toLowerCase() === emailClean)

          if (emailExists) {
            reject(new Error('Email address is already registered to another account.'))
            return
          }
        }

        // Save new dynamic account
        const newUserId = `usr_pat_${Math.floor(100000 + Math.random() * 900000)}`
        const newAccount: MockAccount = {
          id: newUserId,
          username: userData.username.trim(),
          email: userData.email?.trim() || undefined,
          name: userData.fullName.trim(),
          role: 'PATIENT',
          permissions: ['SEARCH_MEDICINES', 'CREATE_RESERVATION', 'CANCEL_RESERVATION', 'VIEW_OWN_HISTORY'],
          firstLogin: false,
          passwordHash: userData.password,
        }

        dynamicUsers[newAccount.username.toLowerCase()] = newAccount
        localStorage.setItem(DYNAMIC_USERS_KEY, JSON.stringify(dynamicUsers))

        const authUser: AuthUser = {
          id: newAccount.id,
          username: newAccount.username,
          email: newAccount.email,
          name: newAccount.name,
          role: newAccount.role,
          permissions: newAccount.permissions,
          firstLogin: newAccount.firstLogin,
        }

        const response: AuthResponse = {
          accessToken: `mock_jwt_access_token_for_${newAccount.id}`,
          refreshToken: `mock_jwt_refresh_token_for_${newAccount.id}`,
          user: authUser,
        }

        // Cache session
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(response))

        resolve(response)
      }, 1500)
    })
  },

  /**
   * Restores session from LocalStorage
   */
  restoreSession: async (): Promise<AuthResponse | null> => {
    const session = localStorage.getItem(CURRENT_USER_KEY)
    if (!session) return null
    try {
      return JSON.parse(session)
    } catch {
      return null
    }
  },

  /**
   * Refreshes JWT token credentials
   */
  refreshToken: async (token: string): Promise<{ accessToken: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ accessToken: `mock_jwt_refreshed_token_for_${token}` })
      }, 500)
    })
  },

  /**
   * Clear active session cache
   */
  logout: async (): Promise<void> => {
    localStorage.removeItem(CURRENT_USER_KEY)
    return new Promise((resolve) => setTimeout(resolve, 300))
  },

  /**
   * Updates credentials for temporary pass updates
   */
  changePassword: async (emailOrUsername: string, currentPass: string, newPass: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const idClean = emailOrUsername.toLowerCase().trim()
        const dynamicUsers = getDynamicUsers()
        
        let account = Object.values(MOCK_ACCOUNTS).find(
          (acc) => acc.username.toLowerCase() === idClean || acc.email?.toLowerCase() === idClean
        )

        let isDynamic = false
        if (!account) {
          account = Object.values(dynamicUsers).find(
            (acc) => acc.username.toLowerCase() === idClean || acc.email?.toLowerCase() === idClean
          )
          isDynamic = true
        }

        if (!account) {
          reject(new Error('User account not found.'))
          return
        }
        if (account.passwordHash !== currentPass) {
          reject(new Error('Current password does not match.'))
          return
        }

        account.passwordHash = newPass
        account.firstLogin = false

        if (isDynamic) {
          dynamicUsers[account.username.toLowerCase()] = account
          localStorage.setItem(DYNAMIC_USERS_KEY, JSON.stringify(dynamicUsers))
        }

        resolve()
      }, 1000)
    })
  },

  requestPasswordReset: async (identifier: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const idClean = identifier.toLowerCase().trim()
        const dynamicUsers = getDynamicUsers()
        
        const exists = 
          Object.values(MOCK_ACCOUNTS).some((acc) => acc.username.toLowerCase() === idClean || acc.email?.toLowerCase() === idClean) ||
          Object.values(dynamicUsers).some((acc) => acc.username.toLowerCase() === idClean || acc.email?.toLowerCase() === idClean)

        if (!exists) {
          reject(new Error('No registered account found with this username or email.'))
          return
        }
        resolve()
      }, 1000)
    })
  },

  verifyResetOTP: async (identifier: string, otp: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (otp !== '123456') {
          reject(new Error('Invalid verification code. Please enter 123456 for testing.'))
          return
        }
        resolve()
      }, 800)
    })
  },

  resetPassword: async (identifier: string, newPass: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const idClean = identifier.toLowerCase().trim()
        const dynamicUsers = getDynamicUsers()
        
        let account = Object.values(MOCK_ACCOUNTS).find(
          (acc) => acc.username.toLowerCase() === idClean || acc.email?.toLowerCase() === idClean
        )

        let isDynamic = false
        if (!account) {
          account = Object.values(dynamicUsers).find(
            (acc) => acc.username.toLowerCase() === idClean || acc.email?.toLowerCase() === idClean
          )
          isDynamic = true
        }

        if (!account) {
          reject(new Error('Account not found.'))
          return
        }
        account.passwordHash = newPass
        account.firstLogin = false

        if (isDynamic) {
          dynamicUsers[account.username.toLowerCase()] = account
          localStorage.setItem(DYNAMIC_USERS_KEY, JSON.stringify(dynamicUsers))
        }
        resolve()
      }, 1000)
    })
  },

  getCurrentUser: async (): Promise<any> => {
    const session = localStorage.getItem(CURRENT_USER_KEY)
    if (!session) throw new Error('No active session.')
    return JSON.parse(session).user
  },

  updateProfile: async (emailOrUsername: string, updatedFields: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const idClean = emailOrUsername.toLowerCase().trim()
        const dynamicUsers = getDynamicUsers()
        
        let account = Object.values(MOCK_ACCOUNTS).find(
          (acc) => acc.username.toLowerCase() === idClean || acc.email?.toLowerCase() === idClean
        )

        let isDynamic = false
        if (!account) {
          account = Object.values(dynamicUsers).find(
            (acc) => acc.username.toLowerCase() === idClean || acc.email?.toLowerCase() === idClean
          )
          isDynamic = true
        }

        if (!account) {
          reject(new Error('User account not found.'))
          return
        }

        // Merge properties
        Object.assign(account, updatedFields)

        if (isDynamic) {
          dynamicUsers[account.username.toLowerCase()] = account
          localStorage.setItem(DYNAMIC_USERS_KEY, JSON.stringify(dynamicUsers))
        }

        // Also update cached session CURRENT_USER_KEY
        const sessionStr = localStorage.getItem(CURRENT_USER_KEY)
        if (sessionStr) {
          const session = JSON.parse(sessionStr)
          session.user = { ...session.user, ...updatedFields }
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(session))
        }

        resolve(account)
      }, 600)
    })
  },

  uploadProfilePhoto: async (file: File): Promise<{ profilePhoto: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { profilePhoto: URL.createObjectURL(file) }
  },

  getProfile: async (emailOrUsername: string): Promise<any> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const idClean = emailOrUsername.toLowerCase().trim()
    const dynamicUsers = getDynamicUsers()
    let account = Object.values(MOCK_ACCOUNTS).find(
      (acc) => acc.username.toLowerCase() === idClean || acc.email?.toLowerCase() === idClean
    )
    if (!account) {
      account = Object.values(dynamicUsers).find(
        (acc) => acc.username.toLowerCase() === idClean || acc.email?.toLowerCase() === idClean
      )
    }
    if (!account) throw new Error('Account not found')
    return account
  }
}
