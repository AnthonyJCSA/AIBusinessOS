'use client'

import { useState } from 'react'
import { inventoryService } from '@/lib/services/inventory.service'

interface Props {
  product: { id: string; name: string; stock: number; org_id?: string; organization_id?: string }
  userId: string
  orgId: string
  onClose: () => void
  onDone: () => void
}

const REASONS = [
  { value: 'restock',    label: '📦 Reabastecimiento' },
  { value: 'damage',     label: '💥 Merma / Daño' },
  { value: 'theft',      label: '🔒 Robo / Pérdida' },
  { value: 'correction', label: '✏️ Corrección de conteo' },
  { value: 'return',     label: '↩️ Devolución' },
  { value: 'other',      label: '📝 Otro' },
]

export default function StockAdjustModal({ product, userId, orgId, onClose, onDone }: Props) {
  const [newStock, setNewStock] = useState(String(product.stock))
  const [reason, setReason] = useState('correction')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const diff = Number(newStock) - product.stock
  const diffColor = diff > 0 ? 'var(--green)' : diff < 0 ? 'var(--red)' : 'var(--muted)'
  const diffLabel = diff > 0 ? `+${diff}` : String(diff)

  const handleSave = async () => {
    const ns = Number(newStock)
    if (isNaN(ns) || ns < 0) { setError('Stock inválido'); return }
    if (diff === 0) { onClose(); return }
    setSaving(true); setError('')
    try {
      await inventoryService.adjustStock(orgId, product.id, ns, reason, userId)
      onDone()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border2)' }}>
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <span className="font-extrabold" style={{ color: 'var(--text)' }}>Ajustar Stock</span>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: 'var(--surface)', color: 'var(--muted)' }}>✕</button>
        </div>

        <div className="p-5 space-y-4">
          {/* Product info */}
          <div className="p-3 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="text-xs font-bold" style={{ color: 'var(--text)' }}>{product.name}</div>
            <div className="text-[10px] mt-0.5" style={{ color: 'var(--muted)' }}>
              Stock actual: <span className="font-bold" style={{ color: 'var(--accent)' }}>{product.stock} unidades</span>
            </div>
          </div>

          {/* New stock input */}
          <div>
            <label className="text-[10px] font-semibold mb-1 block" style={{ color: 'var(--muted)' }}>Nuevo stock</label>
            <input
              type="number"
              min="0"
              value={newStock}
              onChange={e => setNewStock(e.target.value)}
              autoFocus
              className="w-full px-3 py-3 rounded-lg text-xl font-bold outline-none text-center"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
          </div>

          {/* Diff display */}
          {newStock !== '' && diff !== 0 && (
            <div className="flex items-center justify-between p-3 rounded-xl" style={{
              background: diff > 0 ? 'rgba(16,185,129,.06)' : 'rgba(239,68,68,.06)',
              border: `1px solid ${diff > 0 ? 'rgba(16,185,129,.2)' : 'rgba(239,68,68,.2)'}`,
            }}>
              <span className="text-xs" style={{ color: 'var(--muted)' }}>Diferencia</span>
              <span className="text-lg font-extrabold" style={{ color: diffColor }}>{diffLabel} uds</span>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="text-[10px] font-semibold mb-1 block" style={{ color: 'var(--muted)' }}>Motivo</label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs outline-none"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
            >
              {REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          {error && <div className="text-xs" style={{ color: 'var(--red)' }}>{error}</div>}
        </div>

        <div className="p-5 pt-0 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg text-xs font-semibold" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || newStock === '' || Number(newStock) < 0}
            className="flex-1 py-2 rounded-lg text-xs font-bold text-white disabled:opacity-50"
            style={{ background: 'var(--gradient)' }}
          >
            {saving ? 'Guardando…' : diff === 0 ? 'Sin cambios' : 'Confirmar ajuste'}
          </button>
        </div>
      </div>
    </div>
  )
}
