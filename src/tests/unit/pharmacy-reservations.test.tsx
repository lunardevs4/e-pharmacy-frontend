import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import PharmacyReservations from '@/pages/pharmacy/Reservations'
import { PharmacyApi } from '@/services/pharmacy-api'
import { useAuthStore } from '@/store/authStore'

vi.mock('@/services/pharmacy-api', () => ({
  PharmacyApi: {
    getReservations: vi.fn(),
    updateReservationStatusSimple: vi.fn(),
  },
}))

describe('PharmacyReservations - Production State & Mock Fallback Removal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({
      user: {
        id: 'pharmacy-user-1',
        name: 'Kigali Pharmacy',
        email: 'pharmacy@epharmacy.rw',
        role: 'PHARMACY_OWNER',
        pharmacyId: 'pharmacy-uuid-1',
        pharmacy: { id: 'pharmacy-uuid-1', name: 'Kigali Central Pharmacy' },
      } as any,
      isAuthenticated: true,
    })
  })

  it('renders genuine empty state when API returns empty array [] and never renders fake mock reservations', async () => {
    vi.mocked(PharmacyApi.getReservations).mockResolvedValue([])

    render(<PharmacyReservations />)

    // Should not render any of the removed mock reservation data
    await waitFor(() => {
      expect(screen.queryByText('Marie Uwimana')).not.toBeInTheDocument()
      expect(screen.queryByText('Jean-Pierre Nkurunziza')).not.toBeInTheDocument()
      expect(screen.queryByText('RES-2026-001')).not.toBeInTheDocument()
      expect(screen.getByText('No reservations match the current filters.')).toBeInTheDocument()
    })
  })

  it('renders real reservations when returned by the backend API', async () => {
    vi.mocked(PharmacyApi.getReservations).mockResolvedValue([
      {
        id: 'real-res-12345',
        status: 'READY',
        quantity: 2,
        createdAt: '2026-10-26T12:00:00.000Z',
        pickupDeadline: '2026-10-28',
        totalPrice: 4500,
        patientPays: 4500,
        patient: {
          user: {
            firstName: 'Jean',
            lastName: 'Habimana',
            nid: '1199080012345678',
          },
        },
        medicine: {
          tradeName: 'Amoxicillin 500mg',
          prescriptionRequired: true,
        },
      },
    ])

    render(<PharmacyReservations />)

    await waitFor(() => {
      expect(screen.getByText('Jean Habimana')).toBeInTheDocument()
      expect(screen.getByText('Amoxicillin 500mg')).toBeInTheDocument()
      expect(screen.getByText('RWF 4,500')).toBeInTheDocument()
      expect(screen.queryByText('Marie Uwimana')).not.toBeInTheDocument()
    })
  })

  it('displays an error alert with a Retry option upon API failure rather than fabricated data', async () => {
    vi.mocked(PharmacyApi.getReservations).mockRejectedValue(new Error('Network error: Database unreachable'))

    render(<PharmacyReservations />)

    await waitFor(() => {
      expect(screen.getByText('Network error: Database unreachable')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
      expect(screen.queryByText('Marie Uwimana')).not.toBeInTheDocument()
      expect(screen.queryByText('RES-2026-001')).not.toBeInTheDocument()
    })
  })
})
