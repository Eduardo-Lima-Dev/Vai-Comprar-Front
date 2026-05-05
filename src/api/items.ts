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

/** Resposta agrupada por categoria (API em produção). */
type GroupedRoomItemsResponse = {
  pending: Partial<Record<ItemCategory, Item[]>>
  purchased: Partial<Record<ItemCategory, Item[]>>
}

const ITEM_CATEGORIES: ItemCategory[] = [
  'COMIDA',
  'LIMPEZA',
  'HIGIENE',
  'DIA_A_DIA',
  'BEBIDAS',
  'OUTROS',
]

function isGroupedItemsPayload(payload: unknown): payload is GroupedRoomItemsResponse {
  if (typeof payload !== 'object' || payload === null) return false
  const o = payload as Record<string, unknown>
  return 'pending' in o && 'purchased' in o && typeof o.pending === 'object' && o.pending !== null
}

function flattenGroupedItems(data: GroupedRoomItemsResponse): Item[] {
  const out: Item[] = []
  for (const cat of ITEM_CATEGORIES) {
    const pend = data.pending?.[cat]
    const bought = data.purchased?.[cat]
    if (Array.isArray(pend)) out.push(...pend)
    if (Array.isArray(bought)) out.push(...bought)
  }
  return out
}

export async function listItems(slug: string): Promise<Item[]> {
  const payload = await apiClient.get<Item[] | GroupedRoomItemsResponse>(`/rooms/${slug}/items`)
  if (Array.isArray(payload)) return payload
  if (isGroupedItemsPayload(payload)) return flattenGroupedItems(payload)
  return []
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
