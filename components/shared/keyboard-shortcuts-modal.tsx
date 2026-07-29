'use client'

import { useEffect, useCallback, useState } from 'react'
import { X } from 'lucide-react'

interface Shortcut {
  keys: string
  handler: () => void
  description: string
  category: 'Navigation' | 'General'
}

interface KeyboardShortcutsModalProps {
  shortcuts: Shortcut[]
  onClose: () => void
  isOpen: boolean
}

export function KeyboardShortcutsModal({ shortcuts, onClose, isOpen }: KeyboardShortcutsModalProps) {
  const navigationShortcuts = shortcuts.filter(s => s.category === 'Navigation')
  const generalShortcuts = shortcuts.filter(s => s.category === 'General')

  const formatKeys = (keys: string) => {
    if (keys === 'Escape') return 'Esc'
    if (keys === '?') return '?'
    return keys.split(' ').map(k => k.toUpperCase()).join(' then ')
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Navigation</h3>
            <div className="space-y-2">
              {navigationShortcuts.map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{s.description}</span>
                  <kbd className="px-2.5 py-1 bg-gray-100 border border-gray-300 rounded-md text-xs font-mono text-gray-700 shadow-sm">
                    {formatKeys(s.keys)}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">General</h3>
            <div className="space-y-2">
              {generalShortcuts.map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{s.description}</span>
                  <kbd className="px-2.5 py-1 bg-gray-100 border border-gray-300 rounded-md text-xs font-mono text-gray-700 shadow-sm">
                    {formatKeys(s.keys)}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Press <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">?</kbd> to open this modal at any time.
          </p>
        </div>
      </div>
    </div>
  )
}
