'use client'

import { useSyncExternalStore } from 'react'

const STORAGE_KEY = 'nexafx.read-notifications'
const listeners = new Set<() => void>()
let readIds: string[] = []
let hasInitialised = false

const EMPTY: string[] = []

function readStored(): string[] {
  if (typeof window === 'undefined') return EMPTY
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : EMPTY
  } catch {
    return EMPTY
  }
}

function persist(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(readIds))
  } catch {
    // Ignore storage failures (private mode, quota, etc.)
  }
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange)
  return () => listeners.delete(onChange)
}

function getSnapshot(): string[] {
  if (!hasInitialised && typeof window !== 'undefined') {
    readIds = readStored()
    hasInitialised = true
  }
  return readIds
}

function getServerSnapshot(): string[] {
  return EMPTY
}

export function markNotificationRead(id: string): void {
  if (readIds.includes(id)) return
  readIds = [...readIds, id]
  hasInitialised = true
  persist()
  listeners.forEach((listener) => listener())
}

export function markNotificationsRead(ids: string[]): void {
  const merged = new Set([...readIds, ...ids])
  if (merged.size === readIds.length) return
  readIds = [...merged]
  hasInitialised = true
  persist()
  listeners.forEach((listener) => listener())
}

export function clearReadNotifications(): void {
  readIds = []
  hasInitialised = true
  persist()
  listeners.forEach((listener) => listener())
}

export function useReadNotifications(): {
  readIds: string[]
  isRead: (id: string) => boolean
  markRead: (id: string) => void
  markAllRead: (ids: string[]) => void
} {
  const ids = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  return {
    readIds: ids,
    isRead: (id: string) => ids.includes(id),
    markRead: markNotificationRead,
    markAllRead: markNotificationsRead,
  }
}
