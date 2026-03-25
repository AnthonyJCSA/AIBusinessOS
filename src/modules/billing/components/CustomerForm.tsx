'use client'
import { useState } from 'react'
import { DocumentSearchInput } from './DocumentSearchInput'
import { DniResult } from '@/lib/integrations/peruapi/peruapi.types'

export interface CustomerFormData {
  docType:    'DNI' | 'CE' | 'PASAPORTE' | ''
  docNumber:  string
  nombres:    string
  apellidos:  string
  fullName:   string
  phone:      string
  email:      string
  address:    string
}

const EMPTY: CustomerFormData = {
  docType: 'DNI', docNumber: '', nombres: '', apellidos: '',
  fullName: '', phone: '', email: '', address: '',
}

interface Props {
  value: CustomerFormData
  onChange: (data: CustomerFormData) => void
  compact?: boolean   // versión reducida para el POS
}

export function CustomerForm({ value, onChange, compact = false }: Props) {
  const [autoFilled, setAutoFilled] = useState(false)

  function handleDniFound(raw: Record<string, string>) {
    const result = raw as unknown as DniResult
    onChange({
      ...value,
      docNumber: result.dni,
      nombres:   result.nombres,
      apellidos: `${result.apellidoPaterno} ${result.apellidoMaterno}`.trim(),
      fullName:  result.nombreCompleto,
    })
    setAutoFilled(true)
  }

  function handleField(field: keyof CustomerFormData, v: string) {
    setAutoFilled(false)
    onChange({ ...value, [field]: v })
  }

  return (
    <div className="flex flex-col gap-[10px]">

      {/* Tipo de documento */}
      {!compact && (
        <div className="flex flex-col gap-[5px]">
          <label className="text-[10px] font-bold uppercase tracking-[.5px]" style={{ color: 'var(--muted)' }}>
            Tipo de documento
          </label>
          <div className="flex gap-[5px]">
            {(['DNI', 'CE', 'PASAPORTE'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => { onChange({ ...EMPTY, docType: t }); setAutoFilled(false) }}
                className="px-[12px] py-[6px] rounded-[7px] text-[11px] font-semibold transition-all"
                style={{
                  background: value.docType === t ? 'rgba(99,102,241,.15)' : 'var(--surface)',
                  border:     `1px solid ${value.docType === t ? 'rgba(99,102,241,.4)' : 'var(--border)'}`,
                  color:      value.docType === t ? 'var(--accent)' : 'var(--muted)',
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Búsqueda por DNI */}
      {value.docType === 'DNI' && (
        <div className="flex flex-col gap-[5px]">
          <label className="text-[10px] font-bold uppercase tracking-[.5px]" style={{ color: 'var(--muted)' }}>
            Número de DNI
          </label>
          <DocumentSearchInput
            type="DNI"
            onFound={handleDniFound}
          />
        </div>
      )}

      {/* Número de documento para CE / PASAPORTE */}
      {value.docType !== 'DNI' && (
        <div className="flex flex-col gap-[5px]">
          <label className="text-[10px] font-bold uppercase tracking-[.5px]" style={{ color: 'var(--muted)' }}>
            Número de documento
          </label>
          <input
            className="fi-dark"
            value={value.docNumber}
            onChange={e => handleField('docNumber', e.target.value)}
            placeholder="Número de documento"
          />
        </div>
      )}

      {/* Banner de autocompletado */}
      {autoFilled && (
        <div
          className="flex items-center gap-[6px] px-[10px] py-[6px] rounded-[7px] text-[11px]"
          style={{ background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.2)', color: 'var(--green)' }}
        >
          <span>✓</span>
          <span>Datos completados automáticamente desde RENIEC</span>
        </div>
      )}

      {/* Nombres y apellidos */}
      <div className={`grid gap-[8px] ${compact ? 'grid-cols-1' : 'grid-cols-2'}`}>
        <div className="flex flex-col gap-[5px]">
          <label className="text-[10px] font-bold uppercase tracking-[.5px]" style={{ color: 'var(--muted)' }}>
            Nombres
          </label>
          <input
            className="fi-dark"
            value={value.nombres}
            onChange={e => handleField('nombres', e.target.value)}
            placeholder="Nombres"
          />
        </div>
        <div className="flex flex-col gap-[5px]">
          <label className="text-[10px] font-bold uppercase tracking-[.5px]" style={{ color: 'var(--muted)' }}>
            Apellidos
          </label>
          <input
            className="fi-dark"
            value={value.apellidos}
            onChange={e => handleField('apellidos', e.target.value)}
            placeholder="Apellidos"
          />
        </div>
      </div>

      {/* Contacto — solo en modo completo */}
      {!compact && (
        <div className="grid grid-cols-2 gap-[8px]">
          <div className="flex flex-col gap-[5px]">
            <label className="text-[10px] font-bold uppercase tracking-[.5px]" style={{ color: 'var(--muted)' }}>
              Teléfono
            </label>
            <input
              className="fi-dark"
              type="tel"
              value={value.phone}
              onChange={e => handleField('phone', e.target.value)}
              placeholder="9XXXXXXXX"
            />
          </div>
          <div className="flex flex-col gap-[5px]">
            <label className="text-[10px] font-bold uppercase tracking-[.5px]" style={{ color: 'var(--muted)' }}>
              Email
            </label>
            <input
              className="fi-dark"
              type="email"
              value={value.email}
              onChange={e => handleField('email', e.target.value)}
              placeholder="correo@ejemplo.com"
            />
          </div>
          <div className="flex flex-col gap-[5px] col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-[.5px]" style={{ color: 'var(--muted)' }}>
              Dirección
            </label>
            <input
              className="fi-dark"
              value={value.address}
              onChange={e => handleField('address', e.target.value)}
              placeholder="Dirección (opcional)"
            />
          </div>
        </div>
      )}
    </div>
  )
}
