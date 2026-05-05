import { apiClient } from './client'
import type { Item, ItemCategory, ItemStatus } from '../types/api'

type CreateItemInput = {
  name: string
  quantity: string
  category: ItemCategory
}

type UpdateItemInput = Partial<CreateItemInput> & {
  status?: ItemStatus
}

export function listItems(slug: string) {
  return apiClient.get<Item[]>(`/rooms/${slug}/items`)
}

export function createItem(slug: string, input: CreateItemInput) {
  return apiClient.post<Item>(`/rooms/${slug}/items`, input)
}

export function updateItem(slug: string, itemId: string, input: UpdateItemInput) {
  return apiClient.patch<Item>(`/rooms/${slug}/items/${itemId}`, input)
}

export function deleteItem(slug: string, itemId: string) {
  return apiClient.delete<void>(`/rooms/${slug}/items/${itemId}`)
}
