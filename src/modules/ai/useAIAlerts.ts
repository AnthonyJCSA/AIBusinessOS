'use client'
import { useEffect, useRef } from 'react'
import { StockPredictionAI } from '@/lib/ai-predictions'
import { useNotificationsStore } from '@/state/notifications.store'
import type { Product, Sale } from '@/types'

const ai = new StockPredictionAI()

// Convierte Sale[] del sistema al formato que espera StockPredictionAI
function toAISales(sales: Sale[]) {
  return sales
    .filter(s => s.created_at && Array.isArray(s.items))
    .map(s => ({
      date: s.created_at,
      items: (s.items ?? []).map(i => ({
        product_id: i.product_id,
        quantity: i.quantity,
      })),
    }))
}

export function useAIAlerts(products: Product[], sales: Sale[]) {
  const add = useNotificationsStore(s => s.add)
  const notifications = useNotificationsStore(s => s.notifications)
  const ranRef = useRef(false)

  useEffect(() => {
    if (ranRef.current || products.length === 0) return
    ranRef.current = true

    const aiSales = toAISales(sales)

    // ── Alertas de stock crítico ──────────────────────────────
    const critical = ai.getCriticalAlerts(products as any, aiSales)
    critical.slice(0, 5).forEach(p => {
      const alreadyExists = notifications.some(
        n => n.type === 'stock_alert' && n.metadata?.product_id === p.product_id
      )
      if (alreadyExists) return
      add({
        type: 'stock_alert',
        title: `Stock crítico: ${p.product_name}`,
        body: p.days_until_stockout === 0
          ? `Sin stock. Reabastecer urgente.`
          : `Se agota en ${p.days_until_stockout} día(s). Ventas: ${p.daily_avg_sales}/día.`,
        severity: 'critical',
        metadata: { product_id: p.product_id },
      })
    })

    // ── Alertas de stock warning ──────────────────────────────
    const warnings = products
      .map(p => ai.predictStockout(p as any, aiSales))
      .filter(p => p.alert_level === 'warning')
    warnings.slice(0, 3).forEach(p => {
      const alreadyExists = notifications.some(
        n => n.type === 'stock_alert' && n.metadata?.product_id === p.product_id
      )
      if (alreadyExists) return
      add({
        type: 'stock_alert',
        title: `Stock bajo: ${p.product_name}`,
        body: `Se agota en ${p.days_until_stockout} días. Considera reabastecer pronto.`,
        severity: 'warning',
        metadata: { product_id: p.product_id },
      })
    })

    // ── Insight de ventas del día ─────────────────────────────
    const today = new Date().toISOString().split('T')[0]
    const todaySales = sales.filter(s => s.created_at?.startsWith(today))
    if (todaySales.length > 0) {
      const total = todaySales.reduce((s, v) => s + v.total, 0)
      add({
        type: 'insight',
        title: `Resumen del día`,
        body: `${todaySales.length} ventas · Total: S/ ${total.toFixed(2)} · Ticket prom: S/ ${(total / todaySales.length).toFixed(2)}`,
        severity: 'info',
        metadata: { date: today },
      })
    }

    // ── Alerta productos sin stock ────────────────────────────
    const outOfStock = products.filter(p => p.stock === 0)
    if (outOfStock.length > 0) {
      add({
        type: 'stock_alert',
        title: `${outOfStock.length} producto(s) sin stock`,
        body: outOfStock.slice(0, 3).map(p => p.name).join(', ') + (outOfStock.length > 3 ? '…' : ''),
        severity: 'critical',
        metadata: { count: outOfStock.length },
      })
    }
  }, [products, sales]) // eslint-disable-line react-hooks/exhaustive-deps
}
