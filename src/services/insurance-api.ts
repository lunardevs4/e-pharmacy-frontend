import { apiClient } from '@/api/client'

export interface InsuranceProvider {
  id: string
  name: string
  code: string
  email: string
  phone: string
  address: string
  defaultCoveragePercentage: number
  defaultCopayPercentage: number
  status: string
  isActive: boolean
}

export interface InsuredPatient {
  id: string
  insuranceId: string
  patientId?: string
  policyNumber: string
  nationalId: string
  fullName: string
  dateOfBirth?: string
  gender?: string
  phone?: string
  coveragePercentage?: number
  startDate: string
  endDate?: string
  status: string
  insurance?: InsuranceProvider
  claims?: any[]
}

export interface InsuranceClaim {
  id: string
  claimNumber: string
  insuranceId: string
  pharmacyId: string
  insuredPatientId: string
  medicineId: string
  quantity: number
  unitPrice: number
  totalAmount: number
  insuranceAmount: number
  patientAmount: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID'
  claimedAt: string
  processedAt?: string
  paidAt?: string
  rejectionReason?: string
  medicine?: {
    tradeName: string
    genericName: string
  }
  pharmacy?: {
    name: string
  }
}

export interface PharmacyAgreement {
  id: string
  insuranceId: string
  pharmacyId: string
  contractNumber: string
  discountRate: number
  customCoverageRate?: number
  startDate: string
  endDate?: string
  status: string
  insurance?: InsuranceProvider
  pharmacy?: {
    name: string
    address: string
  }
}

export interface MedicineTariff {
  id: string
  insuranceId: string
  medicineId: string
  coveredPrice: number
  coveragePercentage: number
  copayPercentage: number
  fixedCopayAmount?: number
  isCovered: boolean
  requiresPreAuth: boolean
  status: string
  effectiveDate: string
  medicine?: {
    tradeName: string
    genericName: string
  }
}

export interface InsuranceCoverage {
  isCovered: boolean
  hasAgreement: boolean
  insurancePays: number
  patientPays: number
  coveragePercentage?: number
  copayPercentage?: number
  requiresPreAuth?: boolean
  coveredPrice?: number
  insuranceName?: string
  message?: string
}

export interface DashboardSummary {
  totalClaims: number
  totalClaimsAmount: number
  approvedClaims: number
  approvedClaimsAmount: number
  pendingClaims: number
  pendingClaimsAmount: number
  rejectedClaims: number
  rejectedClaimsAmount: number
  paidClaims: number
  paidClaimsAmount: number
  totalPatients: number
  totalAgreements: number
  totalTariffs: number
  claimsThisMonth: number
  claimsAmountThisMonth: number
  recentClaims: InsuranceClaim[]
  claimsByStatus: {
    PENDING: number
    APPROVED: number
    REJECTED: number
    PAID: number
  }
  claimsTrend: {
    month: string
    count: number
    amount: number
  }[]
}

export const insuranceApi = {
  // Dashboard
  async getDashboardSummary(insuranceId?: string): Promise<DashboardSummary> {
    const params = insuranceId ? { insuranceId } : {}
    const response = await apiClient.get('/insurance/summary', { params })
    return response.data
  },

  // Claims
  async getClaims(params?: {
    insuranceId?: string
    pharmacyId?: string
    status?: string
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
  }): Promise<{ data: InsuranceClaim[]; meta: any }> {
    const response = await apiClient.get('/insurance/claims', { params })
    return response.data
  },

  async getClaimById(id: string): Promise<InsuranceClaim> {
    const response = await apiClient.get(`/insurance/claims/${id}`)
    return response.data
  },

  async createClaim(data: {
    insuranceId: string
    pharmacyId: string
    insuredPatientId: string
    medicineId: string
    quantity: number
    unitPrice: number
  }): Promise<InsuranceClaim> {
    const response = await apiClient.post('/insurance/claims', data)
    return response.data
  },

  async updateClaimStatus(id: string, data: { status: string; rejectionReason?: string }): Promise<InsuranceClaim> {
    const response = await apiClient.patch(`/insurance/claims/${id}/status`, data)
    return response.data
  },

  async batchPayClaims(data: { claimIds: string[] }): Promise<{ success: number; failed: number }> {
    const response = await apiClient.post('/insurance/claims/batch-pay', data)
    return response.data
  },

  async getOutstandingPayments(pharmacyId?: string): Promise<any[]> {
    const params = pharmacyId ? { pharmacyId } : {}
    const response = await apiClient.get('/insurance/claims/outstanding', { params })
    return response.data
  },

  // Pharmacy Agreements
  async getAgreements(params?: {
    insuranceId?: string
    pharmacyId?: string
    status?: string
  }): Promise<PharmacyAgreement[]> {
    const response = await apiClient.get('/insurance/pharmacies', { params })
    return response.data
  },

  async getAgreementById(id: string): Promise<PharmacyAgreement> {
    const response = await apiClient.get(`/insurance/pharmacies/agreements/${id}`)
    return response.data
  },

  async createAgreement(data: {
    insuranceId: string
    pharmacyId: string
    contractNumber: string
    discountRate: number
    customCoverageRate?: number
    startDate: string
    endDate?: string
  }): Promise<PharmacyAgreement> {
    const response = await apiClient.post('/insurance/pharmacies/agreement', data)
    return response.data
  },

  async updateAgreement(id: string, data: Partial<any>): Promise<PharmacyAgreement> {
    const response = await apiClient.patch(`/insurance/pharmacies/agreements/${id}`, data)
    return response.data
  },

  async getPharmacyClaimsSummary(pharmacyId: string): Promise<any> {
    const response = await apiClient.get(`/insurance/pharmacies/${pharmacyId}/claims-summary`)
    return response.data
  },

  async syncTariffUpdates(insuranceId: string): Promise<{ synced: number; failed: number }> {
    const response = await apiClient.post(`/insurance/pharmacies/sync-tariffs/${insuranceId}`)
    return response.data
  },

  // Tariffs
  async getTariffs(params?: {
    insuranceId?: string
    medicineId?: string
    status?: string
  }): Promise<MedicineTariff[]> {
    const response = await apiClient.get('/insurance/tariffs', { params })
    return response.data
  },

  async getTariffById(id: string): Promise<MedicineTariff> {
    const response = await apiClient.get(`/insurance/tariffs/${id}`)
    return response.data
  },

  async setTariff(data: {
    insuranceId: string
    medicineId: string
    coveredPrice: number
    coveragePercentage: number
    copayPercentage?: number
    fixedCopayAmount?: number
    isCovered: boolean
    requiresPreAuth: boolean
    effectiveDate: string
  }): Promise<MedicineTariff> {
    const response = await apiClient.post('/insurance/tariffs', data)
    return response.data
  },

  async batchUpdateTariffs(data: {
    insuranceId: string
    tariffs: Array<{
      medicineId: string
      coveredPrice: number
      coveragePercentage: number
      isCovered: boolean
    }>
  }): Promise<{ updated: number; failed: number }> {
    const response = await apiClient.post('/insurance/tariffs/batch', data)
    return response.data
  },

  async updateTariff(id: string, data: Partial<any>): Promise<MedicineTariff> {
    const response = await apiClient.patch(`/insurance/tariffs/${id}`, data)
    return response.data
  },

  async calculateCopay(insuranceId: string, medicineId: string, retailPrice: number): Promise<InsuranceCoverage> {
    const response = await apiClient.get('/insurance/tariffs/calculate-copay', {
      params: { insuranceId, medicineId, retailPrice }
    })
    return response.data
  },

  // Patients
  async getPatients(params?: {
    insuranceId?: string
    status?: string
    search?: string
    page?: number
    limit?: number
  }): Promise<{ data: InsuredPatient[]; meta: any }> {
    const response = await apiClient.get('/insurance/patients', { params })
    return response.data
  },

  async getPatientById(id: string): Promise<InsuredPatient> {
    const response = await apiClient.get(`/insurance/patients/${id}`)
    return response.data
  },

  async registerPatient(data: {
    insuranceId: string
    patientId?: string
    policyNumber: string
    nationalId: string
    fullName: string
    dateOfBirth?: string
    gender?: string
    phone?: string
    coveragePercentage?: number
    startDate?: string
    endDate?: string
    dependentName?: string
    dependentRelationship?: string
  }): Promise<InsuredPatient> {
    const response = await apiClient.post('/insurance/patients', data)
    return response.data
  },

  async updatePatient(id: string, data: Partial<any>): Promise<InsuredPatient> {
    const response = await apiClient.patch(`/insurance/patients/${id}`, data)
    return response.data
  },

  async verifyPolicy(policyNumber: string, nationalId?: string): Promise<any> {
    const data = nationalId ? { policyNumber, nationalId } : { policyNumber }
    const response = await apiClient.post('/insurance/patients/verify', data)
    return response.data
  },

  async searchByNationalId(nationalId: string): Promise<InsuredPatient[]> {
    const response = await apiClient.get(`/insurance/patients/search/national-id/${nationalId}`)
    return response.data
  },

  // Providers
  async getProviders(): Promise<InsuranceProvider[]> {
    const response = await apiClient.get('/insurance/providers')
    return response.data
  }
}
