'use client'
import { useState, useEffect, useCallback } from 'react'
import { saleService } from '@/lib/services'
import type { SalesDayRow, TopProductRow } from '@/types/database.types'

export type DateRange = 'today' | 'week' | 'month' | 'custom'

export function useReports(orgId: string | undefined) {
  const [range, setRange] = useState<DateRange>('week')
  const [salesByDay, setSalesByDay] = useState<SalesDayRow[]>([])
  const [topProducts, setTopProducts] = useState<TopProductRow[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!orgId) return
    setLoading(true)
    try {
      const [days, top] = await Promise.all([
        saleService.getLast7Days(orgId),
        saleService.getTopProducts(orgId, 5),
      ])
      setSalesByDay(days)
      setTopProducts(top)
    } catch (e) {
      console.error('Error loading reports:', e)
    } finally {
      setLoading(false)
    }
  }, [orgId])

  useEffect(() => { load() }, [load])

  const totalRevenue = salesByDay.reduce((s, d) => s + (d.total_amount ?? 0), 0)
  const totalSales = salesByDay.reduce((s, d) => s + (d.sale_count ?? 0), 0)
  const avgTicket = totalSales > 0 ? totalRevenue / totalSales : 0
  const maxDay = Math.max(...salesByDay.map(d => d.total_amount ?? 0), 1)

  return {
    range, setRange,
    salesByDay, topProducts,
    loading, reload: load,
    totalRevenue, totalSales, avgTicket, maxDay,
  }
}
