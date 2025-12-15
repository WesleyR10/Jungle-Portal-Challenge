export type ApiError = {
  status: number
  message: string
}

export async function apiFetch<T>(
  input: string,
  init: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const { auth, headers, ...rest } = init
  const base =
    (import.meta as unknown as { env?: Record<string, string> })?.env?.[
      'VITE_API_URL'
    ] ?? `${window.location.protocol}//${window.location.hostname}:3000`
  const url = input.startsWith('http') ? input : `${base}${input}`

  const finalHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  }

  if (auth) {
    const raw = window.localStorage.getItem('auth_tokens')
    if (raw) {
      try {
        const { accessToken } = JSON.parse(raw) as {
          accessToken: string | null
        }
        if (accessToken) {
          ;(finalHeaders as Record<string, string>).Authorization =
            `Bearer ${accessToken}`
        }
      } catch {}
    }
  }

  const response = await fetch(url, {
    ...rest,
    headers: finalHeaders,
  })

  if (!response.ok) {
    let message = 'Erro inesperado'
    try {
      const data = (await response.json()) as { message?: string | string[] }
      if (typeof data.message === 'string') {
        message = data.message
      } else if (Array.isArray(data.message) && data.message.length > 0) {
        message = String(data.message[0])
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

  return (await response.json()) as T
}
