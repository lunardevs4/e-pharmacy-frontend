import { apiClient } from '@/api/client'

// Backend responses are wrapped by TransformInterceptor as { success, data, timestamp }
const unwrap = (response: any) => response?.data?.data ?? response?.data

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
  insuredPatientId?: string
  medicineId?: string
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
  insuredPatient?: {
    fullName: string
    policyNumber: string
  }
  patient?: {
    user?: {
      firstName: string
      lastName: string
    }
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
    phone?: string
    email?: string
    district?: string
    province?: string
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
  newPatientsThisMonth: number
  totalAgreements: number
  totalTariffs: number
  outstandingPaymentsAmount: number
  approvalPercentage: number
  claimsGrowthPercentage: number
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
  // Dashboard — maps the backend summary payload onto the DashboardSummary shape
  async getDashboardSummary(insuranceId?: string): Promise<DashboardSummary> {
    const params = insuranceId ? { insuranceId } : {}
    const response = await apiClient.get('/insurance/summary', { params })
    const raw = unwrap(response) ?? {}
    const s = raw?.summary ?? raw ?? {}
    const cbs = raw?.claimsByStatus ?? {}
    const trend = raw?.monthlyTrend ?? []

    return {
      totalClaims:
        s.totalClaimsCount ??
        (cbs.PENDING ?? 0) + (cbs.APPROVED ?? 0) + (cbs.REJECTED ?? 0) + (cbs.PAID ?? 0),
      totalClaimsAmount: s.totalClaimsAmountThisMonth ?? 0,
      approvedClaims: s.approvedClaimsCount ?? cbs.APPROVED ?? 0,
      approvedClaimsAmount: s.approvedClaimsAmount ?? 0,
      pendingClaims: s.pendingClaimsCount ?? cbs.PENDING ?? 0,
      pendingClaimsAmount: s.pendingClaimsAmount ?? 0,
      rejectedClaims: s.rejectedClaimsCount ?? cbs.REJECTED ?? 0,
      rejectedClaimsAmount: s.rejectedClaimsAmount ?? 0,
      paidClaims: s.paidClaimsCount ?? cbs.PAID ?? 0,
      paidClaimsAmount: s.paidClaimsAmount ?? 0,
      totalPatients: s.totalInsuredPatients ?? 0,
      newPatientsThisMonth: s.newPatientsThisMonth ?? 0,
      totalAgreements: s.totalActiveAgreements ?? s.pharmaciesAwaitingPayout ?? 0,
      totalTariffs: s.totalCoveredTariffs ?? 0,
      outstandingPaymentsAmount: s.outstandingPaymentsAmount ?? 0,
      approvalPercentage: s.approvalPercentage ?? 0,
      claimsGrowthPercentage: s.claimsGrowthPercentage ?? 0,
      recentClaims: raw?.recentClaims ?? [],
      claimsByStatus: {
        PENDING: cbs.PENDING ?? 0,
        APPROVED: cbs.APPROVED ?? 0,
        REJECTED: cbs.REJECTED ?? 0,
        PAID: cbs.PAID ?? 0,
      },
      claimsTrend: trend.map((t: any) => ({
        month: t.month,
        count: t.volume ?? 0,
        amount: t.value ?? 0,
      })),
    }
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
    const raw = unwrap(response) ?? {}
    if (Array.isArray(raw)) return { data: raw, meta: {} }
    if (Array.isArray(raw?.data)) return { data: raw.data, meta: raw.meta ?? {} }
    return { data: [], meta: {} }
  },

  async getClaimById(id: string): Promise<InsuranceClaim> {
    const response = await apiClient.get(`/insurance/claims/${id}`)
    return unwrap(response)
  },

  async createClaim(data: {
    insuranceId: string
    pharmacyId: string
    insuredPatientId?: string
    patientId?: string
    prescriptionId?: string
    reservationId?: string
    medicineId: string
    quantity: number
    unitPrice: number
    notes?: string
  }): Promise<InsuranceClaim> {
    const response = await apiClient.post('/insurance/claims', data)
    return unwrap(response)
  },

  async updateClaimStatus(
    id: string,
    data: { status: string; rejectionReason?: string },
  ): Promise<InsuranceClaim> {
    const response = await apiClient.patch(`/insurance/claims/${id}/status`, data)
    return unwrap(response)
  },

  async batchPayClaims(data: {
    claimIds: string[]
  }): Promise<{ total: number; successful: number; failed: number; results: any[] }> {
    const response = await apiClient.post('/insurance/claims/batch-pay', data)
    return unwrap(response)
  },

  async getOutstandingPayments(pharmacyId?: string): Promise<any> {
    const params = pharmacyId ? { pharmacyId } : {}
    const response = await apiClient.get('/insurance/claims/outstanding', { params })
    return unwrap(response)
  },

  // Pharmacy Agreements
  async getAgreements(params?: {
    insuranceId?: string
    pharmacyId?: string
    status?: string
  }): Promise<PharmacyAgreement[]> {
    const response = await apiClient.get('/insurance/pharmacies', { params })
    const raw = unwrap(response)
    return Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : []
  },

  async getAgreementById(id: string): Promise<PharmacyAgreement> {
    const response = await apiClient.get(`/insurance/pharmacies/agreements/${id}`)
    return unwrap(response)
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
    return unwrap(response)
  },

  async updateAgreement(id: string, data: Partial<any>): Promise<PharmacyAgreement> {
    const response = await apiClient.patch(`/insurance/pharmacies/agreements/${id}`, data)
    return unwrap(response)
  },

  async getPharmacyClaimsSummary(pharmacyId: string): Promise<any> {
    const response = await apiClient.get(`/insurance/pharmacies/${pharmacyId}/claims-summary`)
    return unwrap(response)
  },

  async syncTariffUpdates(insuranceId: string): Promise<{ synced: number; failed: number }> {
    const response = await apiClient.post(`/insurance/pharmacies/sync-tariffs/${insuranceId}`)
    return unwrap(response)
  },

  // Tariffs
  async getTariffs(params?: {
    insuranceId?: string
    medicineId?: string
    status?: string
  }): Promise<MedicineTariff[]> {
    const response = await apiClient.get('/insurance/tariffs', { params })
    const raw = unwrap(response)
    return Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : []
  },

  async getTariffById(id: string): Promise<MedicineTariff> {
    const response = await apiClient.get(`/insurance/tariffs/${id}`)
    return unwrap(response)
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
    return unwrap(response)
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
    return unwrap(response)
  },

  async updateTariff(id: string, data: Partial<any>): Promise<MedicineTariff> {
    const response = await apiClient.patch(`/insurance/tariffs/${id}`, data)
    return unwrap(response)
  },

  async calculateCopay(
    insuranceId: string,
    medicineId: string,
    retailPrice: number,
  ): Promise<InsuranceCoverage> {
    const response = await apiClient.get('/insurance/tariffs/calculate-copay', {
      params: { insuranceId, medicineId, retailPrice },
    })
    return unwrap(response)
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
    const raw = unwrap(response) ?? {}
    if (Array.isArray(raw)) return { data: raw, meta: {} }
    if (Array.isArray(raw?.data)) return { data: raw.data, meta: raw.meta ?? {} }
    return { data: [], meta: {} }
  },

  async getPatientById(id: string): Promise<InsuredPatient> {
    const response = await apiClient.get(`/insurance/patients/${id}`)
    return unwrap(response)
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
    return unwrap(response)
  },

  async updatePatient(id: string, data: Partial<any>): Promise<InsuredPatient> {
    const response = await apiClient.patch(`/insurance/patients/${id}`, data)
    return unwrap(response)
  },

  async verifyPolicy(policyNumber: string, nationalId?: string): Promise<any> {
    const data = nationalId ? { policyNumber, nationalId } : { policyNumber }
    const response = await apiClient.post('/insurance/patients/verify', data)
    return unwrap(response)
  },

  async searchByNationalId(nationalId: string): Promise<InsuredPatient[]> {
    const response = await apiClient.get(`/insurance/patients/search/national-id/${nationalId}`)
    const raw = unwrap(response)
    return Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : []
  },

  // Providers
  async getProviders(): Promise<InsuranceProvider[]> {
    const response = await apiClient.get('/insurance/providers')
    const raw = unwrap(response)
    return Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : []
  },
}
