import { apiRequest } from '@/lib/api-client'

export interface ProfileUpdate {
  firstName: string | null
  lastName: string | null
}

export interface ProfileResponse {
  user: {
    firstName: string | null
    lastName: string | null
  }
}

export async function updateProfile(input: ProfileUpdate): Promise<ProfileResponse> {
  return apiRequest<ProfileResponse>('/api/profile', {
    method: 'PATCH',
    body: input,
  })
}
