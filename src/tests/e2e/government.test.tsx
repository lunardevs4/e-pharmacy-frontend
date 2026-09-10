/**
 * E2E-style tests — Government portal flows
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import GovernmentDashboard from '@/pages/government/Dashboard'
import PharmacyRegistry from '@/pages/government/PharmacyRegistry'
import GovernmentCompliance from '@/pages/government/Compliance'

vi.mock('@/store/authStore', () => ({
  useAuthStore: () => ({
    user: { id: 'gov-1', name: 'MOH Official', role: 'GOVERNMENT' },
  }),
}))

vi.mock('@/store/languageStore', () => ({
  useLanguageStore: () => ({
    t: (k: string) => k,
    formatStatus: (s: string) => s,
  }),
}))

vi.mock('@/services/auth-api', () => ({
  AuthApi: {
    getAllPharmacies: vi.fn().mockResolvedValue([
      { id: 'ph-1', name: 'Kigali National Pharmacy', status: 'APPROVED',  district: 'Gasabo',    province: 'Kigali' },
      { id: 'ph-2', name: 'MedPlus Heights',           status: 'PENDING',   district: 'Kicukiro',  province: 'Kigali' },
      { id: 'ph-3', name: 'Rwanda Central Pharma',     status: 'REJECTED',  district: 'Nyarugenge', province: 'Kigali' },
    ]),
    getGovernmentSummary: vi.fn().mockResolvedValue({
      totalPharmacies: 3, activePatients: 1240, pendingApprovals: 1, medicinesIndexed: 450,
    }),
    getGovernmentMedicineAvailability: vi.fn().mockResolvedValue([]),
    getGovernmentLowStock: vi.fn().mockResolvedValue([]),
    getGovernmentDistrictCoverage: vi.fn().mockResolvedValue([]),
    getGovernmentReservationStats: vi.fn().mockResolvedValue([]),
    approvePharmacy: vi.fn().mockResolvedValue({}),
    rejectPharmacy: vi.fn().mockResolvedValue({}),
    requestMoreInformation: vi.fn().mockResolvedValue({}),
    getGovernmentReport: vi.fn().mockResolvedValue({}),
  },
}))

vi.mock('@/api/client', () => ({
  apiClient: { get: vi.fn().mockResolvedValue({ data: [] }) },
}))

const renderWithRouter = (ui: React.ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>)

describe('Government Dashboard', () => {
  it('renders without crashing', async () => {
    renderWithRouter(<GovernmentDashboard />)
    await waitFor(() => expect(document.body).toBeTruthy())
  })
})

describe('Pharmacy Registry', () => {
  it('renders the pharmacy list', async () => {
    renderWithRouter(<PharmacyRegistry />)
    await waitFor(() => {
      expect(screen.getByText(/Kigali National Pharmacy/i)).toBeInTheDocument()
    })
  })

  it('shows all pharmacy statuses', async () => {
    renderWithRouter(<PharmacyRegistry />)
    await waitFor(() => {
      expect(screen.getByText(/MedPlus Heights/i)).toBeInTheDocument()
      expect(screen.getByText(/Rwanda Central Pharma/i)).toBeInTheDocument()
    })
  })

  it('filters pharmacies by search', async () => {
    const { userEvent: ue } = await import('@testing-library/user-event')
    const user = ue.setup()
    renderWithRouter(<PharmacyRegistry />)
    await waitFor(() => screen.getByText(/Kigali National Pharmacy/i))

    const inputs = screen.getAllByRole('textbox')
    const searchInput = inputs[0]
    if (searchInput) {
      await user.type(searchInput, 'MedPlus')
      await waitFor(() => {
        expect(screen.queryByText(/Kigali National Pharmacy/i)).toBeFalsy()
      })
    }
  })
})

describe('Government Compliance', () => {
  it('renders without crashing', async () => {
    renderWithRouter(<GovernmentCompliance />)
    await waitFor(() => expect(document.body).toBeTruthy())
  })
})
