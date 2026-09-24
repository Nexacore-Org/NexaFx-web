import { useEffect, useRef } from 'react'

interface Shortcut {
  keys: string
  handler: () => void
  description: string
  category: 'Navigation' | 'General'
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  const bufferRef = useRef<string[]>([])
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const isFormField = (target: EventTarget | null): boolean => {
    const el = target as HTMLElement
    return el?.tagName === 'INPUT' || el?.tagName === 'TEXTAREA' || el?.tagName === 'SELECT' || el?.isContentEditable
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFormField(e.target)) return

      const key = e.key

      if (key === 'Escape') {
        const esc = shortcuts.find(s => s.keys === 'Escape')
        esc?.handler()
        return
      }

      if (key === '?') {
        const q = shortcuts.find(s => s.keys === '?')
        q?.handler()
        return
      }

      if (key.toLowerCase() === 'g') {
        clearTimeout(timerRef.current)
        bufferRef.current = ['g']
        timerRef.current = setTimeout(() => {
          bufferRef.current = []
        }, 500)
        return
      }

      if (bufferRef.current.length === 1 && bufferRef.current[0] === 'g') {
        const sequenceKey = `g ${key.toLowerCase()}`
        const shortcut = shortcuts.find(s => s.keys === sequenceKey)
        if (shortcut) {
          e.preventDefault()
          shortcut.handler()
        }
        bufferRef.current = []
        clearTimeout(timerRef.current)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      clearTimeout(timerRef.current)
    }
  }, [shortcuts])
}
