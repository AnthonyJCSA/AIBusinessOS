'use client'
import { useState, useRef } from 'react'

interface Props {
  type: 'DNI' | 'RUC'
  onFound: (data: Record<string, string>) => void
  disabled?: boolean
}

const CONFIG = {
  DNI: { length: 8, placeholder: '12345678', label: 'DNI', endpoint: '/api/dni' },
  RUC: { length: 11, placeholder: '20123456789', label: 'RUC', endpoint: '/api/ruc' },
}

export function DocumentSearchInput({ type, onFound, disabled }: Props) {
  const [value, setValue]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState<string | null>(null)
  const [found, setFound]   = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const cfg = CONFIG[type]

  async function handleSearch() {
    if (value.length !== cfg.length) return
    setLoading(true)
    setError(null)
    setFound(false)

    try {
      const res  = await fetch(`${cfg.endpoint}/${value}`)
      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? `No se encontró el ${cfg.label}`)
        setLoading(false)
        return
      }

      setFound(true)
      onFound(json)
    } catch {
      setError('Error de conexión. Verifique su internet.')
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value.replace(/\D/g, '').slice(0, cfg.length)
    setValue(v)
    setError(null)
    setFound(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && value.length === cfg.length) handleSearch()
  }

  const canSearch = value.length === cfg.length && !loading && !disabled

  return (
    <div className="flex flex-col gap-[5px]">
      <div className="flex gap-[6px]">
        <div
          className="flex items-center gap-2 flex-1 px-[11px] rounded-[9px] transition-all"
          style={{
            background:  'var(--surface)',
            border:      `1px solid ${error ? 'var(--red)' : found ? 'var(--green)' : 'var(--border)'}`,
            height:      '38px',
          }}
        >
          {/* Icono tipo documento */}
          <span className="text-[11px] font-bold flex-shrink-0" style={{ color: 'var(--sub)' }}>
            {type}
          </span>
          <div style={{ width: '1px', height: '14px', background: 'var(--border)' }} />
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={cfg.placeholder}
            disabled={disabled || loading}
            className="flex-1 bg-transparent outline-none text-sm font-mono"
            style={{ color: 'var(--text)', letterSpacing: '0.05em' }}
          />
          {/* Indicador de estado inline */}
          {loading && (
            <span
              className="w-[14px] h-[14px] rounded-full border-2 border-t-transparent flex-shrink-0 animate-spin-slow"
              style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
            />
          )}
          {found && !loading && (
            <span className="text-[13px] flex-shrink-0" style={{ color: 'var(--green)' }}>✓</span>
          )}
        </div>

        <button
          onClick={handleSearch}
          disabled={!canSearch}
          className="px-[14px] rounded-[9px] text-[11px] font-bold transition-all flex-shrink-0"
          style={{
            background: canSearch ? 'var(--gradient)' : 'var(--surface)',
            border:     `1px solid ${canSearch ? 'transparent' : 'var(--border)'}`,
            color:      canSearch ? '#fff' : 'var(--sub)',
            height:     '38px',
            cursor:     canSearch ? 'pointer' : 'not-allowed',
          }}
        >
          {loading ? '...' : `Buscar ${cfg.label}`}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div
          className="flex items-center gap-[6px] px-[10px] py-[6px] rounded-[7px] text-[11px]"
          style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', color: 'var(--red)' }}
        >
          <span>⚠</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
