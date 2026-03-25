'use client'
import { useState } from 'react'
import { DocumentSearchInput } from './DocumentSearchInput'
import { RucResult } from '@/lib/integrations/peruapi/peruapi.types'

export interface CompanyFormData {
  ruc:        string
  razonSocial: string
  direccion:  string
  estado:     string
  condicion:  string
  email:      string
}

const EMPTY: CompanyFormData = {
  ruc: '', razonSocial: '', direccion: '', estado: '', condicion: '', email: '',
}

interface Props {
  value: CompanyFormData
  onChange: (data: CompanyFormData) => void
}

export function CompanyForm({ value, onChange }: Props) {
  const [autoFilled, setAutoFilled] = useState(false)

  function handleRucFound(raw: Record<string, string>) {
    const result = raw as unknown as RucResult
    onChange({
      ...value,
      ruc:         result.ruc,
      razonSocial: result.razonSocial,
      direccion:   result.direccion,
      estado:      result.estado,
      condicion:   result.condicion,
    })
    setAutoFilled(true)
  }

  function handleField(field: keyof CompanyFormData, v: string) {
    setAutoFilled(false)
    onChange({ ...value, [field]: v })
  }

  const estadoOk = value.estado.toUpperCase() === 'ACTIVO'
  const condicionOk = value.condicion.toUpperCase() === 'HABIDO'

  return (
    <div className="flex flex-col gap-[10px]">

      {/* Búsqueda por RUC */}
      <div className="flex flex-col gap-[5px]">
        <label className="text-[10px] font-bold uppercase tracking-[.5px]" style={{ color: 'var(--muted)' }}>
          RUC de la empresa
        </label>
        <DocumentSearchInput type="RUC" onFound={handleRucFound} />
      </div>

      {/* Banner autocompletado */}
      {autoFilled && (
        <div
          className="flex items-center gap-[6px] px-[10px] py-[6px] rounded-[7px] text-[11px]"
          style={{ background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.2)', color: 'var(--green)' }}
        >
          <span>✓</span>
          <span>Datos completados automáticamente desde SUNAT</span>
        </div>
      )}

      {/* Estado SUNAT — solo si hay datos */}
      {value.estado && (
        <div className="flex gap-[6px]">
          <span
            className="px-[8px] py-[3px] rounded-full text-[10px] font-bold"
            style={{
              background: estadoOk ? 'rgba(16,185,129,.1)' : 'rgba(239,68,68,.1)',
              color:      estadoOk ? 'var(--green)' : 'var(--red)',
            }}
          >
            {estadoOk ? '●' : '○'} {value.estado}
          </span>
          <span
            className="px-[8px] py-[3px] rounded-full text-[10px] font-bold"
            style={{
              background: condicionOk ? 'rgba(16,185,129,.1)' : 'rgba(245,158,11,.1)',
              color:      condicionOk ? 'var(--green)' : 'var(--amber)',
            }}
          >
            {value.condicion}
          </span>
        </div>
      )}

      {/* Razón social */}
      <div className="flex flex-col gap-[5px]">
        <label className="text-[10px] font-bold uppercase tracking-[.5px]" style={{ color: 'var(--muted)' }}>
          Razón social
        </label>
        <input
          className="fi-dark"
          value={value.razonSocial}
          onChange={e => handleField('razonSocial', e.target.value)}
          placeholder="Razón social de la empresa"
        />
      </div>

      {/* Dirección fiscal */}
      <div className="flex flex-col gap-[5px]">
        <label className="text-[10px] font-bold uppercase tracking-[.5px]" style={{ color: 'var(--muted)' }}>
          Dirección fiscal
        </label>
        <input
          className="fi-dark"
          value={value.direccion}
          onChange={e => handleField('direccion', e.target.value)}
          placeholder="Dirección fiscal"
        />
      </div>

      {/* Email para envío del comprobante */}
      <div className="flex flex-col gap-[5px]">
        <label className="text-[10px] font-bold uppercase tracking-[.5px]" style={{ color: 'var(--muted)' }}>
          Email (para envío del comprobante)
        </label>
        <input
          className="fi-dark"
          type="email"
          value={value.email}
          onChange={e => handleField('email', e.target.value)}
          placeholder="contabilidad@empresa.com"
        />
      </div>

      {/* Advertencia si empresa no está activa/habida */}
      {value.estado && (!estadoOk || !condicionOk) && (
        <div
          className="flex items-start gap-[6px] px-[10px] py-[8px] rounded-[7px] text-[11px]"
          style={{ background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.2)', color: 'var(--amber)' }}
        >
          <span className="flex-shrink-0 mt-[1px]">⚠</span>
          <span>
            Esta empresa figura como <strong>{value.estado}</strong> / <strong>{value.condicion}</strong> en SUNAT.
            Verifique antes de emitir la factura.
          </span>
        </div>
      )}
    </div>
  )
}
