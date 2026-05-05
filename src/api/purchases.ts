import { apiClient } from './client'
import type { Purchase, PurchaseDetail } from '../types/api'

export function listPurchases(slug: string) {
  return apiClient.get<Purchase[]>(`/rooms/${slug}/purchases`)
}

export function getPurchaseDetail(slug: string, purchaseId: string) {
  return apiClient.get<PurchaseDetail>(`/rooms/${slug}/purchases/${purchaseId}`)
}
