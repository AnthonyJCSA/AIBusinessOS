'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { QUICK_QUESTIONS } from '@/lib/ai/prompts'
import { useAIInsights } from '@/modules/ai/useAIInsights'

interface Message {
  role: 'user' | 'assistant'
  content: string
  time: string
}

interface AIAssistantProps {
  products: any[]
  sales: any[]
  currentOrg: any
}

const HISTORY_KEY = (orgId: string) => `coriva_chat_${orgId}`
const MAX_HISTORY = 40

function loadHistory(orgId: string): Message[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY(orgId))
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveHistory(orgId: string, messages: Message[]) {
  try {
    localStorage.setItem(HISTORY_KEY(orgId), JSON.stringify(messages.slice(-MAX_HISTORY)))
  } catch {}
}

export default function AIAssistantModule({ products, sales, currentOrg }: AIAssistantProps) {
  const orgId = currentOrg?.id
  const currency = currentOrg?.settings?.currency || 'S/'

  const { insights, loading: insightsLoading } = useAIInsights(orgId, currentOrg?.business_type ?? 'retail')

  const [messages, setMessages] = useState<Message[]>(() => {
    if (!orgId) return [defaultWelcome()]
    const history = loadHistory(orgId)
    return history.length > 0 ? history : [defaultWelcome()]
  })
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)

  // Scroll al fondo cuando llegan mensajes
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [messages])

  // Persistir historial
  useEffect(() => {
    if (orgId) saveHistory(orgId, messages)
  }, [messages, orgId])

  // Preguntas contextuales basadas en el estado real
  const contextualQuestions = useCallback(() => {
    const today = new Date().toISOString().split('T')[0]
    const todaySales = sales.filter(s => s.created_at?.startsWith(today))
    const criticalStock = products.filter(p => p.stock <= (p.min_stock || 5))
    const questions: string[] = []

    if (criticalStock.length > 0)
      questions.push(`¿Qué hago con los ${criticalStock.length} productos con stock crítico?`)
    if (todaySales.length === 0)
      questions.push('¿Por qué no he tenido ventas hoy y qué puedo hacer?')
    if (todaySales.length > 5)
      questions.push(`Tuve ${todaySales.length} ventas hoy, ¿cómo optimizo el cierre del día?`)
    if (products.length > 0)
      questions.push('¿Cuál es mi producto con mejor margen de ganancia?')

    // Completar con preguntas genéricas si faltan
    const generic = QUICK_QUESTIONS.filter(q => !questions.includes(q))
    return [...questions, ...generic].slice(0, 8)
  }, [products, sales])

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim()
    if (!msg || loading) return

    const userMsg: Message = {
      role: 'user',
      content: msg,
      time: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
    }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          orgId,
          businessType: currentOrg?.business_type ?? 'retail',
        }),
      })
      const data = await res.json()
      const aiMsg: Message = {
        role: 'assistant',
        content: data.reply || 'No pude obtener respuesta.',
        time: 'Coriva IA',
      }
      setMessages(prev => [...prev, aiMsg])
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: '❌ Error al conectar con la IA. Verifica tu conexión.', time: 'Error' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const clearChat = () => {
    const welcome = defaultWelcome()
    setMessages([welcome])
    if (orgId) saveHistory(orgId, [welcome])
  }

  const questions = contextualQuestions()
  const today = new Date().toISOString().split('T')[0]
  const todaySales = sales.filter(s => s.created_at?.startsWith(today))
  const todayTotal = todaySales.reduce((s, v) => s + v.total, 0)

  return (
    <div className="p-5 animate-fade-up" style={{ height: 'calc(100vh - 52px)' }}>
      <div className="grid gap-[14px] h-full" style={{ gridTemplateColumns: '1fr 300px' }}>

        {/* ── Chat panel ──────────────────────────────────── */}
        <div className="rounded-[13px] flex flex-col overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          {/* Header */}
          <div className="px-4 py-3 flex items-center gap-[10px]" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-base flex-shrink-0" style={{ background: 'var(--gradient)' }}>
              🤖
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold" style={{ color: 'var(--text)' }}>Coriva IA — Asistente de Negocio</div>
              <div className="text-[10px]" style={{ color: 'var(--green)' }}>● En línea · GPT-4o-mini · Contexto real de tu negocio</div>
            </div>
            <button
              onClick={clearChat}
              className="px-3 py-[7px] rounded-[9px] text-xs font-semibold transition-all"
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
                  style={
                    m.role === 'user'
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
                <div
                  className="px-[13px] py-[10px] rounded-xl text-sm"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: '4px 12px 12px 12px' }}
                >
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
              className="flex-1 px-[13px] py-[9px] rounded-[9px] text-sm outline-none"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
              disabled={loading}
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

        {/* ── Right panel ─────────────────────────────────── */}
        <div className="flex flex-col gap-[10px] overflow-y-auto touch-scroll">

          {/* Insights del día */}
          <div className="rounded-[13px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>📊 Estado del Negocio</span>
            </div>
            <div className="p-3 space-y-2">
              {insightsLoading ? (
                <div className="text-xs text-center py-4 animate-pulse" style={{ color: 'var(--muted)' }}>Analizando…</div>
              ) : insights ? (
                <>
                  <div className="p-3 rounded-[11px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <div className="text-xs font-bold mb-1" style={{ color: 'var(--text)' }}>
                      {insights.trend === 'up' ? '📈' : insights.trend === 'down' ? '📉' : '➡️'} {insights.summary}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${insights.score}%`,
                            background: insights.score >= 70 ? 'var(--green)' : insights.score >= 40 ? 'var(--amber)' : 'var(--red)',
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-bold" style={{ color: 'var(--muted)' }}>{insights.score}/100</span>
                    </div>
                  </div>
                  {insights.highlight && (
                    <div className="text-[11px] px-3 py-2 rounded-lg" style={{ background: 'rgba(99,102,241,.06)', color: 'var(--muted)', border: '1px solid rgba(99,102,241,.15)' }}>
                      💡 {insights.highlight}
                    </div>
                  )}
                </>
              ) : (
                <div className="p-3 rounded-[11px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div className="text-xs font-bold mb-1" style={{ color: 'var(--text)' }}>Hoy</div>
                  <div className="text-[11px]" style={{ color: 'var(--muted)' }}>
                    {todaySales.length} ventas · {currency} {todayTotal.toFixed(2)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* KPIs rápidos */}
          <div className="rounded-[13px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>📈 KPIs Clave</span>
            </div>
            <div className="p-3 grid grid-cols-2 gap-2">
              {[
                { val: String(products.length),                                                                    lbl: 'Productos' },
                { val: String(sales.length),                                                                       lbl: 'Ventas total' },
                { val: String(products.filter(p => p.stock <= (p.min_stock || 5)).length),                        lbl: 'Stock crítico' },
                { val: `${currency} ${sales.reduce((s, v) => s + (v.total || 0), 0).toFixed(0)}`,                 lbl: 'Ingresos' },
              ].map(k => (
                <div key={k.lbl} className="text-center p-[10px] rounded-[9px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div className="text-lg font-extrabold" style={{ color: 'var(--accent)' }}>{k.val}</div>
                  <div className="text-[10px]" style={{ color: 'var(--muted)' }}>{k.lbl}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Preguntas contextuales */}
          <div className="rounded-[13px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>⚡ Preguntas Rápidas</span>
            </div>
            <div className="p-[10px] flex flex-col gap-[6px]">
              {questions.map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  disabled={loading}
                  className="w-full text-left p-3 rounded-[11px] transition-all hover:opacity-80 disabled:opacity-50"
                  style={{ background: 'var(--card2)', border: '1px solid var(--border)' }}
                >
                  <div className="text-xs" style={{ color: 'var(--text)' }}>{q}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function defaultWelcome(): Message {
  return {
    role: 'assistant',
    content: '👋 Hola! Soy tu asistente IA de Coriva.\n\nPuedo ayudarte a:\n• Analizar ventas y predecir tendencias\n• Alertarte sobre stock bajo y recomendar pedidos\n• Crear mensajes para clientes por WhatsApp\n• Sugerir promociones basadas en datos reales\n\n¿En qué te ayudo hoy?',
    time: 'Ahora',
  }
}
