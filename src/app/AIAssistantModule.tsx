'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { QUICK_QUESTIONS } from '@/lib/ai/prompts'
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

    // Stock crítico
    const critical = products.filter(p => p.stock === 0)
    const low      = products.filter(p => p.stock > 0 && p.stock <= (p.min_stock || 5))
    if (critical.length > 0) {
      list.push({
        icon: '🚨', severity: 'critical',
        title: `${critical.length} producto${critical.length > 1 ? 's' : ''} sin stock`,
        body: critical.slice(0, 3).map((p: any) => p.name).join(', '),
        action: { label: 'Ver inventario', module: 'inventory' },
      })
    }
    if (low.length > 0) {
      list.push({
        icon: '⚠️', severity: 'warning',
        title: `${low.length} producto${low.length > 1 ? 's' : ''} con stock bajo`,
        body: low.slice(0, 3).map((p: any) => `${p.name} (${p.stock})`).join(', '),
        action: { label: 'Crear compra', module: 'purchases' },
      })
    }

    // Ventas del día
    const today = new Date().toISOString().split('T')[0]
    const todaySales = sales.filter(s => s.created_at?.startsWith(today) && s.status !== 'CANCELLED')
    const todayTotal = todaySales.reduce((s: number, r: any) => s + (r.total || 0), 0)
    if (todaySales.length > 0) {
      list.push({
        icon: '💰', severity: 'info',
        title: `${todaySales.length} ventas hoy — S/ ${todayTotal.toFixed(2)}`,
        body: 'Buen ritmo de ventas. Consulta el reporte para más detalles.',
        action: { label: 'Ver reportes', module: 'reports' },
      })
    }

    // Leads activos desde Supabase
    if (orgId && isSupabaseConfigured()) {
      const { count } = await supabase
        .from('corivacore_leads')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .in('status', ['new', 'contacted'])
      if (count && count > 0) {
        list.push({
          icon: '🎯', severity: 'info',
          title: `${count} lead${count > 1 ? 's' : ''} sin contactar`,
          body: 'Hay prospectos esperando seguimiento en tu pipeline.',
          action: { label: 'Ver pipeline', module: 'leads' },
        })
      }
    }

    setInsights(list.slice(0, 5))
  }, [products, sales, orgId])

  useEffect(() => { build() }, [build])
  return insights
}

const SEVERITY_STYLE: Record<string, string> = {
  critical: 'border-red-500/30 bg-red-500/5',
  warning:  'border-amber-500/30 bg-amber-500/5',
  info:     'border-indigo-500/20 bg-indigo-500/5',
}

export default function AIAssistantModule({ products, sales, currentOrg, onNavigate }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: `👋 Hola! Soy tu asistente IA de Coriva.\n\nPuedo ayudarte a:\n• Analizar ventas y predecir tendencias\n• Alertarte sobre stock bajo y recomendar pedidos\n• Crear mensajes para clientes por WhatsApp\n• Sugerir promociones basadas en datos reales\n\n¿En qué te ayudo hoy?`,
    time: 'Ahora',
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)
  const insights = useInsights(products, sales, currentOrg?.id)

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [messages])

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim()
    if (!msg || loading) return

    const userMsg: Message = { role: 'user', content: msg, time: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.map(m => ({ role: m.role, content: m.content })),
          orgId: currentOrg?.id,
          businessType: currentOrg?.business_type ?? 'retail',
        }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply || 'No pude obtener respuesta.',
        time: 'Coriva IA',
      }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Error al conectar con la IA.', time: 'Error' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-5 animate-fade-up" style={{ height: 'calc(100vh - 52px)' }}>
      <div className="flex gap-[14px] h-full">

        {/* ── Chat panel ── */}
        <div className="flex-1 rounded-[13px] flex flex-col overflow-hidden min-w-0" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          {/* Header */}
          <div className="px-4 py-3 flex items-center gap-[10px]" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-base flex-shrink-0" style={{ background: 'var(--gradient)' }}>
              🤖
            </div>
            <div>
              <div className="text-sm font-bold" style={{ color: 'var(--text)' }}>Coriva IA — Asistente de Negocio</div>
              <div className="text-[10px]" style={{ color: 'var(--green)' }}>● En línea · GPT-4o powered</div>
            </div>
            <button
              onClick={() => setMessages([{ role: 'assistant', content: 'Chat limpiado. ¿En qué te ayudo?', time: 'Ahora' }])}
              className="ml-auto px-3 py-[7px] rounded-[9px] text-xs font-semibold"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}
            >
              🗑 Limpiar
            </button>
          </div>

          {/* Messages */}
          <div ref={bodyRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 touch-scroll">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="max-w-[85%] px-[13px] py-[10px] rounded-xl text-sm leading-relaxed"
                  style={m.role === 'user'
                    ? { background: 'var(--gradient)', color: '#fff', borderRadius: '12px 12px 4px 12px' }
                    : { background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '4px 12px 12px 12px' }
                  }
                >
                  <div style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>
                  <div className="text-[10px] mt-[3px]" style={{ color: m.role === 'user' ? 'rgba(255,255,255,.6)' : 'var(--sub)' }}>
                    {m.time}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-[13px] py-[10px] rounded-xl text-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: '4px 12px 12px 12px' }}>
                  <span className="animate-pulse">● ● ●</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="px-[14px] py-3 flex gap-2" style={{ borderTop: '1px solid var(--border)' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ej: ¿Cuáles son mis productos con más margen?"
              disabled={loading}
              className="flex-1 px-[13px] py-[9px] rounded-[9px] text-sm outline-none"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="px-[14px] py-[7px] rounded-[9px] text-xs font-semibold text-white disabled:opacity-50"
              style={{ background: 'var(--gradient)' }}
            >
              Enviar ↗
            </button>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="w-[300px] flex-shrink-0 flex flex-col gap-[10px] overflow-y-auto touch-scroll">

          {/* Insights proactivos */}
          {insights.length > 0 && (
            <div className="rounded-[13px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>🔍 Insights Activos</span>
              </div>
              <div className="p-[10px] flex flex-col gap-[6px]">
                {insights.map((ins, i) => (
                  <div key={i} className={`p-3 rounded-[11px] border ${SEVERITY_STYLE[ins.severity]}`}>
                    <div className="flex items-start gap-2">
                      <span className="text-base flex-shrink-0">{ins.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold" style={{ color: 'var(--text)' }}>{ins.title}</div>
                        <div className="text-[10px] mt-0.5 leading-relaxed" style={{ color: 'var(--muted)' }}>{ins.body}</div>
                        {ins.action && onNavigate && (
                          <button
                            onClick={() => onNavigate(ins.action!.module)}
                            className="mt-1.5 text-[10px] font-semibold"
                            style={{ color: 'var(--accent)' }}
                          >
                            {ins.action.label} →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick questions */}
          <div className="rounded-[13px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>⚡ Preguntas Rápidas</span>
            </div>
            <div className="p-[10px] flex flex-col gap-[6px]">
              {QUICK_QUESTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="w-full text-left p-3 rounded-[11px] transition-all hover:bg-white/5"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
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
                { val: String(products.length),                                                                                   lbl: 'Productos' },
                { val: String(sales.length),                                                                                      lbl: 'Ventas total' },
                { val: String(products.filter((p: any) => p.stock <= (p.min_stock || 5)).length),                                 lbl: 'Stock crítico' },
                { val: `${currentOrg?.settings?.currency || 'S/'} ${sales.reduce((s: number, v: any) => s + (v.total || 0), 0).toFixed(0)}`, lbl: 'Ingresos' },
              ].map(k => (
                <div key={k.lbl} className="text-center p-[10px] rounded-[9px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div className="text-lg font-extrabold" style={{ color: 'var(--accent)' }}>{k.val}</div>
                  <div className="text-[10px]" style={{ color: 'var(--muted)' }}>{k.lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
