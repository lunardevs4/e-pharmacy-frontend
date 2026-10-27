import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import PatientProfile from '@/pages/patient/Profile'
import { useAuthStore } from '@/store/authStore'
import { AuthApi } from '@/services/auth-api'
import { MedicineApi } from '@/services/medicine-api'

vi.mock('@/services/auth-api', () => ({
  AuthApi: {
    updateProfile: vi.fn(),
    changePassword: vi.fn(),
    uploadProfilePhoto: vi.fn(),
  },
}))

vi.mock('@/services/medicine-api', () => ({
  MedicineApi: {
    getEmailNotificationPreferences: vi.fn().mockResolvedValue({
      reminders: true,
      lowStock: true,
      reservations: false,
      billing: false,
      system: false,
    }),
    updateEmailNotificationPreferences: vi.fn().mockResolvedValue({}),
  },
}))

describe('PatientProfile - Identity & Profile Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays empty/Not Provided state when National ID is missing, and never shows hardcoded fake NID', async () => {
    useAuthStore.setState({
      user: {
        id: 'patient-uuid-1',
        name: 'Aline Umutoni',
        email: 'aline@example.com',
        phone: '+250788123456',
        role: 'PATIENT',
        nid: undefined, // Missing NID
      } as any,
      isAuthenticated: true,
    })

    render(<PatientProfile />)

    await waitFor(() => {
      expect(screen.getByText('National ID Not Provided')).toBeInTheDocument()
      expect(screen.queryByDisplayValue('1199580048123984')).not.toBeInTheDocument()
      expect(screen.getByPlaceholderText('Not Provided')).toBeInTheDocument()
    })
  })

  it('displays user real registered National ID when present', async () => {
    useAuthStore.setState({
      user: {
        id: 'patient-uuid-2',
        name: 'Eric Mugisha',
        email: 'eric@example.com',
        phone: '+250788654321',
        role: 'PATIENT',
        nid: '1199580012345678',
      } as any,
      isAuthenticated: true,
    })

    render(<PatientProfile />)

    await waitFor(() => {
      expect(screen.getByText('National ID Registered')).toBeInTheDocument()
      expect(screen.getByDisplayValue('1199580012345678')).toBeInTheDocument()
    })
  })

  it('calls AuthApi.updateProfile when saving valid profile updates', async () => {
    useAuthStore.setState({
      user: {
        id: 'patient-uuid-3',
        name: 'Diane Kayitesi',
        email: 'diane@example.com',
        phone: '+250788999888',
        role: 'PATIENT',
        username: 'diane',
        nid: '1199280055554444',
      } as any,
      isAuthenticated: true,
      updateProfile: vi.fn(),
    })

    vi.mocked(AuthApi.updateProfile).mockResolvedValue({
      id: 'patient-uuid-3',
      name: 'Diane Kayitesi Updated',
      email: 'diane@example.com',
      phone: '+250788999888',
    } as any)

    render(<PatientProfile />)

    // Change full name to trigger hasUnsavedChanges
    const nameInput = screen.getByDisplayValue('Diane Kayitesi')
    fireEvent.change(nameInput, { target: { value: 'Diane Kayitesi Updated' } })

    const form = screen.getByRole('button', { name: /save profile/i }).closest('form')
    expect(form).not.toBeNull()
    fireEvent.submit(form!)

    await waitFor(() => {
      expect(AuthApi.updateProfile).toHaveBeenCalledWith(
        'diane',
        expect.objectContaining({
          firstName: 'Diane Kayitesi Updated',
          email: 'diane@example.com',
          phone: '+250788999888',
        })
      )
    })
  })
})
