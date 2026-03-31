'use client'

import { useState, useEffect } from 'react'
import { exportInventoryToCSV } from '../lib/export'

interface Product {
  id: string; code: string; name: string; category?: string
  price: number; cost?: number; stock: number; min_stock: number
  // DIGEMID
  digemid_code?: string; unit_price?: number; allows_fractionation?: boolean
  // Farmacia
  laboratory?: string; brand?: string; active_ingredient?: string
  expiry_date?: string; supplier?: string
  // General
  unit?: string; description?: string
}

interface InventoryProps {
  products: Product[]
  onUpdateProduct: (p: Product) => void
  onAddProduct: (p: Omit<Product, 'id'>) => void
  onDeleteProduct: (id: string) => void
  currentUser: any
}

const emptyProduct = { code: '', name: '', category: 'General', price: 0, cost: 0, stock: 0, min_stock: 5,
  digemid_code: '', unit_price: 0, allows_fractionation: false,
  laboratory: '', brand: '', active_ingredient: '', expiry_date: '', supplier: '', unit: 'unidad', description: '' }

export default function InventoryModule({ products: initial, onUpdateProduct, onAddProduct, onDeleteProduct, currentUser }: InventoryProps) {
  const [products, setProducts] = useState<Product[]>(initial)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [newP, setNewP] = useState(emptyProduct)
  const [loading, setLoading] = useState(false)

  useEffect(() => { setProducts(initial) }, [initial])

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase())
  )
  const lowStock = products.filter(p => p.stock <= (p.min_stock || 5))
  const totalValue = products.reduce((s, p) => s + (p.cost || p.price * 0.7) * p.stock, 0)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try { await onAddProduct(newP); setNewP(emptyProduct); setShowAdd(false) }
    catch { alert('Error al agregar') } finally { setLoading(false) }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editing) return; setLoading(true)
    try { await onUpdateProduct(editing); setEditing(null) }
    catch { alert('Error al actualizar') } finally { setLoading(false) }
  }

  const handleStock = async (id: string, delta: number) => {
    const p = products.find(x => x.id === id); if (!p) return
    const ns = Math.max(0, p.stock + delta)
    setLoading(true)
    try { await onUpdateProduct({ ...p, stock: ns }) }
    finally { setLoading(false) }
  }

  const handleDelete = async (p: Product) => {
    if (!confirm(`¿Eliminar "${p.name}"?`)) return
    setLoading(true)
    try { await onDeleteProduct(p.id) } finally { setLoading(false) }
  }

  const stockStatus = (p: Product) => {
    if (p.stock === 0) return { label: '🚨 Sin stock', bg: 'rgba(239,68,68,.1)', color: 'var(--red)' }
    if (p.stock <= (p.min_stock || 5)) return { label: '⚠️ Bajo', bg: 'rgba(245,158,11,.1)', color: 'var(--amber)' }
    return { label: '✅ Óptimo', bg: 'rgba(16,185,129,.1)', color: 'var(--green)' }
  }

  return (
    <div className="p-5 animate-fade-up">
      {/* AI Banner */}
      {lowStock.length > 0 && (
        <div className="flex items-center gap-[14px] px-[18px] py-[14px] rounded-xl mb-4"
          style={{ background: 'linear-gradient(135deg,rgba(245,158,11,.12),rgba(239,68,68,.08))', border: '1px solid rgba(245,158,11,.25)' }}>
          <div className="w-9 h-9 rounded-[9px] flex items-center justify-center text-base flex-shrink-0" style={{ background: 'var(--gradient)' }}>📦</div>
          <div className="flex-1 min-w-0">
            <strong className="text-sm font-bold block" style={{ color: 'var(--text)' }}>IA detectó {lowStock.length} productos en riesgo de quiebre de stock</strong>
            <span className="text-xs" style={{ color: 'var(--muted)' }}>{lowStock.map(p => p.name).slice(0, 3).join(' · ')}</span>
          </div>
          <button className="px-[14px] py-[7px] rounded-[9px] text-xs font-semibold flex-shrink-0 transition-all"
            style={{ background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.2)', color: 'var(--amber)' }}>
            Notificar proveedor
          </button>
        </div>
      )}

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[10px] mb-4">
        {[
          { color: 'var(--blue)', icon: '📦', label: 'Total Productos', value: String(products.length) },
          { color: 'var(--red)', icon: '🚨', label: 'Stock Crítico', value: String(lowStock.length) },
          { color: 'var(--green)', icon: '💰', label: 'Valor Inventario', value: `S/ ${totalValue.toFixed(0)}` },
          { color: 'var(--amber)', icon: '📊', label: 'Items en Stock', value: String(products.reduce((s, p) => s + p.stock, 0)) },
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
          <span className="text-sm font-bold flex-1" style={{ color: 'var(--text)' }}>Catálogo de Productos</span>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 px-3 h-[38px] rounded-[9px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="var(--sub)" strokeWidth="1.5"><circle cx="6.5" cy="6.5" r="4.5"/><path d="M11 11l3 3"/></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar…"
                className="bg-transparent outline-none text-sm w-[140px]" style={{ color: 'var(--text)' }} />
            </div>
            <button onClick={() => exportInventoryToCSV(products)}
              className="px-3 py-[7px] rounded-[9px] text-xs font-semibold transition-all"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
              📥 Exportar
            </button>
            <button onClick={() => setShowAdd(true)}
              className="px-3 py-[7px] rounded-[9px] text-xs font-semibold text-white transition-all"
              style={{ background: 'var(--gradient)' }}>
              + Agregar
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ minWidth: '600px' }}>
            <thead>
              <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                {['Código', 'Producto', 'Categoría', 'P. Venta', 'Costo', 'Stock', 'Mín.', 'Estado IA', 'Acciones'].map(h => (
                  <th key={h} className="px-[14px] py-[9px] text-left font-bold uppercase tracking-[.6px]"
                    style={{ color: 'var(--sub)', fontSize: '10px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const st = stockStatus(p)
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(30,45,69,.5)' }}>
                    <td className="px-[14px] py-[10px] font-mono text-[11px]" style={{ color: 'var(--muted)' }}>{p.code}</td>
                    <td className="px-[14px] py-[10px] font-bold" style={{ color: 'var(--text)' }}>{p.name}</td>
                    <td className="px-[14px] py-[10px]">
                      <span className="px-2 py-[2px] rounded-full text-[10px] font-semibold"
                        style={{ background: 'rgba(6,182,212,.1)', color: 'var(--accent2)' }}>{p.category || 'General'}</span>
                    </td>
                    <td className="px-[14px] py-[10px]" style={{ color: 'var(--text)' }}>S/ {p.price.toFixed(2)}</td>
                    <td className="px-[14px] py-[10px]" style={{ color: 'var(--muted)' }}>S/ {(p.cost || 0).toFixed(2)}</td>
                    <td className="px-[14px] py-[10px]">
                      <div className="flex items-center gap-[6px]">
                        <span className="font-extrabold text-sm" style={{ color: st.color }}>{p.stock}</span>
                        <button onClick={() => handleStock(p.id, -1)} disabled={loading || p.stock <= 0}
                          className="w-[22px] h-[22px] rounded-[6px] flex items-center justify-center text-xs font-bold transition-all disabled:opacity-40"
                          style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)', color: 'var(--red)' }}>−</button>
                        <button onClick={() => handleStock(p.id, 1)} disabled={loading}
                          className="w-[22px] h-[22px] rounded-[6px] flex items-center justify-center text-xs font-bold transition-all"
                          style={{ background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.2)', color: 'var(--green)' }}>+</button>
                      </div>
                    </td>
                    <td className="px-[14px] py-[10px]" style={{ color: 'var(--muted)' }}>{p.min_stock || 5}</td>
                    <td className="px-[14px] py-[10px]">
                      <span className="px-2 py-[2px] rounded-full text-[10px] font-semibold" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                    </td>
                    <td className="px-[14px] py-[10px]">
                      <div className="flex gap-2">
                        <button onClick={() => setEditing(p)}
                          className="px-2 py-[3px] rounded-[7px] text-[10px] font-semibold transition-all"
                          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}>✏</button>
                        <button onClick={() => handleDelete(p)}
                          className="px-2 py-[3px] rounded-[7px] text-[10px] font-semibold transition-all"
                          style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', color: 'var(--red)' }}>🗑</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Agregar */}
      {showAdd && (
        <Modal title="➕ Agregar Producto" onClose={() => setShowAdd(false)}>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FI label="Código *"><input className="fi-dark" value={newP.code} onChange={e => setNewP(p => ({ ...p, code: e.target.value }))} required /></FI>
              <FI label="Nombre *"><input className="fi-dark" value={newP.name} onChange={e => setNewP(p => ({ ...p, name: e.target.value }))} required /></FI>
              <FI label="Categoría"><input className="fi-dark" value={newP.category} onChange={e => setNewP(p => ({ ...p, category: e.target.value }))} /></FI>
              <FI label="Unidad"><input className="fi-dark" value={newP.unit} onChange={e => setNewP(p => ({ ...p, unit: e.target.value }))} placeholder="unidad, caja, frasco..." /></FI>
              <FI label="Precio Venta *"><input type="number" step="0.01" className="fi-dark" value={newP.price} onChange={e => setNewP(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))} required /></FI>
              <FI label="Costo"><input type="number" step="0.01" className="fi-dark" value={newP.cost} onChange={e => setNewP(p => ({ ...p, cost: parseFloat(e.target.value) || 0 }))} /></FI>
              <FI label="Stock Inicial"><input type="number" className="fi-dark" value={newP.stock} onChange={e => setNewP(p => ({ ...p, stock: parseInt(e.target.value) || 0 }))} /></FI>
              <FI label="Stock Mínimo"><input type="number" className="fi-dark" value={newP.min_stock} onChange={e => setNewP(p => ({ ...p, min_stock: parseInt(e.target.value) || 5 }))} /></FI>
              <FI label="Proveedor" full><input className="fi-dark" value={newP.supplier} onChange={e => setNewP(p => ({ ...p, supplier: e.target.value }))} /></FI>
              {/* Campos DIGEMID */}
              <FI label="Código DIGEMID"><input className="fi-dark" value={newP.digemid_code} onChange={e => setNewP(p => ({ ...p, digemid_code: e.target.value }))} placeholder="MED-001234" /></FI>
              <FI label="Precio Unitario"><input type="number" step="0.01" className="fi-dark" value={newP.unit_price} onChange={e => setNewP(p => ({ ...p, unit_price: parseFloat(e.target.value) || 0 }))} placeholder="Para fraccionamiento" /></FI>
              <FI label="Permite Fraccionamiento" full>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={newP.allows_fractionation} onChange={e => setNewP(p => ({ ...p, allows_fractionation: e.target.checked }))} className="w-4 h-4" />
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>Producto se puede vender por unidad</span>
                </label>
              </FI>
              {/* Campos farmacia */}
              <FI label="Laboratorio"><input className="fi-dark" value={newP.laboratory} onChange={e => setNewP(p => ({ ...p, laboratory: e.target.value }))} /></FI>
              <FI label="Marca"><input className="fi-dark" value={newP.brand} onChange={e => setNewP(p => ({ ...p, brand: e.target.value }))} /></FI>
              <FI label="Principio Activo" full><input className="fi-dark" value={newP.active_ingredient} onChange={e => setNewP(p => ({ ...p, active_ingredient: e.target.value }))} placeholder="Paracetamol 500mg..." /></FI>
              <FI label="Fecha de Vencimiento"><input type="date" className="fi-dark" value={newP.expiry_date} onChange={e => setNewP(p => ({ ...p, expiry_date: e.target.value }))} /></FI>
              <FI label="Descripción" full><input className="fi-dark" value={newP.description} onChange={e => setNewP(p => ({ ...p, description: e.target.value }))} /></FI>
            </div>
            <ModalActions onCancel={() => setShowAdd(false)} loading={loading} label="Guardar Producto" />
          </form>
        </Modal>
      )}

      {/* Modal Editar */}
      {editing && (
        <Modal title="✏️ Editar Producto" onClose={() => setEditing(null)}>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FI label="Código"><input className="fi-dark" value={editing.code} onChange={e => setEditing(p => p ? { ...p, code: e.target.value } : p)} /></FI>
              <FI label="Nombre"><input className="fi-dark" value={editing.name} onChange={e => setEditing(p => p ? { ...p, name: e.target.value } : p)} /></FI>
              <FI label="Precio"><input type="number" step="0.01" className="fi-dark" value={editing.price} onChange={e => setEditing(p => p ? { ...p, price: parseFloat(e.target.value) || 0 } : p)} /></FI>
              <FI label="Stock"><input type="number" className="fi-dark" value={editing.stock} onChange={e => setEditing(p => p ? { ...p, stock: parseInt(e.target.value) || 0 } : p)} /></FI>
              <FI label="Código DIGEMID"><input className="fi-dark" value={editing.digemid_code || ''} onChange={e => setEditing(p => p ? { ...p, digemid_code: e.target.value } : p)} /></FI>
              <FI label="Precio Unitario"><input type="number" step="0.01" className="fi-dark" value={editing.unit_price || 0} onChange={e => setEditing(p => p ? { ...p, unit_price: parseFloat(e.target.value) || 0 } : p)} /></FI>
              <FI label="Permite Fraccionamiento" full>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editing.allows_fractionation || false} onChange={e => setEditing(p => p ? { ...p, allows_fractionation: e.target.checked } : p)} className="w-4 h-4" />
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>Producto se puede vender por unidad</span>
                </label>
              </FI>
            </div>
            <ModalActions onCancel={() => setEditing(null)} loading={loading} label="Guardar Cambios" />
          </form>
        </Modal>
      )}
    </div>
  )
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto" style={{ background: 'var(--card)', border: '1px solid var(--border2)' }}>
        <div className="flex items-center justify-between mb-5">
          <span className="text-base font-extrabold" style={{ color: 'var(--text)' }}>{title}</span>
          <button onClick={onClose} className="w-[30px] h-[30px] rounded-[7px] flex items-center justify-center text-sm transition-all"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}>✕</button>
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

function ModalActions({ onCancel, loading, label }: { onCancel: () => void; loading: boolean; label: string }) {
  return (
    <div className="flex justify-end gap-3 pt-2">
      <button type="button" onClick={onCancel}
        className="px-5 py-[9px] rounded-[9px] text-xs font-semibold transition-all"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}>Cancelar</button>
      <button type="submit" disabled={loading}
        className="px-5 py-[9px] rounded-[9px] text-xs font-semibold text-white transition-all disabled:opacity-60"
        style={{ background: 'var(--gradient)' }}>{loading ? 'Guardando...' : label}</button>
    </div>
  )
}
