'use client'

import { useState, useEffect } from 'react'
import { exportSalesToCSV }  from '../lib/export'
import { InvoiceReport }     from '@/modules/reports/components/InvoiceReport'
import { StockReport }       from '@/modules/reports/components/StockReport'
import { OPPFReport }        from '@/modules/reports/components/OPPFReport'
import { ExpiryAlerts }      from '@/modules/pharma/components/ExpiryAlerts'
import { useFeatureFlag }    from '@/shared/hooks/useFeatureFlag'
import { useSessionStore }   from '@/state/session.store'

interface Sale {
  id: string; sale_number: string; total: number; created_at: string
  customer_name?: string; payment_method: string; status?: string; receipt_type?: string
}

type Tab = 'ventas' | 'comprobantes' | 'stock' | 'farmacia' | 'oppf'

export default function ReportsModule({ sales, currentUser }: { sales: Sale[]; currentUser: any }) {
  const [tab, setTab]             = useState<Tab>('ventas')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate]     = useState('')
  const hasBilling = useFeatureFlag('billing')
  const hasPharma  = useFeatureFlag('pharma')

  // orgId desde el store (más confiable que currentUser.organization_id)
  const org    = useSessionStore(s => s.org)
  const orgId  = org?.id ?? currentUser?.organization_id ?? ''
  const isPharmacy = org?.business_type === 'pharmacy'

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setStartDate(today); setEndDate(today)
  }, [])

  const filtered = sales.filter(s => {
    if (!startDate || !endDate) return true
    const d = new Date(s.created_at).toISOString().split('T')[0]
    return d >= startDate && d <= endDate
  })

  const totalSales = filtered.reduce((s, v) => s + v.total, 0)
  const avgTicket  = filtered.length > 0 ? totalSales / filtered.length : 0

  const paymentBreakdown = filtered.reduce((acc: Record<string, number>, s) => {
    acc[s.payment_method] = (acc[s.payment_method] || 0) + s.total
    return acc
  }, {})
  const paymentTotal = Object.values(paymentBreakdown).reduce((s, v) => s + v, 0)

  const TABS = [
    { key: 'ventas'       as Tab, label: 'Ventas',        icon: '💰' },
    ...(hasBilling ? [{ key: 'comprobantes' as Tab, label: 'Comprobantes', icon: '🧾' }] : []),
    { key: 'stock'        as Tab, label: 'Stock',         icon: '📦' },
    ...(hasPharma && isPharmacy ? [{ key: 'farmacia' as Tab, label: 'Farmacia', icon: '💊' }] : []),
    ...(hasPharma && isPharmacy ? [{ key: 'oppf'     as Tab, label: 'OPPF/SNIPPF', icon: '📋' }] : []),
  ]

  // Si el tab activo ya no existe (ej: perdió acceso), volver a ventas
  useEffect(() => {
    if (!TABS.find(t => t.key === tab)) setTab('ventas')
  }, [hasBilling, hasPharma, isPharmacy]) // eslint-disable-line

  return (
    <div className="p-5 animate-fade-up flex flex-col gap-[14px]">

      {/* Tabs */}
      <div className="flex gap-[5px] p-[4px] rounded-[10px]"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="flex-1 py-[7px] rounded-[7px] text-[11px] font-bold transition-all"
            style={{
              background: tab === t.key ? 'var(--card)' : 'transparent',
              color:      tab === t.key ? 'var(--text)' : 'var(--muted)',
              boxShadow:  tab === t.key ? '0 1px 4px rgba(0,0,0,.15)' : 'none',
            }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── VENTAS ──────────────────────────────────────────────────────────── */}
      {tab === 'ventas' && (
        <>
          {/* Banner */}
          <div className="flex items-center gap-[14px] px-[18px] py-[14px] rounded-xl"
            style={{ background: 'linear-gradient(135deg,rgba(99,102,241,.12),rgba(139,92,246,.08))', border: '1px solid rgba(99,102,241,.25)' }}>
            <div className="w-9 h-9 rounded-[9px] flex items-center justify-center text-base flex-shrink-0"
              style={{ background: 'var(--gradient)' }}>📊</div>
            <div className="flex-1 min-w-0">
              <strong className="text-sm font-bold block" style={{ color: 'var(--text)' }}>Resumen del período</strong>
              <span className="text-xs" style={{ color: 'var(--muted)' }}>
                {filtered.length} transacciones · Ticket promedio S/ {avgTicket.toFixed(2)} · Total S/ {totalSales.toFixed(2)}
              </span>
            </div>
            <button onClick={() => exportSalesToCSV(filtered)}
              className="px-[14px] py-[7px] rounded-[9px] text-xs font-semibold text-white flex-shrink-0"
              style={{ background: 'var(--gradient)' }}>
              📄 Exportar
            </button>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-[10px]">
            {[
              { color: 'var(--green)',  icon: '💰', label: 'Ventas Período',  value: `S/ ${totalSales.toFixed(2)}` },
              { color: 'var(--blue)',   icon: '🧾', label: 'Transacciones',   value: String(filtered.length) },
              { color: 'var(--amber)',  icon: '🎯', label: 'Ticket Promedio', value: `S/ ${avgTicket.toFixed(2)}` },
              { color: 'var(--accent)', icon: '📋', label: 'Total Ventas',    value: String(sales.length) },
            ].map(m => (
              <div key={m.label} className="rounded-[13px] px-[18px] py-4 relative overflow-hidden"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="absolute right-[-10px] top-[-10px] w-[70px] h-[70px] rounded-full"
                  style={{ background: m.color, opacity: 0.06 }} />
                <div className="absolute right-[14px] top-[14px] text-[22px] opacity-35">{m.icon}</div>
                <div className="text-[10px] font-bold uppercase tracking-[.6px]" style={{ color: 'var(--muted)' }}>{m.label}</div>
                <div className="text-[26px] font-extrabold leading-[1.1] my-[3px]" style={{ color: m.color }}>{m.value}</div>
              </div>
            ))}
          </div>

          {/* Filtros */}
          <div className="rounded-[13px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>🔍 Filtros</span>
            </div>
            <div className="p-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="flex flex-col gap-[5px]">
                <label className="text-[10px] font-bold uppercase tracking-[.5px]" style={{ color: 'var(--muted)' }}>Desde</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                  className="px-[13px] py-[9px] rounded-[9px] outline-none text-sm"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              </div>
              <div className="flex flex-col gap-[5px]">
                <label className="text-[10px] font-bold uppercase tracking-[.5px]" style={{ color: 'var(--muted)' }}>Hasta</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                  className="px-[13px] py-[9px] rounded-[9px] outline-none text-sm"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              </div>
              <button onClick={() => { const t = new Date().toISOString().split('T')[0]; setStartDate(t); setEndDate(t) }}
                className="self-end py-[9px] rounded-[9px] text-xs font-semibold"
                style={{ background: 'rgba(59,130,246,.1)', border: '1px solid rgba(59,130,246,.2)', color: 'var(--blue)' }}>
                🔄 Hoy
              </button>
              <button onClick={() => exportSalesToCSV(filtered)}
                className="self-end py-[9px] rounded-[9px] text-xs font-semibold"
                style={{ background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.25)', color: 'var(--green)' }}>
                📄 Exportar Excel
              </button>
            </div>
          </div>

          {/* Métodos de pago + tabla */}
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
                    <div key={method} className="flex items-center gap-[10px] py-[9px] px-3 rounded-lg"
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                      <div className="text-xs font-bold w-[110px] flex-shrink-0" style={{ color: 'var(--text)' }}>{method}</div>
                      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--accent2)' }} />
                      </div>
                      <div className="text-xs w-8 text-right" style={{ color: 'var(--muted)' }}>{pct}%</div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="rounded-[13px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>Últimas ventas</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs" style={{ minWidth: '400px' }}>
                  <thead>
                    <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                      {['Nº', 'Cliente', 'Tipo', 'Pago', 'Total'].map(h => (
                        <th key={h} className="px-[12px] py-[8px] text-left font-bold uppercase tracking-[.6px]"
                          style={{ color: 'var(--sub)', fontSize: '10px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.slice(0, 15).map(s => (
                      <tr key={s.id} style={{ borderBottom: '1px solid rgba(30,45,69,.5)' }}>
                        <td className="px-[12px] py-[9px] font-mono text-[10px]" style={{ color: 'var(--muted)' }}>{s.sale_number}</td>
                        <td className="px-[12px] py-[9px] max-w-[100px] truncate" style={{ color: 'var(--text)' }}>{s.customer_name || 'General'}</td>
                        <td className="px-[12px] py-[9px]">
                          <span className="px-[6px] py-[2px] rounded-full text-[10px] font-semibold"
                            style={{ background: 'rgba(59,130,246,.1)', color: 'var(--blue)' }}>
                            {s.receipt_type || 'BOLETA'}
                          </span>
                        </td>
                        <td className="px-[12px] py-[9px] text-[10px]" style={{ color: 'var(--muted)' }}>{s.payment_method}</td>
                        <td className="px-[12px] py-[9px] font-bold" style={{ color: 'var(--green)' }}>S/ {s.total.toFixed(2)}</td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr><td colSpan={5} className="px-[12px] py-8 text-center text-xs" style={{ color: 'var(--sub)' }}>
                        Sin ventas en el período
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── COMPROBANTES ────────────────────────────────────────────────────── */}
      {tab === 'comprobantes' && orgId && (
        <InvoiceReport orgId={orgId} />
      )}

      {/* ── STOCK ───────────────────────────────────────────────────────────── */}
      {tab === 'stock' && orgId && (
        <StockReport orgId={orgId} />
      )}

      {/* ── OPPF/SNIPPF ─────────────────────────────────────────────────────── */}
      {tab === 'oppf' && orgId && (
        <OPPFReport orgId={orgId} />
      )}

      {/* ── FARMACIA ────────────────────────────────────────────────────────── */}
      {tab === 'farmacia' && orgId && (
        <div className="flex flex-col gap-[14px]">
          {/* Banner farmacia */}
          <div className="flex items-center gap-[14px] px-[18px] py-[14px] rounded-xl"
            style={{ background: 'linear-gradient(135deg,rgba(16,185,129,.1),rgba(6,182,212,.06))', border: '1px solid rgba(16,185,129,.25)' }}>
            <div className="w-9 h-9 rounded-[9px] flex items-center justify-center text-base flex-shrink-0"
              style={{ background: 'var(--gradient)' }}>💊</div>
            <div>
              <strong className="text-sm font-bold block" style={{ color: 'var(--text)' }}>
                Reporte Farmacia — Vencimientos y Lotes
              </strong>
              <span className="text-xs" style={{ color: 'var(--muted)' }}>
                Control de lotes próximos a vencer · Alertas críticas · Gestión DIGEMID
              </span>
            </div>
          </div>

          {/* Alertas 7 días */}
          <div className="rounded-[13px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>🚨 Vencen en 7 días</span>
            </div>
            <div className="p-4">
              <ExpiryAlerts orgId={orgId} days={7} />
            </div>
          </div>

          {/* Alertas 30 días */}
          <div className="rounded-[13px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>⏰ Vencen en 30 días</span>
            </div>
            <div className="p-4">
              <ExpiryAlerts orgId={orgId} days={30} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
