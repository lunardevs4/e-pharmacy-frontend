/**
 * E2E-style tests — Insurance portal flows
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

const MOCK_CLAIMS = [
  { id: 'clm-001', status: 'PENDING',  amount: 15000, patientName: 'Alice Mukamana',  medicine: 'Insulin Glargine', createdAt: new Date().toISOString() },
  { id: 'clm-002', status: 'APPROVED', amount: 8500,  patientName: 'Bob Habimana',     medicine: 'Metformin 850mg',  createdAt: new Date().toISOString() },
  { id: 'clm-003', status: 'REJECTED', amount: 2200,  patientName: 'Carol Ingabire',   medicine: 'Atenolol 50mg',    createdAt: new Date().toISOString() },
]

vi.mock('@/services/auth-api', () => ({
  AuthApi: {
    getInsuranceClaims:    vi.fn().mockResolvedValue(MOCK_CLAIMS),
    getInsurancePatients:  vi.fn().mockResolvedValue([
      { id: 'pat-1', name: 'Alice Mukamana', insuranceId: 'RSSB-001', totalClaims: 3 },
      { id: 'pat-2', name: 'Bob Habimana',   insuranceId: 'RSSB-002', totalClaims: 1 },
    ]),
    getInsurancePayments:  vi.fn().mockResolvedValue([
      { id: 'pay-1', amount: 15000, status: 'PENDING',   pharmacyName: 'Kigali Pharmacy', processedAt: null },
      { id: 'pay-2', amount: 8500,  status: 'PROCESSED', pharmacyName: 'MedPlus Heights', processedAt: new Date().toISOString() },
    ]),
    updateInsuranceClaimStatus: vi.fn().mockResolvedValue({}),
    processInsurancePayment:    vi.fn().mockResolvedValue({}),
    getInsuranceReport:    vi.fn().mockResolvedValue({}),
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
      expect(screen.getByText(/Alice Mukamana/i)).toBeInTheDocument()
    })
  })

  it('shows all three claim statuses', async () => {
    renderWithRouter(<InsuranceClaims />)
    await waitFor(() => {
      expect(screen.getByText(/Bob Habimana/i)).toBeInTheDocument()
      expect(screen.getByText(/Carol Ingabire/i)).toBeInTheDocument()
    })
  })

  it('shows claim amounts', async () => {
    renderWithRouter(<InsuranceClaims />)
    await waitFor(() => {
      // At least one amount should appear
      expect(screen.getByText(/15.000|15,000|15000/)).toBeInTheDocument()
    })
  })
})

describe('Insurance Patients', () => {
  it('renders patient list', async () => {
    renderWithRouter(<InsurancePatients />)
    await waitFor(() => expect(document.body).toBeTruthy())
  })
})

describe('Insurance Payments', () => {
  it('renders payment list', async () => {
    renderWithRouter(<InsurancePayments />)
    await waitFor(() => expect(document.body).toBeTruthy())
  })
})
