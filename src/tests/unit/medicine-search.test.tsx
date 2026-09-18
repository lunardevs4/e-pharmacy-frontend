import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MedicineSearch from '@/pages/patient/MedicineSearch'
import { MedicineApi } from '@/services/medicine-api'
import { insuranceApi } from '@/services/insurance-api'

// Mocks
vi.mock('@/store/languageStore', () => ({
  useLanguageStore: Object.assign(
    () => ({
      t: (k: string) => k,
      formatStatus: (s: string) => s,
      language: 'en',
    }),
    {
      getState: () => ({
        t: (k: string) => k,
        language: 'en',
      }),
    }
  ),
}))

vi.mock('@/store/authStore', () => ({
  useAuthStore: () => ({
    user: {
      id: 'patient-1',
      name: 'Jean Mutabazi',
      role: 'PATIENT',
      insuranceProvider: 'RAMA',
    },
  }),
}))

vi.mock('@/services/insurance-api', () => ({
  insuranceApi: {
    getProviders: vi.fn().mockResolvedValue([
      { id: 'prov-1', name: 'RAMA', code: 'RAMA', defaultCoveragePercentage: 85, isActive: true },
      { id: 'prov-2', name: 'MMI', code: 'MMI', defaultCoveragePercentage: 85, isActive: true },
    ]),
  },
}))

vi.mock('@/services/medicine-api', () => ({
  MedicineApi: {
    searchMedicines: vi.fn(),
    getMedicineById: vi.fn(),
    getMedicineStock: vi.fn(),
    getFavouriteMedicines: vi.fn().mockResolvedValue([]),
    getFavouritePharmacies: vi.fn().mockResolvedValue([]),
    getSearchHistory: vi.fn().mockResolvedValue([]),
    saveSearchHistory: vi.fn().mockResolvedValue({}),
    saveFavouriteMedicine: vi.fn().mockResolvedValue({}),
    saveFavouritePharmacy: vi.fn().mockResolvedValue({}),
  },
}))

const mockMedicines = [
  {
    id: 'med-1',
    name: 'Amoxicillin 500mg',
    genericName: 'Amoxicillin',
    category: 'Antibiotics',
    dosage: '500mg',
    form: 'Capsule',
    prescriptionRequired: true,
    totalStock: 150,
    pharmacyCount: 3,
    minPrice: 1200,
    maxPrice: 1500,
  },
  {
    id: 'med-2',
    name: 'Paracetamol 500mg',
    genericName: 'Paracetamol',
    category: 'Analgesics',
    dosage: '500mg',
    form: 'Tablet',
    prescriptionRequired: false,
    totalStock: 320,
    pharmacyCount: 5,
    minPrice: 500,
    maxPrice: 700,
  },
]

const renderComponent = () =>
  render(
    <MemoryRouter>
      <MedicineSearch />
    </MemoryRouter>
  )

describe('MedicineSearch Page Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(MedicineApi.searchMedicines).mockResolvedValue(mockMedicines as any)
  })

  it('renders search input, popular tags, and filter options', async () => {
    renderComponent()

    expect(screen.getByRole('textbox', { name: /search medicine name/i })).toBeInTheDocument()
    expect(screen.getByText('Try searching:')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Amoxicillin' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Paracetamol' })).toBeInTheDocument()
  })

  it('updates search query input on typing', async () => {
    renderComponent()
    const input = screen.getByRole('textbox', { name: /search medicine name/i })
    fireEvent.change(input, { target: { value: 'Amoxicillin' } })

    expect(input).toHaveValue('Amoxicillin')
  })

  it('executes search and renders medicine cards on submit', async () => {
    renderComponent()
    const input = screen.getByRole('textbox', { name: /search medicine name/i })
    fireEvent.change(input, { target: { value: 'Amox' } })

    const form = input.closest('form')
    if (form) fireEvent.submit(form)

    await waitFor(() => {
      expect(MedicineApi.searchMedicines).toHaveBeenCalledWith('Amox', '', false)
      expect(screen.getByText('Amoxicillin 500mg')).toBeInTheDocument()
      expect(screen.getByText('Paracetamol 500mg')).toBeInTheDocument()
    })
  })

  it('displays empty state with helpful tips when no medicines match', async () => {
    vi.mocked(MedicineApi.searchMedicines).mockResolvedValue([])

    renderComponent()
    const input = screen.getByRole('textbox', { name: /search medicine name/i })
    fireEvent.change(input, { target: { value: 'NonexistentMedicine' } })

    const form = input.closest('form')
    if (form) fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByText('No medicines found')).toBeInTheDocument()
      expect(screen.getByText(/we couldn't find any medications matching/i)).toBeInTheDocument()
      expect(screen.getByText(/check spelling/i)).toBeInTheDocument()
    })
  })

  it('displays patient-friendly error fallback when search API fails', async () => {
    vi.mocked(MedicineApi.searchMedicines).mockRejectedValue(new Error('InternalServerError: database connection failure'))

    renderComponent()
    const input = screen.getByRole('textbox', { name: /search medicine name/i })
    fireEvent.change(input, { target: { value: 'Amox' } })

    const form = input.closest('form')
    if (form) fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toBeInTheDocument()
      expect(screen.queryByText(/database connection failure/i)).not.toBeInTheDocument()
      expect(screen.getByText(/unable to complete your search right now/i)).toBeInTheDocument()
    })
  })

  it('distinguishes network/offline error and displays retry button', async () => {
    const networkErr = new TypeError('Failed to fetch')
    vi.mocked(MedicineApi.searchMedicines).mockRejectedValue(networkErr)

    renderComponent()
    const input = screen.getByRole('textbox', { name: /search medicine name/i })
    fireEvent.change(input, { target: { value: 'Amox' } })

    const form = input.closest('form')
    if (form) fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toBeInTheDocument()
      expect(screen.getByText(/check your internet/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /retry search/i })).toBeInTheDocument()
    })
  })

  it('retries search with preserved parameters when retry button is clicked', async () => {
    const networkErr = new TypeError('Failed to fetch')
    vi.mocked(MedicineApi.searchMedicines)
      .mockRejectedValueOnce(networkErr)
      .mockResolvedValueOnce(mockMedicines as any)

    renderComponent()
    const input = screen.getByRole('textbox', { name: /search medicine name/i })
    fireEvent.change(input, { target: { value: 'Amox' } })

    const form = input.closest('form')
    if (form) fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /retry search/i })).toBeInTheDocument()
    })

    const retryBtn = screen.getByRole('button', { name: /retry search/i })
    fireEvent.click(retryBtn)

    await waitFor(() => {
      expect(MedicineApi.searchMedicines).toHaveBeenCalledTimes(2)
      expect(screen.getByText('Amoxicillin 500mg')).toBeInTheDocument()
    })
  })

  it('triggers search when clicking a popular search tag', async () => {
    renderComponent()
    const tagBtn = screen.getByRole('button', { name: 'Paracetamol' })
    fireEvent.click(tagBtn)

    await waitFor(() => {
      expect(MedicineApi.searchMedicines).toHaveBeenCalledWith('Paracetamol', '', false)
      expect(screen.getByRole('textbox', { name: /search medicine name/i })).toHaveValue('Paracetamol')
    })
  })

  it('shows loading skeleton while search request is pending', async () => {
    let resolvePromise: any
    vi.mocked(MedicineApi.searchMedicines).mockReturnValue(
      new Promise((res) => {
        resolvePromise = res
      })
    )

    renderComponent()
    const input = screen.getByRole('textbox', { name: /search medicine name/i })
    fireEvent.change(input, { target: { value: 'Amox' } })

    const form = input.closest('form')
    if (form) fireEvent.submit(form)

    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()

    resolvePromise(mockMedicines)
    await waitFor(() => {
      expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument()
      expect(screen.getByText('Amoxicillin 500mg')).toBeInTheDocument()
    })
  })

  it('preserves search query text and filter states across errors', async () => {
    vi.mocked(MedicineApi.searchMedicines).mockRejectedValue(new Error('Network error'))

    renderComponent()
    const input = screen.getByRole('textbox', { name: /search medicine name/i })
    fireEvent.change(input, { target: { value: 'Amoxicillin 500mg' } })

    const form = input.closest('form')
    if (form) fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toBeInTheDocument()
      expect(input).toHaveValue('Amoxicillin 500mg')
    })
  })
})
