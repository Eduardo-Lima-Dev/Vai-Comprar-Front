import { env } from '../config/env'
import { clearSessionToken, getSessionToken } from '../lib/session'

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
}

export class ApiError extends Error {
  readonly status: number
  readonly details: unknown

  constructor(message: string, status: number, details: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = getSessionToken()

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const contentType = response.headers.get('content-type') ?? ''
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    if (response.status === 401) {
      clearSessionToken()
    }

    const message =
      typeof payload === 'object' && payload && 'message' in payload
        ? String(payload.message)
        : response.status === 401
          ? 'Sessao expirada ou nao autorizada. Faca login novamente.'
          : `Erro ${response.status} ao consumir API.`
    throw new ApiError(message, response.status, payload)
  }

  return payload as T
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
