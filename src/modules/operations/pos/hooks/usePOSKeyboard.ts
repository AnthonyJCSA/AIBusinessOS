'use client'
import { useEffect } from 'react'

interface POSKeyboardOptions {
  onProcess: () => void
  onClear: () => void
  onClearSearch: () => void
}

export function usePOSKeyboard({ onProcess, onClear, onClearSearch }: POSKeyboardOptions) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // No activar si el foco está en un input de texto (excepto búsqueda)
      const tag = (e.target as HTMLElement).tagName
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'

      if (e.key === 'F2') { e.preventDefault(); onProcess() }
      if (e.key === 'F1') { e.preventDefault(); onClear() }
      if (e.key === 'Escape' && !isInput) { e.preventDefault(); onClearSearch() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onProcess, onClear, onClearSearch])
}
