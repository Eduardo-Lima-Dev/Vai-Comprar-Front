import { apiClient } from './client'
import type { Participant, RoomParticipant } from '../types/api'

type AddParticipantInput = {
  name: string
}

export function getParticipants(slug: string) {
  return apiClient.get<RoomParticipant[]>(`/rooms/${slug}/participants`)
}

export function addParticipant(slug: string, input: AddParticipantInput) {
  return apiClient.post<Participant>(`/rooms/${slug}/participants`, input)
}

export function removeParticipant(slug: string, participantId: string) {
  return apiClient.delete<void>(`/rooms/${slug}/participants/${participantId}`)
}
