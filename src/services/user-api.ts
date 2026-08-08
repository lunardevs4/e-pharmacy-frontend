import { apiClient } from '@/api/client'

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

export const UserApi = {
    getUsers: async (page = 1, limit = 50): Promise<AdminUser[]> => {
        const response = await apiClient.get('/users', { params: { page, limit } })
        return unwrapApiResponse(response)
    },

    createUser: async (data: { firstName: string; lastName: string; email: string; phone: string; role: string }) => {
        const response = await apiClient.post('/auth/managed-users', data)
        return response.data
    },

    updateUserStatus: async (id: string, isActive: boolean) => {
        const response = await apiClient.patch(`/users/${id}/status`, { isActive })
        return response.data
    },

    deleteUser: async (id: string) => {
        const response = await apiClient.delete(`/users/${id}`)
        return response.data
    },
}
