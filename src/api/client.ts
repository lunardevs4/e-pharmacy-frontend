import axios from 'axios'
import { TokenStorage } from '@/services/token-storage'

const API_URL = import.meta.env.VITE_API_URL || 'https://api.epharmacy.gov.rw/v1'

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor: Attach bearer token if present
apiClient.interceptors.request.use(
  (config) => {
    const token = TokenStorage.getToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response Interceptor: Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      TokenStorage.clearToken()
    }
    return Promise.reject(error)
  },
)
