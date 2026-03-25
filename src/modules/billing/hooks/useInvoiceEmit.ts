'use client'
import { useState } from 'react'

export interface InvoiceEmitPayload {
  saleId: string
  orgId: string
  clientDocType?: string
  clientDocNumber?: string
  clientName?: string
  clientAddress?: string
  clientEmail?: string
  modifiesType?: string
  modifiesSeries?: string
  modifiesNumber?: number
  creditNoteType?: number
  debitNoteType?: number
}

export interface InvoiceEmitResult {
  id: string
  invoice_number: string
  status: string
  sunat_status: string
  pdf_url: string | null
  xml_url: string | null
  total: number
}

interface State {
  result: InvoiceEmitResult | null
  loading: boolean
  error: string | null
}

export function useInvoiceEmit() {
  const [state, setState] = useState<State>({ result: null, loading: false, error: null })

  async function emit(payload: InvoiceEmitPayload): Promise<InvoiceEmitResult | null> {
    setState({ result: null, loading: true, error: null })
    try {
      const res = await fetch('/api/invoices', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) {
        setState({ result: null, loading: false, error: json.error ?? 'Error al emitir comprobante' })
        return null
      }
      const result = json.invoice as InvoiceEmitResult
      setState({ result, loading: false, error: null })
      return result
    } catch {
      setState({ result: null, loading: false, error: 'Error de conexión. Intente nuevamente.' })
      return null
    }
  }

  function reset() { setState({ result: null, loading: false, error: null }) }

  return { ...state, emit, reset }
}
