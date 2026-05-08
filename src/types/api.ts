export type ItemCategory =
  | 'COMIDA'
  | 'LIMPEZA'
  | 'HIGIENE'
  | 'DIA_A_DIA'
  | 'BEBIDAS'
  | 'OUTROS'

export type ItemStatus = 'PENDING' | 'PURCHASED'

export type User = {
  id: string
  name: string
  email: string
}

export type AuthResponse = {
  token: string
  user?: User
}

export type Participant = {
  id: string
  name: string
}

export type Room = {
  id: string
  name: string
  slug: string
  createdById?: string
  plannedDate: string | null
  archivedAt?: string | null
  lastAccessedAt?: string | null
  createdAt?: string
  updatedAt?: string
  participants?: Participant[]
}

export type Item = {
  id: string
  name: string
  quantity: string
  category: ItemCategory
  status: ItemStatus
}

export type ShoppingSession = {
  id: string
  startedAt: string
  participantId: string
  participantName?: string
}

export type Purchase = {
  id: string
  totalAmount: number
  createdAt: string
}

export type PurchaseDetail = Purchase & {
  items?: Item[]
  pendingItems?: Item[]
  participant?: Participant | null
}
