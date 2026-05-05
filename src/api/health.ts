import { apiClient } from './client'

type HealthResponse = {
  status: string
}

export function getHealth() {
  return apiClient.get<HealthResponse>('/health')
}
