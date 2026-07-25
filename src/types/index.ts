export type UserRole = 'PATIENT' | 'PHARMACY' | 'INSURANCE' | 'GOVERNMENT' | 'ADMIN'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  nid?: string // National ID (crucial for Rwanda healthcare)
  licenseNumber?: string // For Pharmacy
  insuranceProvider?: string // For Insurance Company
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}
