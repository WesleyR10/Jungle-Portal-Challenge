import { env } from '@/env'

export type ApiError = {
  status: number
  message: string
}

function getTokens() {
  if (typeof window === 'undefined') {
    return { accessToken: null, refreshToken: null }
  }

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

function saveTokens(tokens: {
  accessToken: string | null
  refreshToken?: string | null
}) {
  if (typeof window === 'undefined') return

  try {
    const existing = getTokens()
    const payload = {
      accessToken: tokens.accessToken ?? existing.accessToken ?? null,
      refreshToken: tokens.refreshToken ?? existing.refreshToken ?? null,
    }
    window.localStorage.setItem('auth_tokens', JSON.stringify(payload))
  } catch {}
}

export async function apiFetch<T>(
  input: string,
  init: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const { auth, headers, ...rest } = init

  const base = env.VITE_API_URL

  if (!base) {
    throw new Error('VITE_API_URL não configurada no frontend (.env)')
  }

  const url = input.startsWith('http') ? input : `${base}${input}`

  const finalHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  }

  if (auth) {
    const { accessToken } = getTokens()
    if (accessToken) {
      ;(finalHeaders as Record<string, string>).Authorization =
        `Bearer ${accessToken}`
    }
  }
  async function doRequest(): Promise<Response> {
    try {
      return await fetch(url, {
        ...rest,
        headers: finalHeaders,
      })
    } catch (e: any) {
      const aborted =
        typeof e?.name === 'string' && e.name.toLowerCase() === 'aborterror'
      const error: ApiError = {
        status: aborted ? 0 : 500,
        message: aborted ? 'Requisição cancelada' : 'Falha de rede',
      }
      throw error
    }
  }

  let response = await doRequest()

  if (auth && response.status === 401) {
    const { refreshToken } = getTokens()

    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${base}/api/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        })

        if (refreshResponse.ok) {
          const data = (await refreshResponse.json()) as {
            accessToken: string
            refreshToken?: string
          }

          saveTokens({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          })
          ;(finalHeaders as Record<string, string>).Authorization =
            `Bearer ${data.accessToken}`

          response = await doRequest()
        }
      } catch {}
    }
  }

  if (!response.ok) {
    let message = 'Erro inesperado'
    try {
      const data = (await response.json()) as {
        message?: string | string[]
        error?: string
      }
      if (typeof data.message === 'string') {
        message = data.message
      } else if (Array.isArray(data.message) && data.message.length > 0) {
        message = String(data.message[0])
      } else if (typeof data.error === 'string') {
        message = data.error
      }
    } catch {}

    const error: ApiError = {
      status: response.status,
      message,
    }
    throw error
  }

  if (response.status === 204) {
    return undefined as unknown as T
  }

  const data = (await response.json()) as T
  return data
}
