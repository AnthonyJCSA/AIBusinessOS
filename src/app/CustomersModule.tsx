'use client'

import { useState, useEffect } from 'react'
import { customerService } from '@/lib/services'
import { exportCustomersToCSV } from '../lib/export'
import { DocumentSearchInput } from '@/modules/billing'
import { DniResult } from '@/lib/integrations/peruapi/peruapi.types'

interface Customer {
  id: string; org_id?: string; name: string; document_type?: string
  document_number?: string; phone?: string; email?: string
  address?: string; is_active?: boolean; created_at?: string
}

const emptyC = { document_type: 'DNI', document_number: '', name: '', phone: '', email: '', address: '' }

export default function CustomersModule({ currentUser }: { currentUser: any }) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<Customer | null>(null)
  const [newC, setNewC] = useState(emptyC)
  const [loading, setLoading] = useState(true)

  function handleDniFound(raw: Record<string, string>) {
    const r = raw as unknown as DniResult
    setNewC(p => ({
      ...p,
      document_number: r.dni,
      name: r.nombreCompleto,
    }))
  }

  useEffect(() => { loadCustomers() }, [])

  const loadCustomers = async () => {
    if (!currentUser?.organization_id) return
    try {
      setLoading(true)
      const data = await customerService.getAll(currentUser.organization_id)
      setCustomers(data)
    } catch { console.error('Error loading customers') }
    finally { setLoading(false) }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser?.organization_id) return
    try {
      await customerService.create(currentUser.organization_id, newC)
      await loadCustomers(); setNewC(emptyC); setShowAdd(false)
    } catch { alert('❌ Error al agregar cliente') }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editing) return
    try {
      await customerService.update(editing.id, { name: editing.name, phone: editing.phone, email: editing.email, address: editing.address })
      await loadCustomers(); setEditing(null)
    } catch { alert('❌ Error al actualizar') }
  }

  const handleDelete = async (c: Customer) => {
    if (!confirm(`¿Eliminar a ${c.name}?`)) return
    try { await customerService.update(c.id, { is_active: false }); await loadCustomers() }
    catch { alert('❌ Error') }
  }

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.document_number || '').includes(search)
  )

  const thisMonth = customers.filter(c => {
    if (!c.created_at) return false
    const d = new Date(c.created_at); const n = new Date()
    return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear()
  }).length

  const getSegment = (c: Customer) => {
    if (!c.created_at) return { label: '🔄 Regular', bg: 'rgba(59,130,246,.1)', color: 'var(--blue)' }
    const days = (Date.now() - new Date(c.created_at).getTime()) / 86400000
    if (days < 7) return { label: '🆕 Nuevo', bg: 'rgba(16,185,129,.1)', color: 'var(--green)' }
    if (days > 30) return { label: '💤 Inactivo', bg: 'rgba(239,68,68,.1)', color: 'var(--red)' }
    return { label: '🔄 Regular', bg: 'rgba(59,130,246,.1)', color: 'var(--blue)' }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin-slow" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
    </div>
  )

  return (
    <div className="p-5 animate-fade-up">
      {/* AI Banner */}
      <div className="flex items-center gap-[14px] px-[18px] py-[14px] rounded-xl mb-4"
        style={{ background: 'linear-gradient(135deg,rgba(99,102,241,.12),rgba(139,92,246,.08))', border: '1px solid rgba(99,102,241,.25)' }}>
        <div className="w-9 h-9 rounded-[9px] flex items-center justify-center text-base flex-shrink-0" style={{ background: 'var(--gradient)' }}>🤖</div>
        <div className="flex-1 min-w-0">
          <strong className="text-sm font-bold block" style={{ color: 'var(--text)' }}>IA: Segmentación automática de clientes activa</strong>
          <span className="text-xs" style={{ color: 'var(--muted)' }}>VIP · Regular · Nuevo · Inactivo — basado en historial de compras</span>
        </div>
        <button className="px-[14px] py-[7px] rounded-[9px] text-xs font-semibold text-white flex-shrink-0 transition-all"
          style={{ background: 'var(--gradient)' }}>
          Crear campaña
        </button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[10px] mb-4">
        {[
          { color: 'var(--blue)', icon: '👥', label: 'Total Clientes', value: String(customers.length) },
          { color: 'var(--green)', icon: '✅', label: 'Activos', value: String(customers.filter(c => c.is_active !== false).length) },
          { color: 'var(--amber)', icon: '🆕', label: 'Nuevos (mes)', value: String(thisMonth) },
          { color: 'var(--accent)', icon: '💰', label: 'LTV Promedio', value: 'S/ —' },
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

      {/* Tabla */}
      <div className="rounded-[13px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <span className="text-sm font-bold flex-1" style={{ color: 'var(--text)' }}>Base de Clientes CRM</span>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 px-3 h-[38px] rounded-[9px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="var(--sub)" strokeWidth="1.5"><circle cx="6.5" cy="6.5" r="4.5"/><path d="M11 11l3 3"/></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar…"
                className="bg-transparent outline-none text-sm w-[140px]" style={{ color: 'var(--text)' }} />
            </div>
            <button onClick={() => exportCustomersToCSV(customers)}
              className="px-3 py-[7px] rounded-[9px] text-xs font-semibold transition-all"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}>📥 Exportar</button>
            <button onClick={() => setShowAdd(true)}
              className="px-3 py-[7px] rounded-[9px] text-xs font-semibold text-white transition-all"
              style={{ background: 'var(--gradient)' }}>+ Agregar</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ minWidth: '600px' }}>
            <thead>
              <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                {['Cliente', 'Documento', 'Contacto', 'Seg. IA', 'Acción'].map(h => (
                  <th key={h} className="px-[14px] py-[9px] text-left font-bold uppercase tracking-[.6px]"
                    style={{ color: 'var(--sub)', fontSize: '10px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const seg = getSegment(c)
                return (
                  <tr key={c.id} style={{ borderBottom: '1px solid rgba(30,45,69,.5)' }}>
                    <td className="px-[14px] py-[10px] font-bold" style={{ color: 'var(--text)' }}>{c.name}</td>
                    <td className="px-[14px] py-[10px] font-mono text-[11px]" style={{ color: 'var(--muted)' }}>
                      {c.document_type} {c.document_number}
                    </td>
                    <td className="px-[14px] py-[10px]" style={{ color: 'var(--muted)' }}>
                      {c.phone && <div>📱 {c.phone}</div>}
                      {c.email && <div className="text-[10px]">✉️ {c.email}</div>}
                    </td>
                    <td className="px-[14px] py-[10px]">
                      <span className="px-2 py-[2px] rounded-full text-[10px] font-semibold" style={{ background: seg.bg, color: seg.color }}>{seg.label}</span>
                    </td>
                    <td className="px-[14px] py-[10px]">
                      <div className="flex gap-2">
                        <button onClick={() => setEditing(c)}
                          className="px-2 py-[3px] rounded-[7px] text-[10px] font-semibold transition-all"
                          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}>✏</button>
                        {c.phone && (
                          <button onClick={() => window.open(`https://wa.me/${c.phone?.replace(/\D/g, '')}`, '_blank')}
                            className="px-2 py-[3px] rounded-[7px] text-[10px] font-semibold transition-all"
                            style={{ background: 'rgba(37,211,102,.1)', border: '1px solid rgba(37,211,102,.2)', color: '#25D366' }}>WA</button>
                        )}
                        <button onClick={() => handleDelete(c)}
                          className="px-2 py-[3px] rounded-[7px] text-[10px] font-semibold transition-all"
                          style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', color: 'var(--red)' }}>🗑</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-[14px] py-8 text-center text-xs" style={{ color: 'var(--sub)' }}>Sin clientes registrados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Agregar */}
      {showAdd && (
        <DarkModal title="➕ Agregar Cliente" onClose={() => setShowAdd(false)}>
          <form onSubmit={handleAdd} className="space-y-4">
            {/* Búsqueda automática por DNI */}
            {newC.document_type === 'DNI' && (
              <FI label="Buscar por DNI" full>
                <DocumentSearchInput type="DNI" onFound={handleDniFound} />
              </FI>
            )}
            <div className="grid grid-cols-2 gap-3">
              <FI label="Tipo Doc"><select className="fi-dark" value={newC.document_type} onChange={e => setNewC(p => ({ ...p, document_type: e.target.value }))}><option>DNI</option><option>RUC</option><option>CE</option></select></FI>
              <FI label="Número *"><input className="fi-dark" value={newC.document_number} onChange={e => setNewC(p => ({ ...p, document_number: e.target.value }))} required /></FI>
              <FI label="Nombre Completo *" full><input className="fi-dark" value={newC.name} onChange={e => setNewC(p => ({ ...p, name: e.target.value }))} required /></FI>
              <FI label="Teléfono"><input className="fi-dark" value={newC.phone} onChange={e => setNewC(p => ({ ...p, phone: e.target.value }))} /></FI>
              <FI label="Email"><input type="email" className="fi-dark" value={newC.email} onChange={e => setNewC(p => ({ ...p, email: e.target.value }))} /></FI>
              <FI label="Dirección" full><input className="fi-dark" value={newC.address} onChange={e => setNewC(p => ({ ...p, address: e.target.value }))} /></FI>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowAdd(false)} className="px-5 py-[9px] rounded-[9px] text-xs font-semibold" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}>Cancelar</button>
              <button type="submit" className="px-5 py-[9px] rounded-[9px] text-xs font-semibold text-white" style={{ background: 'var(--gradient)' }}>Agregar Cliente</button>
            </div>
          </form>
        </DarkModal>
      )}

      {/* Modal Editar */}
      {editing && (
        <DarkModal title="✏️ Editar Cliente" onClose={() => setEditing(null)}>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FI label="Nombre" full><input className="fi-dark" value={editing.name} onChange={e => setEditing(p => p ? { ...p, name: e.target.value } : p)} /></FI>
              <FI label="Teléfono"><input className="fi-dark" value={editing.phone || ''} onChange={e => setEditing(p => p ? { ...p, phone: e.target.value } : p)} /></FI>
              <FI label="Email"><input type="email" className="fi-dark" value={editing.email || ''} onChange={e => setEditing(p => p ? { ...p, email: e.target.value } : p)} /></FI>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setEditing(null)} className="px-5 py-[9px] rounded-[9px] text-xs font-semibold" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}>Cancelar</button>
              <button type="submit" className="px-5 py-[9px] rounded-[9px] text-xs font-semibold text-white" style={{ background: 'var(--gradient)' }}>Guardar</button>
            </div>
          </form>
        </DarkModal>
      )}
    </div>
  )
}

function DarkModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto" style={{ background: 'var(--card)', border: '1px solid var(--border2)' }}>
        <div className="flex items-center justify-between mb-5">
          <span className="text-base font-extrabold" style={{ color: 'var(--text)' }}>{title}</span>
          <button onClick={onClose} className="w-[30px] h-[30px] rounded-[7px] flex items-center justify-center text-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function FI({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={`flex flex-col gap-[5px] ${full ? 'col-span-2' : ''}`}>
      <label className="text-[10px] font-bold uppercase tracking-[.5px]" style={{ color: 'var(--muted)' }}>{label}</label>
      {children}
    </div>
  )
}
