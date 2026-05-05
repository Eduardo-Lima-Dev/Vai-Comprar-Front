import { apiClient } from './client'
import type { Participant } from '../types/api'

type AddParticipantInput = {
  name: string
}

export function addParticipant(slug: string, input: AddParticipantInput) {
  return apiClient.post<Participant>(`/rooms/${slug}/participants`, input)
}

export function removeParticipant(slug: string, participantId: string) {
  return apiClient.delete<void>(`/rooms/${slug}/participants/${participantId}`)
}
