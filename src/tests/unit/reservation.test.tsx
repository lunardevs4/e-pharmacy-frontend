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
    ]),
  },
}))

vi.mock('@/services/medicine-api', () => ({
  MedicineApi: {
    searchMedicines: vi.fn(),
    getMedicineById: vi.fn(),
    getMedicineStock: vi.fn(),
    createReservation: vi.fn(),
    uploadPrescription: vi.fn(),
    createPrescription: vi.fn(),
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
    id: 'med-otc',
    name: 'Paracetamol 500mg',
    genericName: 'Paracetamol',
    category: 'Analgesics',
    dosage: '500mg',
    form: 'Tablet',
    prescriptionRequired: false,
    totalStock: 50,
    pharmacyCount: 1,
    minPrice: 500,
    maxPrice: 500,
  },
  {
    id: 'med-rx',
    name: 'Amoxicillin 500mg',
    genericName: 'Amoxicillin',
    category: 'Antibiotics',
    dosage: '500mg',
    form: 'Capsule',
    prescriptionRequired: true,
    totalStock: 20,
    pharmacyCount: 1,
    minPrice: 1500,
    maxPrice: 1500,
  },
]

const mockStock = [
  {
    pharmacyId: 'pharm-1',
    pharmacyName: 'Kigali City Pharmacy',
    pharmacyAddress: 'KG 11 Ave, Kigali',
    phone: '+250788111222',
    lat: -1.9441,
    lng: 30.0619,
    distance: 1.2,
    stock: 10,
    price: 1500,
    rating: 4.8,
    insuranceAccepted: ['RAMA'],
    insuranceCoverage: {
      hasAgreement: true,
      isCovered: true,
      coveragePercentage: 85,
      insurancePays: 1275,
      patientPays: 225,
    },
  },
]

const renderPage = () =>
  render(
    <MemoryRouter>
      <MedicineSearch />
    </MemoryRouter>
  )

describe('Medicine Reservation Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(MedicineApi.searchMedicines).mockResolvedValue(mockMedicines as any)
    vi.mocked(MedicineApi.getMedicineStock).mockResolvedValue(mockStock as any)
  })

  const openReservationModal = async (medName = 'Paracetamol 500mg') => {
    renderPage()
    const input = screen.getByRole('textbox', { name: /search medicine name/i })
    fireEvent.change(input, { target: { value: medName } })

    const form = input.closest('form')
    if (form) fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByText(medName)).toBeInTheDocument()
    })

    const viewStockBtns = screen.getAllByRole('button', { name: /check inventory/i })
    fireEvent.click(viewStockBtns[0])

    await waitFor(() => {
      expect(screen.getByText('Kigali City Pharmacy')).toBeInTheDocument()
    })

    const reserveBtn = screen.getByRole('button', { name: /^reserve$/i })
    fireEvent.click(reserveBtn)

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  }

  it('renders reservation modal with selection details and quantity selector', async () => {
    await openReservationModal('Paracetamol 500mg')

    expect(screen.getByRole('heading', { name: /reserve medication/i })).toBeInTheDocument()
    expect(screen.getByText('Selection Details')).toBeInTheDocument()
    expect(screen.getByTestId('reservation-quantity')).toHaveTextContent('1')
    expect(screen.getByTestId('confirm-reservation-btn')).toBeInTheDocument()
  })

  it('increments and decrements quantity correctly within stock limits', async () => {
    await openReservationModal('Paracetamol 500mg')

    const decBtn = screen.getByRole('button', { name: /decrease quantity/i })
    const incBtn = screen.getByRole('button', { name: /increase quantity/i })

    // Initially at 1, decrement is disabled
    expect(decBtn).toBeDisabled()

    // Increment to 2
    fireEvent.click(incBtn)
    expect(screen.getByTestId('reservation-quantity')).toHaveTextContent('2')
    expect(decBtn).not.toBeDisabled()

    // Decrement back to 1
    fireEvent.click(decBtn)
    expect(screen.getByTestId('reservation-quantity')).toHaveTextContent('1')
    expect(decBtn).toBeDisabled()
  })

  it('disables increment button when quantity reaches maximum pharmacy stock', async () => {
    await openReservationModal('Paracetamol 500mg')

    const incBtn = screen.getByRole('button', { name: /increase quantity/i })
    // Stock is 10
    for (let i = 1; i < 10; i++) {
      fireEvent.click(incBtn)
    }

    expect(screen.getByTestId('reservation-quantity')).toHaveTextContent('10')
    expect(incBtn).toBeDisabled()
  })

  it('requires prescription upload for regulated medication before confirming reservation', async () => {
    await openReservationModal('Amoxicillin 500mg')

    expect(screen.getByTestId('prescription-uploader')).toBeInTheDocument()
    expect(screen.getByText(/prescription required/i)).toBeInTheDocument()

    const confirmBtn = screen.getByTestId('confirm-reservation-btn')
    fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(screen.getByTestId('prescription-error')).toBeInTheDocument()
      expect(screen.getByText(/a valid doctor's prescription is required/i)).toBeInTheDocument()
      expect(MedicineApi.createReservation).not.toHaveBeenCalled()
    })
  })

  it('calls createReservation API with selected parameters on confirmation', async () => {
    const mockReservation = {
      id: 'RES-998877',
      medicineId: 'med-otc',
      pharmacyId: 'pharm-1',
      pharmacyName: 'Kigali City Pharmacy',
      quantity: 2,
      totalPrice: 450,
      status: 'CONFIRMED',
      pickupDeadline: 'Tomorrow at 6:00 PM',
      patientPays: 450,
    }
    vi.mocked(MedicineApi.createReservation).mockResolvedValue(mockReservation as any)

    await openReservationModal('Paracetamol 500mg')

    const incBtn = screen.getByRole('button', { name: /increase quantity/i })
    fireEvent.click(incBtn) // quantity = 2

    const confirmBtn = screen.getByTestId('confirm-reservation-btn')
    fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(MedicineApi.createReservation).toHaveBeenCalledWith({
        medicineId: 'med-otc',
        pharmacyId: 'pharm-1',
        quantity: 2,
      })
      expect(screen.getByTestId('reservation-success-state')).toBeInTheDocument()
      expect(screen.getByTestId('created-reservation-id')).toHaveTextContent('RES-998877')
    })
  })

  it('disables submit button and shows reserving indicator while request is in flight', async () => {
    let resolveRes: any
    vi.mocked(MedicineApi.createReservation).mockReturnValue(
      new Promise((res) => {
        resolveRes = res
      })
    )

    await openReservationModal('Paracetamol 500mg')

    const confirmBtn = screen.getByTestId('confirm-reservation-btn')
    fireEvent.click(confirmBtn)

    expect(screen.getByText(/reserving\.\.\./i)).toBeInTheDocument()
    expect(confirmBtn).toBeDisabled()

    resolveRes({
      id: 'RES-12345',
      pharmacyName: 'Kigali City Pharmacy',
      pickupDeadline: 'Tomorrow',
      patientPays: 225,
    })

    await waitFor(() => {
      expect(screen.getByTestId('reservation-success-state')).toBeInTheDocument()
    })
  })

  it('displays patient-friendly error when reservation fails due to stock conflict (409)', async () => {
    vi.mocked(MedicineApi.createReservation).mockRejectedValue({
      response: {
        status: 409,
        data: { message: 'Stock changed. Another patient reserved the last units.' },
      },
    })

    await openReservationModal('Paracetamol 500mg')

    const confirmBtn = screen.getByTestId('confirm-reservation-btn')
    fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(screen.getByTestId('reservation-error-banner')).toBeInTheDocument()
      expect(screen.getByText(/stock conflict/i)).toBeInTheDocument()
      expect(screen.getByText(/no longer available/i)).toBeInTheDocument()
    })
  })

  it('displays network error banner with retry button on connection failure and retries successfully', async () => {
    const networkErr = new TypeError('Failed to fetch')
    const mockSuccess = {
      id: 'RES-RETRY-OK',
      pharmacyName: 'Kigali City Pharmacy',
      pickupDeadline: 'Tomorrow',
      patientPays: 225,
    }

    vi.mocked(MedicineApi.createReservation)
      .mockRejectedValueOnce(networkErr)
      .mockResolvedValueOnce(mockSuccess as any)

    await openReservationModal('Paracetamol 500mg')

    const confirmBtn = screen.getByTestId('confirm-reservation-btn')
    fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(screen.getByTestId('reservation-error-banner')).toBeInTheDocument()
      expect(screen.getByText(/connection issue/i)).toBeInTheDocument()
    })

    const retryBtn = screen.getByRole('button', { name: /retry/i })
    fireEvent.click(retryBtn)

    await waitFor(() => {
      expect(MedicineApi.createReservation).toHaveBeenCalledTimes(2)
      expect(screen.getByTestId('reservation-success-state')).toBeInTheDocument()
      expect(screen.getByTestId('created-reservation-id')).toHaveTextContent('RES-RETRY-OK')
    })
  })

  it('preserves selected quantity and pharmacy across submission errors', async () => {
    vi.mocked(MedicineApi.createReservation).mockRejectedValue(new Error('Server error'))

    await openReservationModal('Paracetamol 500mg')

    const incBtn = screen.getByRole('button', { name: /increase quantity/i })
    fireEvent.click(incBtn) // quantity = 2
    expect(screen.getByTestId('reservation-quantity')).toHaveTextContent('2')

    const confirmBtn = screen.getByTestId('confirm-reservation-btn')
    fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(screen.getByTestId('reservation-error-banner')).toBeInTheDocument()
      // State is preserved!
      expect(screen.getByTestId('reservation-quantity')).toHaveTextContent('2')
    })
  })
})
