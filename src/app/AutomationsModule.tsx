'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  automationService,
  AUTOMATION_TEMPLATES,
  type Automation,
  type AutomationLog,
  type TriggerType,
  type ActionType,
  type AutomationStatus,
} from '@/lib/services/automation.service'
import type { User } from '@/types'

interface Props { currentUser: User; orgId: string }

const TRIGGER_LABELS: Record<TriggerType, { icon: string; label: string; desc: string }> = {
  stock_below_min:   { icon: '📦', label: 'Stock bajo mínimo',       desc: 'Cuando un producto baja del umbral' },
  stock_zero:        { icon: '🚨', label: 'Stock en cero',           desc: 'Cuando un producto se agota' },
  customer_inactive: { icon: '💤', label: 'Cliente inactivo',        desc: 'Sin compras en N días' },
  sale_completed:    { icon: '💰', label: 'Venta completada',        desc: 'Al registrar cada venta' },
  daily_summary:     { icon: '📊', label: 'Resumen diario',          desc: 'Al cierre del día (17–20h)' },
  lead_no_contact:   { icon: '🎯', label: 'Lead sin contacto',       desc: 'Lead sin actividad en N días' },
}

const ACTION_LABELS: Record<ActionType, { icon: string; label: string }> = {
  notify_internal:       { icon: '🔔', label: 'Notificación interna' },
  notify_whatsapp:       { icon: '📱', label: 'WhatsApp al negocio' },
  send_whatsapp_template:{ icon: '💬', label: 'Plantilla WhatsApp' },
  create_task:           { icon: '✅', label: 'Crear tarea' },
}

const STATUS_STYLE: Record<AutomationStatus, { bg: string; color: string; label: string }> = {
  active: { bg: 'rgba(16,185,129,.1)',  color: 'var(--green)', label: '● Activa' },
  paused: { bg: 'rgba(245,158,11,.1)',  color: 'var(--amber)', label: '⏸ Pausada' },
  draft:  { bg: 'rgba(99,102,241,.1)',  color: 'var(--accent)', label: '✏ Borrador' },
}

const EMPTY_FORM = {
  name: '', description: '',
  trigger: 'stock_below_min' as TriggerType,
  action: 'notify_internal' as ActionType,
  config: {} as Automation['config'],
  status: 'active' as AutomationStatus,
}

export default function AutomationsModule({ currentUser, orgId }: Props) {
  const [automations, setAutomations] = useState<Automation[]>([])
  const [logs, setLogs]               = useState<AutomationLog[]>([])
  const [loading, setLoading]         = useState(true)
  const [showModal, setShowModal]     = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [form, setForm]               = useState(EMPTY_FORM)
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState('')
  const [activeTab, setActiveTab]     = useState<'automations' | 'logs'>('automations')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [a, l] = await Promise.all([
        automationService.getAll(orgId),
        automationService.getLogs(orgId),
      ])
      setAutomations(a)
      setLogs(l)
    } catch {
      // Tabla puede no existir aún — mostrar estado vacío
      setAutomations([])
      setLogs([])
    } finally {
      setLoading(false)
    }
  }, [orgId])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!form.name.trim()) return
    setSaving(true); setError('')
    try {
      await automationService.create(orgId, form)
      setShowModal(false); setForm(EMPTY_FORM)
      await load()
    } catch (e: any) { setError(e.message) }
    finally { setSaving(false) }
  }

  const handleFromTemplate = async (tpl: typeof AUTOMATION_TEMPLATES[0]) => {
    setSaving(true)
    try {
      await automationService.create(orgId, tpl)
      setShowTemplates(false)
      await load()
    } catch (e: any) { setError(e.message) }
    finally { setSaving(false) }
  }

  const handleToggle = async (a: Automation) => {
    try {
      await automationService.toggleStatus(a.id, a.status)
      await load()
    } catch (e: any) { setError(e.message) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta automatización?')) return
    try { await automationService.delete(id); await load() }
    catch (e: any) { setError(e.message) }
  }

  const activeCount = automations.filter(a => a.status === 'active').length
  const totalRuns   = automations.reduce((s, a) => s + (a.run_count ?? 0), 0)

  return (
    <div className="p-5 animate-fade-up space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-extrabold" style={{ color: 'var(--text)' }}>Automatizaciones</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
            {automations.length} workflows · {activeCount} activos · {totalRuns} ejecuciones totales
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowTemplates(true)}
            className="px-3 py-2 rounded-lg text-xs font-semibold transition-all"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
            ⚡ Plantillas
          </button>
          <button onClick={() => { setShowModal(true); setError('') }}
            className="px-4 py-2 rounded-lg text-xs font-bold text-white"
            style={{ background: 'var(--gradient)' }}>
            + Nueva
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg text-xs" style={{ background: 'rgba(239,68,68,.1)', color: 'var(--red)', border: '1px solid rgba(239,68,68,.2)' }}>
          {error}
        </div>
      )}

      {/* Métricas */}
      <div className="grid grid-cols-3 gap-[10px]">
        {[
          { color: 'var(--green)',  icon: '⚡', label: 'Activas',     value: String(activeCount) },
          { color: 'var(--accent)', icon: '🔄', label: 'Ejecuciones', value: String(totalRuns) },
          { color: 'var(--amber)',  icon: '📋', label: 'Logs hoy',    value: String(logs.filter(l => l.created_at?.startsWith(new Date().toISOString().split('T')[0])).length) },
        ].map(m => (
          <div key={m.label} className="rounded-[13px] px-[18px] py-4 relative overflow-hidden"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="absolute right-[-10px] top-[-10px] w-[70px] h-[70px] rounded-full" style={{ background: m.color, opacity: 0.06 }} />
            <div className="absolute right-[14px] top-[14px] text-[22px] opacity-35">{m.icon}</div>
            <div className="text-[10px] font-bold uppercase tracking-[.6px]" style={{ color: 'var(--muted)' }}>{m.label}</div>
            <div className="text-[26px] font-extrabold leading-[1.1] my-[3px]" style={{ color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['automations', 'logs'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="px-4 py-2 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: activeTab === tab ? 'rgba(99,102,241,.15)' : 'var(--surface)',
              border: `1px solid ${activeTab === tab ? 'rgba(99,102,241,.3)' : 'var(--border)'}`,
              color: activeTab === tab ? 'var(--accent)' : 'var(--muted)',
            }}>
            {tab === 'automations' ? '⚡ Workflows' : '📋 Historial'}
          </button>
        ))}
      </div>

      {/* Lista de automatizaciones */}
      {activeTab === 'automations' && (
        <div className="rounded-[13px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          {loading ? (
            <div className="p-8 text-center text-xs" style={{ color: 'var(--muted)' }}>Cargando…</div>
          ) : automations.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-3">⚡</div>
              <div className="text-sm font-bold mb-1" style={{ color: 'var(--text)' }}>Sin automatizaciones</div>
              <div className="text-xs mb-4" style={{ color: 'var(--muted)' }}>Crea tu primer workflow o usa una plantilla</div>
              <button onClick={() => setShowTemplates(true)}
                className="px-4 py-2 rounded-lg text-xs font-bold text-white"
                style={{ background: 'var(--gradient)' }}>
                Ver plantillas →
              </button>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {automations.map(a => {
                const trig = TRIGGER_LABELS[a.trigger]
                const act  = ACTION_LABELS[a.action]
                const st   = STATUS_STYLE[a.status]
                return (
                  <div key={a.id} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/5">
                    {/* Icono trigger */}
                    <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                      {trig.icon}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>{a.name}</span>
                        <span className="text-[10px] px-2 py-[2px] rounded-full font-semibold"
                          style={{ background: st.bg, color: st.color }}>
                          {st.label}
                        </span>
                      </div>
                      <div className="text-[11px]" style={{ color: 'var(--muted)' }}>
                        {trig.icon} {trig.label} → {act.icon} {act.label}
                        {a.description && ` · ${a.description}`}
                      </div>
                      <div className="text-[10px] mt-0.5" style={{ color: 'var(--sub)' }}>
                        {a.run_count} ejecuciones
                        {a.last_run_at && ` · Última: ${new Date(a.last_run_at).toLocaleDateString('es-PE')}`}
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => handleToggle(a)}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all"
                        style={a.status === 'active'
                          ? { background: 'rgba(245,158,11,.1)', color: 'var(--amber)', border: '1px solid rgba(245,158,11,.2)' }
                          : { background: 'rgba(16,185,129,.1)', color: 'var(--green)', border: '1px solid rgba(16,185,129,.2)' }
                        }>
                        {a.status === 'active' ? '⏸ Pausar' : '▶ Activar'}
                      </button>
                      <button onClick={() => handleDelete(a.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all"
                        style={{ background: 'rgba(239,68,68,.08)', color: 'var(--red)', border: '1px solid rgba(239,68,68,.2)' }}>
                        🗑
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Historial de logs */}
      {activeTab === 'logs' && (
        <div className="rounded-[13px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                  {['Automatización', 'Resultado', 'Estado', 'Fecha'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center" style={{ color: 'var(--muted)' }}>
                    Sin ejecuciones registradas
                  </td></tr>
                ) : logs.map(l => {
                  const auto = automations.find(a => a.id === l.automation_id)
                  return (
                    <tr key={l.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="px-4 py-3 font-semibold" style={{ color: 'var(--text)' }}>
                        {auto?.name ?? l.automation_id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3 max-w-[300px] truncate" style={{ color: 'var(--muted)' }}>
                        {l.action_result}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-[2px] rounded-full text-[10px] font-semibold"
                          style={l.success
                            ? { background: 'rgba(16,185,129,.1)', color: 'var(--green)' }
                            : { background: 'rgba(239,68,68,.1)', color: 'var(--red)' }
                          }>
                          {l.success ? '✓ OK' : '✕ Error'}
                        </span>
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--muted)' }}>
                        {new Date(l.created_at).toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Modal crear automatización ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl flex flex-col max-h-[90vh]"
            style={{ background: 'var(--card)', border: '1px solid var(--border2)' }}>
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
              <span className="font-extrabold" style={{ color: 'var(--text)' }}>Nueva Automatización</span>
              <button onClick={() => setShowModal(false)} className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
                style={{ background: 'var(--surface)', color: 'var(--muted)' }}>✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Nombre */}
              <div>
                <label className="text-[10px] font-semibold mb-1 block" style={{ color: 'var(--muted)' }}>Nombre *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ej: Alerta stock crítico"
                  className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              </div>

              {/* Trigger */}
              <div>
                <label className="text-[10px] font-semibold mb-2 block" style={{ color: 'var(--muted)' }}>Cuando ocurra…</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(TRIGGER_LABELS) as [TriggerType, typeof TRIGGER_LABELS[TriggerType]][]).map(([key, t]) => (
                    <button key={key} onClick={() => setForm(f => ({ ...f, trigger: key }))}
                      className="text-left p-3 rounded-[11px] transition-all"
                      style={{
                        background: form.trigger === key ? 'rgba(99,102,241,.1)' : 'var(--surface)',
                        border: `1px solid ${form.trigger === key ? 'var(--accent)' : 'var(--border)'}`,
                      }}>
                      <div className="text-base mb-1">{t.icon}</div>
                      <div className="text-[11px] font-bold" style={{ color: 'var(--text)' }}>{t.label}</div>
                      <div className="text-[10px]" style={{ color: 'var(--muted)' }}>{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Config del trigger */}
              {form.trigger === 'stock_below_min' && (
                <div>
                  <label className="text-[10px] font-semibold mb-1 block" style={{ color: 'var(--muted)' }}>Umbral de stock</label>
                  <input type="number" min="1" value={form.config.threshold ?? 5}
                    onChange={e => setForm(f => ({ ...f, config: { ...f.config, threshold: parseInt(e.target.value) } }))}
                    className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                </div>
              )}
              {form.trigger === 'customer_inactive' && (
                <div>
                  <label className="text-[10px] font-semibold mb-1 block" style={{ color: 'var(--muted)' }}>Días sin compra</label>
                  <input type="number" min="1" value={form.config.inactive_days ?? 30}
                    onChange={e => setForm(f => ({ ...f, config: { ...f.config, inactive_days: parseInt(e.target.value) } }))}
                    className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                </div>
              )}
              {form.trigger === 'lead_no_contact' && (
                <div>
                  <label className="text-[10px] font-semibold mb-1 block" style={{ color: 'var(--muted)' }}>Días sin contacto</label>
                  <input type="number" min="1" value={form.config.no_contact_days ?? 3}
                    onChange={e => setForm(f => ({ ...f, config: { ...f.config, no_contact_days: parseInt(e.target.value) } }))}
                    className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                </div>
              )}

              {/* Acción */}
              <div>
                <label className="text-[10px] font-semibold mb-2 block" style={{ color: 'var(--muted)' }}>Entonces…</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(ACTION_LABELS) as [ActionType, typeof ACTION_LABELS[ActionType]][]).map(([key, a]) => (
                    <button key={key} onClick={() => setForm(f => ({ ...f, action: key }))}
                      className="text-left p-3 rounded-[11px] transition-all"
                      style={{
                        background: form.action === key ? 'rgba(16,185,129,.1)' : 'var(--surface)',
                        border: `1px solid ${form.action === key ? 'var(--green)' : 'var(--border)'}`,
                      }}>
                      <div className="text-base mb-1">{a.icon}</div>
                      <div className="text-[11px] font-bold" style={{ color: 'var(--text)' }}>{a.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Config de acción WhatsApp */}
              {(form.action === 'notify_whatsapp' || form.action === 'send_whatsapp_template') && (
                <div className="space-y-2">
                  {form.action === 'notify_whatsapp' && (
                    <div>
                      <label className="text-[10px] font-semibold mb-1 block" style={{ color: 'var(--muted)' }}>Teléfono destino</label>
                      <input placeholder="+51 999 999 999" value={form.config.phone ?? ''}
                        onChange={e => setForm(f => ({ ...f, config: { ...f.config, phone: e.target.value } }))}
                        className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                    </div>
                  )}
                  <div>
                    <label className="text-[10px] font-semibold mb-1 block" style={{ color: 'var(--muted)' }}>
                      Plantilla del mensaje <span style={{ color: 'var(--sub)' }}>(usa {'{nombre}'}, {'{negocio}'})</span>
                    </label>
                    <textarea rows={3} value={form.config.message_template ?? ''}
                      onChange={e => setForm(f => ({ ...f, config: { ...f.config, message_template: e.target.value } }))}
                      placeholder="¡Hola {nombre}! Te esperamos en {negocio}…"
                      className="w-full px-3 py-2 rounded-lg text-xs outline-none resize-none"
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                  </div>
                </div>
              )}

              {error && <div className="text-xs" style={{ color: 'var(--red)' }}>{error}</div>}
            </div>
            <div className="p-5 border-t flex gap-3 justify-end" style={{ borderColor: 'var(--border)' }}>
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-xs font-semibold"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
                Cancelar
              </button>
              <button onClick={handleCreate} disabled={saving || !form.name.trim()}
                className="px-5 py-2 rounded-lg text-xs font-bold text-white disabled:opacity-50"
                style={{ background: 'var(--gradient)' }}>
                {saving ? 'Guardando…' : 'Crear Automatización'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal plantillas ── */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl flex flex-col max-h-[85vh]"
            style={{ background: 'var(--card)', border: '1px solid var(--border2)' }}>
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
              <span className="font-extrabold" style={{ color: 'var(--text)' }}>⚡ Plantillas de Automatización</span>
              <button onClick={() => setShowTemplates(false)} className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
                style={{ background: 'var(--surface)', color: 'var(--muted)' }}>✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {AUTOMATION_TEMPLATES.map((tpl, i) => {
                const trig = TRIGGER_LABELS[tpl.trigger]
                const act  = ACTION_LABELS[tpl.action]
                return (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <div className="text-2xl flex-shrink-0">{trig.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold" style={{ color: 'var(--text)' }}>{tpl.name}</div>
                      <div className="text-[11px]" style={{ color: 'var(--muted)' }}>{tpl.description}</div>
                      <div className="text-[10px] mt-1" style={{ color: 'var(--sub)' }}>
                        {trig.label} → {act.icon} {act.label}
                      </div>
                    </div>
                    <button onClick={() => handleFromTemplate(tpl)} disabled={saving}
                      className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-white flex-shrink-0 disabled:opacity-50"
                      style={{ background: 'var(--gradient)' }}>
                      Usar
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
