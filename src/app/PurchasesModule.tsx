'use client'

import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
interface Supplier { id: string; name: string; phone?: string; email?: string }
interface Purchase { id: string; supplier_id?: string; status: string; total: number; created_at: string; notes?: string; supplier?: Supplier }

export default function PurchasesModule({ orgId }: { orgId: string }) {
  const [tab, setTab] = useState<'purchases' | 'suppliers'>('purchases')
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (orgId) load() }, [orgId])

  async function load() {
    if (!isSupabaseConfigured() || !orgId) { setLoading(false); return }
    try {
      const [{ data: p }, { data: s }] = await Promise.all([
        supabase.from('corivacore_purchases').select('*, supplier:corivacore_suppliers(name)').eq('org_id', orgId).order('created_at', { ascending: false }),
        supabase.from('corivacore_suppliers').select('*').eq('org_id', orgId).order('name'),
      ])
      setPurchases(p || [])
      setSuppliers(s || [])
    } catch { setPurchases([]); setSuppliers([]) }
    setLoading(false)
  }

  async function saveSupplier() {
    if (!form.name.trim() || !orgId) return
    setSaving(true)
    try {
      await supabase.from('corivacore_suppliers').insert({ org_id: orgId, name: form.name, phone: form.phone || null, email: form.email || null })
      setForm({ name: '', phone: '', email: '' })
      setShowForm(false)
      await load()
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  const statusColor: Record<string, string> = {
    PENDIENTE: 'rgba(245,158,11,.15)',
    RECIBIDA: 'rgba(16,185,129,.15)',
    CANCELADA: 'rgba(239,68,68,.15)',
  }
  const statusText: Record<string, string> = {
    PENDIENTE: 'var(--amber)',
    RECIBIDA: 'var(--green)',
    CANCELADA: 'var(--red)',
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
    </div>
  )

  return (
    <div className="p-4 md:p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold" style={{ color: 'var(--text)' }}>Compras & Proveedores</h2>
        {tab === 'suppliers' && (
          <button onClick={() => setShowForm(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white"
            style={{ background: 'var(--gradient)' }}>
            + Proveedor
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['purchases', 'suppliers'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
            style={{
              background: tab === t ? 'rgba(99,102,241,.15)' : 'var(--surface)',
              border: `1px solid ${tab === t ? 'rgba(99,102,241,.3)' : 'var(--border)'}`,
              color: tab === t ? 'var(--accent)' : 'var(--muted)',
            }}>
            {t === 'purchases' ? `Órdenes (${purchases.length})` : `Proveedores (${suppliers.length})`}
          </button>
        ))}
      </div>

      {/* Purchases list */}
      {tab === 'purchases' && (
        <div className="flex flex-col gap-2">
          {purchases.length === 0 ? (
            <div className="text-center py-16" style={{ color: 'var(--muted)' }}>
              <div className="text-4xl mb-3">📦</div>
              <p className="text-sm font-semibold">No hay órdenes de compra</p>
              <p className="text-xs mt-1">Las compras aparecerán aquí una vez creadas</p>
            </div>
          ) : purchases.map(p => (
            <div key={p.id} className="p-4 rounded-xl flex items-center justify-between"
              style={{ background: 'var(--card)', border: '1px solid var(--border2)' }}>
              <div>
                <div className="text-sm font-bold" style={{ color: 'var(--text)' }}>
                  {(p.supplier as any)?.name || 'Sin proveedor'}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                  {new Date(p.created_at).toLocaleDateString('es-PE')}
                  {p.notes && ` · ${p.notes}`}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>S/ {p.total?.toFixed(2)}</span>
                <span className="px-2 py-1 rounded-lg text-[10px] font-bold"
                  style={{ background: statusColor[p.status] || 'var(--surface)', color: statusText[p.status] || 'var(--muted)' }}>
                  {p.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Suppliers list */}
      {tab === 'suppliers' && (
        <div className="flex flex-col gap-2">
          {suppliers.length === 0 ? (
            <div className="text-center py-16" style={{ color: 'var(--muted)' }}>
              <div className="text-4xl mb-3">🏭</div>
              <p className="text-sm font-semibold">No hay proveedores</p>
              <button onClick={() => setShowForm(true)} className="mt-3 px-4 py-2 rounded-xl text-xs font-bold text-white" style={{ background: 'var(--gradient)' }}>
                Agregar proveedor
              </button>
            </div>
          ) : suppliers.map(s => (
            <div key={s.id} className="p-4 rounded-xl flex items-center justify-between"
              style={{ background: 'var(--card)', border: '1px solid var(--border2)' }}>
              <div>
                <div className="text-sm font-bold" style={{ color: 'var(--text)' }}>{s.name}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                  {[s.phone, s.email].filter(Boolean).join(' · ') || 'Sin contacto'}
                </div>
              </div>
              {s.phone && (
                <a href={`https://wa.me/51${s.phone}`} target="_blank" rel="noopener noreferrer"
                  className="px-3 py-1 rounded-lg text-[11px] font-bold"
                  style={{ background: 'rgba(37,211,102,.1)', color: '#25D366', border: '1px solid rgba(37,211,102,.3)' }}>
                  WhatsApp
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Supplier form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-3" style={{ background: 'var(--card)', border: '1px solid var(--border2)' }}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-extrabold text-sm" style={{ color: 'var(--text)' }}>Nuevo Proveedor</h3>
              <button onClick={() => setShowForm(false)} className="text-sm px-2 py-1 rounded-lg" style={{ background: 'var(--surface)', color: 'var(--muted)' }}>✕</button>
            </div>
            {[
              { key: 'name', label: 'Nombre *', placeholder: 'Nombre del proveedor' },
              { key: 'phone', label: 'Teléfono', placeholder: '987654321' },
              { key: 'email', label: 'Email', placeholder: 'proveedor@email.com' },
            ].map(f => (
              <div key={f.key} className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase" style={{ color: 'var(--muted)' }}>{f.label}</label>
                <input value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="px-3 py-2 rounded-xl text-xs outline-none"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              </div>
            ))}
            <button onClick={saveSupplier} disabled={saving || !form.name.trim()}
              className="w-full py-2 rounded-xl text-xs font-bold text-white mt-1 disabled:opacity-50"
              style={{ background: 'var(--gradient)' }}>
              {saving ? 'Guardando...' : 'Crear Proveedor'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
