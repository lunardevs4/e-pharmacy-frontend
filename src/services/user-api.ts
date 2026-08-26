import { apiClient } from '@/api/client'
import { AxiosError } from 'axios'

export interface AdminUser {
    id: string
    email: string
    phone?: string
    firstName?: string
    lastName?: string
    role: string
    isActive?: boolean
    createdAt?: string
    updatedAt?: string
}

const unwrapApiResponse = (response: any): any[] => {
    const payload = response?.data ?? response
    if (Array.isArray(payload)) {
        return payload
    }
    if (Array.isArray(payload.data)) {
        return payload.data
    }
    if (Array.isArray(payload.data?.data)) {
        return payload.data.data
    }
    return []
}

const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error !== null) {
    const axiosError = error as AxiosError
    const responseData = axiosError.response?.data as any
    if (responseData?.message) {
      if (typeof responseData.message === 'string') return responseData.message
      if (Array.isArray(responseData.message)) return (responseData.message as string[]).join(' · ')
    }
    if (responseData?.error && typeof responseData.error === 'string') return responseData.error
  }
  if (error instanceof Error) return error.message
  return 'Request failed. Please try again.'
}

export const UserApi = {
    getUsers: async (page = 1, limit = 50): Promise<AdminUser[]> => {
        try {
            const response = await apiClient.get('/users', { params: { page, limit } })
            return unwrapApiResponse(response)
        } catch (error) {
            throw new Error(getErrorMessage(error))
        }
    },

    createUser: async (data: { firstName: string; lastName: string; email: string; phone: string; role: string }) => {
        try {
            const response = await apiClient.post('/auth/managed-users', data)
            return response.data
        } catch (error) {
            throw new Error(getErrorMessage(error))
        }
    },

    updateUserStatus: async (id: string, isActive: boolean) => {
        try {
            const response = await apiClient.patch(`/users/${id}/status`, { isActive })
            return response.data
        } catch (error) {
            throw new Error(getErrorMessage(error))
        }
    },

    deleteUser: async (id: string) => {
        try {
            const response = await apiClient.delete(`/users/${id}`)
            return response.data
        } catch (error) {
            throw new Error(getErrorMessage(error))
        }
    },
}
