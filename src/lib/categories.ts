import type { ItemCategory } from '../types/api'

export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  COMIDA: 'Comida',
  LIMPEZA: 'Limpeza',
  HIGIENE: 'Higiene',
  DIA_A_DIA: 'Dia a dia',
  BEBIDAS: 'Bebidas',
  OUTROS: 'Outros',
}

/** Chips used on room list filters (subset per mockups). */
export const ROOM_FILTER_CATEGORIES: ItemCategory[] = ['COMIDA', 'LIMPEZA', 'HIGIENE']
