'use client'
import { useState } from 'react'
import { inventoryService } from '@/lib/services'
import { Modal } from '@/shared/components/ui/Modal'

interface StockAdjustModalProps {
  product: { id: string; name: string; stock: number }
  createdBy?: string
  onClose: () => void
  onSuccess: () => void
}

const REASONS = [
  'Conteo físico',
  'Merma / deterioro',
  'Robo / pérdida',
  'Error de registro',
  'Devolución de cliente',
  'Otro',
]

export function StockAdjustModal({ product, createdBy, onClose, onSuccess }: StockAdjustModalProps) {
  const [newStock, setNewStock] = useState(String(product.stock))
  const [reason, setReason] = useState(REASONS[0])
  const [customReason, setCustomReason] = useState('')
  const [loading, setLoading] = useState(false)

  const diff = Number(newStock) - product.stock
  const finalReason = reason === 'Otro' ? customReason : reason

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!finalReason.trim()) { alert('Ingresa un motivo'); return }
    if (Number(newStock) < 0) { alert('El stock no puede ser negativo'); return }
    setLoading(true)
    try {
      await inventoryService.adjustStock(product.id, Number(newStock), finalReason, createdBy)
      onSuccess()
      onClose()
    } catch {
      alert('❌ Error al ajustar stock')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open title="⚖️ Ajustar Stock" onClose={onClose} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div
          className="p-3 rounded-xl text-center"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div className="text-xs font-bold mb-1" style={{ color: 'var(--muted)' }}>{product.name}</div>
          <div className="text-2xl font-extrabold" style={{ color: 'var(--text)' }}>
            {product.stock} uds actuales
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase tracking-[.5px]" style={{ color: 'var(--muted)' }}>
            Nuevo stock *
          </label>
          <input
            type="number" min="0" required
            value={newStock}
            onChange={e => setNewStock(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-lg font-bold text-center outline-none"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
            autoFocus
          />
          {newStock !== '' && (
            <div
              className="text-xs font-semibold text-center mt-1"
              style={{ color: diff > 0 ? 'var(--green)' : diff < 0 ? 'var(--red)' : 'var(--muted)' }}
            >
              {diff > 0 ? `+${diff} unidades` : diff < 0 ? `${diff} unidades` : 'Sin cambio'}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase tracking-[.5px]" style={{ color: 'var(--muted)' }}>
            Motivo *
          </label>
          <select
            value={reason}
            onChange={e => setReason(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
          >
            {REASONS.map(r => <option key={r}>{r}</option>)}
          </select>
          {reason === 'Otro' && (
            <input
              value={customReason}
              onChange={e => setCustomReason(e.target.value)}
              placeholder="Describe el motivo..."
              className="w-full px-3 py-2 rounded-lg text-sm outline-none mt-1"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
              required
            />
          )}
        </div>

        <div className="flex gap-3 pt-1">
          <button
            type="button" onClick={onClose}
            className="flex-1 py-2 rounded-xl text-xs font-semibold"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}
          >
            Cancelar
          </button>
          <button
            type="submit" disabled={loading || newStock === String(product.stock)}
            className="flex-1 py-2 rounded-xl text-xs font-semibold text-white disabled:opacity-40"
            style={{ background: 'var(--gradient)' }}
          >
            {loading ? 'Guardando...' : 'Confirmar Ajuste'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
