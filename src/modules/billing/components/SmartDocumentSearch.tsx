'use client'
import { useState, useRef } from 'react'
import { detectDocumentType } from '../rules/billing.rules'
import type { DniResult, RucResult } from '@/lib/integrations/peruapi/peruapi.types'

export type SmartDocResult =
  | { type: 'DNI'; data: DniResult }
  | { type: 'RUC'; data: RucResult }

interface Props {
  onFound: (result: SmartDocResult) => void
  onManual?: (value: string, type: 'DNI' | 'RUC') => void
  disabled?: boolean
  autoFocus?: boolean
}

export function SmartDocumentSearch({ onFound, onManual, disabled, autoFocus }: Props) {
  const [value, setValue]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [found, setFound]     = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const detectedType = detectDocumentType(value)
  const canSearch    = (detectedType !== null) && !loading && !disabled

  async function handleSearch() {
    if (!detectedType) return
    setLoading(true)
    setError(null)
    setFound(false)

    const endpoint = detectedType === 'DNI' ? `/api/dni/${value}` : `/api/ruc/${value}`

    try {
      const res  = await fetch(endpoint)
      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? `No se encontró el ${detectedType}`)
        setLoading(false)
        return
      }

      setFound(true)
      onFound({ type: detectedType, data: json })
    } catch {
      setError('Error de conexión. Puede continuar ingresando los datos manualmente.')
      onManual?.(value, detectedType)
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value.replace(/\D/g, '').slice(0, 11)
    setValue(v)
    setError(null)
    setFound(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && canSearch) handleSearch()
  }

  const typeLabel = detectedType ?? '—'
  const hint = value.length === 0
    ? 'Ingrese DNI (8 dígitos) o RUC (11 dígitos)'
    : detectedType
      ? `${detectedType} detectado · Enter para buscar`
      : `${value.length} dígitos — DNI=8, RUC=11`

  return (
    <div className="flex flex-col gap-[5px]">
      <div
        className="flex items-center gap-2 px-[11px] rounded-[9px] transition-all"
        style={{
          background: 'var(--surface)',
          border:     `1px solid ${error ? 'var(--red)' : found ? 'var(--green)' : detectedType ? 'rgba(99,102,241,.4)' : 'var(--border)'}`,
          height:     '40px',
        }}
      >
        {/* Badge tipo detectado */}
        <span
          className="text-[10px] font-bold flex-shrink-0 px-[6px] py-[2px] rounded-[5px] transition-all"
          style={{
            background: detectedType ? 'rgba(99,102,241,.15)' : 'var(--border)',
            color:      detectedType ? 'var(--accent)' : 'var(--sub)',
            minWidth:   '30px',
            textAlign:  'center',
          }}
        >
          {typeLabel}
        </span>

        <div style={{ width: '1px', height: '14px', background: 'var(--border)', flexShrink: 0 }} />

        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="DNI o RUC"
          disabled={disabled || loading}
          autoFocus={autoFocus}
          className="flex-1 bg-transparent outline-none text-sm font-mono"
          style={{ color: 'var(--text)', letterSpacing: '0.06em' }}
        />

        {/* Spinner */}
        {loading && (
          <span
            className="w-[14px] h-[14px] rounded-full border-2 flex-shrink-0 animate-spin"
            style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
          />
        )}
        {found && !loading && (
          <span className="text-[13px] flex-shrink-0" style={{ color: 'var(--green)' }}>✓</span>
        )}

        {/* Botón buscar inline */}
        <button
          onClick={handleSearch}
          disabled={!canSearch}
          className="flex-shrink-0 px-[10px] h-[28px] rounded-[6px] text-[11px] font-bold transition-all"
          style={{
            background: canSearch ? 'var(--gradient)' : 'transparent',
            color:      canSearch ? '#fff' : 'var(--sub)',
            cursor:     canSearch ? 'pointer' : 'not-allowed',
            border:     canSearch ? 'none' : '1px solid var(--border)',
          }}
        >
          {loading ? '...' : 'Buscar'}
        </button>
      </div>

      {/* Hint / error */}
      {error ? (
        <div
          className="flex items-center gap-[6px] px-[10px] py-[6px] rounded-[7px] text-[11px]"
          style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', color: 'var(--red)' }}
        >
          <span>⚠</span>
          <span>{error}</span>
          {onManual && detectedType && (
            <button
              onClick={() => onManual(value, detectedType)}
              className="ml-auto underline text-[10px]"
              style={{ color: 'var(--accent)' }}
            >
              Ingresar manualmente
            </button>
          )}
        </div>
      ) : (
        <p className="text-[10px] px-[2px]" style={{ color: 'var(--sub)' }}>{hint}</p>
      )}
    </div>
  )
}
