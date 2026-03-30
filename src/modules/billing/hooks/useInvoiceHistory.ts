'use client'
import { useState, useEffect, useCallback } from 'react'
import type { DBInvoice } from '@/types/database.types'

interface UseInvoiceHistoryOptions {
  orgId: string
  saleId?: string   // si se pasa, filtra por venta
  limit?: number
}

interface State {
  invoices: DBInvoice[]
  loading: boolean
  error: string | null
}

export function useInvoiceHistory({ orgId, saleId, limit = 50 }: UseInvoiceHistoryOptions) {
  const [state, setState] = useState<State>({ invoices: [], loading: false, error: null })

  const fetch_ = useCallback(async () => {
    if (!orgId) return
    setState(s => ({ ...s, loading: true, error: null }))
    try {
      const params = new URLSearchParams({ orgId, limit: String(limit) })
      if (saleId) params.set('saleId', saleId)

      const res  = await fetch(`/api/invoices?${params}`)
      const json = await res.json()

      if (!res.ok) {
        setState({ invoices: [], loading: false, error: json.error ?? 'Error al cargar comprobantes' })
        return
      }
      setState({ invoices: json.invoices ?? [], loading: false, error: null })
    } catch {
      setState({ invoices: [], loading: false, error: 'Error de conexión' })
    }
  }, [orgId, saleId, limit])

  useEffect(() => { fetch_() }, [fetch_])

  return { ...state, refresh: fetch_ }
}
