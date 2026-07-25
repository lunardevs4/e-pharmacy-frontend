const TOKEN_KEY = 'rwanda_epharmacy_token'

export const TokenStorage = {
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY)
  },
  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token)
  },
  clearToken: (): void => {
    localStorage.removeItem(TOKEN_KEY)
  },
}
