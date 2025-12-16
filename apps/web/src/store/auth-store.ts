import { create } from 'zustand'

type AuthState = {
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  login: (tokens: { accessToken: string; refreshToken: string }) => void
  logout: () => void
}

const initialTokens = getInitialAuthFromStorage()

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: initialTokens.accessToken,
  refreshToken: initialTokens.refreshToken,
  isAuthenticated: !!initialTokens.accessToken,
  login: ({ accessToken, refreshToken }) =>
    set((state) => {
      window.localStorage.setItem(
        'auth_tokens',
        JSON.stringify({ accessToken, refreshToken })
      )

      return {
        ...state,
        accessToken,
        refreshToken,
        isAuthenticated: true,
      }
    }),
  logout: () =>
    set((state) => {
      window.localStorage.removeItem('auth_tokens')

      return {
        ...state,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      }
    }),
}))

export function getInitialAuthFromStorage() {
  if (typeof window === 'undefined')
    return { accessToken: null, refreshToken: null }

  try {
    const raw = window.localStorage.getItem('auth_tokens')
    if (!raw) return { accessToken: null, refreshToken: null }
    return JSON.parse(raw) as {
      accessToken: string | null
      refreshToken: string | null
    }
  } catch {
    return { accessToken: null, refreshToken: null }
  }
}
