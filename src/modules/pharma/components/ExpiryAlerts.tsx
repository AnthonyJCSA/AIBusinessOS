'use client'
import { useExpiryAlerts } from '../hooks/usePharma'
import { pharmaService } from '../services/pharma.service'
import type { ExpiringBatchRow } from '@/types/pharma.types'

interface Props {
  orgId: string
  days?: number
  compact?: boolean
}

const LEVEL_STYLE = {
  expired:  { bg: 'rgba(239,68,68,.1)',   color: 'var(--red)',   label: 'Vencido',    icon: '🚨' },
  critical: { bg: 'rgba(239,68,68,.08)',  color: 'var(--red)',   label: '≤7 días',    icon: '⚠️' },
  warning:  { bg: 'rgba(245,158,11,.08)', color: 'var(--amber)', label: '≤30 días',   icon: '⏰' },
  ok:       { bg: 'rgba(16,185,129,.08)', color: 'var(--green)', label: 'OK',         icon: '✅' },
}

function BatchRow({ batch }: { batch: ExpiringBatchRow }) {
  const level = pharmaService.classifyExpiry(batch.days_left)
  const s     = LEVEL_STYLE[level]
  const date  = new Date(batch.expiry_date).toLocaleDateString('es-PE')

  return (
    <div className="flex items-center gap-[10px] px-[12px] py-[9px] rounded-[9px]"
      style={{ background: s.bg, border: `1px solid ${s.color}22` }}>
      <span className="text-base flex-shrink-0">{s.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-bold truncate" style={{ color: 'var(--text)' }}>
          {batch.product_name}
        </div>
        <div className="text-[10px]" style={{ color: 'var(--muted)' }}>
          Lote {batch.batch_number} · Vence {date} · {batch.quantity} unid.
        </div>
      </div>
      <span className="text-[11px] font-bold flex-shrink-0" style={{ color: s.color }}>
        {batch.days_left <= 0 ? 'Vencido' : `${batch.days_left}d`}
      </span>
    </div>
  )
}

export function ExpiryAlerts({ orgId, days = 30, compact = false }: Props) {
  const { batches, critical, expired, loading, error, refresh } = useExpiryAlerts(orgId, days)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-[20px]">
        <span className="w-[16px] h-[16px] rounded-full border-2 animate-spin"
          style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-[10px] py-[8px] rounded-[7px] text-[11px]"
        style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', color: 'var(--red)' }}>
        {error}
      </div>
    )
  }

  const urgent = [...expired, ...critical]

  if (compact) {
    if (!urgent.length) return null
    return (
      <div className="flex items-center gap-[10px] px-[14px] py-[11px] rounded-[11px]"
        style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)' }}>
        <span className="text-lg">🚨</span>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-bold" style={{ color: 'var(--text)' }}>
            {urgent.length} lote{urgent.length !== 1 ? 's' : ''} vencido{urgent.length !== 1 ? 's' : ''} o por vencer
          </div>
          <div className="text-[10px] truncate" style={{ color: 'var(--muted)' }}>
            {urgent.slice(0, 3).map(b => b.product_name).join(' · ')}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-[8px]">
      {/* Resumen */}
      <div className="grid grid-cols-3 gap-[8px]">
        {[
          { label: 'Vencidos',   count: expired.length,  color: 'var(--red)'   },
          { label: '≤7 días',    count: critical.length, color: 'var(--red)'   },
          { label: '≤30 días',   count: batches.length - expired.length - critical.length, color: 'var(--amber)' },
        ].map(m => (
          <div key={m.label} className="flex flex-col items-center py-[10px] rounded-[9px]"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <span className="text-[20px] font-extrabold" style={{ color: m.color }}>{m.count}</span>
            <span className="text-[10px]" style={{ color: 'var(--muted)' }}>{m.label}</span>
          </div>
        ))}
      </div>

      {/* Lista */}
      {batches.length === 0 ? (
        <div className="text-center py-[20px] text-[12px]" style={{ color: 'var(--sub)' }}>
          Sin lotes próximos a vencer en {days} días ✅
        </div>
      ) : (
        <div className="flex flex-col gap-[5px]">
          {batches.map(b => <BatchRow key={b.batch_id} batch={b} />)}
        </div>
      )}

      <button onClick={refresh} className="text-[10px] underline self-end" style={{ color: 'var(--accent)' }}>
        Actualizar
      </button>
    </div>
  )
}
