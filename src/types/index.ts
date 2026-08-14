export type UserRole = 'PATIENT' | 'PHARMACY' | 'PHARMACY_OWNER' | 'PHARMACIST' | 'GOVERNMENT' | 'INSURANCE' | 'ADMIN'

export interface PatientProfile {
  id?: string
  userId?: string
  medicalProfile?: string | null
  address?: string | null
  dateOfBirth?: string | null
  gender?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface PharmacySummary {
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

export interface User {
  id: string
  username: string
  email?: string
  name: string
  firstName?: string
  lastName?: string
  role: UserRole
  phone?: string
  nid?: string // National ID (crucial for Rwanda healthcare)
  licenseNumber?: string // For Pharmacy
  insuranceProvider?: string // For Insurance Company
  firstLogin?: boolean // Mandatory first-time password change flag
  position?: string // Employee position (e.g. Pharmacist)
  permissions?: string[] // Employee permissions array
  pharmacyId?: string // Link to pharmacy organization
  pharmacyName?: string // Name of the pharmacy
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
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
  patient?: PatientProfile
  pharmacy?: PharmacySummary
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface Medicine {
  id: string
  name: string
  genericName: string
  tradeNames: string[]
  category: string
  manufacturer: string
  prescriptionRequired: boolean
  uses: string
  dosage: string
  warnings: string
  sideEffects: string
  interactions: string
  storage: string
}

export interface PharmacyStock {
  pharmacyId: string
  pharmacyName: string
  rating: number
  isOpen: boolean
  distance: number
  price: number
  stock: number
  stockStatus: 'HIGH' | 'LIMITED' | 'ALMOST_OUT' | 'OUT_OF_STOCK'
  insuranceAccepted: string[]
  lat: number
  lng: number
  locationText: string
}

export interface Reservation {
  id: string
  medicineId: string
  medicineName: string
  pharmacyId: string
  pharmacyName: string
  quantity: number
  insuranceProvider: string
  insuranceId: string
  prescriptionFileName?: string
  totalPrice: number
  insurancePays: number
  patientPays: number
  pickupDeadline: string
  status: 'PENDING' | 'RESERVED' | 'CONFIRMED' | 'COLLECTED' | 'CANCELLED' | 'EXPIRED'
  createdAt: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'RESERVATION' | 'PRESCRIPTION' | 'SECURITY' | 'SYSTEM'
  read: boolean
  createdAt: string
}

export interface SearchHistoryItem {
  id: string
  query: string
  category: string
  timestamp: string
}
