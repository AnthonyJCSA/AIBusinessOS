'use client'

import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

interface Automation {
  id: string
  name: string
  trigger_type: string
  action_type: string
  is_active: boolean
  run_count: number
  last_run_at?: string
  created_at: string
}

const TEMPLATES = [
  { name: 'Alerta stock crítico', trigger_type: 'stock_low', action_type: 'notify', description: 'Notifica cuando un producto baja del stock mínimo' },
  { name: 'Bienvenida cliente nuevo', trigger_type: 'new_customer', action_type: 'whatsapp', description: 'Envía WhatsApp al registrar un cliente nuevo' },
  { name: 'Resumen diario de ventas', trigger_type: 'daily_summary', action_type: 'notify', description: 'Resumen automático al cierre del día' },
  { name: 'Reactivar clientes inactivos', trigger_type: 'customer_inactive', action_type: 'whatsapp', description: 'Mensaje a clientes sin compras en 30 días' },
]

const TRIGGER_LABELS: Record<string, string> = {
  stock_low: '📦 Stock bajo',
  new_customer: '👤 Cliente nuevo',
  daily_summary: '📊 Resumen diario',
  customer_inactive: '💤 Cliente inactivo',
}

const ACTION_LABELS: Record<string, string> = {
  notify: '🔔 Notificación',
  whatsapp: '💬 WhatsApp',
  email: '✉️ Email',
}

export default function AutomationsModule({ currentOrg }: { currentOrg: any }) {
  const orgId = currentOrg?.id
  const [automations, setAutomations] = useState<Automation[]>([])
  const [loading, setLoading] = useState(true)
  const [showTemplates, setShowTemplates] = useState(false)
  const [saving, setSaving] = useState(false)
  const [tableExists, setTableExists] = useState(true)

  useEffect(() => { if (orgId) load() }, [orgId])

  async function load() {
    if (!isSupabaseConfigured() || !orgId) { setLoading(false); return }
    try {
      const { data, error } = await supabase
        .from('corivacore_automations').select('*').eq('org_id', orgId).order('created_at', { ascending: false })
      if (error?.code === '42P01') { setTableExists(false); setLoading(false); return }
      setAutomations(data || [])
    } catch { setAutomations([]) }
    setLoading(false)
  }

  async function createFromTemplate(t: typeof TEMPLATES[0]) {
    if (!orgId) return
    setSaving(true)
    try {
      await supabase.from('corivacore_automations').insert({
        org_id: orgId,
        name: t.name,
        trigger_type: t.trigger_type,
        action_type: t.action_type,
        is_active: true,
        run_count: 0,
      })
      setShowTemplates(false)
      await load()
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  async function toggleActive(a: Automation) {
    await supabase.from('corivacore_automations').update({ is_active: !a.is_active }).eq('id', a.id)
    setAutomations(prev => prev.map(x => x.id === a.id ? { ...x, is_active: !x.is_active } : x))
  }

  async function deleteAutomation(id: string) {
    await supabase.from('corivacore_automations').delete().eq('id', id)
    setAutomations(prev => prev.filter(a => a.id !== id))
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
    </div>
  )

  if (!tableExists) return (
    <div className="p-6 flex flex-col items-center justify-center gap-4 text-center" style={{ color: 'var(--muted)' }}>
      <div className="text-5xl">⚙️</div>
      <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>Módulo de Automatizaciones</p>
      <p className="text-xs max-w-sm">Ejecuta el script <code className="px-1 py-0.5 rounded" style={{ background: 'var(--surface)' }}>006_automations_sprint7.sql</code> en Supabase para activar este módulo.</p>
    </div>
  )

  return (
    <div className="p-4 md:p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold" style={{ color: 'var(--text)' }}>Automatizaciones IA</h2>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>{automations.filter(a => a.is_active).length} activas de {automations.length}</p>
        </div>
        <button onClick={() => setShowTemplates(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white"
          style={{ background: 'var(--gradient)' }}>
          + Desde template
        </button>
      </div>

      {automations.length === 0 ? (
        <div className="text-center py-16" style={{ color: 'var(--muted)' }}>
          <div className="text-5xl mb-3">🤖</div>
          <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Sin automatizaciones</p>
          <p className="text-xs mt-1 mb-4">Crea tu primera automatización desde un template</p>
          <button onClick={() => setShowTemplates(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white"
            style={{ background: 'var(--gradient)' }}>
            Ver templates
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {automations.map(a => (
            <div key={a.id} className="p-4 rounded-xl flex items-center justify-between gap-3"
              style={{ background: 'var(--card)', border: '1px solid var(--border2)' }}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold truncate" style={{ color: 'var(--text)' }}>{a.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold flex-shrink-0 ${a.is_active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-gray-500/15 text-gray-400'}`}>
                    {a.is_active ? 'ACTIVA' : 'PAUSADA'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--muted)' }}>
                  <span>{TRIGGER_LABELS[a.trigger_type] || a.trigger_type}</span>
                  <span>→</span>
                  <span>{ACTION_LABELS[a.action_type] || a.action_type}</span>
                  <span>· {a.run_count} ejecuciones</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => toggleActive(a)}
                  className="px-3 py-1 rounded-lg text-[11px] font-bold transition-all"
                  style={{
                    background: a.is_active ? 'rgba(245,158,11,.1)' : 'rgba(16,185,129,.1)',
                    color: a.is_active ? 'var(--amber)' : 'var(--green)',
                    border: `1px solid ${a.is_active ? 'rgba(245,158,11,.2)' : 'rgba(16,185,129,.2)'}`,
                  }}>
                  {a.is_active ? 'Pausar' : 'Activar'}
                </button>
                <button onClick={() => deleteAutomation(a.id)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs"
                  style={{ background: 'rgba(239,68,68,.1)', color: 'var(--red)', border: '1px solid rgba(239,68,68,.2)' }}>
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showTemplates && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl p-6 flex flex-col gap-3" style={{ background: 'var(--card)', border: '1px solid var(--border2)' }}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-extrabold text-sm" style={{ color: 'var(--text)' }}>Templates de Automatización</h3>
              <button onClick={() => setShowTemplates(false)} className="text-sm px-2 py-1 rounded-lg" style={{ background: 'var(--surface)', color: 'var(--muted)' }}>✕</button>
            </div>
            {TEMPLATES.map(t => (
              <div key={t.trigger_type} className="p-3 rounded-xl flex items-center justify-between gap-3"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div>
                  <div className="text-xs font-bold" style={{ color: 'var(--text)' }}>{t.name}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: 'var(--muted)' }}>{t.description}</div>
                  <div className="flex items-center gap-1 mt-1 text-[10px]" style={{ color: 'var(--sub)' }}>
                    <span>{TRIGGER_LABELS[t.trigger_type]}</span>
                    <span>→</span>
                    <span>{ACTION_LABELS[t.action_type]}</span>
                  </div>
                </div>
                <button onClick={() => createFromTemplate(t)} disabled={saving}
                  className="px-3 py-1 rounded-lg text-[11px] font-bold flex-shrink-0 disabled:opacity-50"
                  style={{ background: 'rgba(99,102,241,.15)', color: 'var(--accent)', border: '1px solid rgba(99,102,241,.2)' }}>
                  Usar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
