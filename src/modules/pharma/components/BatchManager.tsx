'use client'
import { useState } from 'react'
import { useBatches } from '../hooks/usePharma'
import { pharmaService } from '../services/pharma.service'
import type { DBProductBatch } from '@/types/pharma.types'

interface Props {
  orgId:       string
  productId:   string
  productName: string
}

const EMPTY = { batchNumber: '', expiryDate: '', quantity: 0, costPrice: '' }

function BatchRow({ batch }: { batch: DBProductBatch }) {
  const level = pharmaService.classifyExpiry(
    Math.floor((new Date(batch.expiry_date).getTime() - Date.now()) / 86400000)
  )
  const colors = {
    expired:  { color: 'var(--red)',   bg: 'rgba(239,68,68,.1)'   },
    critical: { color: 'var(--red)',   bg: 'rgba(239,68,68,.08)'  },
    warning:  { color: 'var(--amber)', bg: 'rgba(245,158,11,.08)' },
    ok:       { color: 'var(--green)', bg: 'rgba(16,185,129,.08)' },
  }
  const s    = colors[level]
  const date = new Date(batch.expiry_date).toLocaleDateString('es-PE')

  return (
    <div className="flex items-center gap-[10px] px-[12px] py-[9px] rounded-[9px]"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-bold font-mono" style={{ color: 'var(--text)' }}>
          {batch.batch_number}
        </div>
        <div className="text-[10px]" style={{ color: 'var(--muted)' }}>
          Vence {date} · {batch.quantity} unid.
          {batch.cost_price ? ` · Costo S/ ${Number(batch.cost_price).toFixed(2)}` : ''}
        </div>
      </div>
      <span className="px-[8px] py-[2px] rounded-full text-[10px] font-bold"
        style={{ background: s.bg, color: s.color }}>
        {level === 'expired' ? 'Vencido' : level === 'critical' ? 'Crítico' : level === 'warning' ? 'Alerta' : 'OK'}
      </span>
    </div>
  )
}

export function BatchManager({ orgId, productId, productName }: Props) {
  const { batches, loading, error, addBatch } = useBatches(orgId, productId)
  const [form, setForm]     = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [formErr, setFormErr] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setFormErr(null)
    if (!form.batchNumber || !form.expiryDate || form.quantity <= 0) {
      setFormErr('Lote, fecha y cantidad son requeridos')
      return
    }
    setSaving(true)
    try {
      await addBatch({
        batchNumber: form.batchNumber,
        expiryDate:  form.expiryDate,
        quantity:    form.quantity,
        costPrice:   form.costPrice ? Number(form.costPrice) : undefined,
      })
      setForm(EMPTY)
      setShowForm(false)
    } catch (e) {
      setFormErr((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-[10px]">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[12px] font-bold" style={{ color: 'var(--text)' }}>{productName}</div>
          <div className="text-[10px]" style={{ color: 'var(--muted)' }}>
            {batches.length} lote{batches.length !== 1 ? 's' : ''} registrado{batches.length !== 1 ? 's' : ''}
          </div>
        </div>
        <button onClick={() => setShowForm(v => !v)}
          className="px-[10px] py-[5px] rounded-[7px] text-[11px] font-bold"
          style={{ background: 'var(--gradient)', color: '#fff' }}>
          + Lote
        </button>
      </div>

      {/* Formulario nuevo lote */}
      {showForm && (
        <form onSubmit={handleAdd}
          className="flex flex-col gap-[8px] p-[12px] rounded-[9px]"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="grid grid-cols-2 gap-[8px]">
            <div className="flex flex-col gap-[4px]">
              <label className="text-[10px] font-bold uppercase tracking-[.5px]" style={{ color: 'var(--muted)' }}>Nº Lote *</label>
              <input className="fi-dark" value={form.batchNumber}
                onChange={e => setForm(f => ({ ...f, batchNumber: e.target.value }))}
                placeholder="Ej: LOT-2024-001" />
            </div>
            <div className="flex flex-col gap-[4px]">
              <label className="text-[10px] font-bold uppercase tracking-[.5px]" style={{ color: 'var(--muted)' }}>Vencimiento *</label>
              <input type="date" className="fi-dark" value={form.expiryDate}
                onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-[4px]">
              <label className="text-[10px] font-bold uppercase tracking-[.5px]" style={{ color: 'var(--muted)' }}>Cantidad *</label>
              <input type="number" min="1" className="fi-dark" value={form.quantity || ''}
                onChange={e => setForm(f => ({ ...f, quantity: parseInt(e.target.value) || 0 }))} />
            </div>
            <div className="flex flex-col gap-[4px]">
              <label className="text-[10px] font-bold uppercase tracking-[.5px]" style={{ color: 'var(--muted)' }}>Costo unitario</label>
              <input type="number" step="0.01" className="fi-dark" value={form.costPrice}
                onChange={e => setForm(f => ({ ...f, costPrice: e.target.value }))}
                placeholder="0.00" />
            </div>
          </div>

          {formErr && (
            <div className="text-[11px] px-[8px] py-[5px] rounded-[6px]"
              style={{ background: 'rgba(239,68,68,.08)', color: 'var(--red)' }}>
              {formErr}
            </div>
          )}

          <div className="flex gap-[6px] justify-end">
            <button type="button" onClick={() => setShowForm(false)}
              className="px-[12px] py-[6px] rounded-[7px] text-[11px]"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="px-[12px] py-[6px] rounded-[7px] text-[11px] font-bold text-white disabled:opacity-50"
              style={{ background: 'var(--gradient)' }}>
              {saving ? 'Guardando...' : 'Guardar lote'}
            </button>
          </div>
        </form>
      )}

      {/* Lista de lotes */}
      {loading ? (
        <div className="flex justify-center py-[16px]">
          <span className="w-[14px] h-[14px] rounded-full border-2 animate-spin"
            style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
        </div>
      ) : batches.length === 0 ? (
        <div className="text-center py-[16px] text-[11px]" style={{ color: 'var(--sub)' }}>
          Sin lotes registrados
        </div>
      ) : (
        <div className="flex flex-col gap-[5px]">
          {batches.map(b => <BatchRow key={b.id} batch={b} />)}
        </div>
      )}
    </div>
  )
}
