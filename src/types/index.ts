export type UserRole = 'PATIENT' | 'PHARMACY' | 'INSURANCE' | 'GOVERNMENT' | 'ADMIN'

export interface User {
  id: string
  username: string
  email?: string
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
  pickupCode: string
  pickupDeadline: string
  status: 'PENDING' | 'RESERVED' | 'CONFIRMED' | 'COLLECTED' | 'CANCELLED' | 'EXPIRED'
  createdAt: string
}
