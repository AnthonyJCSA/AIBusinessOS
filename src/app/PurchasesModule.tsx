'use client'

import { useState, useEffect, useCallback } from 'react'
import { purchaseService, type Supplier, type Purchase, type PurchaseItem } from '@/lib/services/purchase.service'
import type { User } from '@/types'

interface Props {
  currentUser: User
  orgId: string
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:   { label: 'Pendiente',  color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  received:  { label: 'Recibida',   color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  partial:   { label: 'Parcial',    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  cancelled: { label: 'Cancelada',  color: 'bg-red-500/10 text-red-400 border-red-500/20' },
}

const EMPTY_ITEM: Omit<PurchaseItem, 'subtotal'> = { product_name: '', quantity: 1, unit_cost: 0 }

export default function PurchasesModule({ currentUser, orgId }: Props) {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showSuppliersModal, setShowSuppliersModal] = useState(false)
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // ── Create PO form state ──
  const [form, setForm] = useState({
    supplier_id: '',
    notes: '',
    expected_at: '',
    items: [{ ...EMPTY_ITEM, subtotal: 0 }] as PurchaseItem[],
  })

  // ── Supplier form state ──
  const [supplierForm, setSupplierForm] = useState({ name: '', contact_name: '', phone: '', email: '', ruc: '' })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [p, s] = await Promise.all([
        purchaseService.getAll(orgId),
        purchaseService.getSuppliers(orgId),
      ])
      setPurchases(p)
      setSuppliers(s)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [orgId])

  useEffect(() => { load() }, [load])

  // ── Item helpers ──
  const updateItem = (idx: number, field: keyof PurchaseItem, value: string | number) => {
    setForm(f => {
      const items = [...f.items]
      items[idx] = { ...items[idx], [field]: value }
      items[idx].subtotal = items[idx].quantity * items[idx].unit_cost
      return { ...f, items }
    })
  }

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { ...EMPTY_ITEM, subtotal: 0 }] }))
  const removeItem = (idx: number) => setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }))

  const total = form.items.reduce((s, i) => s + i.subtotal, 0)

  // ── Submit PO ──
  const handleCreate = async () => {
    if (!form.items.some(i => i.product_name.trim())) return
    setSaving(true)
    setError('')
    try {
      await purchaseService.create(orgId, {
        supplier_id: form.supplier_id || undefined,
        items: form.items.filter(i => i.product_name.trim()),
        notes: form.notes || undefined,
        expected_at: form.expected_at || undefined,
        created_by: currentUser.id,
      })
      setShowCreateModal(false)
      setForm({ supplier_id: '', notes: '', expected_at: '', items: [{ ...EMPTY_ITEM, subtotal: 0 }] })
      await load()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  // ── Receive PO ──
  const handleReceive = async (id: string) => {
    if (!confirm('¿Confirmar recepción? Se actualizará el stock automáticamente.')) return
    try {
      await purchaseService.receive(id, currentUser.id)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  // ── Cancel PO ──
  const handleCancel = async (id: string) => {
    if (!confirm('¿Cancelar esta orden de compra?')) return
    try {
      await purchaseService.cancel(id)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  // ── Create Supplier ──
  const handleCreateSupplier = async () => {
    if (!supplierForm.name.trim()) return
    setSaving(true)
    try {
      await purchaseService.createSupplier(orgId, supplierForm)
      setSupplierForm({ name: '', contact_name: '', phone: '', email: '', ruc: '' })
      const s = await purchaseService.getSuppliers(orgId)
      setSuppliers(s)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const pendingCount = purchases.filter(p => p.status === 'pending').length
  const totalPending = purchases.filter(p => p.status === 'pending').reduce((s, p) => s + p.total, 0)

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-extrabold" style={{ color: 'var(--text)' }}>Compras & Proveedores</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
            {pendingCount} órdenes pendientes · S/ {totalPending.toFixed(2)} por recibir
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSuppliersModal(true)}
            className="px-3 py-2 rounded-lg text-xs font-semibold transition-all"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--muted)' }}
          >
            🏭 Proveedores ({suppliers.length})
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-lg text-xs font-bold text-white transition-all"
            style={{ background: 'var(--gradient)' }}
          >
            + Nueva Orden
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg text-xs" style={{ background: 'rgba(239,68,68,.1)', color: 'var(--red)', border: '1px solid rgba(239,68,68,.2)' }}>
          {error}
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                {['Nº Orden', 'Proveedor', 'Items', 'Total', 'Estado', 'Fecha', 'Acciones'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center" style={{ color: 'var(--muted)' }}>Cargando…</td></tr>
              ) : purchases.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center" style={{ color: 'var(--muted)' }}>
                  <div className="text-3xl mb-2">📦</div>
                  <div>No hay órdenes de compra</div>
                  <div className="text-[10px] mt-1">Crea tu primera orden para gestionar el stock</div>
                </td></tr>
              ) : purchases.map(p => {
                const st = STATUS_LABELS[p.status]
                return (
                  <tr
                    key={p.id}
                    className="cursor-pointer transition-colors hover:bg-white/5"
                    style={{ borderBottom: '1px solid var(--border)' }}
                    onClick={() => setSelectedPurchase(p)}
                  >
                    <td className="px-4 py-3 font-mono font-bold" style={{ color: 'var(--accent)' }}>
                      {p.purchase_number || '—'}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text)' }}>
                      {(p.supplier as any)?.name || <span style={{ color: 'var(--muted)' }}>Sin proveedor</span>}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--muted)' }}>
                      {p.items?.length ?? '—'} items
                    </td>
                    <td className="px-4 py-3 font-bold" style={{ color: 'var(--text)' }}>
                      S/ {p.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-semibold border ${st.color}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--muted)' }}>
                      {p.created_at ? new Date(p.created_at).toLocaleDateString('es-PE') : '—'}
                    </td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <div className="flex gap-1">
                        {p.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleReceive(p.id)}
                              className="px-2 py-1 rounded text-[10px] font-semibold transition-all"
                              style={{ background: 'rgba(16,185,129,.1)', color: 'var(--green)', border: '1px solid rgba(16,185,129,.2)' }}
                            >
                              ✓ Recibir
                            </button>
                            <button
                              onClick={() => handleCancel(p.id)}
                              className="px-2 py-1 rounded text-[10px] font-semibold transition-all"
                              style={{ background: 'rgba(239,68,68,.1)', color: 'var(--red)', border: '1px solid rgba(239,68,68,.2)' }}
                            >
                              ✕
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Create PO Modal ── */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl flex flex-col max-h-[90vh]" style={{ background: 'var(--card)', border: '1px solid var(--border2)' }}>
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
              <span className="font-extrabold" style={{ color: 'var(--text)' }}>Nueva Orden de Compra</span>
              <button onClick={() => setShowCreateModal(false)} className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: 'var(--surface)', color: 'var(--muted)' }}>✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Supplier + date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold mb-1 block" style={{ color: 'var(--muted)' }}>Proveedor</label>
                  <select
                    value={form.supplier_id}
                    onChange={e => setForm(f => ({ ...f, supplier_id: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  >
                    <option value="">Sin proveedor</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold mb-1 block" style={{ color: 'var(--muted)' }}>Fecha esperada</label>
                  <input
                    type="date"
                    value={form.expected_at}
                    onChange={e => setForm(f => ({ ...f, expected_at: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  />
                </div>
              </div>

              {/* Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-semibold" style={{ color: 'var(--muted)' }}>Productos</label>
                  <button onClick={addItem} className="text-[10px] font-semibold px-2 py-1 rounded" style={{ background: 'rgba(99,102,241,.1)', color: 'var(--accent)' }}>+ Agregar</button>
                </div>
                <div className="space-y-2">
                  {form.items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-[1fr_80px_90px_80px_28px] gap-2 items-center">
                      <input
                        placeholder="Nombre del producto"
                        value={item.product_name}
                        onChange={e => updateItem(idx, 'product_name', e.target.value)}
                        className="px-3 py-2 rounded-lg text-xs outline-none"
                        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
                      />
                      <input
                        type="number" min="1" placeholder="Cant."
                        value={item.quantity}
                        onChange={e => updateItem(idx, 'quantity', Number(e.target.value))}
                        className="px-2 py-2 rounded-lg text-xs outline-none text-center"
                        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
                      />
                      <input
                        type="number" min="0" step="0.01" placeholder="Costo unit."
                        value={item.unit_cost || ''}
                        onChange={e => updateItem(idx, 'unit_cost', Number(e.target.value))}
                        className="px-2 py-2 rounded-lg text-xs outline-none"
                        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
                      />
                      <div className="text-xs font-bold text-right" style={{ color: 'var(--text)' }}>
                        S/ {item.subtotal.toFixed(2)}
                      </div>
                      {form.items.length > 1 && (
                        <button onClick={() => removeItem(idx)} className="w-7 h-7 rounded flex items-center justify-center text-xs" style={{ color: 'var(--red)' }}>✕</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-[10px] font-semibold mb-1 block" style={{ color: 'var(--muted)' }}>Notas</label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Instrucciones especiales, condiciones de pago…"
                  className="w-full px-3 py-2 rounded-lg text-xs outline-none resize-none"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
                />
              </div>

              {/* Total */}
              <div className="flex justify-end">
                <div className="text-right">
                  <div className="text-[10px]" style={{ color: 'var(--muted)' }}>Total de la orden</div>
                  <div className="text-2xl font-extrabold" style={{ color: 'var(--text)' }}>S/ {total.toFixed(2)}</div>
                </div>
              </div>
            </div>

            <div className="p-5 border-t flex gap-3 justify-end" style={{ borderColor: 'var(--border)' }}>
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded-lg text-xs font-semibold" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={saving || !form.items.some(i => i.product_name.trim())}
                className="px-5 py-2 rounded-lg text-xs font-bold text-white disabled:opacity-50"
                style={{ background: 'var(--gradient)' }}
              >
                {saving ? 'Guardando…' : 'Crear Orden'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Suppliers Modal ── */}
      {showSuppliersModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl flex flex-col max-h-[85vh]" style={{ background: 'var(--card)', border: '1px solid var(--border2)' }}>
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
              <span className="font-extrabold" style={{ color: 'var(--text)' }}>🏭 Proveedores</span>
              <button onClick={() => setShowSuppliersModal(false)} className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: 'var(--surface)', color: 'var(--muted)' }}>✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Add supplier form */}
              <div className="p-4 rounded-xl space-y-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="text-xs font-bold" style={{ color: 'var(--text)' }}>Nuevo Proveedor</div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'name', placeholder: 'Nombre *' },
                    { key: 'contact_name', placeholder: 'Contacto' },
                    { key: 'phone', placeholder: 'Teléfono' },
                    { key: 'email', placeholder: 'Email' },
                    { key: 'ruc', placeholder: 'RUC' },
                  ].map(({ key, placeholder }) => (
                    <input
                      key={key}
                      placeholder={placeholder}
                      value={(supplierForm as any)[key]}
                      onChange={e => setSupplierForm(f => ({ ...f, [key]: e.target.value }))}
                      className="px-3 py-2 rounded-lg text-xs outline-none"
                      style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    />
                  ))}
                </div>
                <button
                  onClick={handleCreateSupplier}
                  disabled={saving || !supplierForm.name.trim()}
                  className="w-full py-2 rounded-lg text-xs font-bold text-white disabled:opacity-50"
                  style={{ background: 'var(--gradient)' }}
                >
                  {saving ? 'Guardando…' : '+ Agregar Proveedor'}
                </button>
              </div>

              {/* Suppliers list */}
              <div className="space-y-2">
                {suppliers.length === 0 ? (
                  <div className="text-center py-6 text-xs" style={{ color: 'var(--muted)' }}>No hay proveedores registrados</div>
                ) : suppliers.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <div>
                      <div className="text-xs font-bold" style={{ color: 'var(--text)' }}>{s.name}</div>
                      <div className="text-[10px]" style={{ color: 'var(--muted)' }}>
                        {[s.contact_name, s.phone, s.ruc].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Purchase Detail Modal ── */}
      {selectedPurchase && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border2)' }}>
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
              <div>
                <div className="font-extrabold font-mono" style={{ color: 'var(--accent)' }}>{selectedPurchase.purchase_number}</div>
                <div className="text-[10px]" style={{ color: 'var(--muted)' }}>
                  {new Date(selectedPurchase.created_at!).toLocaleString('es-PE')}
                </div>
              </div>
              <button onClick={() => setSelectedPurchase(null)} className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: 'var(--surface)', color: 'var(--muted)' }}>✕</button>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--muted)' }}>Proveedor</span>
                <span style={{ color: 'var(--text)' }}>{(selectedPurchase.supplier as any)?.name || '—'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--muted)' }}>Estado</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${STATUS_LABELS[selectedPurchase.status].color}`}>
                  {STATUS_LABELS[selectedPurchase.status].label}
                </span>
              </div>
              {selectedPurchase.notes && (
                <div className="text-xs p-3 rounded-lg" style={{ background: 'var(--surface)', color: 'var(--muted)' }}>
                  {selectedPurchase.notes}
                </div>
              )}
              <div className="border-t pt-3" style={{ borderColor: 'var(--border)' }}>
                <div className="text-[10px] font-semibold mb-2" style={{ color: 'var(--muted)' }}>ITEMS</div>
                {selectedPurchase.items?.map((item, i) => (
                  <div key={i} className="flex justify-between text-xs py-1">
                    <span style={{ color: 'var(--text)' }}>{item.product_name} × {item.quantity}</span>
                    <span style={{ color: 'var(--muted)' }}>S/ {item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-bold pt-2 border-t mt-2" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
                  <span>Total</span>
                  <span>S/ {selectedPurchase.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
