import { apiClient } from '../api-client'

export type ScheduleFrequency = 'daily' | 'weekly' | 'monthly'
export type ScheduleType = 'Convert' | 'Withdraw'

export interface Schedule {
  id: string
  type: ScheduleType
  fromCurrency: string
  toCurrency?: string
  amount: number
  frequency: ScheduleFrequency
  nextRunAt: string
  isActive: boolean
  destinationAddress?: string
  createdAt: string
}

export const getSchedules = (): Promise<Schedule[]> =>
  apiClient('/schedules', { useProxy: false })

export const createSchedule = (dto: Omit<Schedule, 'id' | 'nextRunAt' | 'createdAt'>): Promise<Schedule> =>
  apiClient('/schedules', { method: 'POST', useProxy: false, body: JSON.stringify(dto) })

export const deleteSchedule = (id: string): Promise<void> =>
  apiClient(`/schedules/${id}`, { method: 'DELETE', useProxy: false })

export const toggleSchedule = (id: string, isActive: boolean): Promise<Schedule> =>
  apiClient(`/schedules/${id}`, { method: 'PATCH', useProxy: false, body: JSON.stringify({ isActive }) })
