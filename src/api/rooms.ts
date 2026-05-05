import { apiClient } from './client'
import type { Room } from '../types/api'

type CreateRoomInput = {
  name: string
  plannedDate?: string
}

type UpdateRoomInput = Partial<CreateRoomInput>

export function createRoom(input: CreateRoomInput) {
  return apiClient.post<Room>('/rooms', input)
}

export function getRoom(slug: string) {
  return apiClient.get<Room>(`/rooms/${slug}`)
}

export function updateRoom(slug: string, input: UpdateRoomInput) {
  return apiClient.patch<Room>(`/rooms/${slug}`, input)
}

export function archiveRoom(slug: string) {
  return apiClient.post<Room>(`/rooms/${slug}/archive`)
}
