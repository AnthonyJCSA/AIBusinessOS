'use client'

import { useState, useEffect, useCallback } from 'react'
import { customerService } from '@/lib/services'
import { crmService, type CustomerWithSegment, type Segment } from '@/lib/services/crm.service'
import { saleService } from '@/lib/services'
import { useOrganization } from '@/shared/hooks/useOrganization'
import { Modal } from '@/shared/components/ui/Modal'
import { Badge } from '@/shared/components/ui/Badge'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { exportCustomersToCSV } from '@/lib/export'

const SEGMENT_STYLES: Record<Segment, { variant: 'success' | 'info' | 'warning' | 'danger' | 'default'; label: string }> = {
  nuevo:     { variant: 'success', label: '🆕 Nuevo' },
  regular:   { variant: 'info',    label: '🔄 Regular' },
  frecuente: { variant: 'default', label: '⭐ Frecuente' },
  vip:       { variant: 'warning', label: '👑 VIP' },
  inactivo:  { variant: 'danger',  label: '💤 Inactivo' },
}

const SEGMENT_FILTERS: { key: Segment | 'all'; label: string }[] = [
  { key: 'all',      label: 'Todos' },
  { key: 'vip',      label: '👑 VIP' },
  { key: 'frecuente',label: '⭐ Frecuente' },
  { key: 'regular',  label: '🔄 Regular' },
  { key: 'nuevo',    label: '🆕 Nuevo' },
  { key: 'inactivo', label: '💤 Inactivo' },
]

const emptyC = { document_type: 'DNI', document_number: '', name: '', phone: '', email: '', address: '', notes: '' }

export default function CustomersModule({ currentUser }: { currentUser: any }) {
  const org = useOrganization()
  const orgId = org?.id ?? currentUser?.organization_id
  const currency = org?.settings?.currency ?? 'S/'

  const [customers, setCustomers]         = useState<CustomerWithSegment[]>([])
  const [stats, setStats]                 = useState({ total: 0, active: 0, vip: 0, newThisMonth: 0, inactive: 0, avgTicket: 0, totalRevenue: 0, retentionRate: 0 })
  const [search, setSearch]               = useState('')
  const [segmentFilter, setSegmentFilter] = useState<Segment | 'all'>('all')
  const [showAdd, setShowAdd]             = useState(false)
  const [selected, setSelected]           = useState<CustomerWithSegment | null>(null)
  const [editing, setEditing]             = useState<CustomerWithSegment | null>(null)
  const [newC, setNewC]                   = useState(emptyC)
  const [loading, setLoading]             = useState(true)
  const [customerSales, setCustomerSales] = useState<any[]>([])
  const [loadingSales, setLoadingSales]   = useState(false)

  const load = useCallback(async () => {
    if (!orgId) return
    setLoading(true)
    try {
      const [data, s] = await Promise.all([
        crmService.getAll(orgId),
        crmService.getStats(orgId),
      ])
      setCustomers(data)
      setStats(s)
    } catch { console.error('Error loading customers') }
    finally { setLoading(false) }
  }, [orgId])

  useEffect(() => { load() }, [load])

  const loadCustomerSales = async (customerId: string) => {
    setLoadingSales(true)
    try {
      const all = await saleService.getAll(orgId, 200)
      setCustomerSales(all.filter((s: any) => s.customer_id === customerId))
    } catch { setCustomerSales([]) }
    finally { setLoadingSales(false) }
  }

  const handleSelect = (c: CustomerWithSegment) => {
    setSelected(c)
    loadCustomerSales(c.id)
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orgId) return
    try {
      await customerService.create(orgId, newC)
      await load(); setNewC(emptyC); setShowAdd(false)
    } catch { alert('❌ Error al agregar cliente') }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editing) return
    try {
      await customerService.update(editing.id, {
        name: editing.name, phone: editing.phone,
        email: editing.email, address: editing.address,
        notes: (editing as any).notes,
      })
      await load(); setEditing(null)
      if (selected?.id === editing.id) setSelected({ ...selected, ...editing })
    } catch { alert('❌ Error al actualizar') }
  }

  const handleDelete = async (c: CustomerWithSegment) => {
    if (!confirm(`¿Desactivar a ${c.name}?`)) return
    try {
      await customerService.update(c.id, { is_active: false })
      await load()
      if (selected?.id === c.id) setSelected(null)
    } catch { alert('❌ Error') }
  }

  const filtered = customers.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.document_number ?? '').includes(search) ||
      (c.phone ?? '').includes(search)
    const matchSegment = segmentFilter === 'all' || c.computed_segment === segmentFilter
    return matchSearch && matchSegment
  })

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
        style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
    </div>
  )

  return (
    <div className="p-5 animate-fade-up space-y-4">

      {/* Métricas CRM reales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[10px]">
        {[
          { color: 'var(--blue)',   icon: '👥', label: 'Total Clientes',  value: String(stats.total) },
          { color: 'var(--green)',  icon: '✅', label: 'Retención',       value: `${stats.retentionRate}%` },
          { color: 'var(--amber)',  icon: '👑', label: 'VIP',             value: String(stats.vip) },
          { color: 'var(--red)',    icon: '💤', label: 'Inactivos',       value: String(stats.inactive) },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[14px]">

        {/* Lista */}
        <div className="lg:col-span-2 rounded-[13px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          {/* Toolbar */}
          <div className="px-4 py-3 flex flex-wrap items-center gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="text-sm font-bold flex-shrink-0" style={{ color: 'var(--text)' }}>Base de Clientes</span>
            <div className="flex items-center gap-2 px-3 h-[34px] rounded-[9px] flex-1 min-w-[120px]"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="var(--sub)" strokeWidth="1.5">
                <circle cx="6.5" cy="6.5" r="4.5" /><path d="M11 11l3 3" />
              </svg>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar…" className="bg-transparent outline-none text-xs w-full"
                style={{ color: 'var(--text)' }} />
            </div>
            <button onClick={() => exportCustomersToCSV(customers)}
              className="px-3 py-[6px] rounded-[9px] text-xs font-semibold"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
              📥
            </button>
            <button onClick={() => setShowAdd(true)}
              className="px-3 py-[6px] rounded-[9px] text-xs font-semibold text-white"
              style={{ background: 'var(--gradient)' }}>
              + Agregar
            </button>
          </div>

          {/* Filtros de segmento */}
          <div className="px-4 py-2 flex gap-2 overflow-x-auto" style={{ borderBottom: '1px solid var(--border)' }}>
            {SEGMENT_FILTERS.map(f => (
              <button key={f.key} onClick={() => setSegmentFilter(f.key)}
                className="px-3 py-[4px] rounded-full text-[10px] font-semibold whitespace-nowrap transition-all"
                style={{
                  background: segmentFilter === f.key ? 'rgba(99,102,241,.15)' : 'var(--surface)',
                  border: `1px solid ${segmentFilter === f.key ? 'rgba(99,102,241,.3)' : 'var(--border)'}`,
                  color: segmentFilter === f.key ? 'var(--accent)' : 'var(--muted)',
                }}>
                {f.label}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs" style={{ minWidth: '500px' }}>
              <thead>
                <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                  {['Cliente', 'Contacto', 'Compras', 'Total', 'Segmento', ''].map(h => (
                    <th key={h} className="px-[14px] py-[9px] text-left font-bold uppercase tracking-[.6px]"
                      style={{ color: 'var(--sub)', fontSize: '10px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="py-8">
                    <EmptyState icon="👥" title="Sin clientes" description="Agrega tu primer cliente" />
                  </td></tr>
                ) : filtered.map(c => {
                  const seg = SEGMENT_STYLES[c.computed_segment] ?? SEGMENT_STYLES.regular
                  return (
                    <tr key={c.id} onClick={() => handleSelect(c)}
                      className="cursor-pointer transition-all"
                      style={{
                        borderBottom: '1px solid rgba(30,45,69,.5)',
                        background: selected?.id === c.id ? 'rgba(99,102,241,.08)' : 'transparent',
                      }}>
                      <td className="px-[14px] py-[10px] font-bold" style={{ color: 'var(--text)' }}>
                        {c.name}
                        {c.document_number && (
                          <div className="text-[10px] font-mono" style={{ color: 'var(--sub)' }}>
                            {c.document_type} {c.document_number}
                          </div>
                        )}
                      </td>
                      <td className="px-[14px] py-[10px]" style={{ color: 'var(--muted)' }}>
                        {c.phone && <div>📱 {c.phone}</div>}
                        {c.email && <div className="text-[10px]">✉️ {c.email}</div>}
                      </td>
                      <td className="px-[14px] py-[10px] font-bold text-center" style={{ color: 'var(--text)' }}>
                        {c.total_purchases ?? 0}
                      </td>
                      <td className="px-[14px] py-[10px] font-bold" style={{ color: 'var(--green)' }}>
                        {currency} {(c.total_spent ?? 0).toFixed(2)}
                      </td>
                      <td className="px-[14px] py-[10px]">
                        <Badge variant={seg.variant}>{seg.label}</Badge>
                      </td>
                      <td className="px-[14px] py-[10px]">
                        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                          {c.phone && (
                            <button onClick={() => window.open(`https://wa.me/${c.phone?.replace(/\D/g, '')}`, '_blank')}
                              className="px-2 py-[3px] rounded-[7px] text-[10px] font-semibold"
                              style={{ background: 'rgba(37,211,102,.1)', color: '#25D366', border: '1px solid rgba(37,211,102,.2)' }}>
                              WA
                            </button>
                          )}
                          <button onClick={() => setEditing(c)}
                            className="px-2 py-[3px] rounded-[7px] text-[10px] font-semibold"
                            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
                            ✏
                          </button>
                          <button onClick={() => handleDelete(c)}
                            className="px-2 py-[3px] rounded-[7px] text-[10px] font-semibold"
                            style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', color: 'var(--red)' }}>
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Panel perfil */}
        <div className="rounded-[13px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          {!selected ? (
            <div className="h-full flex items-center justify-center p-6">
              <EmptyState icon="👤" title="Selecciona un cliente" description="Haz clic para ver su perfil" />
            </div>
          ) : (
            <>
              <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
                <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>Perfil del Cliente</span>
                <button onClick={() => setSelected(null)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}>✕</button>
              </div>
              <div className="p-4 space-y-4">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full mx-auto mb-2 flex items-center justify-center text-2xl font-extrabold text-white"
                    style={{ background: 'var(--gradient)' }}>
                    {selected.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="font-extrabold text-base" style={{ color: 'var(--text)' }}>{selected.name}</div>
                  {selected.phone && <div className="text-xs" style={{ color: 'var(--muted)' }}>📱 {selected.phone}</div>}
                  {selected.email && <div className="text-xs" style={{ color: 'var(--muted)' }}>✉️ {selected.email}</div>}
                  <div className="mt-2">
                    <Badge variant={SEGMENT_STYLES[selected.computed_segment]?.variant ?? 'default'}>
                      {SEGMENT_STYLES[selected.computed_segment]?.label ?? 'Regular'}
                    </Badge>
                  </div>
                  {selected.days_since_last_purchase !== null && (
                    <div className="text-[10px] mt-1" style={{ color: selected.days_since_last_purchase > 30 ? 'var(--red)' : 'var(--muted)' }}>
                      Última compra: hace {selected.days_since_last_purchase} días
                    </div>
                  )}
                </div>

                {/* Métricas */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Compras',      value: String(selected.total_purchases ?? 0),                                                                                    color: 'var(--blue)' },
                    { label: 'Total gastado', value: `${currency} ${(selected.total_spent ?? 0).toFixed(0)}`,                                                                 color: 'var(--green)' },
                    { label: 'Ticket prom.', value: selected.total_purchases ? `${currency} ${((selected.total_spent ?? 0) / selected.total_purchases).toFixed(0)}` : '—',   color: 'var(--amber)' },
                    { label: 'Días inactivo', value: selected.days_since_last_purchase !== null ? `${selected.days_since_last_purchase}d` : '—',                              color: 'var(--muted)' },
                  ].map(m => (
                    <div key={m.label} className="p-2 rounded-lg text-center"
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                      <div className="text-base font-extrabold" style={{ color: m.color }}>{m.value}</div>
                      <div className="text-[10px]" style={{ color: 'var(--sub)' }}>{m.label}</div>
                    </div>
                  ))}
                </div>

                {/* Historial */}
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[.5px] mb-2" style={{ color: 'var(--muted)' }}>Últimas compras</div>
                  {loadingSales ? (
                    <div className="text-xs text-center py-3" style={{ color: 'var(--sub)' }}>Cargando...</div>
                  ) : customerSales.length === 0 ? (
                    <div className="text-xs text-center py-3" style={{ color: 'var(--sub)' }}>Sin compras registradas</div>
                  ) : (
                    <div className="space-y-1 max-h-[180px] overflow-y-auto">
                      {customerSales.slice(0, 10).map((s: any) => (
                        <div key={s.id} className="flex items-center justify-between px-2 py-[6px] rounded-lg"
                          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                          <div>
                            <div className="text-[11px] font-bold" style={{ color: 'var(--text)' }}>{s.sale_number}</div>
                            <div className="text-[10px]" style={{ color: 'var(--sub)' }}>
                              {new Date(s.created_at).toLocaleDateString('es-PE')}
                            </div>
                          </div>
                          <div className="text-xs font-bold" style={{ color: 'var(--green)' }}>
                            {currency} {s.total.toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Acciones */}
                <div className="space-y-2">
                  {selected.phone && (
                    <button onClick={() => window.open(`https://wa.me/${selected.phone?.replace(/\D/g, '')}`, '_blank')}
                      className="w-full py-2 rounded-xl text-xs font-semibold"
                      style={{ background: 'rgba(37,211,102,.1)', color: '#25D366', border: '1px solid rgba(37,211,102,.3)' }}>
                      📱 Enviar WhatsApp
                    </button>
                  )}
                  {selected.computed_segment === 'inactivo' && (
                    <button onClick={() => {
                      const msg = encodeURIComponent(`¡Hola ${selected.name}! 👋 Hace tiempo no te vemos. Te tenemos una oferta especial. ¿Cuándo nos visitas?`)
                      window.open(`https://wa.me/${selected.phone?.replace(/\D/g, '')}?text=${msg}`, '_blank')
                    }}
                      className="w-full py-2 rounded-xl text-xs font-semibold"
                      style={{ background: 'rgba(245,158,11,.1)', color: 'var(--amber)', border: '1px solid rgba(245,158,11,.3)' }}>
                      🔄 Reactivar cliente
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal Agregar */}
      <Modal open={showAdd} title="➕ Agregar Cliente" onClose={() => setShowAdd(false)}>
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {[
              ['Tipo Doc', 'document_type', 'select'],
              ['Número', 'document_number', 'text'],
              ['Nombre Completo *', 'name', 'text', true],
              ['Teléfono', 'phone', 'text'],
              ['Email', 'email', 'email'],
              ['Dirección', 'address', 'text', true],
              ['Notas', 'notes', 'text', true],
            ].map(([label, key, type, full]) => (
              <div key={key as string} className={`flex flex-col gap-1 ${full ? 'col-span-2' : ''}`}>
                <label className="text-[10px] font-bold uppercase tracking-[.5px]" style={{ color: 'var(--muted)' }}>{label}</label>
                {type === 'select' ? (
                  <select value={(newC as any)[key as string]}
                    onChange={e => setNewC(p => ({ ...p, [key as string]: e.target.value }))}
                    className="px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                    <option>DNI</option><option>RUC</option><option>CE</option><option>Pasaporte</option>
                  </select>
                ) : (
                  <input type={type as string} value={(newC as any)[key as string]}
                    onChange={e => setNewC(p => ({ ...p, [key as string]: e.target.value }))}
                    required={key === 'name'}
                    className="px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowAdd(false)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
              Cancelar
            </button>
            <button type="submit"
              className="flex-1 py-2 rounded-xl text-xs font-bold text-white"
              style={{ background: 'var(--gradient)' }}>
              Agregar Cliente
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Editar */}
      <Modal open={!!editing} title="✏️ Editar Cliente" onClose={() => setEditing(null)}>
        {editing && (
          <form onSubmit={handleUpdate} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Nombre', 'name', false],
                ['Teléfono', 'phone', false],
                ['Email', 'email', false],
                ['Dirección', 'address', true],
                ['Notas', 'notes', true],
              ].map(([label, key, full]) => (
                <div key={key as string} className={`flex flex-col gap-1 ${full ? 'col-span-2' : ''}`}>
                  <label className="text-[10px] font-bold uppercase tracking-[.5px]" style={{ color: 'var(--muted)' }}>{label}</label>
                  <input value={(editing as any)[key as string] ?? ''}
                    onChange={e => setEditing(p => p ? { ...p, [key as string]: e.target.value } : p)}
                    className="px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                </div>
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setEditing(null)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
                Cancelar
              </button>
              <button type="submit"
                className="flex-1 py-2 rounded-xl text-xs font-bold text-white"
                style={{ background: 'var(--gradient)' }}>
                Guardar Cambios
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
