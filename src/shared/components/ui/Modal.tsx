'use client'
import { useEffect } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
}

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className={`w-full ${sizes[size]} rounded-2xl p-6`}
        style={{ background: 'var(--card)', border: '1px solid var(--border2)' }}
      >
        {title && (
          <div className="flex items-center justify-between mb-5">
            <span className="text-base font-extrabold" style={{ color: 'var(--text)' }}>
              {title}
            </span>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}
            >
              ✕
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
