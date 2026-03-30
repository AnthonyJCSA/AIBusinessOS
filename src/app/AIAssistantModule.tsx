'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { getQuickQuestions } from '@/lib/ai/prompts'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

interface Message {
  role: 'user' | 'assistant'
  content: string
  time: string
}

interface Insight {
  icon: string
  title: string
  body: string
  severity: 'info' | 'warning' | 'critical'
  action?: { label: string; module: string }
}

interface AIAssistantProps {
  products: any[]
  sales: any[]
  currentOrg: any
  onNavigate?: (module: string) => void
}

function useInsights(products: any[], sales: any[], orgId: string | undefined) {
  const [insights, setInsights] = useState<Insight[]>([])

  const build = useCallback(async () => {
    const list: Insight[] = []

    const critical = products.filter(p => p.stock === 0)
    const low      = products.filter(p => p.stock > 0 && p.stock <= (p.min_stock || 5))
    if (critical.length > 0) list.push({
      icon: '🚨', severity: 'critical',
      title: `${critical.length} producto${critical.length > 1 ? 's' : ''} sin stock`,
      body: critical.slice(0, 3).map((p: any) => p.name).join(', '),
      action: { label: 'Ver inventario', module: 'inventory' },
    })
    if (low.length > 0) list.push({
      icon: '⚠️', severity: 'warning',
      title: `${low.length} producto${low.length > 1 ? 's' : ''} con stock bajo`,
      body: low.slice(0, 3).map((p: any) => `${p.name} (${p.stock})`).join(', '),
      action: { label: 'Crear compra', module: 'purchases' },
    })

    const today = new Date().toISOString().split('T')[0]
    const todaySales = sales.filter(s => s.created_at?.startsWith(today) && s.status !== 'CANCELLED')
    const todayTotal = todaySales.reduce((s: number, r: any) => s + (r.total || 0), 0)
    if (todaySales.length > 0) list.push({
      icon: '💰', severity: 'info',
      title: `${todaySales.length} ventas hoy — S/ ${todayTotal.toFixed(2)}`,
      body: 'Buen ritmo de ventas. Consulta el reporte para más detalles.',
      action: { label: 'Ver reportes', module: 'reports' },
    })

    if (orgId && isSupabaseConfigured()) {
      const [leadsRes, invoicesRes, batchesRes] = await Promise.allSettled([
        supabase.from('corivacore_leads').select('id', { count: 'exact', head: true })
          .eq('org_id', orgId).in('status', ['new', 'contacted']),
        supabase.from('corivacore_invoices').select('id', { count: 'exact', head: true })
          .eq('org_id', orgId).in('sunat_status', ['PENDIENTE', 'RECHAZADA']),
        supabase.from('corivacore_product_batches').select('id', { count: 'exact', head: true })
          .eq('org_id', orgId).gt('quantity', 0)
          .lte('expiry_date', new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]),
      ])
      const leadsCount   = leadsRes.status   === 'fulfilled' ? (leadsRes.value.count   ?? 0) : 0
      const invoiceCount = invoicesRes.status === 'fulfilled' ? (invoicesRes.value.count ?? 0) : 0
      const batchCount   = batchesRes.status  === 'fulfilled' ? (batchesRes.value.count  ?? 0) : 0

      if (leadsCount > 0)   list.push({ icon: '🎯', severity: 'info',     title: `${leadsCount} lead${leadsCount > 1 ? 's' : ''} sin contactar`,                                    body: 'Hay prospectos esperando seguimiento.',                          action: { label: 'Ver pipeline',    module: 'leads'   } })
      if (invoiceCount > 0) list.push({ icon: '🧾', severity: 'warning',  title: `${invoiceCount} comprobante${invoiceCount > 1 ? 's' : ''} pendiente${invoiceCount > 1 ? 's' : ''} SUNAT`, body: 'Comprobantes sin aceptación o rechazados.',                      action: { label: 'Ver facturación', module: 'billing' } })
      if (batchCount > 0)   list.push({ icon: '⏰', severity: 'critical', title: `${batchCount} lote${batchCount > 1 ? 's' : ''} vence${batchCount === 1 ? '' : 'n'} en 7 días`,     body: 'Revisa los lotes próximos a vencer.',                           action: { label: 'Ver farmacia',    module: 'pharma'  } })
    }

    setInsights(list.slice(0, 6))
  }, [products, sales, orgId])

  useEffect(() => { build() }, [build])
  return insights
}

const SEVERITY_STYLE: Record<string, { border: string; bg: string }> = {
  critical: { border: 'rgba(239,68,68,.3)',   bg: 'rgba(239,68,68,.05)'   },
  warning:  { border: 'rgba(245,158,11,.3)',  bg: 'rgba(245,158,11,.05)'  },
  info:     { border: 'rgba(99,102,241,.2)',  bg: 'rgba(99,102,241,.05)'  },
}

type MobileTab = 'chat' | 'insights' | 'preguntas'

export default function AIAssistantModule({ products, sales, currentOrg, onNavigate }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: `👋 Hola! Soy tu asistente IA de Coriva.\n\nPuedo ayudarte a:\n• Analizar ventas y predecir tendencias\n• Alertarte sobre stock bajo y recomendar pedidos\n• Crear mensajes para clientes por WhatsApp\n• Sugerir promociones basadas en datos reales\n\n¿En qué te ayudo hoy?`,
    time: 'Ahora',
  }])
  const [input, setInput]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [mobileTab, setMobileTab] = useState<MobileTab>('chat')
  const bodyRef                   = useRef<HTMLDivElement>(null)
  const insights                  = useInsights(products, sales, currentOrg?.id)
  const quickQuestions            = getQuickQuestions(currentOrg?.business_type ?? 'retail')

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [messages])

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim()
    if (!msg || loading) return
    // En móvil, al enviar mensaje cambiar al tab de chat
    setMobileTab('chat')
    const userMsg: Message = { role: 'user', content: msg, time: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setLoading(true)
    try {
      const res  = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next.map(m => ({ role: m.role, content: m.content })), orgId: currentOrg?.id, businessType: currentOrg?.business_type ?? 'retail' }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'No pude obtener respuesta.', time: 'Coriva IA' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Error al conectar con la IA.', time: 'Error' }])
    } finally {
      setLoading(false)
    }
  }

  // ── Panel derecho (insights + preguntas + KPIs) ──────────────────────────────
  const RightPanel = () => (
    <div className="flex flex-col gap-[10px]">
      {/* Insights */}
      {insights.length > 0 && (
        <div className="rounded-[13px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>🔍 Insights Activos</span>
          </div>
          <div className="p-[10px] flex flex-col gap-[6px]">
            {insights.map((ins, i) => {
              const s = SEVERITY_STYLE[ins.severity]
              return (
                <div key={i} className="p-3 rounded-[11px]"
                  style={{ border: `1px solid ${s.border}`, background: s.bg }}>
                  <div className="flex items-start gap-2">
                    <span className="text-base flex-shrink-0">{ins.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold" style={{ color: 'var(--text)' }}>{ins.title}</div>
                      <div className="text-[10px] mt-[2px] leading-relaxed" style={{ color: 'var(--muted)' }}>{ins.body}</div>
                      {ins.action && onNavigate && (
                        <button onClick={() => onNavigate(ins.action!.module)}
                          className="mt-[6px] text-[10px] font-semibold" style={{ color: 'var(--accent)' }}>
                          {ins.action.label} →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Preguntas rápidas */}
      <div className="rounded-[13px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>⚡ Preguntas Rápidas</span>
        </div>
        <div className="p-[10px] flex flex-col gap-[6px]">
          {quickQuestions.map(q => (
            <button key={q} onClick={() => sendMessage(q)}
              className="w-full text-left p-3 rounded-[11px] transition-all"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="text-xs font-medium" style={{ color: 'var(--text)' }}>
                {q.length > 60 ? q.slice(0, 57) + '…' : q}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="rounded-[13px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>📊 Contexto del Negocio</span>
        </div>
        <div className="p-3 grid grid-cols-2 gap-2">
          {[
            { val: String(products.length), lbl: 'Productos' },
            { val: String(sales.length),    lbl: 'Ventas total' },
            { val: String(products.filter((p: any) => p.stock <= (p.min_stock || 5)).length), lbl: 'Stock crítico' },
            { val: `${currentOrg?.settings?.currency || 'S/'} ${sales.reduce((s: number, v: any) => s + (v.total || 0), 0).toFixed(0)}`, lbl: 'Ingresos' },
          ].map(k => (
            <div key={k.lbl} className="text-center p-[10px] rounded-[9px]"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="text-lg font-extrabold" style={{ color: 'var(--accent)' }}>{k.val}</div>
              <div className="text-[10px]" style={{ color: 'var(--muted)' }}>{k.lbl}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // ── Chat panel ───────────────────────────────────────────────────────────────
  const ChatPanel = () => (
    <div className="flex-1 rounded-[13px] flex flex-col overflow-hidden min-w-0 min-h-0"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-[10px] flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-base flex-shrink-0"
          style={{ background: 'var(--gradient)' }}>🤖</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold truncate" style={{ color: 'var(--text)' }}>Coriva IA</div>
          <div className="text-[10px]" style={{ color: 'var(--green)' }}>● En línea · GPT-4o</div>
        </div>
        <button onClick={() => setMessages([{ role: 'assistant', content: 'Chat limpiado. ¿En qué te ayudo?', time: 'Ahora' }])}
          className="px-3 py-[6px] rounded-[9px] text-xs font-semibold flex-shrink-0"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
          🗑
        </button>
      </div>

      {/* Messages */}
      <div ref={bodyRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 touch-scroll">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[85%] px-[13px] py-[10px] text-sm leading-relaxed"
              style={m.role === 'user'
                ? { background: 'var(--gradient)', color: '#fff', borderRadius: '12px 12px 4px 12px' }
                : { background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '4px 12px 12px 12px' }
              }>
              <div style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>
              <div className="text-[10px] mt-[3px]"
                style={{ color: m.role === 'user' ? 'rgba(255,255,255,.6)' : 'var(--sub)' }}>
                {m.time}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="px-[13px] py-[10px] text-sm"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: '4px 12px 12px 12px' }}>
              <span className="animate-pulse">● ● ●</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-[14px] py-3 flex gap-2 flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Escribe tu pregunta…"
          disabled={loading}
          className="flex-1 px-[13px] py-[9px] rounded-[9px] text-sm outline-none"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
        <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
          className="px-[14px] py-[7px] rounded-[9px] text-xs font-semibold text-white disabled:opacity-50 flex-shrink-0"
          style={{ background: 'var(--gradient)' }}>
          ↗
        </button>
      </div>
    </div>
  )

  return (
    <div className="animate-fade-up flex flex-col" style={{ height: 'calc(100dvh - 52px)', padding: '12px' }}>

      {/* ── DESKTOP: dos columnas ─────────────────────────────────────────────── */}
      <div className="hidden lg:flex gap-[14px] h-full min-h-0">
        <ChatPanel />
        <div className="w-[300px] flex-shrink-0 overflow-y-auto touch-scroll">
          <RightPanel />
        </div>
      </div>

      {/* ── MÓVIL / TABLET: tabs ─────────────────────────────────────────────── */}
      <div className="flex lg:hidden flex-col h-full min-h-0 gap-[8px]">
        {/* Tab switcher */}
        <div className="flex gap-[4px] p-[3px] rounded-[10px] flex-shrink-0"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          {([
            { key: 'chat'      as MobileTab, label: '💬 Chat'      },
            { key: 'insights'  as MobileTab, label: `🔍 Insights${insights.length > 0 ? ` (${insights.length})` : ''}` },
            { key: 'preguntas' as MobileTab, label: '⚡ Preguntas' },
          ]).map(t => (
            <button key={t.key} onClick={() => setMobileTab(t.key)}
              className="flex-1 py-[7px] rounded-[7px] text-[11px] font-bold transition-all"
              style={{
                background: mobileTab === t.key ? 'var(--card)' : 'transparent',
                color:      mobileTab === t.key ? 'var(--text)' : 'var(--muted)',
                boxShadow:  mobileTab === t.key ? '0 1px 4px rgba(0,0,0,.15)' : 'none',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Chat tab */}
        {mobileTab === 'chat' && (
          <div className="flex-1 min-h-0 flex flex-col">
            <ChatPanel />
          </div>
        )}

        {/* Insights tab */}
        {mobileTab === 'insights' && (
          <div className="flex-1 overflow-y-auto touch-scroll">
            {insights.length === 0 ? (
              <div className="text-center py-[40px] text-[13px]" style={{ color: 'var(--sub)' }}>
                Sin alertas activas ✅
              </div>
            ) : (
              <div className="flex flex-col gap-[8px]">
                {insights.map((ins, i) => {
                  const s = SEVERITY_STYLE[ins.severity]
                  return (
                    <div key={i} className="p-3 rounded-[11px]"
                      style={{ border: `1px solid ${s.border}`, background: s.bg }}>
                      <div className="flex items-start gap-2">
                        <span className="text-base flex-shrink-0">{ins.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold" style={{ color: 'var(--text)' }}>{ins.title}</div>
                          <div className="text-[11px] mt-[2px]" style={{ color: 'var(--muted)' }}>{ins.body}</div>
                          {ins.action && onNavigate && (
                            <button onClick={() => onNavigate(ins.action!.module)}
                              className="mt-[6px] text-[11px] font-semibold" style={{ color: 'var(--accent)' }}>
                              {ins.action.label} →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Preguntas tab */}
        {mobileTab === 'preguntas' && (
          <div className="flex-1 overflow-y-auto touch-scroll">
            <div className="flex flex-col gap-[8px]">
              {quickQuestions.map(q => (
                <button key={q} onClick={() => sendMessage(q)}
                  className="w-full text-left p-4 rounded-[11px] transition-all"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>{q}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
