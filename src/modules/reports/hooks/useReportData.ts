'use client'
import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface SalesReportRow {
  sale_date: string
  total_amount: number
  sale_count: number
}

export interface TopProductRow {
  product_id: string
  product_name: string
  total_qty: number
  total_revenue: number
}

export interface InvoiceReportRow {
  id: string
  invoice_number: string
  type: string
  client_name: string
  client_doc_type: string | null
  client_doc: string | null
  total: number
  sunat_status: string
  created_at: string
}

export interface StockAlertRow {
  id: string
  name: string
  code: string
  stock: number
  min_stock: number
  category: string | null
}

export interface ReportFilters {
  startDate: string
  endDate: string
}

export function useReportData(orgId: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  // ── Ventas por día ──────────────────────────────────────────────────────────
  const fetchSalesByDay = useCallback(async (filters: ReportFilters): Promise<SalesReportRow[]> => {
    setLoading(true); setError(null)
    try {
      const { data, error } = await supabase
        .from('corivacore_sales')
        .select('created_at, total')
        .eq('org_id', orgId)
        .neq('status', 'cancelled')
        .gte('created_at', filters.startDate)
        .lte('created_at', filters.endDate + 'T23:59:59')
        .order('created_at')

      if (error) throw new Error(error.message)

      // Agrupar por día en cliente
      const map: Record<string, { total: number; count: number }> = {}
      for (const row of data ?? []) {
        const day = row.created_at.slice(0, 10)
        if (!map[day]) map[day] = { total: 0, count: 0 }
        map[day].total += row.total
        map[day].count += 1
      }
      return Object.entries(map).map(([sale_date, v]) => ({
        sale_date,
        total_amount: v.total,
        sale_count:   v.count,
      }))
    } finally {
      setLoading(false)
    }
  }, [orgId])

  // ── Top productos ───────────────────────────────────────────────────────────
  const fetchTopProducts = useCallback(async (filters: ReportFilters, limit = 10): Promise<TopProductRow[]> => {
    setLoading(true); setError(null)
    try {
      const { data: sales } = await supabase
        .from('corivacore_sales')
        .select('id')
        .eq('org_id', orgId)
        .neq('status', 'cancelled')
        .gte('created_at', filters.startDate)
        .lte('created_at', filters.endDate + 'T23:59:59')

      if (!sales?.length) return []

      const saleIds = sales.map(s => s.id)
      const { data, error } = await supabase
        .from('corivacore_sale_items')
        .select('product_id, product_name, quantity, subtotal')
        .in('sale_id', saleIds)

      if (error) throw new Error(error.message)

      const map: Record<string, TopProductRow> = {}
      for (const item of data ?? []) {
        const key = item.product_id ?? item.product_name
        if (!map[key]) map[key] = { product_id: key, product_name: item.product_name, total_qty: 0, total_revenue: 0 }
        map[key].total_qty     += item.quantity
        map[key].total_revenue += item.subtotal
      }
      return Object.values(map)
        .sort((a, b) => b.total_revenue - a.total_revenue)
        .slice(0, limit)
    } finally {
      setLoading(false)
    }
  }, [orgId])

  // ── Comprobantes emitidos ───────────────────────────────────────────────────
  const fetchInvoices = useCallback(async (filters: ReportFilters): Promise<InvoiceReportRow[]> => {
    setLoading(true); setError(null)
    try {
      const { data, error } = await supabase
        .from('corivacore_invoices')
        .select('id, invoice_number, type, client_name, client_doc_type, client_doc, total, sunat_status, created_at')
        .eq('org_id', orgId)
        .gte('created_at', filters.startDate)
        .lte('created_at', filters.endDate + 'T23:59:59')
        .order('created_at', { ascending: false })

      if (error) throw new Error(error.message)
      return (data ?? []) as InvoiceReportRow[]
    } finally {
      setLoading(false)
    }
  }, [orgId])

  // ── Stock crítico ───────────────────────────────────────────────────────────
  const fetchStockAlerts = useCallback(async (): Promise<StockAlertRow[]> => {
    setLoading(true); setError(null)
    try {
      const { data, error } = await supabase
        .from('corivacore_products')
        .select('id, name, code, stock, min_stock, category')
        .eq('org_id', orgId)
        .eq('is_active', true)
        .order('stock')
        .limit(200)

      if (error) throw new Error(error.message)
      return ((data ?? []) as StockAlertRow[]).filter(p => p.stock <= (p.min_stock ?? 5))
    } finally {
      setLoading(false)
    }
  }, [orgId])

  return { loading, error, fetchSalesByDay, fetchTopProducts, fetchInvoices, fetchStockAlerts }
}
