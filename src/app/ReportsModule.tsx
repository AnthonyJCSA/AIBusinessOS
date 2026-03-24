'use client'

import { useState, useEffect, useCallback } from 'react'
import { saleService } from '@/lib/services'
import { useOrganization } from '@/shared/hooks/useOrganization'
import { exportSalesToCSV } from '@/lib/export'

interface Sale {
  id: string; sale_number: string; total: number; created_at: string
  customer_name?: string; payment_method: string; status?: string; receipt_type?: string
}

type Range = 'today' | 'week' | 'month'

export default function ReportsModule({ sales: initialSales, currentUser }: { sales: Sale[]; currentUser: any }) {
  const org = useOrganization()
  const orgId = org?.id ?? currentUser?.organization_id
  const currency = org?.settings?.currency ?? 'S/'

  const [range, setRange]           = useState<Range>('week')
  const [startDate, setStartDate]   = useState('')
  const [endDate, setEndDate]       = useState('')
  const [salesByDay, setSalesByDay] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [loading, setLoading]       = useState(false)

  // Inicializar fechas
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setEndDate(today)
    const weekAgo = new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0]
    setStartDate(weekAgo)
  }, [])

  const loadChartData = useCallback(async () => {
    if (!orgId) return
    setLoading(true)
    try {
      const [days, top] = await Promise.all([
        saleService.getLast7Days(orgId),
        saleService.getTopProducts(orgId, 5),
      ])
      setSalesByDay(days ?? [])
      setTopProducts(top ?? [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [orgId])

  useEffect(() => { loadChartData() }, [loadChartData])

  const setQuickRange = (r: Range) => {
    setRange(r)
    const today = new Date().toISOString().split('T')[0]
    setEndDate(today)
    if (r === 'today') setStartDate(today)
    else if (r === 'week') setStartDate(new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0])
    else setStartDate(new Date(Date.now() - 29 * 86400000).toISOString().split('T')[0])
  }

  const filtered = initialSales.filter(s => {
    if (!startDate || !endDate) return true
    const d = new Date(s.created_at).toISOString().split('T')[0]
    return d >= startDate && d <= endDate
  })

  const totalRevenue = filtered.reduce((s, v) => s + v.total, 0)
  const avgTicket    = filtered.length > 0 ? totalRevenue / filtered.length : 0
  const maxBar       = Math.max(...salesByDay.map(d => d.total_amount ?? 0), 1)

  const paymentBreakdown = filtered.reduce((acc: Record<string, number>, s) => {
    acc[s.payment_method] = (acc[s.payment_method] || 0) + s.total
    return acc
  }, {})
  const paymentTotal = Object.values(paymentBreakdown).reduce((s, v) => s + v, 0)

  const paymentIcons: Record<string, string> = {
    EFECTIVO: '💵', TARJETA: '💳', YAPE: '📱', PLIN: '📲', TRANSFERENCIA: '🏦',
  }

  return (
    <div className="p-5 animate-fade-up space-y-4">

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[10px]">
        {[
          { color: 'var(--green)',  icon: '💰', label: 'Ingresos Período',  value: `${currency} ${totalRevenue.toFixed(2)}` },
          { color: 'var(--blue)',   icon: '🧾', label: 'Transacciones',     value: String(filtered.length) },
          { color: 'var(--amber)',  icon: '🎯', label: 'Ticket Promedio',   value: `${currency} ${avgTicket.toFixed(2)}` },
          { color: 'var(--accent)', icon: '📋', label: 'Total Histórico',   value: String(initialSales.length) },
        ].map(m => (
          <div key={m.label} className="rounded-[13px] px-[18px] py-4 relative overflow-hidden"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="absolute right-[-10px] top-[-10px] w-[70px] h-[70px] rounded-full"
              style={{ background: m.color, opacity: 0.06 }} />
            <div className="absolute right-[14px] top-[14px] text-[22px] opacity-35">{m.icon}</div>
            <div className="text-[10px] font-bold uppercase tracking-[.6px]" style={{ color: 'var(--muted)' }}>{m.label}</div>
            <div className="text-[22px] font-extrabold leading-[1.1] my-[3px]" style={{ color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="rounded-[13px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="px-4 py-3 flex flex-wrap items-center gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>🔍 Período</span>
          <div className="flex gap-2">
            {(['today', 'week', 'month'] as Range[]).map(r => (
              <button key={r} onClick={() => setQuickRange(r)}
                className="px-3 py-[5px] rounded-full text-[11px] font-semibold transition-all"
                style={{
                  background: range === r ? 'rgba(99,102,241,.15)' : 'var(--surface)',
                  border: `1px solid ${range === r ? 'rgba(99,102,241,.3)' : 'var(--border)'}`,
                  color: range === r ? 'var(--accent)' : 'var(--muted)',
                }}>
                {r === 'today' ? 'Hoy' : r === 'week' ? '7 días' : '30 días'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
              className="px-3 py-[6px] rounded-[9px] text-xs outline-none"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
            <span className="text-xs" style={{ color: 'var(--muted)' }}>→</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
              className="px-3 py-[6px] rounded-[9px] text-xs outline-none"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
            <button onClick={() => exportSalesToCSV(filtered)}
              className="px-3 py-[6px] rounded-[9px] text-xs font-semibold"
              style={{ background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.25)', color: 'var(--green)' }}>
              📥 Exportar
            </button>
          </div>
        </div>
      </div>

      {/* Gráfico + Top productos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[14px]">

        {/* Gráfico últimos 7 días */}
        <div className="rounded-[13px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>📊 Ventas Últimos 7 Días</span>
            {loading && <span className="text-[10px]" style={{ color: 'var(--muted)' }}>Cargando...</span>}
          </div>
          <div className="p-4">
            {salesByDay.length === 0 ? (
              <div className="text-xs text-center py-8" style={{ color: 'var(--sub)' }}>Sin datos disponibles</div>
            ) : (
              <>
                <div className="flex items-end gap-[6px] h-24 mb-2">
                  {salesByDay.map((d, i) => {
                    const height = maxBar > 0 ? Math.max(4, (d.total_amount / maxBar) * 100) : 4
                    const isToday = i === salesByDay.length - 1
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-[2px] group relative">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                          style={{ color: 'var(--text)', background: 'var(--card)', padding: '2px 4px', borderRadius: 4, border: '1px solid var(--border)' }}>
                          {currency} {(d.total_amount ?? 0).toFixed(0)}
                        </div>
                        <div className="w-full rounded-t-[3px] transition-all"
                          style={{
                            height: `${height}%`,
                            background: isToday ? 'var(--accent)' : 'rgba(99,102,241,.35)',
                            boxShadow: isToday ? '0 0 8px rgba(99,102,241,.4)' : 'none',
                          }} />
                      </div>
                    )
                  })}
                </div>
                <div className="flex justify-around">
                  {salesByDay.map((d, i) => (
                    <span key={i} className="text-[9px]" style={{ color: 'var(--sub)' }}>
                      {new Date(d.sale_date).toLocaleDateString('es-PE', { weekday: 'short' })}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex justify-between text-xs px-1">
                  <span style={{ color: 'var(--muted)' }}>
                    Total 7d: <strong style={{ color: 'var(--text)' }}>
                      {currency} {salesByDay.reduce((s, d) => s + (d.total_amount ?? 0), 0).toFixed(2)}
                    </strong>
                  </span>
                  <span style={{ color: 'var(--muted)' }}>
                    Ventas: <strong style={{ color: 'var(--text)' }}>
                      {salesByDay.reduce((s, d) => s + (d.sale_count ?? 0), 0)}
                    </strong>
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Top productos */}
        <div className="rounded-[13px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>🏆 Top Productos</span>
          </div>
          <div className="p-4 space-y-2">
            {topProducts.length === 0 ? (
              <div className="text-xs text-center py-6" style={{ color: 'var(--sub)' }}>Sin datos</div>
            ) : topProducts.map((p, i) => {
              const maxQty = topProducts[0]?.total_qty ?? 1
              const pct = Math.round((p.total_qty / maxQty) * 100)
              return (
                <div key={p.product_id} className="flex items-center gap-3 py-[9px] px-3 rounded-lg"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div className="text-xs font-extrabold w-5 text-center" style={{ color: 'var(--muted)' }}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold truncate" style={{ color: 'var(--text)' }}>{p.product_name}</div>
                    <div className="h-1.5 rounded-full mt-1 overflow-hidden" style={{ background: 'var(--border)' }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--accent2)' }} />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs font-bold" style={{ color: 'var(--text)' }}>{p.total_qty} uds</div>
                    <div className="text-[10px]" style={{ color: 'var(--green)' }}>{currency} {(p.total_revenue ?? 0).toFixed(0)}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Métodos de pago */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[14px]">
        <div className="rounded-[13px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>💳 Métodos de Pago</span>
          </div>
          <div className="p-4 space-y-2">
            {Object.entries(paymentBreakdown).length === 0 ? (
              <div className="text-xs text-center py-4" style={{ color: 'var(--sub)' }}>Sin datos en el período</div>
            ) : Object.entries(paymentBreakdown).map(([method, amount]) => {
              const pct = paymentTotal > 0 ? Math.round((amount / paymentTotal) * 100) : 0
              return (
                <div key={method} className="flex items-center gap-3 py-[9px] px-3 rounded-lg"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div className="text-xs font-bold w-[100px] flex-shrink-0" style={{ color: 'var(--text)' }}>
                    {paymentIcons[method] ?? '💰'} {method}
                  </div>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--accent2)' }} />
                  </div>
                  <div className="text-xs font-bold w-12 text-right" style={{ color: 'var(--text)' }}>{pct}%</div>
                  <div className="text-xs w-20 text-right" style={{ color: 'var(--muted)' }}>
                    {currency} {amount.toFixed(0)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Tabla de ventas */}
        <div className="rounded-[13px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>
              Historial ({filtered.length} ventas)
            </span>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: '280px' }}>
            <table className="w-full text-xs">
              <thead className="sticky top-0" style={{ background: 'var(--surface)' }}>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Nº', 'Fecha', 'Cliente', 'Total'].map(h => (
                    <th key={h} className="px-3 py-2 text-left font-bold uppercase tracking-[.6px]"
                      style={{ color: 'var(--sub)', fontSize: '10px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 30).map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid rgba(30,45,69,.5)' }}>
                    <td className="px-3 py-[8px] font-mono text-[10px]" style={{ color: 'var(--muted)' }}>{s.sale_number}</td>
                    <td className="px-3 py-[8px]" style={{ color: 'var(--muted)' }}>
                      {new Date(s.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' })}
                    </td>
                    <td className="px-3 py-[8px] truncate max-w-[100px]" style={{ color: 'var(--text)' }}>
                      {s.customer_name || 'General'}
                    </td>
                    <td className="px-3 py-[8px] font-bold" style={{ color: 'var(--green)' }}>
                      {currency} {s.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={4} className="px-3 py-8 text-center" style={{ color: 'var(--sub)' }}>
                    Sin ventas en el período
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  )
}
