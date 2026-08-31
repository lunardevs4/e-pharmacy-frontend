const ACCESS_TOKEN_KEY = 'rwanda_epharmacy_access_token'
const REFRESH_TOKEN_KEY = 'rwanda_epharmacy_refresh_token'
const USER_KEY = 'rwanda_epharmacy_user'

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
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem('rwanda_epharmacy_user')
    localStorage.removeItem('epharmacy_current_session_user')
  },
  getRefreshToken: (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },
  setRefreshToken: (token: string): void => {
    localStorage.setItem(REFRESH_TOKEN_KEY, token)
  },
  saveUser: (user: object): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },
  loadUser: (): object | null => {
    try {
      const ownRaw = localStorage.getItem(USER_KEY)
      if (ownRaw) return JSON.parse(ownRaw)

      const sessionRaw = localStorage.getItem('epharmacy_current_session_user')
      if (!sessionRaw) return null
      const parsed = JSON.parse(sessionRaw)
      return parsed?.user ?? parsed
    } catch {
      return null
    }
  },
}
