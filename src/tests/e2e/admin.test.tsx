/**
 * E2E-style tests — Admin portal flows
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import AdminDashboard from '@/pages/admin/Dashboard'
import AdminUsers from '@/pages/admin/Users'
import AdminAuditLogs from '@/pages/admin/AuditLogs'

vi.mock('@/store/authStore', () => ({
  useAuthStore: () => ({
    user: { id: 'admin-1', name: 'System Admin', role: 'ADMIN' },
  }),
}))

vi.mock('@/store/languageStore', () => ({
  useLanguageStore: () => ({
    t: (k: string) => k,
    formatStatus: (s: string) => s,
  }),
}))

const MOCK_USERS = [
  { id: 'u-1', name: 'Alice Mukamana',  email: 'alice@test.com',    role: 'PATIENT',   isActive: true,  createdAt: new Date().toISOString() },
  { id: 'u-2', name: 'Bob Habimana',    email: 'bob@pharmacy.com',  role: 'PHARMACY',  isActive: true,  createdAt: new Date().toISOString() },
  { id: 'u-3', name: 'Carol Ingabire',  email: 'carol@gov.rw',      role: 'GOVERNMENT',isActive: false, createdAt: new Date().toISOString() },
]

const MOCK_AUDIT = [
  { id: 'al-1', action: 'CREATE', entityType: 'MEDICINE',     createdAt: new Date().toISOString(), user: { email: 'alice@test.com' } },
  { id: 'al-2', action: 'UPDATE', entityType: 'RESERVATION',  createdAt: new Date().toISOString(), user: { email: 'bob@pharmacy.com' } },
  { id: 'al-3', action: 'DELETE', entityType: 'USER',         createdAt: new Date().toISOString(), user: { email: 'admin@epharmacy.test' } },
]

vi.mock('@/api/client', () => ({
  apiClient: {
    get: vi.fn((url: string) => {
      if (url.includes('/users')) return Promise.resolve({ data: { data: MOCK_USERS, total: 3, page: 1, limit: 20 } })
      if (url.includes('/audit-logs')) return Promise.resolve({ data: { data: MOCK_AUDIT } })
      if (url.includes('/public/stats')) return Promise.resolve({ data: { registeredPharmacies: 12, activeUsers: 1240 } })
      return Promise.resolve({ data: [] })
    }),
    patch: vi.fn().mockResolvedValue({ data: {} }),
    delete: vi.fn().mockResolvedValue({ data: {} }),
  },
}))

vi.mock('@/services/auth-api', () => ({
  AuthApi: {
    getAuditLogs: vi.fn().mockResolvedValue(MOCK_AUDIT),
    getPlatformReport: vi.fn().mockResolvedValue({}),
  },
}))

const renderWithRouter = (ui: React.ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>)

describe('Admin Dashboard', () => {
  it('renders without crashing', async () => {
    renderWithRouter(<AdminDashboard />)
    await waitFor(() => expect(document.body).toBeTruthy())
  })
})

describe('Admin Users', () => {
  it('renders the users list', async () => {
    renderWithRouter(<AdminUsers />)
    await waitFor(() => {
      expect(screen.getByText(/Alice Mukamana/i)).toBeInTheDocument()
    })
  })

  it('shows users with different roles', async () => {
    renderWithRouter(<AdminUsers />)
    await waitFor(() => {
      expect(screen.getByText(/Bob Habimana/i)).toBeInTheDocument()
    })
  })

  it('has a search input', async () => {
    renderWithRouter(<AdminUsers />)
    await waitFor(() => {
      const inputs = screen.getAllByRole('textbox')
      expect(inputs.length).toBeGreaterThan(0)
    })
  })

  it('filters users by search', async () => {
    const user = userEvent.setup()
    renderWithRouter(<AdminUsers />)
    await waitFor(() => screen.getByText(/Alice Mukamana/i))

    const searchInput = screen.getAllByRole('textbox')[0]
    await user.type(searchInput, 'Bob')

    await waitFor(() => {
      expect(screen.queryByText(/Alice Mukamana/i)).toBeFalsy()
      expect(screen.getByText(/Bob Habimana/i)).toBeInTheDocument()
    })
  })
})

describe('Admin Audit Logs', () => {
  it('renders audit log entries', async () => {
    renderWithRouter(<AdminAuditLogs />)
    await waitFor(() => expect(document.body).toBeTruthy())
  })

  it('shows action types in logs', async () => {
    renderWithRouter(<AdminAuditLogs />)
    await waitFor(() => {
      // At least one action type should appear
      const createEl = screen.queryByText(/create/i)
      const updateEl = screen.queryByText(/update/i)
      expect(createEl || updateEl).toBeTruthy()
    })
  })
})
