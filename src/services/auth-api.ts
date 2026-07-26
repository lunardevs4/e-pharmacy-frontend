import { UserRole } from '@/types'

export interface AuthUser {
  id: string
  name: string
  email: string
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

// Simulated backend database of accounts
const MOCK_ACCOUNTS: Record<string, Omit<AuthUser, 'email'> & { passwordHash: string }> = {
  'staff@epharmacy.rw': {
    id: 'usr_staff_001',
    name: 'Olivier Mugisha',
    role: 'PHARMACY',
    position: 'Pharmacist',
    permissions: ['MANAGE_INVENTORY', 'DISPENSE_MEDICINE'],
    pharmacyId: 'phar_kigali_001',
    pharmacyName: 'Kigali Pharmacy',
    firstLogin: true, // Forces first time password change
    passwordHash: 'TempPass123!',
  },
  'patient@epharmacy.rw': {
    id: 'usr_pat_002',
    name: 'Jean Paul Habimana',
    role: 'PATIENT',
    firstLogin: false,
    passwordHash: 'PatientPass123!',
  },
  'manager@epharmacy.rw': {
    id: 'usr_man_003',
    name: 'Dr. Jeanne d\'Arc',
    role: 'PHARMACY',
    position: 'Pharmacy Manager',
    permissions: ['MANAGE_INVENTORY', 'DISPENSE_MEDICINE', 'MANAGE_STAFF', 'VIEW_REPORTS'],
    pharmacyId: 'phar_kigali_001',
    pharmacyName: 'Kigali Pharmacy',
    firstLogin: false,
    passwordHash: 'ManagerPass123!',
  },
  'government@epharmacy.rw': {
    id: 'usr_gov_004',
    name: 'Hon. Claudine Uwera',
    role: 'GOVERNMENT',
    position: 'Health Director',
    permissions: ['VIEW_ANALYTICS', 'VIEW_REPORTS'],
    firstLogin: false,
    passwordHash: 'GovPass123!',
  },
  'admin@epharmacy.rw': {
    id: 'usr_adm_005',
    name: 'Admin Strator',
    role: 'ADMIN',
    position: 'System Administrator',
    permissions: ['MANAGE_USERS', 'VIEW_AUDIT_LOGS'],
    firstLogin: false,
    passwordHash: 'AdminPass123!',
  },
}

export const AuthApi = {
  /**
   * Simulates credentials authentication against backend NestJS API
   */
  login: async (email: string, password: string): Promise<AuthResponse> => {
    return new Promise((resolve, reject) => {
      // Simulate network latency
      setTimeout(() => {
        const account = MOCK_ACCOUNTS[email.toLowerCase().trim()]
        
        if (!account || account.passwordHash !== password) {
          reject(new Error('Invalid email or password. Please verify your credentials.'))
          return
        }

        resolve({
          accessToken: `mock_jwt_access_token_for_${account.id}`,
          refreshToken: `mock_jwt_refresh_token_for_${account.id}`,
          user: {
            id: account.id,
            name: account.name,
            email: email.toLowerCase().trim(),
            role: account.role,
            position: account.position,
            permissions: account.permissions,
            pharmacyId: account.pharmacyId,
            pharmacyName: account.pharmacyName,
            firstLogin: account.firstLogin,
          },
        })
      }, 1000)
    })
  },

  /**
   * Simulates password update for staff first-time login
   */
  changePassword: async (email: string, currentPass: string, newPass: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const account = MOCK_ACCOUNTS[email.toLowerCase().trim()]
        if (!account) {
          reject(new Error('User account not found.'))
          return
        }
        if (account.passwordHash !== currentPass) {
          reject(new Error('Current temporary password does not match.'))
          return
        }

        // Simulate password hash change and flag update
        account.passwordHash = newPass
        account.firstLogin = false
        resolve()
      }, 1000)
    })
  },

  /**
   * Simulates Forgot Password OTP email request
   */
  requestPasswordReset: async (email: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Just verify if account exists in mock DB
        const exists = Object.keys(MOCK_ACCOUNTS).includes(email.toLowerCase().trim())
        if (!exists) {
          reject(new Error('No registered account found with this email address.'))
          return
        }
        resolve()
      }, 1000)
    })
  },

  /**
   * Simulates OTP verification check
   */
  verifyResetOTP: async (email: string, otp: string): Promise<void> => {
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

  /**
   * Simulates reset password submission
   */
  resetPassword: async (email: string, newPass: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const account = MOCK_ACCOUNTS[email.toLowerCase().trim()]
        if (!account) {
          reject(new Error('Account not found.'))
          return
        }
        account.passwordHash = newPass
        resolve()
      }, 1000)
    })
  },
}
