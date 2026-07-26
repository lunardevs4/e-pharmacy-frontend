const ACCESS_TOKEN_KEY = 'rwanda_epharmacy_access_token'
const REFRESH_TOKEN_KEY = 'rwanda_epharmacy_refresh_token'

export const TokenStorage = {
  getToken: (): string | null => {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  },
  setToken: (token: string): void => {
    localStorage.setItem(ACCESS_TOKEN_KEY, token)
  },
  clearToken: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem('rwanda_epharmacy_user')
  },
  getRefreshToken: (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },
  setRefreshToken: (token: string): void => {
    localStorage.setItem(REFRESH_TOKEN_KEY, token)
  },
}
