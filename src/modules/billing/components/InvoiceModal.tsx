'use client'
import { InvoicePanel } from './InvoicePanel'
import { InvoiceEmitResult } from '../hooks/useInvoiceEmit'

interface Props {
  saleId:    string
  orgId:     string
  total:     number
  currency?: string
  onSuccess: (invoice: InvoiceEmitResult) => void
  onClose:   () => void
}

export function InvoiceModal({ saleId, orgId, total, currency, onSuccess, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 backdrop-blur-sm">
      <div
        className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl overflow-y-auto"
        style={{
          background:  'var(--card)',
          border:      '1px solid var(--border2)',
          maxHeight:   '92dvh',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 sticky top-0"
          style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)', zIndex: 1 }}
        >
          <div>
            <div className="text-sm font-extrabold" style={{ color: 'var(--text)' }}>
              Emitir comprobante electrónico
            </div>
            <div className="text-[11px]" style={{ color: 'var(--muted)' }}>
              Vía Nubefact · SUNAT
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-[30px] h-[30px] rounded-[7px] flex items-center justify-center text-sm transition-all"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          <InvoicePanel
            saleId={saleId}
            orgId={orgId}
            total={total}
            currency={currency}
            onSuccess={onSuccess}
            onSkip={onClose}
          />
        </div>
      </div>
    </div>
  )
}
