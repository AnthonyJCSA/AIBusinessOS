'use client'
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
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
  const overlayRef = useRef<HTMLDivElement>(null)

  // Cerrar con Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const modal = (
    <div
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
      style={{
        position:       'fixed',
        inset:          0,
        zIndex:         9999,
        background:     'rgba(0,0,0,.72)',
        backdropFilter: 'blur(4px)',
        display:        'flex',
        alignItems:     'flex-end',
        justifyContent: 'center',
        padding:        '0',
      }}
    >
      <div
        style={{
          width:       '100%',
          maxWidth:    '460px',
          maxHeight:   '92dvh',
          overflowY:   'auto',
          background:  'var(--card)',
          border:      '1px solid var(--border2)',
          borderRadius: '20px 20px 0 0',
        }}
        // En desktop centrar verticalmente
        className="sm:rounded-[20px] sm:mb-4"
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

  // Renderizar en document.body para escapar cualquier overflow:hidden padre
  if (typeof document === 'undefined') return null
  return createPortal(modal, document.body)
}
