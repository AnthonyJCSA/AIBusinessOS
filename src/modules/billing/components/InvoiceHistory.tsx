'use client'
import { useInvoiceHistory } from '../hooks/useInvoiceHistory'
import { InvoiceResendButton } from './InvoiceResendButton'
import type { DBInvoice } from '@/types/database.types'

interface Props {
  orgId:   string
  saleId?: string
  compact?: boolean
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  ACEPTADA:  { bg: 'rgba(16,185,129,.1)',  color: 'var(--green)' },
  EMITIDA:   { bg: 'rgba(59,130,246,.1)',  color: 'var(--blue)'  },
  PENDIENTE: { bg: 'rgba(245,158,11,.1)',  color: 'var(--amber)' },
  RECHAZADA: { bg: 'rgba(239,68,68,.1)',   color: 'var(--red)'   },
  ANULADA:   { bg: 'rgba(107,114,128,.1)', color: 'var(--sub)'   },
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.PENDIENTE
  return (
    <span className="px-[7px] py-[2px] rounded-full text-[10px] font-bold"
      style={{ background: s.bg, color: s.color }}>
      {status}
    </span>
  )
}

function InvoiceRow({ inv, onResent }: { inv: DBInvoice; onResent: () => void }) {
  const date = inv.created_at ? new Date(inv.created_at).toLocaleDateString('es-PE') : '—'
  return (
    <div className="flex items-center gap-[10px] px-[12px] py-[10px] rounded-[9px] transition-all"
      style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center gap-[6px]">
          <span className="text-[12px] font-bold font-mono" style={{ color: 'var(--text)' }}>
            {inv.invoice_number}
          </span>
          <StatusBadge status={inv.sunat_status} />
        </div>
        <div className="text-[10px] truncate" style={{ color: 'var(--muted)' }}>
          {inv.client_name} · {date} · S/ {Number(inv.total).toFixed(2)}
        </div>
      </div>

      <div className="flex items-center gap-[5px] flex-shrink-0">
        {inv.pdf_url && (
          <a href={inv.pdf_url} target="_blank" rel="noopener noreferrer"
            className="px-[8px] py-[4px] rounded-[6px] text-[10px] font-semibold"
            style={{ background: 'rgba(239,68,68,.1)', color: 'var(--red)' }}>
            PDF
          </a>
        )}
        {inv.xml_url && (
          <a href={inv.xml_url} target="_blank" rel="noopener noreferrer"
            className="px-[8px] py-[4px] rounded-[6px] text-[10px] font-semibold"
            style={{ background: 'rgba(59,130,246,.1)', color: 'var(--blue)' }}>
            XML
          </a>
        )}
        {inv.client_email && (
          <InvoiceResendButton invoiceId={inv.id} onSuccess={onResent} />
        )}
      </div>
    </div>
  )
}

export function InvoiceHistory({ orgId, saleId, compact = false }: Props) {
  const { invoices, loading, error, refresh } = useInvoiceHistory({ orgId, saleId, limit: compact ? 5 : 50 })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-[24px]">
        <span className="w-[18px] h-[18px] rounded-full border-2 animate-spin"
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

  if (!invoices.length) {
    return (
      <div className="text-center py-[24px] text-[12px]" style={{ color: 'var(--sub)' }}>
        No hay comprobantes emitidos
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-[6px]">
      {!compact && (
        <div className="flex items-center justify-between mb-[4px]">
          <span className="text-[11px] font-bold uppercase tracking-[.5px]" style={{ color: 'var(--muted)' }}>
            {invoices.length} comprobante{invoices.length !== 1 ? 's' : ''}
          </span>
          <button onClick={refresh} className="text-[10px] underline" style={{ color: 'var(--accent)' }}>
            Actualizar
          </button>
        </div>
      )}
      {invoices.map(inv => (
        <InvoiceRow key={inv.id} inv={inv} onResent={refresh} />
      ))}
    </div>
  )
}
