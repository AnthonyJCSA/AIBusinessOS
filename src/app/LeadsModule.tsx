'use client'

import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
const STAGES = ['Nuevo', 'Contactado', 'Interesado', 'Propuesta', 'Cerrado', 'Perdido']
const STAGE_COLORS: Record<string, string> = {
  Nuevo: 'rgba(99,102,241,.15)',
  Contactado: 'rgba(59,130,246,.15)',
  Interesado: 'rgba(245,158,11,.15)',
  Propuesta: 'rgba(16,185,129,.15)',
  Cerrado: 'rgba(16,185,129,.3)',
  Perdido: 'rgba(239,68,68,.15)',
}

interface Lead {
  id: string
  name: string
  phone?: string
  email?: string
  source?: string
  stage: string
  estimated_value?: number
  notes?: string
  created_at: string
}

export default function LeadsModule({ orgId }: { orgId: string }) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState<Lead | null>(null)
  const [form, setForm] = useState({ name: '', phone: '', email: '', source: '', estimated_value: '', notes: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (orgId) load() }, [orgId])

  async function load() {
    if (!isSupabaseConfigured() || !orgId) { setLoading(false); return }
    try {
      const { data } = await supabase
        .from('corivacore_leads').select('*').eq('org_id', orgId).order('created_at', { ascending: false })
      setLeads(data || [])
    } catch { setLeads([]) }
    setLoading(false)
  }

  async function saveLead() {
    if (!form.name.trim() || !orgId) return
    setSaving(true)
    try {
      await supabase.from('corivacore_leads').insert({
        org_id: orgId,
        name: form.name,
        phone: form.phone || null,
        email: form.email || null,
        source: form.source || null,
        estimated_value: form.estimated_value ? parseFloat(form.estimated_value) : null,
        notes: form.notes || null,
        stage: 'Nuevo',
      })
      setForm({ name: '', phone: '', email: '', source: '', estimated_value: '', notes: '' })
      setShowForm(false)
      await load()
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  async function moveStage(lead: Lead, stage: string) {
    await supabase.from('corivacore_leads').update({ stage }).eq('id', lead.id)
    setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, stage } : l))
    if (selected?.id === lead.id) setSelected({ ...lead, stage })
  }

  async function deleteLead(id: string) {
    await supabase.from('corivacore_leads').delete().eq('id', id)
    setLeads(prev => prev.filter(l => l.id !== id))
    setSelected(null)
  }

  const byStage = (stage: string) => leads.filter(l => l.stage === stage)

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
    </div>
  )

  return (
    <div className="p-4 md:p-6 h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold" style={{ color: 'var(--text)' }}>Leads & Pipeline</h2>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>{leads.length} leads en total</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white"
          style={{ background: 'var(--gradient)' }}>
          + Nuevo Lead
        </button>
      </div>

      {/* Kanban */}
      <div className="flex gap-3 overflow-x-auto pb-2 flex-1">
        {STAGES.map(stage => (
          <div key={stage} className="flex-shrink-0 w-56 flex flex-col gap-2">
            <div className="flex items-center justify-between px-2 py-1 rounded-lg text-xs font-bold"
              style={{ background: STAGE_COLORS[stage], color: 'var(--text)' }}>
              <span>{stage}</span>
              <span className="opacity-60">{byStage(stage).length}</span>
            </div>
            <div className="flex flex-col gap-2 min-h-[100px]">
              {byStage(stage).map(lead => (
                <div key={lead.id}
                  onClick={() => setSelected(lead)}
                  className="p-3 rounded-xl cursor-pointer transition-all hover:scale-[1.02]"
                  style={{ background: 'var(--card)', border: '1px solid var(--border2)' }}>
                  <div className="text-xs font-bold mb-1" style={{ color: 'var(--text)' }}>{lead.name}</div>
                  {lead.phone && <div className="text-[10px]" style={{ color: 'var(--muted)' }}>📞 {lead.phone}</div>}
                  {lead.estimated_value && (
                    <div className="text-[10px] font-semibold mt-1" style={{ color: 'var(--green)' }}>
                      S/ {lead.estimated_value.toFixed(2)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl p-6 flex flex-col gap-4" style={{ background: 'var(--card)', border: '1px solid var(--border2)' }}>
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base" style={{ color: 'var(--text)' }}>{selected.name}</h3>
              <button onClick={() => setSelected(null)} className="text-sm px-2 py-1 rounded-lg" style={{ background: 'var(--surface)', color: 'var(--muted)' }}>✕</button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: 'var(--muted)' }}>
              {selected.phone && <div>📞 {selected.phone}</div>}
              {selected.email && <div>✉️ {selected.email}</div>}
              {selected.source && <div>📌 {selected.source}</div>}
              {selected.estimated_value && <div className="font-bold" style={{ color: 'var(--green)' }}>S/ {selected.estimated_value}</div>}
            </div>
            {selected.notes && <p className="text-xs p-3 rounded-xl" style={{ background: 'var(--surface)', color: 'var(--muted)' }}>{selected.notes}</p>}
            <div>
              <p className="text-[10px] font-bold uppercase mb-2" style={{ color: 'var(--sub)' }}>Mover a etapa</p>
              <div className="flex flex-wrap gap-2">
                {STAGES.map(s => (
                  <button key={s} onClick={() => moveStage(selected, s)}
                    className="px-3 py-1 rounded-lg text-[11px] font-semibold transition-all"
                    style={{
                      background: selected.stage === s ? STAGE_COLORS[s] : 'var(--surface)',
                      border: `1px solid ${selected.stage === s ? 'rgba(99,102,241,.3)' : 'var(--border)'}`,
                      color: 'var(--text)',
                    }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              {selected.phone && (
                <a href={`https://wa.me/51${selected.phone}`} target="_blank" rel="noopener noreferrer"
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-center"
                  style={{ background: 'rgba(37,211,102,.1)', color: '#25D366', border: '1px solid rgba(37,211,102,.3)' }}>
                  WhatsApp
                </a>
              )}
              <button onClick={() => deleteLead(selected.id)}
                className="px-4 py-2 rounded-xl text-xs font-bold"
                style={{ background: 'rgba(239,68,68,.1)', color: 'var(--red)', border: '1px solid rgba(239,68,68,.2)' }}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New lead form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-3" style={{ background: 'var(--card)', border: '1px solid var(--border2)' }}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-extrabold text-sm" style={{ color: 'var(--text)' }}>Nuevo Lead</h3>
              <button onClick={() => setShowForm(false)} className="text-sm px-2 py-1 rounded-lg" style={{ background: 'var(--surface)', color: 'var(--muted)' }}>✕</button>
            </div>
            {[
              { key: 'name', label: 'Nombre *', placeholder: 'Nombre del lead' },
              { key: 'phone', label: 'Teléfono', placeholder: '987654321' },
              { key: 'email', label: 'Email', placeholder: 'correo@email.com' },
              { key: 'source', label: 'Fuente', placeholder: 'Instagram, Referido...' },
              { key: 'estimated_value', label: 'Valor estimado (S/)', placeholder: '0.00' },
            ].map(f => (
              <div key={f.key} className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase" style={{ color: 'var(--muted)' }}>{f.label}</label>
                <input value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="px-3 py-2 rounded-xl text-xs outline-none"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              </div>
            ))}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase" style={{ color: 'var(--muted)' }}>Notas</label>
              <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                rows={2} placeholder="Observaciones..."
                className="px-3 py-2 rounded-xl text-xs outline-none resize-none"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
            </div>
            <button onClick={saveLead} disabled={saving || !form.name.trim()}
              className="w-full py-2 rounded-xl text-xs font-bold text-white mt-1 disabled:opacity-50"
              style={{ background: 'var(--gradient)' }}>
              {saving ? 'Guardando...' : 'Crear Lead'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
