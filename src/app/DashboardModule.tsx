'use client'

import { useAIInsights } from '@/modules/ai/useAIInsights'
import { useAIAlerts } from '@/modules/ai/useAIAlerts'

interface DashboardProps {
  sales: any[]
  products: any[]
  currentOrg: any
  onNavigate: (module: string) => void
}

const TREND_ICON = { up: '📈', down: '📉', stable: '➡️' }
const PRIORITY_STYLE = {
  high:   { bg: 'rgba(239,68,68,.08)',   border: 'rgba(239,68,68,.2)',   color: 'var(--red)' },
  medium: { bg: 'rgba(245,158,11,.08)',  border: 'rgba(245,158,11,.2)',  color: 'var(--amber)' },
  low:    { bg: 'rgba(16,185,129,.08)',  border: 'rgba(16,185,129,.2)',  color: 'var(--green)' },
}

export default function DashboardModule({ sales, products, currentOrg, onNavigate }: DashboardProps) {
  const currency = currentOrg?.settings?.currency || 'S/'

  // ── IA real ───────────────────────────────────────────────
  const { insights, loading: insightsLoading, refresh } = useAIInsights(
    currentOrg?.id,
    currentOrg?.business_type ?? 'retail'
  )
  useAIAlerts(products, sales)

  // ── Métricas del día ──────────────────────────────────────
  const today = new Date().toISOString().split('T')[0]
  const todaySales = sales.filter(s => s.created_at?.startsWith(today))
  const todayTotal = todaySales.reduce((sum, s) => sum + (s.total || 0), 0)
  const avgTicket = todaySales.length > 0 ? todayTotal / todaySales.length : 0

  const criticalStock = products.filter(p => p.stock <= (p.min_stock || 5) && p.stock > 0)
  const outOfStock = products.filter(p => p.stock === 0)
  const alertCount = criticalStock.length + outOfStock.length

  // ── Gráfico últimos 7 días (real desde sales) ─────────────
  const weekBars = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const key = d.toISOString().split('T')[0]
    const total = sales
      .filter(s => s.created_at?.startsWith(key))
      .reduce((s, v) => s + (v.total ?? 0), 0)
    return { total, label: d.toLocaleDateString('es-PE', { weekday: 'short' }), isToday: i === 6 }
  })
  const maxBar = Math.max(...weekBars.map(b => b.total), 1)

  const topProducts = products.slice(0, 4)

  return (
    <div className="p-5 space-y-4 animate-fade-up">

      {/* ── AI Insights Banner ─────────────────────────────── */}
      <div
        className="rounded-xl px-[18px] py-[14px]"
        style={{
          background: 'linear-gradient(135deg,rgba(99,102,241,.12),rgba(139,92,246,.08))',
          border: '1px solid rgba(99,102,241,.25)',
        }}
      >
        {insightsLoading ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[9px] flex items-center justify-center text-base flex-shrink-0 animate-pulse" style={{ background: 'var(--gradient)' }}>🤖</div>
            <div>
              <div className="text-sm font-bold" style={{ color: 'var(--text)' }}>Analizando tu negocio con IA…</div>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>Generando insights personalizados</div>
            </div>
          </div>
        ) : insights ? (
          <div className="flex items-start gap-[14px]">
            <div className="w-9 h-9 rounded-[9px] flex items-center justify-center text-base flex-shrink-0" style={{ background: 'var(--gradient)' }}>🤖</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <strong className="text-sm font-bold" style={{ color: 'var(--text)' }}>
                  {TREND_ICON[insights.trend]} {insights.summary}
                </strong>
                <span
                  className="text-[10px] px-2 py-[2px] rounded-full font-bold flex-shrink-0"
                  style={{
                    background: insights.score >= 70 ? 'rgba(16,185,129,.15)' : insights.score >= 40 ? 'rgba(245,158,11,.15)' : 'rgba(239,68,68,.15)',
                    color: insights.score >= 70 ? 'var(--green)' : insights.score >= 40 ? 'var(--amber)' : 'var(--red)',
                  }}
                >
                  Score {insights.score}/100
                </span>
              </div>
              {insights.highlight && (
                <span className="text-xs" style={{ color: 'var(--muted)' }}>💡 {insights.highlight}</span>
              )}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => onNavigate('asistente')}
                className="px-[14px] py-[7px] rounded-[9px] text-xs font-semibold text-white transition-all"
                style={{ background: 'var(--gradient)' }}
              >
                Ver análisis
              </button>
              <button
                onClick={refresh}
                className="w-8 h-8 rounded-[9px] flex items-center justify-center text-xs transition-all"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}
                title="Actualizar insights"
              >
                ↻
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-[14px]">
            <div className="w-9 h-9 rounded-[9px] flex items-center justify-center text-base flex-shrink-0" style={{ background: 'var(--gradient)' }}>🤖</div>
            <div className="flex-1">
              <strong className="text-sm font-bold block" style={{ color: 'var(--text)' }}>
                IA detectó {alertCount} situaciones importantes hoy
              </strong>
              <span className="text-xs" style={{ color: 'var(--muted)' }}>
                {outOfStock.length > 0 && `${outOfStock.length} sin stock · `}
                {criticalStock.length > 0 && `${criticalStock.length} stock crítico · `}
                {todaySales.length} ventas hoy
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
        )}
      </div>

      {/* ── Métricas ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[10px]">
        <MetricCard color="green" icon="💰" label="Ventas Hoy"      value={`${currency} ${todayTotal.toFixed(0)}`}  sub={`${todaySales.length} transacciones`} />
        <MetricCard color="blue"  icon="🧾" label="Transacciones"   value={String(todaySales.length)}               sub="del día" />
        <MetricCard color="amber" icon="🎯" label="Ticket Promedio" value={`${currency} ${avgTicket.toFixed(1)}`}   sub={`Meta: ${currency} 40`} />
        <MetricCard color="red"   icon="⚠️" label="Stock Crítico"   value={String(alertCount)}                      sub="productos" />
      </div>

      {/* ── Gráfico + Acciones IA ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[14px]">

        {/* Gráfico ventas semana real */}
        <div className="lg:col-span-2 rounded-[13px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>📊 Ventas Últimos 7 Días</span>
            <span className="text-[10px] px-2 py-[2px] rounded-full font-semibold" style={{ background: 'rgba(16,185,129,.1)', color: 'var(--green)' }}>
              Datos reales
            </span>
          </div>
          <div className="p-4">
            <div className="flex items-end gap-[6px] h-20 mb-2">
              {weekBars.map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-[2px] group relative">
                  {bar.total > 0 && (
                    <div
                      className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap px-1 rounded"
                      style={{ color: 'var(--text)', background: 'var(--card)', border: '1px solid var(--border)' }}
                    >
                      {currency} {bar.total.toFixed(0)}
                    </div>
                  )}
                  <div
                    className="w-full rounded-t-[3px] transition-all"
                    style={{
                      height: `${Math.max(4, (bar.total / maxBar) * 100)}%`,
                      background: bar.isToday ? 'var(--accent)' : 'rgba(99,102,241,.3)',
                      boxShadow: bar.isToday ? '0 0 6px rgba(99,102,241,.4)' : 'none',
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-around">
              {weekBars.map((b, i) => (
                <span key={i} className="text-[10px]" style={{ color: 'var(--sub)' }}>{b.label}</span>
              ))}
            </div>

            {/* Insight de IA sobre ventas */}
            {insights && (
              <div
                className="mt-3 px-3 py-2 rounded-lg text-xs"
                style={{ background: 'rgba(99,102,241,.06)', border: '1px solid rgba(99,102,241,.15)', color: 'var(--muted)' }}
              >
                🤖 <strong style={{ color: 'var(--accent)' }}>IA:</strong> {insights.highlight || 'Analizando tendencias de ventas…'}
              </div>
            )}
          </div>
        </div>

        {/* Acciones IA reales */}
        <div className="rounded-[13px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>⚡ Acciones IA</span>
            {insightsLoading && <span className="text-[10px] animate-pulse" style={{ color: 'var(--muted)' }}>Analizando…</span>}
          </div>
          <div className="p-3 space-y-2">
            {insights?.actions?.length ? (
              insights.actions.map((a, i) => {
                const s = PRIORITY_STYLE[a.priority]
                return (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-[11px]"
                    style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                    <span className="text-base flex-shrink-0">{a.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-semibold" style={{ color: 'var(--text)' }}>{a.text}</div>
                      <div className="text-[10px] mt-0.5 capitalize" style={{ color: s.color }}>{a.priority} prioridad</div>
                    </div>
                  </div>
                )
              })
            ) : (
              <>
                {outOfStock.slice(0, 2).map(p => (
                  <AlertRow key={p.id} type="crit" icon="🚨" name={p.name} desc="Sin stock" value={0} />
                ))}
                {criticalStock.slice(0, 2).map(p => (
                  <AlertRow key={p.id} type="warn" icon="⚠️" name={p.name} desc="Stock bajo" value={p.stock} />
                ))}
                {alertCount === 0 && (
                  <AlertRow type="ok" icon="✅" name="Todo en orden" desc="Stock óptimo" value={products.length} />
                )}
              </>
            )}
            <button
              onClick={() => onNavigate('inventory')}
              className="w-full py-[10px] rounded-[9px] text-xs font-semibold text-white mt-2"
              style={{ background: 'var(--gradient)' }}
            >
              Ver inventario completo
            </button>
          </div>
        </div>
      </div>

      {/* ── Bottom row ────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[14px]">

        {/* Top productos */}
        <div className="rounded-[13px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>🏆 Top Productos</span>
          </div>
          <div className="p-4 space-y-2">
            {topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-[10px] py-[9px] px-3 rounded-lg"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="text-xs font-bold w-[110px] flex-shrink-0" style={{ color: 'var(--text)' }}>{p.name}</div>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                  <div className="h-full rounded-full" style={{ width: `${Math.max(20, 100 - i * 20)}%`, background: 'var(--accent2)' }} />
                </div>
                <div className="text-xs w-10 text-right" style={{ color: 'var(--muted)' }}>{p.stock}u</div>
              </div>
            ))}
          </div>
        </div>

        {/* Alertas IA de la BD */}
        <div className="rounded-[13px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>🔔 Alertas IA</span>
            {insights?.alerts?.length ? (
              <span className="text-[10px] px-2 py-[2px] rounded-full font-semibold" style={{ background: 'rgba(239,68,68,.1)', color: 'var(--red)' }}>
                {insights.alerts.length} activas
              </span>
            ) : null}
          </div>
          <div className="p-3 space-y-2">
            {insights?.alerts?.length ? (
              insights.alerts.map((a, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-[11px]"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <span className="text-base flex-shrink-0">{a.icon}</span>
                  <div className="text-[11px]" style={{ color: 'var(--text)' }}>{a.text}</div>
                </div>
              ))
            ) : (
              <div className="text-xs text-center py-4" style={{ color: 'var(--sub)' }}>
                {insightsLoading ? 'Analizando…' : 'Sin alertas activas'}
              </div>
            )}
            <button
              onClick={() => onNavigate('asistente')}
              className="w-full py-[9px] rounded-[9px] text-xs font-semibold transition-all"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}
            >
              Consultar a la IA →
            </button>
          </div>
        </div>

        {/* Comunicaciones IA */}
        <div className="rounded-[13px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>📧 Comunicaciones</span>
          </div>
          <div className="p-4 space-y-2">
            <div
              className="p-3 rounded-[11px] cursor-pointer transition-all"
              style={{ background: 'var(--card2)', border: '1px solid var(--border)' }}
              onClick={() => onNavigate('communications')}
            >
              <div className="text-xs font-bold mb-1" style={{ color: 'var(--text)' }}>🤖 IA sugiere</div>
              <div className="text-[11px]" style={{ color: 'var(--muted)' }}>
                {insights?.actions?.[0]?.text ?? 'Envía una campaña de WhatsApp a tus clientes hoy'}
              </div>
            </div>
            <div
              className="p-3 rounded-[11px] cursor-pointer transition-all"
              style={{ background: 'var(--card2)', border: '1px solid var(--border)' }}
              onClick={() => onNavigate('communications')}
            >
              <div className="text-xs font-bold mb-1" style={{ color: 'var(--text)' }}>📦 Alerta stock</div>
              <div className="text-[11px]" style={{ color: 'var(--muted)' }}>
                {alertCount > 0
                  ? `${alertCount} productos necesitan reposición urgente`
                  : 'Notificar a proveedor de reposición'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ color, icon, label, value, sub }: { color: string; icon: string; label: string; value: string; sub: string }) {
  const colors: Record<string, string> = {
    green: 'var(--green)', blue: 'var(--blue)', amber: 'var(--amber)', red: 'var(--red)', purple: 'var(--accent)',
  }
  const c = colors[color] || colors.blue
  return (
    <div className="relative rounded-[13px] px-[18px] py-4 flex flex-col gap-[2px] overflow-hidden transition-all hover:-translate-y-[1px] cursor-default"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
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
    crit: { border: 'rgba(239,68,68,.3)',   bg: 'rgba(239,68,68,.04)',   iconBg: 'rgba(239,68,68,.15)',   valColor: 'var(--red)' },
    warn: { border: 'rgba(245,158,11,.3)',  bg: 'rgba(245,158,11,.04)',  iconBg: 'rgba(245,158,11,.15)',  valColor: 'var(--amber)' },
    ok:   { border: 'rgba(16,185,129,.3)',  bg: 'rgba(16,185,129,.04)',  iconBg: 'rgba(16,185,129,.15)',  valColor: 'var(--green)' },
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
