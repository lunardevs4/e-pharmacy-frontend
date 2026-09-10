/**
 * E2E-style tests — Pharmacy portal flows
 * Uses Vitest + @testing-library/react with mocked API layer.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import PharmacyDashboard from '@/pages/pharmacy/Dashboard'
import PharmacyReservations from '@/pages/pharmacy/Reservations'
import PharmacyInventory from '@/pages/pharmacy/Inventory'

// ── Mock auth store ──────────────────────────────────────────────────────────
vi.mock('@/store/authStore', () => ({
  useAuthStore: () => ({
    user: {
      id: 'pharm-user-1',
      name: 'Test Pharmacist',
      role: 'PHARMACY_OWNER',
      pharmacy: { id: 'pharm-1', name: 'Test Pharmacy' },
      pharmacyId: 'pharm-1',
    },
  }),
}))

vi.mock('@/store/languageStore', () => ({
  useLanguageStore: () => ({
    t: (k: string) => k,
    formatStatus: (s: string) => s,
  }),
}))

// ── Mock API clients ─────────────────────────────────────────────────────────
vi.mock('@/services/medicine-api', () => ({
  MedicineApi: {
    getPharmacyDashboardData: vi.fn().mockResolvedValue({ reservations: [], inventory: [] }),
    getPharmacyInventory: vi.fn().mockResolvedValue([]),
    getCategories: vi.fn().mockResolvedValue([]),
    getManufacturers: vi.fn().mockResolvedValue([]),
    updatePharmacyInventory: vi.fn().mockResolvedValue({}),
  },
}))

vi.mock('@/services/pharmacy-api', () => ({
  PharmacyApi: {
    getAuditLogs: vi.fn().mockResolvedValue([]),
    getReservations: vi.fn().mockResolvedValue([
      {
        id: 'res-001',
        status: 'PENDING',
        quantity: 2,
        createdAt: new Date().toISOString(),
        pickupDeadline: '2026-09-10',
        patientPays: 1500,
        medicine: { tradeName: 'Paracetamol 500mg', prescriptionRequired: false },
        patient: { user: { firstName: 'Marie', lastName: 'Uwimana', nid: '119958004812' } },
      },
      {
        id: 'res-002',
        status: 'CONFIRMED',
        quantity: 1,
        createdAt: new Date().toISOString(),
        pickupDeadline: '2026-09-11',
        patientPays: 2800,
        medicine: { tradeName: 'Amoxicillin 500mg', prescriptionRequired: true },
        patient: { user: { firstName: 'Jean', lastName: 'Nkurunziza', nid: '119938009238' } },
      },
    ]),
    updateReservationStatus: vi.fn().mockResolvedValue({}),
    updateReservationStatusSimple: vi.fn().mockResolvedValue({}),
  },
}))

vi.mock('@/api/client', () => ({
  apiClient: {
    get: vi.fn().mockResolvedValue({ data: { data: [] } }),
    patch: vi.fn().mockResolvedValue({ data: {} }),
  },
}))

// ── Helpers ──────────────────────────────────────────────────────────────────
const renderWithRouter = (ui: React.ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>)

// ── Tests ────────────────────────────────────────────────────────────────────
describe('Pharmacy Dashboard', () => {
  it('renders the pharmacy dashboard without crashing', async () => {
    renderWithRouter(<PharmacyDashboard />)
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).toBeFalsy()
    })
  })

  it('shows stat cards', async () => {
    renderWithRouter(<PharmacyDashboard />)
    await waitFor(() => {
      // At least one stat card heading should be visible
      const dashboardEl = document.querySelector('.space-y-4, .space-y-6')
      expect(dashboardEl).toBeTruthy()
    })
  })
})

describe('Pharmacy Reservations', () => {
  it('renders the reservations list', async () => {
    renderWithRouter(<PharmacyReservations />)
    await waitFor(() => {
      expect(screen.getByText(/Paracetamol 500mg/i)).toBeInTheDocument()
    })
  })

  it('shows pending and confirmed reservations', async () => {
    renderWithRouter(<PharmacyReservations />)
    await waitFor(() => {
      expect(screen.getByText(/Marie Uwimana/i)).toBeInTheDocument()
      expect(screen.getByText(/Jean Nkurunziza/i)).toBeInTheDocument()
    })
  })

  it('filters reservations by search input', async () => {
    const user = userEvent.setup()
    renderWithRouter(<PharmacyReservations />)

    await waitFor(() => screen.getByText(/Marie Uwimana/i))

    const searchInput = screen.getByPlaceholderText(/search patient/i)
    await user.type(searchInput, 'Jean')

    await waitFor(() => {
      expect(screen.queryByText(/Marie Uwimana/i)).toBeFalsy()
      expect(screen.getByText(/Jean Nkurunziza/i)).toBeInTheDocument()
    })
  })

  it('filters by status', async () => {
    const user = userEvent.setup()
    renderWithRouter(<PharmacyReservations />)

    await waitFor(() => screen.getByText(/Marie Uwimana/i))

    const select = screen.getByRole('combobox', { name: /filter by status/i })
    await user.selectOptions(select, 'PENDING')

    await waitFor(() => {
      expect(screen.getByText(/Marie Uwimana/i)).toBeInTheDocument()
    })
  })

  it('shows Confirm button for CONFIRMED reservations', async () => {
    renderWithRouter(<PharmacyReservations />)
    await waitFor(() => {
      const confirmBtns = screen.getAllByRole('button', { name: /confirm/i })
      expect(confirmBtns.length).toBeGreaterThan(0)
    })
  })
})

describe('Pharmacy Inventory', () => {
  it('renders without crashing', async () => {
    renderWithRouter(<PharmacyInventory />)
    await waitFor(() => {
      expect(screen.queryByText(/failed to load/i)).toBeFalsy()
    })
  })

  it('shows Add Medication button', async () => {
    renderWithRouter(<PharmacyInventory />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add medication/i })).toBeInTheDocument()
    })
  })

  it('shows Import CSV button', async () => {
    renderWithRouter(<PharmacyInventory />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /import csv/i })).toBeInTheDocument()
    })
  })
})
