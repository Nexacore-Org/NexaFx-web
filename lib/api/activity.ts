import { apiClient } from '../api-client'

export type ActivityEventType =
  | 'login'
  | 'logout'
  | 'password_changed'
  | 'profile_updated'
  | '2fa_enabled'
  | '2fa_disabled'
  | 'withdrawal_submitted'
  | 'kyc_verified'

export interface ActivityEvent {
  id: string
  type: ActivityEventType
  description: string
  ipAddress?: string
  deviceInfo?: string
  createdAt: string
}

export const getActivityLog = (): Promise<ActivityEvent[]> =>
  apiClient('/users/activity', { useProxy: false })
