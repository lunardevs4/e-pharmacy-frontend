export const TOKEN_KEY = 'epharmacy_auth_token'
export const REFRESH_TOKEN_KEY = 'epharmacy_auth_refresh'
export const TOKEN_TIMESTAMP_KEY = 'epharmacy_auth_token_ts'

const STORAGE_IMPL = ((): Storage | null => {
  try {
    if (typeof window === 'undefined') return null
    const testKey = '__epharmacy_storage_test__'
    window.localStorage.setItem(testKey, '1')
    window.localStorage.removeItem(testKey)
    return window.localStorage
  } catch {
    try {
      if (typeof window === 'undefined') return null
      return window.sessionStorage
    } catch {
      return null
    }
  }
})()

interface InMemoryStore {
  token: string | null
  refreshToken: string | null
  tokenTs: number | null
}

const inMemory: InMemoryStore = {
  token: null,
  refreshToken: null,
  tokenTs: null,
}

export const TokenStorage = {
  hasPersistence(): boolean {
    return STORAGE_IMPL !== null
  },

  getToken(): string | null {
    if (STORAGE_IMPL) {
      try {
        return STORAGE_IMPL.getItem(TOKEN_KEY)
      } catch {
        return inMemory.token
      }
    }
    return inMemory.token
  },

  getRefreshToken(): string | null {
    if (STORAGE_IMPL) {
      try {
        return STORAGE_IMPL.getItem(REFRESH_TOKEN_KEY)
      } catch {
        return inMemory.refreshToken
      }
    }
    return inMemory.refreshToken
  },

  getTokenTimestamp(): number | null {
    if (STORAGE_IMPL) {
      try {
        const raw = STORAGE_IMPL.getItem(TOKEN_TIMESTAMP_KEY)
        return raw ? Number(raw) || null : null
      } catch {
        return inMemory.tokenTs
      }
    }
    return inMemory.tokenTs
  },

  setToken(token: string): void {
    if (typeof token !== 'string' || token.length === 0) {
      TokenStorage.clearToken()
      return
    }
    const now = Date.now()
    if (STORAGE_IMPL) {
      try {
        STORAGE_IMPL.setItem(TOKEN_KEY, token)
        STORAGE_IMPL.setItem(TOKEN_TIMESTAMP_KEY, String(now))
        return
      } catch {
        // fall through to in-memory
      }
    }
    inMemory.token = token
    inMemory.tokenTs = now
  },

  setRefreshToken(refreshToken: string): void {
    if (typeof refreshToken !== 'string' || refreshToken.length === 0) {
      TokenStorage.clearRefreshToken()
      return
    }
    if (STORAGE_IMPL) {
      try {
        STORAGE_IMPL.setItem(REFRESH_TOKEN_KEY, refreshToken)
        return
      } catch {
        // fall through to in-memory
      }
    }
    inMemory.refreshToken = refreshToken
  },

  setTokens(accessToken: string, refreshToken?: string): void {
    TokenStorage.setToken(accessToken)
    if (refreshToken) TokenStorage.setRefreshToken(refreshToken)
  },

  clearRefreshToken(): void {
    if (STORAGE_IMPL) {
      try {
        STORAGE_IMPL.removeItem(REFRESH_TOKEN_KEY)
        return
      } catch {
        // fall through
      }
    }
    inMemory.refreshToken = null
  },

  clearToken(): void {
    if (STORAGE_IMPL) {
      try {
        STORAGE_IMPL.removeItem(TOKEN_KEY)
        STORAGE_IMPL.removeItem(REFRESH_TOKEN_KEY)
        STORAGE_IMPL.removeItem(TOKEN_TIMESTAMP_KEY)
        return
      } catch {
        // fall through
      }
    }
    inMemory.token = null
    inMemory.refreshToken = null
    inMemory.tokenTs = null
  },

  isAuthenticated(): boolean {
    return Boolean(TokenStorage.getToken())
  },
} as const
