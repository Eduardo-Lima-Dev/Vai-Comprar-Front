import { apiClient } from './client'
import type { AuthResponse, User } from '../types/api'

type RegisterInput = {
  name: string
  email: string
  password: string
}

type LoginInput = {
  email: string
  password: string
}

export function register(input: RegisterInput) {
  return apiClient.post<unknown>('/auth/register', input).then(normalizeAuthResponse)
}

export function login(input: LoginInput) {
  return apiClient.post<unknown>('/auth/login', input).then(normalizeAuthResponse)
}

export function getMe() {
  return apiClient.get<unknown>('/auth/me').then(normalizeUserPayload)
}

export function getProfile() {
  return apiClient.get<unknown>('/auth/profile').then(normalizeUserPayload)
}

type UpdateProfileInput = {
  name?: string
  email?: string
  password?: string
}

export function updateProfile(input: UpdateProfileInput) {
  return apiClient.patch<unknown>('/auth/profile', input).then(normalizeUserPayload)
}

function normalizeAuthResponse(payload: unknown): AuthResponse {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Resposta de autenticacao invalida.')
  }

  const source = payload as Record<string, unknown>
  const data =
    source.data && typeof source.data === 'object'
      ? (source.data as Record<string, unknown>)
      : source

  const tokenCandidates = [source.token, source.accessToken, source.access_token, data.token, data.accessToken, data.access_token]
  const token = tokenCandidates.find((candidate) => typeof candidate === 'string' && candidate.trim()) as string | undefined

  if (!token) {
    throw new Error('Nao foi possivel obter token de autenticacao.')
  }

  const userCandidateRaw = (data.user ?? source.user) as unknown
  return {
    token,
    user: userCandidateRaw ? normalizeUserPayload(userCandidateRaw) : undefined,
  }
}

function normalizeUserPayload(payload: unknown): User {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Dados de usuario invalidos.')
  }

  const source = payload as Record<string, unknown>
  const userSource =
    source.user && typeof source.user === 'object'
      ? (source.user as Record<string, unknown>)
      : source

  const id = String(userSource.id ?? userSource.userId ?? userSource.sub ?? '')
  const name = String(userSource.name ?? userSource.fullName ?? userSource.username ?? '')
  const email = String(userSource.email ?? '')

  const createdAt = typeof userSource.createdAt === 'string' ? userSource.createdAt : undefined
  const updatedAt = typeof userSource.updatedAt === 'string' ? userSource.updatedAt : undefined

  return { id, name, email, createdAt, updatedAt }
}
