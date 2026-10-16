import { apiRequest } from '@/lib/api-client'

export type NotificationCategory =
  | 'transactions'
  | 'security'
  | 'promotions'
  | 'system'

export interface AppNotification {
  id: string
  title: string
  body: string
  category: NotificationCategory
  createdAt: string
}

const CATEGORIES: NotificationCategory[] = [
  'transactions',
  'security',
  'promotions',
  'system',
]

function normalize(payload: unknown): AppNotification[] {
  const list =
    Array.isArray(payload)
      ? payload
      : payload && typeof payload === 'object' && 'notifications' in payload
        ? (payload as { notifications?: unknown }).notifications
        : []

  if (!Array.isArray(list)) return []

  return list
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null
      const record = entry as Record<string, unknown>
      const id = record.id
      const title = record.title
      const body = record.body ?? record.message ?? ''
      const category = record.category
      const createdAt = record.createdAt ?? record.created_at
      if (typeof id !== 'string' || typeof title !== 'string') return null
      return {
        id,
        title,
        body: typeof body === 'string' ? body : '',
        category: CATEGORIES.includes(category as NotificationCategory)
          ? (category as NotificationCategory)
          : 'system',
        createdAt: typeof createdAt === 'string' ? createdAt : new Date().toISOString(),
      }
    })
    .filter((entry): entry is AppNotification => entry !== null)
}

export async function getNotifications(): Promise<AppNotification[]> {
  const payload = await apiRequest<unknown>('/api/notifications')
  return normalize(payload)
}

export function categoryLabel(category: NotificationCategory): string {
  return category.charAt(0).toUpperCase() + category.slice(1)
}
