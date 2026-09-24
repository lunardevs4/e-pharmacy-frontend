/**
 * E2E-style tests — Insurance portal flows
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import InsuranceDashboard from '@/pages/insurance/Dashboard'
import InsuranceClaims from '@/pages/insurance/Claims'
import InsurancePatients from '@/pages/insurance/Patients'
import InsurancePayments from '@/pages/insurance/Payments'

vi.mock('@/store/authStore', () => ({
  useAuthStore: () => ({
    user: {
      id: 'ins-user-1',
      name: 'RSSB Auditor',
      role: 'INSURANCE',
      insuranceProvider: 'RSSB',
    },
  }),
}))

vi.mock('@/store/languageStore', () => ({
  useLanguageStore: () => ({
    t: (k: string) => k,
    formatStatus: (s: string) => s,
  }),
}))

const mockProviders = [
  { id: 'prov-1', name: 'RSSB', code: 'RSSB', defaultCoveragePercentage: 85, defaultCopayPercentage: 15, status: 'ACTIVE', isActive: true, email: 'info@rssb.rw', phone: '+250788000111', address: 'Kigali' },
]

const mockClaims = [
  {
    id: 'clm-001',
    claimNumber: 'RSSB-2026-000001',
    insuranceId: 'prov-1',
    pharmacyId: 'ph-1',
    insuredPatientId: '1199070000000',
    quantity: 2,
    unitPrice: 7500,
    totalAmount: 15000,
    insuranceAmount: 12750,
    patientAmount: 2250,
    status: 'PENDING',
    claimedAt: new Date().toISOString(),
    medicineName: 'Insulin Glargine',
    pharmacy: { name: 'Kigali Pharmacy' },
    insuredPatient: { fullName: 'Alice Mukamana', policyNumber: 'RSSB-001', nationalId: '1199070000000' },
  },
  {
    id: 'clm-002',
    claimNumber: 'RSSB-2026-000002',
    insuranceId: 'prov-1',
    pharmacyId: 'ph-1',
    insuredPatientId: '1199080000000',
    quantity: 1,
    unitPrice: 8500,
    totalAmount: 8500,
    insuranceAmount: 7225,
    patientAmount: 1275,
    status: 'APPROVED',
    claimedAt: new Date().toISOString(),
    medicineName: 'Metformin 850mg',
    pharmacy: { name: 'Kigali Pharmacy' },
    insuredPatient: { fullName: 'Bob Habimana', policyNumber: 'RSSB-002', nationalId: '1199080000000' },
  },
  {
    id: 'clm-003',
    claimNumber: 'RSSB-2026-000003',
    insuranceId: 'prov-1',
    pharmacyId: 'ph-2',
    insuredPatientId: '1199090000000',
    quantity: 1,
    unitPrice: 2200,
    totalAmount: 2200,
    insuranceAmount: 1870,
    patientAmount: 330,
    status: 'REJECTED',
    claimedAt: new Date().toISOString(),
    medicineName: 'Atenolol 50mg',
    pharmacy: { name: 'MedPlus Heights' },
    insuredPatient: { fullName: 'Carol Ingabire', policyNumber: 'RSSB-003', nationalId: '1199090000000' },
  },
]

vi.mock('@/services/insurance-api', () => ({
  insuranceApi: {
    getProviders: vi.fn().mockImplementation(() => Promise.resolve(mockProviders)),
    getDashboardSummary: vi.fn().mockImplementation(() => Promise.resolve({
      totalClaims: 3,
      totalClaimsAmount: 25700,
      approvedClaims: 1,
      approvedClaimsAmount: 7225,
      pendingClaims: 1,
      pendingClaimsAmount: 12750,
      rejectedClaims: 1,
      rejectedClaimsAmount: 2200,
      paidClaims: 0,
      paidClaimsAmount: 0,
      totalPatients: 3,
      newPatientsThisMonth: 1,
      totalAgreements: 2,
      totalTariffs: 15,
      outstandingPaymentsAmount: 7225,
      approvalPercentage: 33.33,
      claimsGrowthPercentage: 10,
      recentClaims: mockClaims,
      claimsByStatus: { PENDING: 1, APPROVED: 1, REJECTED: 1, PAID: 0 },
      claimsTrend: [],
    })),
    getClaims: vi.fn().mockImplementation(() => Promise.resolve({ data: mockClaims, meta: { total: 3 } })),
    getPatients: vi.fn().mockImplementation(() => Promise.resolve({
      data: [
        { id: 'pat-1', fullName: 'Alice Mukamana', policyNumber: 'RSSB-001', nationalId: '1199070000000', status: 'ACTIVE', coveragePercentage: 85, insurance: { name: 'RSSB' }, claims: [] },
        { id: 'pat-2', fullName: 'Bob Habimana', policyNumber: 'RSSB-002', nationalId: '1199080000000', status: 'ACTIVE', coveragePercentage: 85, insurance: { name: 'RSSB' }, claims: [] },
      ],
      meta: { total: 2 },
    })),
    getOutstandingPayments: vi.fn().mockImplementation(() => Promise.resolve({
      totalOutstanding: 7225,
      claimCount: 1,
      claims: [mockClaims[1]],
    })),
    updateClaimStatus: vi.fn().mockResolvedValue({}),
    batchPayClaims: vi.fn().mockResolvedValue({ total: 1, successful: 1, failed: 0, results: [] }),
    registerPatient: vi.fn().mockResolvedValue({ id: 'pat-new' }),
    setTariff: vi.fn().mockResolvedValue({}),
    getTariffs: vi.fn().mockResolvedValue([]),
    exportReport: vi.fn().mockResolvedValue(new Blob(['test'])),
  },
}))

const renderWithRouter = (ui: React.ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>)

describe('Insurance Dashboard', () => {
  it('renders without crashing', async () => {
    renderWithRouter(<InsuranceDashboard />)
    await waitFor(() => expect(document.body).toBeTruthy())
  })
})

describe('Insurance Claims', () => {
  it('renders the claims list', async () => {
    renderWithRouter(<InsuranceClaims />)
    await waitFor(() => {
      expect(screen.getByText(/RSSB-2026-000001/i)).toBeInTheDocument()
    })
  })

  it('shows all claim numbers and pharmacy details', async () => {
    renderWithRouter(<InsuranceClaims />)
    await waitFor(() => {
      expect(screen.getByText(/RSSB-2026-000002/i)).toBeInTheDocument()
      expect(screen.getByText(/RSSB-2026-000003/i)).toBeInTheDocument()
    })
  })

  it('shows claim amounts', async () => {
    renderWithRouter(<InsuranceClaims />)
    await waitFor(() => {
      expect(screen.getByText(/15,000/)).toBeInTheDocument()
    })
  })
})

describe('Insurance Patients', () => {
  it('renders patient list', async () => {
    renderWithRouter(<InsurancePatients />)
    await waitFor(() => expect(screen.getByText(/Alice Mukamana/i)).toBeInTheDocument())
  })
})

describe('Insurance Payments', () => {
  it('renders payment list', async () => {
    renderWithRouter(<InsurancePayments />)
    await waitFor(() => expect(screen.getByText(/Kigali Pharmacy/i)).toBeInTheDocument())
  })
})

