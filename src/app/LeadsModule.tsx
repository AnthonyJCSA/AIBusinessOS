'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { customerService } from '@/lib/services'
import type { User } from '@/types'

interface Lead {
  id: string
  org_id: string
  name: string
  phone?: string
  email?: string
  source: string
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost'
  notes?: string
  estimated_value?: number
  assigned_to?: string
  created_at: string
  updated_at?: string
}

interface LeadNote {
  id: string
  lead_id: string
  content: string
  created_by: string
  created_at: string
}

interface Props { currentUser: User; orgId: string }

const STAGES: { id: Lead['status']; label: string; color: string; bg: string }[] = [
  { id: 'new',       label: 'Nuevo',      color: '#6366f1', bg: 'rgba(99,102,241,.08)' },
  { id: 'contacted', label: 'Contactado', color: '#f59e0b', bg: 'rgba(245,158,11,.08)' },
  { id: 'qualified', label: 'Calificado', color: '#3b82f6', bg: 'rgba(59,130,246,.08)' },
  { id: 'proposal',  label: 'Propuesta',  color: '#8b5cf6', bg: 'rgba(139,92,246,.08)' },
  { id: 'won',       label: '✓ Ganado',   color: '#10b981', bg: 'rgba(16,185,129,.08)' },
  { id: 'lost',      label: '✕ Perdido',  color: '#ef4444', bg: 'rgba(239,68,68,.08)' },
]

const SOURCES = ['whatsapp', 'instagram', 'facebook', 'referido', 'web', 'otro']
const EMPTY_FORM = { name: '', phone: '', email: '', source: 'otro', notes: '', estimated_value: '' }

export default function LeadsModule({ currentUser, orgId }: Props) {
  const [leads, setLeads]               = useState<Lead[]>([])
  const [loading, setLoading]           = useState(true)
  const [showModal, setShowModal]       = useState(false)
  const [form, setForm]                 = useState(EMPTY_FORM)
  const [saving, setSaving]             = useState(false)
  const [error, setError]               = useState('')
  const [dragging, setDragging]         = useState<string | null>(null)
  const [dragOver, setDragOver]         = useState<Lead['status'] | null>(null)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [notes, setNotes]               = useState<LeadNote[]>([])
  const [newNote, setNewNote]           = useState('')
  const [savingNote, setSavingNote]     = useState(false)
  const [converting, setConverting]     = useState(false)

  const load = useCallback(async () => {
    if (!isSupabaseConfigured()) { setLoading(false); return }
    setLoading(true)
    const { data, error } = await supabase
      .from('corivacore_leads')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
    if (!error) setLeads((data as Lead[]) || [])
    setLoading(false)
  }, [orgId])

  useEffect(() => { load() }, [load])

  const loadNotes = async (leadId: string) => {
    try {
      const { data } = await supabase
        .from('corivacore_lead_notes')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false })
      setNotes((data as LeadNote[]) || [])
    } catch {
      setNotes([])
    }
  }

  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead)
    loadNotes(lead.id)
  }

  const handleCreate = async () => {
    if (!form.name.trim()) return
    setSaving(true); setError('')
    const { error } = await supabase
      .from('corivacore_leads')
      .insert({
        ...form,
        estimated_value: form.estimated_value ? parseFloat(form.estimated_value) : null,
        org_id: orgId,
        status: 'new',
        assigned_to: currentUser.id,
      })
    if (error) { setError(error.message); setSaving(false); return }
    setForm(EMPTY_FORM); setShowModal(false); setSaving(false)
    await load()
  }

  const moveToStage = async (leadId: string, status: Lead['status']) => {
    setLeads(ls => ls.map(l => l.id === leadId ? { ...l, status } : l))
    await supabase
      .from('corivacore_leads')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', leadId)
    if (selectedLead?.id === leadId) setSelectedLead(s => s ? { ...s, status } : s)
  }

  const handleAddNote = async () => {
    if (!newNote.trim() || !selectedLead) return
    setSavingNote(true)
    const { data } = await supabase
      .from('corivacore_lead_notes')
      .insert({ lead_id: selectedLead.id, content: newNote, created_by: currentUser.full_name })
      .select().single()
    if (data) setNotes(prev => [data as LeadNote, ...prev])
    setNewNote('')
    setSavingNote(false)
  }

  // Convierte lead ganado en cliente CRM
  const handleConvertToCustomer = async () => {
    if (!selectedLead) return
    setConverting(true)
    try {
      await customerService.create(orgId, {
        name: selectedLead.name,
        phone: selectedLead.phone,
        email: selectedLead.email,
        notes: `Convertido desde lead. Fuente: ${selectedLead.source}`,
      })
      await moveToStage(selectedLead.id, 'won')
      setSelectedLead(null)
      alert(`✅ ${selectedLead.name} convertido a cliente`)
    } catch (e: any) { alert(`❌ ${e.message}`) }
    finally { setConverting(false) }
  }

  const handleDelete = async (leadId: string) => {
    if (!confirm('¿Eliminar este lead?')) return
    await supabase.from('corivacore_leads').delete().eq('id', leadId)
    setLeads(ls => ls.filter(l => l.id !== leadId))
    if (selectedLead?.id === leadId) setSelectedLead(null)
  }

  // Drag & Drop
  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.effectAllowed = 'move'; setDragging(id)
  }
  const onDrop = async (e: React.DragEvent, status: Lead['status']) => {
    e.preventDefault()
    if (dragging) await moveToStage(dragging, status)
    setDragging(null); setDragOver(null)
  }

  const byStage = (status: Lead['status']) => leads.filter(l => l.status === status)
  const totalWon   = leads.filter(l => l.status === 'won').length
  const convRate   = leads.length ? Math.round((totalWon / leads.length) * 100) : 0
  const pipelineValue = leads
    .filter(l => !['won', 'lost'].includes(l.status))
    .reduce((s, l) => s + (l.estimated_value ?? 0), 0)

  return (
    <div className="p-4 md:p-6 flex flex-col h-full gap-4">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-extrabold" style={{ color: 'var(--text)' }}>Pipeline de Leads</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
            {leads.length} leads · {totalWon} ganados · {convRate}% conversión
            {pipelineValue > 0 && ` · S/ ${pipelineValue.toFixed(0)} en pipeline`}
          </p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-lg text-xs font-bold text-white"
          style={{ background: 'var(--gradient)' }}>
          + Nuevo Lead
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg text-xs" style={{ background: 'rgba(239,68,68,.1)', color: 'var(--red)', border: '1px solid rgba(239,68,68,.2)' }}>
          {error}
        </div>
      )}

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Kanban */}
        <div className="flex gap-3 overflow-x-auto pb-2 flex-1">
          {STAGES.map(stage => {
            const stageLeads = byStage(stage.id)
            const isOver = dragOver === stage.id
            return (
              <div key={stage.id}
                className="flex-shrink-0 flex flex-col rounded-xl transition-all"
                style={{
                  width: '200px',
                  background: isOver ? stage.bg : 'var(--surface)',
                  border: `1px solid ${isOver ? stage.color + '40' : 'var(--border)'}`,
                }}
                onDragOver={e => { e.preventDefault(); setDragOver(stage.id) }}
                onDragLeave={() => setDragOver(null)}
                onDrop={e => onDrop(e, stage.id)}>

                <div className="px-3 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: stage.color }} />
                    <span className="text-xs font-bold" style={{ color: 'var(--text)' }}>{stage.label}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: stage.bg, color: stage.color }}>
                    {stageLeads.length}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {loading ? (
                    <div className="text-center py-4 text-[10px]" style={{ color: 'var(--muted)' }}>Cargando…</div>
                  ) : stageLeads.length === 0 ? (
                    <div className="h-16 rounded-lg border-2 border-dashed flex items-center justify-center text-[10px]"
                      style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
                      Arrastra aquí
                    </div>
                  ) : stageLeads.map(lead => (
                    <div key={lead.id}
                      draggable
                      onDragStart={e => onDragStart(e, lead.id)}
                      onDragEnd={() => setDragging(null)}
                      onClick={() => handleSelectLead(lead)}
                      className="p-3 rounded-xl cursor-grab active:cursor-grabbing transition-all hover:scale-[1.01]"
                      style={{
                        background: selectedLead?.id === lead.id ? stage.bg : 'var(--card)',
                        border: `1px solid ${selectedLead?.id === lead.id ? stage.color + '40' : 'var(--border)'}`,
                        opacity: dragging === lead.id ? 0.5 : 1,
                      }}>
                      <div className="text-xs font-bold mb-1" style={{ color: 'var(--text)' }}>{lead.name}</div>
                      {lead.phone && (
                        <div className="text-[10px] flex items-center gap-1" style={{ color: 'var(--muted)' }}>
                          📱 {lead.phone}
                        </div>
                      )}
                      {lead.estimated_value && (
                        <div className="text-[10px] font-semibold mt-1" style={{ color: 'var(--green)' }}>
                          S/ {lead.estimated_value.toFixed(0)}
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[9px] px-2 py-0.5 rounded-full capitalize"
                          style={{ background: 'var(--surface)', color: 'var(--muted)' }}>
                          {lead.source}
                        </span>
                        <span className="text-[9px]" style={{ color: 'var(--muted)' }}>
                          {new Date(lead.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Panel detalle lead */}
        {selectedLead && (
          <div className="w-72 flex-shrink-0 rounded-xl flex flex-col overflow-hidden"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>{selectedLead.name}</span>
              <button onClick={() => setSelectedLead(null)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs"
                style={{ background: 'var(--surface)', color: 'var(--muted)' }}>✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Info */}
              <div className="space-y-2 text-xs">
                {selectedLead.phone && (
                  <div className="flex items-center justify-between">
                    <span style={{ color: 'var(--muted)' }}>Teléfono</span>
                    <a href={`https://wa.me/${selectedLead.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                      className="font-semibold" style={{ color: 'var(--green)' }}>
                      📱 {selectedLead.phone}
                    </a>
                  </div>
                )}
                {selectedLead.email && (
                  <div className="flex items-center justify-between">
                    <span style={{ color: 'var(--muted)' }}>Email</span>
                    <span style={{ color: 'var(--text)' }}>{selectedLead.email}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--muted)' }}>Fuente</span>
                  <span className="capitalize" style={{ color: 'var(--text)' }}>{selectedLead.source}</span>
                </div>
                {selectedLead.estimated_value && (
                  <div className="flex items-center justify-between">
                    <span style={{ color: 'var(--muted)' }}>Valor estimado</span>
                    <span className="font-bold" style={{ color: 'var(--green)' }}>S/ {selectedLead.estimated_value.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Mover etapa */}
              <div>
                <div className="text-[10px] font-semibold mb-2" style={{ color: 'var(--muted)' }}>MOVER A ETAPA</div>
                <div className="grid grid-cols-3 gap-1">
                  {STAGES.map(s => (
                    <button key={s.id}
                      onClick={() => moveToStage(selectedLead.id, s.id)}
                      className="py-1.5 rounded-lg text-[10px] font-semibold transition-all"
                      style={{
                        background: selectedLead.status === s.id ? s.bg : 'var(--surface)',
                        border: `1px solid ${selectedLead.status === s.id ? s.color + '40' : 'var(--border)'}`,
                        color: selectedLead.status === s.id ? s.color : 'var(--muted)',
                      }}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Convertir a cliente */}
              {selectedLead.status !== 'lost' && (
                <button onClick={handleConvertToCustomer} disabled={converting}
                  className="w-full py-2 rounded-xl text-xs font-bold text-white disabled:opacity-50"
                  style={{ background: 'var(--gradient)' }}>
                  {converting ? 'Convirtiendo…' : '🎉 Convertir a Cliente'}
                </button>
              )}

              {/* Notas */}
              <div>
                <div className="text-[10px] font-semibold mb-2" style={{ color: 'var(--muted)' }}>NOTAS DE ACTIVIDAD</div>
                <div className="flex gap-2 mb-2">
                  <input value={newNote} onChange={e => setNewNote(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                    placeholder="Agregar nota…"
                    className="flex-1 px-3 py-2 rounded-lg text-xs outline-none"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                  <button onClick={handleAddNote} disabled={savingNote || !newNote.trim()}
                    className="px-3 py-2 rounded-lg text-xs font-bold text-white disabled:opacity-50"
                    style={{ background: 'var(--gradient)' }}>
                    +
                  </button>
                </div>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {notes.length === 0 ? (
                    <div className="text-[10px] text-center py-3" style={{ color: 'var(--sub)' }}>Sin notas aún</div>
                  ) : notes.map(n => (
                    <div key={n.id} className="p-2 rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                      <div className="text-[11px]" style={{ color: 'var(--text)' }}>{n.content}</div>
                      <div className="text-[9px] mt-1" style={{ color: 'var(--sub)' }}>
                        {n.created_by} · {new Date(n.created_at).toLocaleDateString('es-PE')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Eliminar */}
              <button onClick={() => handleDelete(selectedLead.id)}
                className="w-full py-2 rounded-xl text-xs font-semibold"
                style={{ background: 'rgba(239,68,68,.08)', color: 'var(--red)', border: '1px solid rgba(239,68,68,.2)' }}>
                🗑 Eliminar lead
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal crear lead */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border2)' }}>
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
              <span className="font-extrabold" style={{ color: 'var(--text)' }}>Nuevo Lead</span>
              <button onClick={() => setShowModal(false)} className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
                style={{ background: 'var(--surface)', color: 'var(--muted)' }}>✕</button>
            </div>
            <div className="p-5 space-y-3">
              {[
                { key: 'name',  placeholder: 'Nombre completo *', type: 'text' },
                { key: 'phone', placeholder: 'Teléfono / WhatsApp', type: 'tel' },
                { key: 'email', placeholder: 'Email', type: 'email' },
                { key: 'estimated_value', placeholder: 'Valor estimado (S/)', type: 'number' },
              ].map(({ key, placeholder, type }) => (
                <input key={key} type={type} placeholder={placeholder}
                  value={(form as any)[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              ))}
              <select value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                {SOURCES.map(s => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
              <textarea rows={2} placeholder="Notas iniciales…" value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-xs outline-none resize-none"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              {error && <div className="text-xs" style={{ color: 'var(--red)' }}>{error}</div>}
            </div>
            <div className="p-5 pt-0 flex gap-3">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-2 rounded-lg text-xs font-semibold"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
                Cancelar
              </button>
              <button onClick={handleCreate} disabled={saving || !form.name.trim()}
                className="flex-1 py-2 rounded-lg text-xs font-bold text-white disabled:opacity-50"
                style={{ background: 'var(--gradient)' }}>
                {saving ? 'Guardando…' : 'Crear Lead'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
