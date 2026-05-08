import { apiClient } from './client'
import type { Purchase, ShoppingSession } from '../types/api'

type StartShoppingInput = {
  participantId?: string
}

type FinishShoppingInput = {
  totalAmount: number
  participantId: string
}

export function startShopping(slug: string, input: StartShoppingInput) {
  return apiClient.post<ShoppingSession>(`/rooms/${slug}/shopping/start`, input)
}

export function finishShopping(slug: string, sessionId: string, input: FinishShoppingInput) {
  return apiClient.post<Purchase>(`/rooms/${slug}/shopping/${sessionId}/finish`, input)
}

export function getActiveSession(slug: string) {
  return apiClient.get<ShoppingSession | null>(`/rooms/${slug}/shopping/active`)
}

export function cancelShopping(slug: string, sessionId: string) {
  return apiClient.delete<{ success: boolean }>(`/rooms/${slug}/shopping/${sessionId}`)
}
