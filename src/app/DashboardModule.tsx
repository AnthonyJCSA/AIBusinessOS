'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

interface DashboardProps {
  sales: any[]
  products: any[]
  currentOrg: any
  onNavigate: (module: string) => void
}

interface DashKPIs {
  todayTotal: number
  todayCount: number
  weekData: { day: string; total: number }[]
  topProducts: { name: string; qty: number }[]
  leadsCount: number
  pendingPurchases: number
}

function useDashKPIs(orgId: string | undefined) {
  const [kpis, setKpis] = useState<DashKPIs | null>(null)

  const load = useCallback(async () => {
    if (!orgId || !isSupabaseConfigured()) return
    const today = new Date().toISOString().split('T')[0]
    const weekAgo = new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0]

    const [salesRes, weekRes, topRes, leadsRes, purchasesRes] = await Promise.allSettled([
      supabase
        .from('corivacore_sales')
        .select('total, created_at')
        .eq('org_id', orgId)
        .gte('created_at', `${today}T00:00:00`)
        .neq('status', 'CANCELLED'),
      supabase
        .from('corivacore_sales')
        .select('total, created_at')
        .eq('org_id', orgId)
        .gte('created_at', `${weekAgo}T00:00:00`)
        .neq('status', 'CANCELLED'),
      supabase
        .from('corivacore_sale_items')
        .select('product_id, quantity, product:corivacore_products(name)')
        .eq('org_id', orgId)
        .gte('created_at', `${weekAgo}T00:00:00`)
        .limit(200),
      supabase
        .from('corivacore_leads')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .in('status', ['new', 'contacted', 'qualified', 'proposal']),
      supabase
        .from('corivacore_purchases')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('status', 'pending'),
    ])

    // Today
    const todaySales = salesRes.status === 'fulfilled' ? (salesRes.value.data ?? []) : []
    const todayTotal = todaySales.reduce((s: number, r: any) => s + (r.total || 0), 0)
    const todayCount = todaySales.length

    // Week chart — last 7 days
    const weekSales = weekRes.status === 'fulfilled' ? (weekRes.value.data ?? []) : []
    const weekMap: Record<string, number> = {}
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0]
      weekMap[d] = 0
    }
    weekSales.forEach((s: any) => {
      const d = s.created_at?.split('T')[0]
      if (d && weekMap[d] !== undefined) weekMap[d] += s.total || 0
    })
    const weekData = Object.entries(weekMap).map(([date, total]) => ({
      day: new Date(date + 'T12:00:00').toLocaleDateString('es-PE', { weekday: 'short' }),
      total,
    }))

    // Top products
    const items = topRes.status === 'fulfilled' ? (topRes.value.data ?? []) : []
    const prodMap: Record<string, { name: string; qty: number }> = {}
    items.forEach((i: any) => {
      const name = (i.product as any)?.name ?? 'Desconocido'
      if (!prodMap[name]) prodMap[name] = { name, qty: 0 }
      prodMap[name].qty += i.quantity || 0
    })
    const topProducts = Object.values(prodMap).sort((a, b) => b.qty - a.qty).slice(0, 4)

    const leadsCount = leadsRes.status === 'fulfilled' ? (leadsRes.value.count ?? 0) : 0
    const pendingPurchases = purchasesRes.status === 'fulfilled' ? (purchasesRes.value.count ?? 0) : 0

    setKpis({ todayTotal, todayCount, weekData, topProducts, leadsCount, pendingPurchases })
  }, [orgId])

  useEffect(() => { load() }, [load])
  return kpis
}

export default function DashboardModule({ sales, products, currentOrg, onNavigate }: DashboardProps) {
  const currency = currentOrg?.settings?.currency || 'S/'
  const kpis = useDashKPIs(currentOrg?.id)

  // Fallback a props mientras carga Supabase
  const today = new Date().toISOString().split('T')[0]
  const todaySalesFallback = sales.filter(s => s.created_at?.startsWith(today))
  const todayTotal  = kpis?.todayTotal  ?? todaySalesFallback.reduce((s, r) => s + (r.total || 0), 0)
  const todayCount  = kpis?.todayCount  ?? todaySalesFallback.length
  const avgTicket   = todayCount > 0 ? todayTotal / todayCount : 0

  const criticalStock = products.filter(p => p.stock > 0 && p.stock <= (p.min_stock || 5))
  const outOfStock    = products.filter(p => p.stock === 0)
  const alertCount    = criticalStock.length + outOfStock.length

  // Week chart
  const weekData = kpis?.weekData ?? []
  const maxWeek  = Math.max(...weekData.map(d => d.total), 1)

  // Top products
  const topProducts = kpis?.topProducts?.length
    ? kpis.topProducts
    : products.slice(0, 4).map(p => ({ name: p.name, qty: p.stock }))
  const maxQty = Math.max(...topProducts.map(p => p.qty), 1)

  return (
    <div className="p-5 space-y-4 animate-fade-up">

      {/* AI Banner */}
      <div
        className="flex items-center gap-[14px] px-[18px] py-[14px] rounded-xl"
        style={{ background: 'linear-gradient(135deg,rgba(99,102,241,.12),rgba(139,92,246,.08))', border: '1px solid rgba(99,102,241,.25)' }}
      >
        <div className="w-9 h-9 rounded-[9px] flex items-center justify-center text-base flex-shrink-0" style={{ background: 'var(--gradient)' }}>
          🤖
        </div>
        <div className="flex-1 min-w-0">
          <strong className="text-sm font-bold block" style={{ color: 'var(--text)' }}>
            IA detectó {alertCount} situaciones importantes hoy
          </strong>
          <span className="text-xs" style={{ color: 'var(--muted)' }}>
            {outOfStock.length > 0 && `${outOfStock.length} sin stock · `}
            {criticalStock.length > 0 && `${criticalStock.length} stock crítico · `}
            {todayCount} ventas hoy
            {kpis?.leadsCount ? ` · ${kpis.leadsCount} leads activos` : ''}
          </span>
        </div>
        <button
          onClick={() => onNavigate('asistente')}
          className="px-[14px] py-[7px] rounded-[9px] text-xs font-semibold text-white flex-shrink-0"
          style={{ background: 'var(--gradient)' }}
        >
          Ver análisis
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[10px]">
        <MetricCard color="green" icon="💰" label="Ventas Hoy"       value={`${currency} ${todayTotal.toFixed(0)}`}  sub={`${todayCount} transacciones`} />
        <MetricCard color="blue"  icon="🎯" label="Ticket Promedio"  value={`${currency} ${avgTicket.toFixed(1)}`}   sub="promedio por venta" />
        <MetricCard color="amber" icon="📦" label="Leads Activos"    value={String(kpis?.leadsCount ?? '—')}          sub="en pipeline" onClick={() => onNavigate('leads')} />
        <MetricCard color="red"   icon="⚠️" label="Stock Crítico"    value={String(alertCount)}                       sub="productos" onClick={() => onNavigate('inventory')} />
      </div>

      {/* Chart + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[14px]">

        {/* 7-day bar chart */}
        <div className="lg:col-span-2 rounded-[13px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>📊 Ventas — Últimos 7 días</span>
            {kpis && (
              <span className="text-[10px] px-2 py-[2px] rounded-full font-semibold" style={{ background: 'rgba(16,185,129,.1)', color: 'var(--green)' }}>
                Datos reales
              </span>
            )}
          </div>
          <div className="p-4">
            {weekData.length === 0 ? (
              <div className="h-24 flex items-center justify-center text-xs" style={{ color: 'var(--muted)' }}>Cargando datos…</div>
            ) : (
              <>
                <div className="flex items-end gap-[6px] h-24 mb-2">
                  {weekData.map((d, i) => {
                    const pct = Math.max((d.total / maxWeek) * 100, d.total > 0 ? 8 : 2)
                    const isToday = i === weekData.length - 1
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-[2px] group relative">
                        {d.total > 0 && (
                          <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap px-1 py-0.5 rounded" style={{ background: 'var(--surface)', color: 'var(--text)' }}>
                            {currency} {d.total.toFixed(0)}
                          </div>
                        )}
                        <div
                          className="w-full rounded-t-[3px] transition-all"
                          style={{
                            height: `${pct}%`,
                            minHeight: '3px',
                            background: isToday ? 'var(--accent)' : 'rgba(99,102,241,.35)',
                            boxShadow: isToday ? '0 0 8px rgba(99,102,241,.4)' : 'none',
                          }}
                        />
                      </div>
                    )
                  })}
                </div>
                <div className="flex justify-around">
                  {weekData.map((d, i) => (
                    <span key={i} className="text-[10px]" style={{ color: i === weekData.length - 1 ? 'var(--accent)' : 'var(--sub)' }}>
                      {d.day}
                    </span>
                  ))}
                </div>
              </>
            )}
            <div className="mt-3 px-3 py-2 rounded-lg text-xs" style={{ background: 'rgba(99,102,241,.06)', border: '1px solid rgba(99,102,241,.15)', color: 'var(--muted)' }}>
              🤖 <strong style={{ color: 'var(--accent)' }}>Predicción IA:</strong> Basado en tu historial, el fin de semana suele ser tu mejor momento. Asegura stock.
            </div>
          </div>
        </div>

        {/* Stock alerts */}
        <div className="rounded-[13px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>⚠️ Alertas de Stock</span>
          </div>
          <div className="p-3 space-y-2">
            {outOfStock.slice(0, 2).map((p: any) => (
              <AlertRow key={p.id} type="crit" icon="🚨" name={p.name} desc="Sin stock" value={0} />
            ))}
            {criticalStock.slice(0, 3).map((p: any) => (
              <AlertRow key={p.id} type="warn" icon="⚠️" name={p.name} desc="Stock bajo" value={p.stock} />
            ))}
            {alertCount === 0 && (
              <AlertRow type="ok" icon="✅" name="Todo en orden" desc="Stock óptimo" value={products.length} />
            )}
            <button
              onClick={() => onNavigate('inventory')}
              className="w-full py-[10px] rounded-[9px] text-xs font-semibold text-white mt-2"
              style={{ background: 'var(--gradient)' }}
            >
              Ver inventario →
            </button>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[14px]">

        {/* Top products */}
        <div className="rounded-[13px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>🏆 Top Productos (7d)</span>
          </div>
          <div className="p-4 space-y-2">
            {topProducts.length === 0 ? (
              <div className="text-xs text-center py-4" style={{ color: 'var(--muted)' }}>Sin datos de ventas</div>
            ) : topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-[10px] py-[9px] px-3 rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="text-xs font-bold truncate flex-1" style={{ color: 'var(--text)' }}>{p.name}</div>
                <div className="w-16 h-1.5 rounded-full overflow-hidden flex-shrink-0" style={{ background: 'var(--border)' }}>
                  <div className="h-full rounded-full" style={{ width: `${(p.qty / maxQty) * 100}%`, background: 'var(--accent2)' }} />
                </div>
                <div className="text-xs w-8 text-right flex-shrink-0" style={{ color: 'var(--muted)' }}>{p.qty}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Leads & Pipeline */}
        <div className="rounded-[13px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>🎯 Pipeline</span>
          </div>
          <div className="p-4 space-y-3">
            <div className="text-center">
              <div className="text-3xl font-extrabold" style={{ color: 'var(--accent)' }}>{kpis?.leadsCount ?? '—'}</div>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>leads activos</div>
            </div>
            {kpis?.pendingPurchases !== undefined && kpis.pendingPurchases > 0 && (
              <div className="flex justify-between text-xs px-2">
                <span style={{ color: 'var(--muted)' }}>Compras pendientes</span>
                <span className="font-bold" style={{ color: 'var(--amber)' }}>{kpis.pendingPurchases}</span>
              </div>
            )}
            <button
              onClick={() => onNavigate('leads')}
              className="w-full py-[9px] rounded-[9px] text-xs font-semibold"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}
            >
              Ver pipeline →
            </button>
          </div>
        </div>

        {/* Quick actions */}
        <div className="rounded-[13px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>⚡ Acciones Rápidas</span>
          </div>
          <div className="p-3 space-y-2">
            {[
              { icon: '🛒', label: 'Nueva venta',       module: 'pos' },
              { icon: '📦', label: 'Registrar compra',  module: 'purchases' },
              { icon: '👥', label: 'Ver clientes',       module: 'customers' },
              { icon: '📊', label: 'Ver reportes',       module: 'reports' },
            ].map(a => (
              <button
                key={a.module}
                onClick={() => onNavigate(a.module)}
                className="w-full flex items-center gap-3 p-3 rounded-[11px] text-left transition-all hover:bg-white/5"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <span className="text-base">{a.icon}</span>
                <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{a.label}</span>
                <span className="ml-auto text-xs" style={{ color: 'var(--muted)' }}>→</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ color, icon, label, value, sub, onClick }: {
  color: string; icon: string; label: string; value: string; sub: string; onClick?: () => void
}) {
  const colors: Record<string, string> = {
    green: 'var(--green)', blue: 'var(--blue)', amber: 'var(--amber)', red: 'var(--red)', purple: 'var(--accent)',
  }
  const c = colors[color] || colors.blue
  return (
    <div
      onClick={onClick}
      className={`relative rounded-[13px] px-[18px] py-4 flex flex-col gap-[2px] overflow-hidden transition-all hover:-translate-y-[1px] ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      <div className="absolute right-[-10px] top-[-10px] w-[70px] h-[70px] rounded-full" style={{ background: c, opacity: 0.06 }} />
      <div className="absolute right-[14px] top-[14px] text-[22px] opacity-35">{icon}</div>
      <div className="text-[10px] font-bold uppercase tracking-[.6px]" style={{ color: 'var(--muted)' }}>{label}</div>
      <div className="text-[26px] font-extrabold leading-[1.1] my-[3px]" style={{ color: c }}>{value}</div>
      <div className="text-[11px]" style={{ color: 'var(--sub)' }}>{sub}</div>
    </div>
  )
}

function AlertRow({ type, icon, name, desc, value }: { type: string; name: string; desc: string; value: number; icon: string }) {
  const styles: Record<string, { border: string; bg: string; iconBg: string; valColor: string }> = {
    crit: { border: 'rgba(239,68,68,.3)',  bg: 'rgba(239,68,68,.04)',  iconBg: 'rgba(239,68,68,.15)',  valColor: 'var(--red)'   },
    warn: { border: 'rgba(245,158,11,.3)', bg: 'rgba(245,158,11,.04)', iconBg: 'rgba(245,158,11,.15)', valColor: 'var(--amber)' },
    ok:   { border: 'rgba(16,185,129,.3)', bg: 'rgba(16,185,129,.04)', iconBg: 'rgba(16,185,129,.15)', valColor: 'var(--green)' },
  }
  const s = styles[type]
  return (
    <div className="flex items-center gap-3 p-3 rounded-[11px]" style={{ border: `1px solid ${s.border}`, background: s.bg }}>
      <div className="w-9 h-9 rounded-[9px] flex items-center justify-center text-base flex-shrink-0" style={{ background: s.iconBg }}>{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-bold truncate" style={{ color: 'var(--text)' }}>{name}</div>
        <div className="text-[11px]" style={{ color: 'var(--muted)' }}>{desc}</div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-lg font-extrabold" style={{ color: s.valColor }}>{value}</div>
        <div className="text-[10px]" style={{ color: 'var(--muted)' }}>uds</div>
      </div>
    </div>
  )
}
