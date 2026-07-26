export type UserRole = 'PATIENT' | 'PHARMACY' | 'INSURANCE' | 'GOVERNMENT' | 'ADMIN'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  nid?: string // National ID (crucial for Rwanda healthcare)
  licenseNumber?: string // For Pharmacy
  insuranceProvider?: string // For Insurance Company
  firstLogin?: boolean // Mandatory first-time password change flag
  position?: string // Employee position (e.g. Pharmacist)
  permissions?: string[] // Employee permissions array
  pharmacyId?: string // Link to pharmacy organization
  pharmacyName?: string // Name of the pharmacy
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}
