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

// Static mock accounts for Patient, Government, and Admin
const MOCK_ACCOUNTS: Record<string, MockAccount> = {
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
const DYNAMIC_PHARMACIES_KEY = 'epharmacy_registered_pharmacies'
const CURRENT_USER_KEY = 'epharmacy_current_session_user'

const INITIAL_PHARMACIES = [
  {
    id: 'ph-001',
    pharmacyName: 'Kigali National Pharmacy',
    tradingName: 'KNP',
    licenseNumber: 'LIC-KIG-48293-2026',
    businessRegistrationNumber: 'BRN-10029302',
    tin: 'TIN-0029381',
    category: 'Retail',
    ownershipType: 'Corporation',
    officialEmail: 'info@kigalipharmacy.rw',
    officialPhone: '0788123456',
    username: 'staff', // Matches static account staff username for testing
    passwordHash: 'TempPass123!',
    province: 'Kigali City',
    district: 'Nyarugenge',
    sector: 'Kiyovu',
    cell: 'Nyashyamba',
    village: 'Rugenge',
    gpsCoords: { lat: -1.94407, lng: 30.061885 },
    pharmacistName: 'Olivier Mugisha',
    pharmacistNid: '1199080012345678',
    pharmacistLicense: 'PH-LIC-2024-0091',
    pharmacistPhone: '0788123456',
    pharmacistEmail: 'jeanne@kigalipharmacy.rw',
    status: 'APPROVED',
    submissionDate: '2026-06-01',
    estimatedReviewTime: 'Approved',
    documents: [],
    timeline: [
      { event: 'Application Submitted', date: '2026-06-01', notes: 'Initial submission' },
      { event: 'Review Started', date: '2026-06-02', notes: 'MOH regulatory board review' },
      { event: 'Approved', date: '2026-06-03', notes: 'License issued and activated' }
    ]
  },
  {
    id: 'ph-002',
    pharmacyName: 'Remera City Medical',
    tradingName: 'RCM',
    licenseNumber: 'LIC-GAS-90238-2026',
    businessRegistrationNumber: 'BRN-20938102',
    tin: 'TIN-9820391',
    category: 'Retail',
    ownershipType: 'Sole Proprietorship',
    officialEmail: 'info@remeracitymedical.rw',
    officialPhone: '0788223344',
    username: 'remera_pharma',
    passwordHash: 'RemeraPass123!',
    province: 'Kigali City',
    district: 'Gasabo',
    sector: 'Remera',
    cell: 'Rukiri II',
    village: 'Kabuga',
    gpsCoords: { lat: -1.9587, lng: 30.1178 },
    pharmacistName: 'Marie Grace Ineza',
    pharmacistNid: '1198880012345678',
    pharmacistLicense: 'PH-LIC-2024-0238',
    pharmacistPhone: '0788223344',
    pharmacistEmail: 'olivier@remeracitymedical.rw',
    status: 'APPROVED',
    submissionDate: '2026-06-10',
    estimatedReviewTime: 'Approved',
    documents: [],
    timeline: [
      { event: 'Application Submitted', date: '2026-06-10', notes: 'Initial submission' },
      { event: 'Approved', date: '2026-06-12', notes: 'Approved by MoH inspector' }
    ]
  },
  {
    id: 'ph-003',
    pharmacyName: 'Nyarugenge Health Pharmacy',
    tradingName: 'Nyarugenge Health',
    licenseNumber: 'LIC-NYA-72819-2026',
    businessRegistrationNumber: 'BRN-30291028',
    tin: 'TIN-9182736',
    category: 'Retail',
    ownershipType: 'Partnership',
    officialEmail: 'info@nyarugengehealth.rw',
    officialPhone: '0788334455',
    username: 'nyarugenge_health',
    passwordHash: 'NyarugengePass123!',
    province: 'Kigali City',
    district: 'Nyarugenge',
    sector: 'Muhima',
    cell: 'Taba',
    village: 'Amahoro',
    gpsCoords: { lat: -1.9489, lng: 30.0583 },
    pharmacistName: 'Jean Paul Habimana',
    pharmacistNid: '1198580012345678',
    pharmacistLicense: 'PH-LIC-2023-0819',
    pharmacistPhone: '0788334455',
    pharmacistEmail: 'jeanpaul@nyarugengehealth.rw',
    status: 'APPROVED',
    submissionDate: '2026-06-15',
    estimatedReviewTime: 'Approved',
    documents: [],
    timeline: [
      { event: 'Application Submitted', date: '2026-06-15', notes: 'Initial submission' },
      { event: 'Approved', date: '2026-06-16', notes: 'Approved' }
    ]
  },
  {
    id: 'ph-004',
    pharmacyName: 'Gikondo District Pharmacy',
    tradingName: 'Gikondo District',
    licenseNumber: 'LIC-KIC-19238-2026',
    businessRegistrationNumber: 'BRN-48192038',
    tin: 'TIN-8273641',
    category: 'Retail',
    ownershipType: 'Partnership',
    officialEmail: 'gikondo@districtpharma.rw',
    officialPhone: '0788445566',
    username: 'manager', // Matches static account manager username for testing
    passwordHash: 'ManagerPass123!',
    province: 'Kigali City',
    district: 'Kicukiro',
    sector: 'Gikondo',
    cell: 'Kagunga',
    village: 'Marembo',
    gpsCoords: { lat: -1.9745, lng: 30.0812 },
    pharmacistName: 'Aimable Nsanzimana',
    pharmacistNid: '1198080012345678',
    pharmacistLicense: 'PH-LIC-2022-0482',
    pharmacistPhone: '0788445566',
    pharmacistEmail: 'aimable@gikondo.rw',
    status: 'SUSPENDED',
    statusNotes: 'Non-compliance with safety regulations: expired medicines found in inventory.',
    submissionDate: '2026-06-20',
    estimatedReviewTime: 'Suspended',
    documents: [],
    timeline: [
      { event: 'Application Submitted', date: '2026-06-20', notes: 'Initial submission' },
      { event: 'Approved', date: '2026-06-21', notes: 'Approved' },
      { event: 'Suspended', date: '2026-07-20', notes: 'Violation of MoH drug safety regulations' }
    ]
  },
  {
    id: 'ph-005',
    pharmacyName: 'MedPlus Kigali Heights',
    tradingName: 'MedPlus KH',
    licenseNumber: 'LIC-GAS-78901-2026',
    businessRegistrationNumber: 'BRN-82738192',
    tin: 'TIN-1928374',
    category: 'Retail',
    ownershipType: 'Corporation',
    officialEmail: 'kh@medplus.rw',
    officialPhone: '0788556677',
    username: 'medplus_kh',
    passwordHash: 'Medpass123!',
    province: 'Kigali City',
    district: 'Gasabo',
    sector: 'Kacyiru',
    cell: 'Kamutwa',
    village: 'Kamatamu',
    gpsCoords: { lat: -1.9515, lng: 30.0934 },
    pharmacistName: 'Dr. Christian Uwase',
    pharmacistNid: '1199380012345678',
    pharmacistLicense: 'PH-LIC-2025-0982',
    pharmacistPhone: '0788556677',
    pharmacistEmail: 'uwase@medplus.rw',
    status: 'PENDING_VERIFICATION',
    submissionDate: '2026-07-28',
    estimatedReviewTime: '3-5 business days',
    documents: [],
    timeline: [
      { event: 'Application Submitted', date: '2026-07-28', notes: 'Awaiting MoH document audit' }
    ]
  }
]

const getDynamicUsers = (): Record<string, MockAccount> => {
  const data = localStorage.getItem(DYNAMIC_USERS_KEY)
  return data ? JSON.parse(data) : {}
}

const getDynamicPharmacies = (): any[] => {
  const data = localStorage.getItem(DYNAMIC_PHARMACIES_KEY)
  if (!data) {
    localStorage.setItem(DYNAMIC_PHARMACIES_KEY, JSON.stringify(INITIAL_PHARMACIES))
    return INITIAL_PHARMACIES
  }
  return JSON.parse(data)
}

const saveDynamicPharmacies = (pharmacies: any[]) => {
  localStorage.setItem(DYNAMIC_PHARMACIES_KEY, JSON.stringify(pharmacies))
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
        const pharmaciesList = getDynamicPharmacies()
        
        // 1. First check if it matches a pharmacy username or email in the registrations database
        const pharmacy = pharmaciesList.find(
          (ph) => ph.username.toLowerCase() === idClean || ph.officialEmail.toLowerCase() === idClean
        )

        if (pharmacy) {
          if (pharmacy.passwordHash !== password) {
            reject(new Error('Invalid username/email or password. Please verify your credentials.'))
            return
          }

          // Check if pharmacy is approved
          if (pharmacy.status !== 'APPROVED') {
            reject(new Error(`PHARMACY_STATUS_ERROR:${JSON.stringify({
              status: pharmacy.status,
              pharmacyName: pharmacy.pharmacyName,
              submissionDate: pharmacy.submissionDate,
              estimatedReviewTime: pharmacy.estimatedReviewTime,
              statusNotes: pharmacy.statusNotes
            })}`))
            return
          }

          // Active Approved Pharmacy Manager User
          const authUser: AuthUser = {
            id: `usr_pharm_${pharmacy.id}`,
            username: pharmacy.username,
            email: pharmacy.officialEmail,
            name: pharmacy.pharmacistName,
            role: 'PHARMACY',
            position: 'Pharmacy Manager',
            permissions: ['VIEW_RESERVATIONS', 'CONFIRM_RESERVATION', 'DISPENSE_MEDICINE', 'VIEW_INVENTORY', 'MANAGE_INVENTORY', 'UPDATE_PRICING', 'MANAGE_STAFF', 'VIEW_PHARMACY_REPORTS'],
            pharmacyId: pharmacy.id,
            pharmacyName: pharmacy.pharmacyName,
            firstLogin: false,
          }

          const response: AuthResponse = {
            accessToken: `mock_jwt_access_token_for_${authUser.id}`,
            refreshToken: `mock_jwt_refresh_token_for_${authUser.id}`,
            user: authUser,
          }

          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(response))
          resolve(response)
          return
        }

        // 2. Lookup in standard static mock accounts and dynamic accounts
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

        // If the account has role = PHARMACY, we must verify the pharmacy store itself is APPROVED
        if (account.role === 'PHARMACY' && account.pharmacyId) {
          const matchedPharm = pharmaciesList.find((ph) => ph.id === account.pharmacyId)
          if (matchedPharm && matchedPharm.status !== 'APPROVED') {
            reject(new Error(`PHARMACY_STATUS_ERROR:${JSON.stringify({
              status: matchedPharm.status,
              pharmacyName: matchedPharm.pharmacyName,
              submissionDate: matchedPharm.submissionDate,
              estimatedReviewTime: matchedPharm.estimatedReviewTime,
              statusNotes: matchedPharm.statusNotes
            })}`))
            return
          }
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

        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(response))
        resolve(response)
      }, 1000)
    })
  },

  /**
   * Simulated Registration for Patient Citizens
   */
  registerPatient: async (userData: {
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

        // Check uniqueness across static, dynamic and pharmacies database
        const usernameExists = 
          Object.values(MOCK_ACCOUNTS).some((acc) => acc.username.toLowerCase() === usernameClean) ||
          Object.values(dynamicUsers).some((acc) => acc.username.toLowerCase() === usernameClean) ||
          getDynamicPharmacies().some((ph) => ph.username.toLowerCase() === usernameClean)

        if (usernameExists) {
          reject(new Error('Username is already taken by another account.'))
          return
        }

        if (emailClean) {
          const emailExists =
            Object.values(MOCK_ACCOUNTS).some((acc) => acc.email?.toLowerCase() === emailClean) ||
            Object.values(dynamicUsers).some((acc) => acc.email?.toLowerCase() === emailClean) ||
            getDynamicPharmacies().some((ph) => ph.officialEmail.toLowerCase() === emailClean)

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
          phone: userData.phone,
          dob: userData.dob,
          gender: userData.gender,
          province: userData.province,
          district: userData.district,
          sector: userData.sector,
          cell: userData.cell,
          village: userData.village,
        } as any

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

        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(response))
        resolve(response)
      }, 1500)
    })
  },

  /**
   * Simulated Professional Pharmacy Onboarding
   */
  registerPharmacy: async (pharmacyData: {
    pharmacyName: string
    tradingName?: string
    licenseNumber: string
    businessRegistrationNumber: string
    tin: string
    category: string
    ownershipType: string
    officialEmail: string
    officialPhone: string
    username: string
    passwordHash: string
    province: string
    district: string
    sector: string
    cell: string
    village: string
    gpsCoords?: { lat: number; lng: number } | null
    pharmacistName: string
    pharmacistNid: string
    pharmacistLicense: string
    pharmacistPhone: string
    pharmacistEmail: string
    documents: Array<{ name: string; fileType: string; fileSize: number }>
  }): Promise<any> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const dynamicUsers = getDynamicUsers()
        const pharmaciesList = getDynamicPharmacies()
        const usernameClean = pharmacyData.username.toLowerCase().trim()
        const emailClean = pharmacyData.officialEmail.toLowerCase().trim()

        // Uniqueness check
        const usernameExists =
          Object.values(MOCK_ACCOUNTS).some((acc) => acc.username.toLowerCase() === usernameClean) ||
          Object.values(dynamicUsers).some((acc) => acc.username.toLowerCase() === usernameClean) ||
          pharmaciesList.some((ph) => ph.username.toLowerCase() === usernameClean)

        if (usernameExists) {
          reject(new Error('Pharmacy username is already taken.'))
          return
        }

        const emailExists =
          Object.values(MOCK_ACCOUNTS).some((acc) => acc.email?.toLowerCase() === emailClean) ||
          Object.values(dynamicUsers).some((acc) => acc.email?.toLowerCase() === emailClean) ||
          pharmaciesList.some((ph) => ph.officialEmail.toLowerCase() === emailClean)

        if (emailExists) {
          reject(new Error('Pharmacy official email is already registered.'))
          return
        }

        // Add application
        const newPharmId = `ph-${Math.floor(100 + Math.random() * 900)}`
        const submissionDate = new Date().toISOString().split('T')[0]
        
        const newPharmacy = {
          ...pharmacyData,
          id: newPharmId,
          status: 'PENDING_VERIFICATION',
          submissionDate,
          estimatedReviewTime: '3-5 business days',
          timeline: [
            { event: 'Application Submitted', date: submissionDate, notes: 'Onboarding wizard successfully completed.' }
          ]
        }

        pharmaciesList.push(newPharmacy)
        saveDynamicPharmacies(pharmaciesList)

        resolve(newPharmacy)
      }, 1500)
    })
  },

  /**
   * Retrieves listing of all pharmacies (Gov verification access)
   */
  getAllPharmacies: async (): Promise<any[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getDynamicPharmacies())
      }, 300)
    })
  },

  /**
   * Regulatory Actions: MOH Verification Controls
   */
  approvePharmacy: async (pharmacyId: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const pharmaciesList = getDynamicPharmacies()
        const phIdx = pharmaciesList.findIndex((ph) => ph.id === pharmacyId)
        if (phIdx === -1) {
          reject(new Error('Pharmacy not found.'))
          return
        }

        const today = new Date().toISOString().split('T')[0]
        pharmaciesList[phIdx].status = 'APPROVED'
        pharmaciesList[phIdx].timeline.push({
          event: 'Approved',
          date: today,
          notes: 'MOH regulatory audit passed. Pharmacy credentials activated.'
        })

        saveDynamicPharmacies(pharmaciesList)
        resolve(pharmaciesList[phIdx])
      }, 800)
    })
  },

  rejectPharmacy: async (pharmacyId: string, notes?: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const pharmaciesList = getDynamicPharmacies()
        const phIdx = pharmaciesList.findIndex((ph) => ph.id === pharmacyId)
        if (phIdx === -1) {
          reject(new Error('Pharmacy not found.'))
          return
        }

        const today = new Date().toISOString().split('T')[0]
        pharmaciesList[phIdx].status = 'REJECTED'
        pharmaciesList[phIdx].statusNotes = notes || 'MOH regulatory requirements not met.'
        pharmaciesList[phIdx].timeline.push({
          event: 'Rejected',
          date: today,
          notes: notes || 'Rejected by MOH auditor.'
        })

        saveDynamicPharmacies(pharmaciesList)
        resolve(pharmaciesList[phIdx])
      }, 800)
    })
  },

  suspendPharmacy: async (pharmacyId: string, notes?: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const pharmaciesList = getDynamicPharmacies()
        const phIdx = pharmaciesList.findIndex((ph) => ph.id === pharmacyId)
        if (phIdx === -1) {
          reject(new Error('Pharmacy not found.'))
          return
        }

        const today = new Date().toISOString().split('T')[0]
        pharmaciesList[phIdx].status = 'SUSPENDED'
        pharmaciesList[phIdx].statusNotes = notes || 'Pharmacy suspended for compliance violations.'
        pharmaciesList[phIdx].timeline.push({
          event: 'Suspended',
          date: today,
          notes: notes || 'Suspension applied by MOH compliance division.'
        })

        saveDynamicPharmacies(pharmaciesList)
        resolve(pharmaciesList[phIdx])
      }, 800)
    })
  },

  reactivatePharmacy: async (pharmacyId: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const pharmaciesList = getDynamicPharmacies()
        const phIdx = pharmaciesList.findIndex((ph) => ph.id === pharmacyId)
        if (phIdx === -1) {
          reject(new Error('Pharmacy not found.'))
          return
        }

        const today = new Date().toISOString().split('T')[0]
        pharmaciesList[phIdx].status = 'APPROVED'
        pharmaciesList[phIdx].timeline.push({
          event: 'Reactivated',
          date: today,
          notes: 'MOH review cleared. License reactivated.'
        })

        saveDynamicPharmacies(pharmaciesList)
        resolve(pharmaciesList[phIdx])
      }, 800)
    })
  },

  requestMoreInformation: async (pharmacyId: string, details: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const pharmaciesList = getDynamicPharmacies()
        const phIdx = pharmaciesList.findIndex((ph) => ph.id === pharmacyId)
        if (phIdx === -1) {
          reject(new Error('Pharmacy not found.'))
          return
        }

        const today = new Date().toISOString().split('T')[0]
        pharmaciesList[phIdx].status = 'MORE_INFO_REQUESTED'
        pharmaciesList[phIdx].statusNotes = details
        pharmaciesList[phIdx].timeline.push({
          event: 'Additional Info Requested',
          date: today,
          notes: `Auditor comment: ${details}`
        })

        saveDynamicPharmacies(pharmaciesList)
        resolve(pharmaciesList[phIdx])
      }, 800)
    })
  },

  getRegistrationStatus: async (identifier: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const idClean = identifier.toLowerCase().trim()
        const pharmaciesList = getDynamicPharmacies()
        const pharmacy = pharmaciesList.find(
          (ph) => ph.username.toLowerCase() === idClean || ph.officialEmail.toLowerCase() === idClean
        )
        if (!pharmacy) {
          reject(new Error('No pharmacy registration application matches this account.'))
          return
        }
        resolve(pharmacy)
      }, 600)
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
        const pharmaciesList = getDynamicPharmacies()
        
        const exists = 
          Object.values(MOCK_ACCOUNTS).some((acc) => acc.username.toLowerCase() === idClean || acc.email?.toLowerCase() === idClean) ||
          Object.values(dynamicUsers).some((acc) => acc.username.toLowerCase() === idClean || acc.email?.toLowerCase() === idClean) ||
          pharmaciesList.some((ph) => ph.username.toLowerCase() === idClean || ph.officialEmail.toLowerCase() === idClean)

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
        const pharmaciesList = getDynamicPharmacies()
        
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

        if (account) {
          account.passwordHash = newPass
          account.firstLogin = false

          if (isDynamic) {
            dynamicUsers[account.username.toLowerCase()] = account
            localStorage.setItem(DYNAMIC_USERS_KEY, JSON.stringify(dynamicUsers))
          }
          resolve()
          return
        }

        // Otherwise reset pharmacy password
        const phIdx = pharmaciesList.findIndex(
          (ph) => ph.username.toLowerCase() === idClean || ph.officialEmail.toLowerCase() === idClean
        )
        if (phIdx !== -1) {
          pharmaciesList[phIdx].passwordHash = newPass
          saveDynamicPharmacies(pharmaciesList)
          resolve()
          return
        }

        reject(new Error('Account not found.'))
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

        if (account) {
          Object.assign(account, updatedFields)

          if (isDynamic) {
            dynamicUsers[account.username.toLowerCase()] = account
            localStorage.setItem(DYNAMIC_USERS_KEY, JSON.stringify(dynamicUsers))
          }

          const sessionStr = localStorage.getItem(CURRENT_USER_KEY)
          if (sessionStr) {
            const session = JSON.parse(sessionStr)
            session.user = { ...session.user, ...updatedFields }
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(session))
          }

          resolve(account)
          return
        }

        // Check if updating pharmacy
        const pharmaciesList = getDynamicPharmacies()
        const phIdx = pharmaciesList.findIndex(
          (ph) => ph.username.toLowerCase() === idClean || ph.officialEmail.toLowerCase() === idClean
        )
        if (phIdx !== -1) {
          Object.assign(pharmaciesList[phIdx], updatedFields)
          saveDynamicPharmacies(pharmaciesList)
          resolve(pharmaciesList[phIdx])
          return
        }

        reject(new Error('User account not found.'))
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
    if (account) return account

    const pharmaciesList = getDynamicPharmacies()
    const pharmacy = pharmaciesList.find(
      (ph) => ph.username.toLowerCase() === idClean || ph.officialEmail.toLowerCase() === idClean
    )
    if (pharmacy) return pharmacy

    throw new Error('Account not found')
  }
}
