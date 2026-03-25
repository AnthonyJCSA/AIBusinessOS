'use client'
import { useState } from 'react'
import { CustomerForm, CustomerFormData } from './CustomerForm'
import { CompanyForm, CompanyFormData }   from './CompanyForm'
import { useInvoiceEmit, InvoiceEmitResult } from '../hooks/useInvoiceEmit'

type ReceiptType = 'BOLETA' | 'FACTURA'

interface Props {
  saleId:  string
  orgId:   string
  total:   number
  currency?: string
  onSuccess?: (invoice: InvoiceEmitResult) => void
  onSkip?:   () => void
}

const EMPTY_CUSTOMER: CustomerFormData = {
  docType: 'DNI', docNumber: '', nombres: '', apellidos: '',
  fullName: '', phone: '', email: '', address: '',
}
const EMPTY_COMPANY: CompanyFormData = {
  ruc: '', razonSocial: '', direccion: '', estado: '', condicion: '', email: '',
}

export function InvoicePanel({ saleId, orgId, total, currency = 'S/', onSuccess, onSkip }: Props) {
  const [receiptType, setReceiptType] = useState<ReceiptType>('BOLETA')
  const [customer, setCustomer]       = useState<CustomerFormData>(EMPTY_CUSTOMER)
  const [company, setCompany]         = useState<CompanyFormData>(EMPTY_COMPANY)
  const { loading, error, result, emit, reset } = useInvoiceEmit()

  async function handleEmit() {
    const isFactura = receiptType === 'FACTURA'

    const payload = {
      saleId,
      orgId,
      clientDocType:   isFactura ? 'RUC'          : customer.docType,
      clientDocNumber: isFactura ? company.ruc     : customer.docNumber,
      clientName:      isFactura ? company.razonSocial : (customer.fullName || `${customer.nombres} ${customer.apellidos}`.trim()),
      clientAddress:   isFactura ? company.direccion   : customer.address,
      clientEmail:     isFactura ? company.email        : customer.email,
    }

    const res = await emit(payload)
    if (res) onSuccess?.(res)
  }

  // ── Estado: comprobante emitido ──────────────────────────────────────────────
  if (result) {
    const accepted = result.sunat_status === 'ACEPTADA'
    return (
      <div className="flex flex-col gap-[12px]">
        {/* Resultado */}
        <div
          className="flex flex-col gap-[8px] p-[14px] rounded-[11px]"
          style={{
            background: accepted ? 'rgba(16,185,129,.06)' : 'rgba(245,158,11,.06)',
            border:     `1px solid ${accepted ? 'rgba(16,185,129,.25)' : 'rgba(245,158,11,.25)'}`,
          }}
        >
          <div className="flex items-center gap-[8px]">
            <span className="text-xl">{accepted ? '✅' : '⚠️'}</span>
            <div>
              <div className="text-sm font-bold" style={{ color: 'var(--text)' }}>
                {accepted ? 'Comprobante aceptado por SUNAT' : 'Comprobante pendiente de aceptación'}
              </div>
              <div className="text-[11px] font-mono" style={{ color: 'var(--muted)' }}>
                {result.invoice_number}
              </div>
            </div>
          </div>

          {/* Links PDF / XML */}
          <div className="flex gap-[6px] flex-wrap">
            {result.pdf_url && (
              <a
                href={result.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-[5px] px-[10px] py-[5px] rounded-[7px] text-[11px] font-semibold transition-all"
                style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)', color: 'var(--red)' }}
              >
                📄 Ver PDF
              </a>
            )}
            {result.xml_url && (
              <a
                href={result.xml_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-[5px] px-[10px] py-[5px] rounded-[7px] text-[11px] font-semibold transition-all"
                style={{ background: 'rgba(59,130,246,.1)', border: '1px solid rgba(59,130,246,.2)', color: 'var(--blue)' }}
              >
                📋 Ver XML
              </a>
            )}
          </div>
        </div>

        <button
          onClick={reset}
          className="w-full py-[9px] rounded-[9px] text-xs font-semibold transition-all"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}
        >
          Emitir otro comprobante
        </button>
      </div>
    )
  }

  // ── Formulario ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-[12px]">

      {/* Selector BOLETA / FACTURA */}
      <div className="flex flex-col gap-[6px]">
        <label className="text-[10px] font-bold uppercase tracking-[.5px]" style={{ color: 'var(--muted)' }}>
          Tipo de comprobante
        </label>
        <div className="flex gap-[6px]">
          {(['BOLETA', 'FACTURA'] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => { setReceiptType(t); reset() }}
              className="flex-1 py-[8px] rounded-[9px] text-[12px] font-bold transition-all"
              style={{
                background: receiptType === t ? 'rgba(99,102,241,.15)' : 'var(--surface)',
                border:     `1px solid ${receiptType === t ? 'rgba(99,102,241,.4)' : 'var(--border)'}`,
                color:      receiptType === t ? 'var(--accent)' : 'var(--muted)',
              }}
            >
              {t === 'BOLETA' ? '🧾' : '📋'} {t}
            </button>
          ))}
        </div>
      </div>

      {/* Separador */}
      <div style={{ height: '1px', background: 'var(--border)' }} />

      {/* Formulario según tipo */}
      {receiptType === 'BOLETA' ? (
        <CustomerForm value={customer} onChange={setCustomer} />
      ) : (
        <CompanyForm value={company} onChange={setCompany} />
      )}

      {/* Error de emisión */}
      {error && (
        <div
          className="flex items-start gap-[6px] px-[10px] py-[8px] rounded-[7px] text-[11px]"
          style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', color: 'var(--red)' }}
        >
          <span className="flex-shrink-0">⚠</span>
          <span>{error}</span>
        </div>
      )}

      {/* Total */}
      <div
        className="flex items-center justify-between px-[12px] py-[8px] rounded-[9px]"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <span className="text-[11px] font-bold uppercase tracking-[.5px]" style={{ color: 'var(--muted)' }}>
          Total a facturar
        </span>
        <span className="text-[18px] font-extrabold" style={{ color: 'var(--green)' }}>
          {currency} {total.toFixed(2)}
        </span>
      </div>

      {/* Acciones */}
      <div className="flex flex-col gap-[6px]">
        <button
          onClick={handleEmit}
          disabled={loading}
          className="w-full py-[10px] rounded-[9px] text-sm font-bold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-[6px]"
          style={{ background: loading ? 'var(--surface)' : 'var(--gradient)', border: loading ? '1px solid var(--border)' : 'none' }}
        >
          {loading ? (
            <>
              <span
                className="w-[14px] h-[14px] rounded-full border-2 border-t-transparent animate-spin-slow"
                style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
              />
              <span style={{ color: 'var(--muted)' }}>Enviando a SUNAT…</span>
            </>
          ) : (
            `Emitir ${receiptType}`
          )}
        </button>

        {onSkip && (
          <button
            onClick={onSkip}
            disabled={loading}
            className="w-full py-[8px] rounded-[9px] text-[11px] font-medium transition-all"
            style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--sub)' }}
          >
            Omitir — solo ticket interno
          </button>
        )}
      </div>
    </div>
  )
}
