export type ApiError = {
  status: number
  message: string
}

export async function apiFetch<T>(
  input: string,
  init: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const { auth, headers, ...rest } = init

  const base = import.meta.env.VITE_API_URL

  if (!base) {
    throw new Error('VITE_API_URL não configurada no frontend (.env)')
  }

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

  console.info('[apiFetch] request', {
    url,
    method: rest.method || 'GET',
  })
  let response: Response
  try {
    response = await fetch(url, {
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
  console.info('[apiFetch] response ok', {
    url,
    status: response.status,
  })
  return data
}
