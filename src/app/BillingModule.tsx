'use client'

import { useState, useEffect, useCallback } from 'react'
import { invoiceService } from '@/lib/services/invoice.service'
import { useOrganization } from '@/shared/hooks/useOrganization'
import type { DBInvoice, DBInvoiceCredit } from '@/types/database.types'

const TYPE_STYLE: Record<string, { bg: string; color: string }> = {
  FACTURA:      { bg: 'rgba(99,102,241,.1)',  color: 'var(--accent)' },
  BOLETA:       { bg: 'rgba(6,182,212,.1)',   color: 'var(--accent2)' },
  NOTA_CREDITO: { bg: 'rgba(245,158,11,.1)',  color: 'var(--amber)' },
  NOTA_DEBITO:  { bg: 'rgba(239,68,68,.1)',   color: 'var(--red)' },
}
const SUNAT_STYLE: Record<string, { bg: string; color: string }> = {
  ACEPTADA:  { bg: 'rgba(16,185,129,.1)',  color: 'var(--green)' },
  RECHAZADA: { bg: 'rgba(239,68,68,.1)',   color: 'var(--red)' },
  PENDIENTE: { bg: 'rgba(245,158,11,.1)',  color: 'var(--amber)' },
}

type InvoiceType = DBInvoice['type']

interface FormState {
  type: InvoiceType
  series: string
  clientName: string
  clientDocType: string
  clientDoc: string
  clientAddress: string
  clientEmail: string
  description: string
  quantity: number
  unitPrice: number
  igvPct: number
  creditParts: number
}

const EMPTY_FORM: FormState = {
  type: 'FACTURA', series: 'F001',
  clientName: '', clientDocType: 'RUC', clientDoc: '',
  clientAddress: '', clientEmail: '',
  description: '', quantity: 1, unitPrice: 0,
  igvPct: 18, creditParts: 1,
}

export default function BillingModule({ currentOrg }: { currentOrg: any }) {
  const org = useOrganization() ?? currentOrg
  const orgId = org?.id ?? currentOrg?.id
  const currency = org?.settings?.currency || currentOrg?.settings?.currency || 'S/'
  const currentUserId = currentOrg?.id ?? org?.id ?? ''

  const [invoices, setInvoices]           = useState<DBInvoice[]>([])
  const [pendingCredits, setPendingCredits] = useState<(DBInvoiceCredit & { invoice_number: string; client_name: string })[]>([])
  const [loading, setLoading]             = useState(true)
  const [showNew, setShowNew]             = useState(false)
  const [selected, setSelected]           = useState<DBInvoice | null>(null)
  const [selectedCredits, setSelectedCredits] = useState<DBInvoiceCredit[]>([])
  const [form, setForm]                   = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving]               = useState(false)
  const [error, setError]                 = useState('')

  const load = useCallback(async () => {
    if (!orgId) return
    setLoading(true)
    try {
      const [invs, credits] = await Promise.all([
        invoiceService.getAll(orgId),
        invoiceService.getPendingCredits(orgId),
      ])
      setInvoices(invs)
      setPendingCredits(credits)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }, [orgId])

  useEffect(() => { load() }, [load])

  // Actualizar series según tipo
  useEffect(() => {
    setForm(f => ({
      ...f,
      series: f.type === 'FACTURA' ? 'F001' : f.type === 'BOLETA' ? 'B001' : 'NC01',
    }))
  }, [form.type])

  const subtotal   = form.quantity * form.unitPrice
  const igvAmount  = subtotal * (form.igvPct / 100)
  const total      = subtotal + igvAmount

  const handleCreate = async () => {
    if (!form.clientName.trim() || !form.description.trim() || total === 0) return
    setSaving(true); setError('')
    try {
      await invoiceService.create(orgId, {
        type:         form.type,
        series:       form.series,
        clientName:   form.clientName,
        clientDocType: form.clientDocType,
        clientDoc:    form.clientDoc,
        clientAddress: form.clientAddress,
        clientEmail:  form.clientEmail,
        subtotal,
        igv:          igvAmount,
        total,
        creditParts:  form.creditParts > 1 ? form.creditParts : undefined,
        createdBy:    currentUserId,
      })
      setShowNew(false)
      setForm(EMPTY_FORM)
      await load()
    } catch (e: any) { setError(e.message) }
    finally { setSaving(false) }
  }

  const handleSelectInvoice = async (inv: DBInvoice) => {
    setSelected(inv)
    try {
      const credits = await invoiceService.getCredits(inv.id)
      setSelectedCredits(credits)
    } catch { setSelectedCredits([]) }
  }

  const handleMarkPaid = async (creditId: string) => {
    try {
      await invoiceService.markCreditPaid(creditId, currentUserId)
      await load()
      if (selected) {
        const credits = await invoiceService.getCredits(selected.id)
        setSelectedCredits(credits)
      }
    } catch (e: any) { setError(e.message) }
  }

  const handleCancel = async (inv: DBInvoice) => {
    if (!confirm(`¿Anular ${inv.invoice_number}?`)) return
    try { await invoiceService.cancel(inv.id); await load() }
    catch (e: any) { setError(e.message) }
  }

  // Métricas
  const totalEmitido    = invoices.filter(i => i.status !== 'ANULADA').reduce((s, i) => s + i.total, 0)
  const aceptadasCount  = invoices.filter(i => i.sunat_status === 'ACEPTADA').length
  const pendingAmount   = pendingCredits.reduce((s, c) => s + c.amount, 0)

  return (
    <div className="p-5 animate-fade-up space-y-4">

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[10px]">
        {[
          { color: 'var(--blue)',   icon: '🧾', label: 'Comprobantes',      value: String(invoices.length) },
          { color: 'var(--green)',  icon: '✅', label: 'Aceptadas SUNAT',   value: String(aceptadasCount) },
          { color: 'var(--amber)',  icon: '⏳', label: 'Créditos Pendientes', value: String(pendingCredits.length) },
          { color: 'var(--red)',    icon: '💰', label: 'Por Cobrar',         value: `${currency} ${pendingAmount.toFixed(2)}` },
        ].map(m => (
          <div key={m.label} className="rounded-[13px] px-[18px] py-4 relative overflow-hidden"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="absolute right-[-10px] top-[-10px] w-[70px] h-[70px] rounded-full" style={{ background: m.color, opacity: 0.06 }} />
            <div className="absolute right-[14px] top-[14px] text-[22px] opacity-35">{m.icon}</div>
            <div className="text-[10px] font-bold uppercase tracking-[.6px]" style={{ color: 'var(--muted)' }}>{m.label}</div>
            <div className="text-[22px] font-extrabold leading-[1.1] my-[3px]" style={{ color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[14px]">

        {/* Lista comprobantes */}
        <div className="lg:col-span-2 rounded-[13px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>🧾 Comprobantes Electrónicos</span>
            <button onClick={() => { setShowNew(true); setError('') }}
              className="px-3 py-[7px] rounded-[9px] text-xs font-semibold text-white"
              style={{ background: 'var(--gradient)' }}>
              + Nuevo
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs" style={{ minWidth: '600px' }}>
              <thead>
                <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                  {['Número', 'Tipo', 'Cliente', 'Fecha', 'Total', 'SUNAT', ''].map(h => (
                    <th key={h} className="px-[14px] py-[9px] text-left font-bold uppercase tracking-[.6px]"
                      style={{ color: 'var(--sub)', fontSize: '10px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center" style={{ color: 'var(--muted)' }}>Cargando…</td></tr>
                ) : invoices.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center" style={{ color: 'var(--muted)' }}>
                    <div className="text-3xl mb-2">🧾</div>
                    <div>No hay comprobantes emitidos</div>
                  </td></tr>
                ) : invoices.map(inv => {
                  const ts = TYPE_STYLE[inv.type] ?? TYPE_STYLE.BOLETA
                  const ss = SUNAT_STYLE[inv.sunat_status] ?? SUNAT_STYLE.PENDIENTE
                  return (
                    <tr key={inv.id}
                      className="cursor-pointer transition-colors hover:bg-white/5"
                      style={{ borderBottom: '1px solid var(--border)', opacity: inv.status === 'ANULADA' ? 0.45 : 1 }}
                      onClick={() => handleSelectInvoice(inv)}>
                      <td className="px-[14px] py-[10px] font-mono font-bold" style={{ color: 'var(--accent2)' }}>
                        {inv.invoice_number}
                      </td>
                      <td className="px-[14px] py-[10px]">
                        <span className="px-2 py-[2px] rounded-full text-[10px] font-bold" style={{ background: ts.bg, color: ts.color }}>
                          {inv.type}
                        </span>
                      </td>
                      <td className="px-[14px] py-[10px]">
                        <div className="font-semibold" style={{ color: 'var(--text)' }}>{inv.client_name}</div>
                        {inv.client_doc && <div className="text-[10px]" style={{ color: 'var(--muted)' }}>{inv.client_doc}</div>}
                      </td>
                      <td className="px-[14px] py-[10px]" style={{ color: 'var(--muted)' }}>
                        {inv.created_at ? new Date(inv.created_at).toLocaleDateString('es-PE') : '—'}
                      </td>
                      <td className="px-[14px] py-[10px] font-bold" style={{ color: 'var(--green)' }}>
                        {currency} {inv.total.toFixed(2)}
                      </td>
                      <td className="px-[14px] py-[10px]">
                        <span className="px-2 py-[2px] rounded-full text-[10px] font-bold" style={{ background: ss.bg, color: ss.color }}>
                          {inv.sunat_status}
                        </span>
                      </td>
                      <td className="px-[14px] py-[10px]" onClick={e => e.stopPropagation()}>
                        {inv.status !== 'ANULADA' && (
                          <button onClick={() => handleCancel(inv)}
                            className="px-2 py-1 rounded text-[10px] font-semibold"
                            style={{ background: 'rgba(239,68,68,.1)', color: 'var(--red)', border: '1px solid rgba(239,68,68,.2)' }}>
                            Anular
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Créditos pendientes */}
        <div className="rounded-[13px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>⏳ Créditos por Cobrar</span>
          </div>
          <div className="p-3 flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: '400px' }}>
            {pendingCredits.length === 0 ? (
              <p className="text-xs text-center py-6" style={{ color: 'var(--sub)' }}>Sin créditos pendientes ✅</p>
            ) : pendingCredits.map(c => (
              <div key={c.id} className="rounded-[9px] p-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold" style={{ color: 'var(--text)' }}>{c.client_name}</span>
                  <span className="text-xs font-extrabold" style={{ color: 'var(--amber)' }}>{currency} {c.amount.toFixed(2)}</span>
                </div>
                <div className="text-[10px] mb-2" style={{ color: 'var(--muted)' }}>
                  {c.invoice_number} · Vence: {c.due_date}
                </div>
                <button onClick={() => handleMarkPaid(c.id)}
                  className="w-full py-[6px] rounded-[7px] text-[10px] font-bold"
                  style={{ background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.2)', color: 'var(--green)' }}>
                  ✓ Marcar pagado
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Modal nuevo comprobante ── */}
      {showNew && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl flex flex-col max-h-[90vh]" style={{ background: 'var(--card)', border: '1px solid var(--border2)' }}>
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
              <span className="font-extrabold" style={{ color: 'var(--text)' }}>🧾 Nuevo Comprobante</span>
              <button onClick={() => setShowNew(false)} className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: 'var(--surface)', color: 'var(--muted)' }}>✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Tipo */}
              <div className="flex gap-2">
                {(['FACTURA', 'BOLETA', 'NOTA_CREDITO'] as InvoiceType[]).map(t => (
                  <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                    className="flex-1 py-2 rounded-[9px] text-xs font-bold border transition-all"
                    style={{
                      background: form.type === t ? 'var(--accent)' : 'var(--surface)',
                      borderColor: form.type === t ? 'var(--accent)' : 'var(--border)',
                      color: form.type === t ? '#fff' : 'var(--muted)',
                    }}>{t}</button>
                ))}
              </div>

              {/* Series */}
              <div className="grid grid-cols-2 gap-3">
                <FI label="Serie">
                  <input className="fi-dark" value={form.series}
                    onChange={e => setForm(f => ({ ...f, series: e.target.value }))} />
                </FI>
                <FI label="Tipo Doc. Cliente">
                  <select className="fi-dark" value={form.clientDocType}
                    onChange={e => setForm(f => ({ ...f, clientDocType: e.target.value }))}>
                    <option>RUC</option><option>DNI</option><option>CE</option>
                  </select>
                </FI>
              </div>

              {/* Cliente */}
              <div className="grid grid-cols-2 gap-3">
                <FI label="Cliente / Razón Social *" full>
                  <input className="fi-dark" value={form.clientName}
                    onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))} />
                </FI>
                <FI label="RUC / DNI">
                  <input className="fi-dark" value={form.clientDoc}
                    onChange={e => setForm(f => ({ ...f, clientDoc: e.target.value }))} />
                </FI>
                <FI label="Email">
                  <input type="email" className="fi-dark" value={form.clientEmail}
                    onChange={e => setForm(f => ({ ...f, clientEmail: e.target.value }))} />
                </FI>
                <FI label="Dirección" full>
                  <input className="fi-dark" value={form.clientAddress}
                    onChange={e => setForm(f => ({ ...f, clientAddress: e.target.value }))} />
                </FI>
              </div>

              {/* Producto/Servicio */}
              <div className="grid grid-cols-2 gap-3">
                <FI label="Descripción *" full>
                  <input className="fi-dark" value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </FI>
                <FI label="Cantidad">
                  <input type="number" min="1" className="fi-dark" value={form.quantity}
                    onChange={e => setForm(f => ({ ...f, quantity: parseInt(e.target.value) || 1 }))} />
                </FI>
                <FI label="Precio Unitario">
                  <input type="number" step="0.01" min="0" className="fi-dark" value={form.unitPrice || ''}
                    onChange={e => setForm(f => ({ ...f, unitPrice: parseFloat(e.target.value) || 0 }))} />
                </FI>
                <FI label="IGV (%)">
                  <input type="number" className="fi-dark" value={form.igvPct}
                    onChange={e => setForm(f => ({ ...f, igvPct: parseFloat(e.target.value) || 18 }))} />
                </FI>
                <FI label="Cuotas de crédito">
                  <select className="fi-dark" value={form.creditParts}
                    onChange={e => setForm(f => ({ ...f, creditParts: parseInt(e.target.value) }))}>
                    <option value={1}>Contado</option>
                    <option value={2}>2 cuotas</option>
                    <option value={3}>3 cuotas</option>
                    <option value={6}>6 cuotas</option>
                  </select>
                </FI>
              </div>

              {/* Resumen */}
              <div className="rounded-[9px] p-3 space-y-1" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <Row label="Subtotal"    value={`${currency} ${subtotal.toFixed(2)}`} />
                <Row label={`IGV (${form.igvPct}%)`} value={`${currency} ${igvAmount.toFixed(2)}`} />
                <div className="flex justify-between text-sm font-bold pt-1 border-t" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--green)' }}>{currency} {total.toFixed(2)}</span>
                </div>
              </div>

              {/* Cuotas preview */}
              {form.creditParts > 1 && (
                <div className="rounded-[9px] p-3" style={{ background: 'rgba(245,158,11,.06)', border: '1px solid rgba(245,158,11,.2)' }}>
                  <div className="text-[10px] font-bold uppercase tracking-[.5px] mb-2" style={{ color: 'var(--amber)' }}>Cronograma</div>
                  {Array.from({ length: form.creditParts }, (_, i) => (
                    <div key={i} className="flex justify-between text-xs py-[3px]">
                      <span style={{ color: 'var(--muted)' }}>Cuota {i + 1} — {new Date(Date.now() + (i + 1) * 30 * 86400000).toLocaleDateString('es-PE')}</span>
                      <span style={{ color: 'var(--text)' }}>{currency} {(total / form.creditParts).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              {error && <div className="text-xs" style={{ color: 'var(--red)' }}>{error}</div>}
            </div>
            <div className="p-5 border-t flex gap-3 justify-end" style={{ borderColor: 'var(--border)' }}>
              <button onClick={() => setShowNew(false)} className="px-4 py-2 rounded-lg text-xs font-semibold"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
                Cancelar
              </button>
              <button onClick={handleCreate}
                disabled={saving || !form.clientName.trim() || !form.description.trim() || total === 0}
                className="px-5 py-2 rounded-lg text-xs font-bold text-white disabled:opacity-50"
                style={{ background: 'var(--gradient)' }}>
                {saving ? 'Emitiendo…' : 'Emitir Comprobante'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal detalle ── */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border2)' }}>
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
              <div>
                <div className="font-extrabold font-mono" style={{ color: 'var(--accent2)' }}>{selected.invoice_number}</div>
                <div className="text-[10px]" style={{ color: 'var(--muted)' }}>
                  {selected.created_at ? new Date(selected.created_at).toLocaleString('es-PE') : ''}
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
                style={{ background: 'var(--surface)', color: 'var(--muted)' }}>✕</button>
            </div>
            <div className="p-5 space-y-2 text-xs">
              <Row label="Cliente"  value={selected.client_name} />
              <Row label="Doc."     value={selected.client_doc ?? '—'} />
              <Row label="Subtotal" value={`${currency} ${selected.subtotal.toFixed(2)}`} />
              <Row label="IGV"      value={`${currency} ${selected.igv.toFixed(2)}`} />
              <div className="flex justify-between font-bold text-sm pt-1 border-t" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
                <span>Total</span>
                <span style={{ color: 'var(--green)' }}>{currency} {selected.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span style={{ color: 'var(--muted)' }}>SUNAT</span>
                <span className="px-2 py-[2px] rounded-full text-[10px] font-bold"
                  style={{ background: SUNAT_STYLE[selected.sunat_status]?.bg, color: SUNAT_STYLE[selected.sunat_status]?.color }}>
                  {selected.sunat_status}
                </span>
              </div>

              {selectedCredits.length > 0 && (
                <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                  <div className="text-[10px] font-bold uppercase tracking-[.5px] mb-2" style={{ color: 'var(--muted)' }}>Cuotas</div>
                  {selectedCredits.map((c, i) => (
                    <div key={c.id} className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                      <span style={{ color: 'var(--muted)' }}>Cuota {i + 1} · {c.due_date}</span>
                      <span style={{ color: 'var(--text)' }}>{currency} {c.amount.toFixed(2)}</span>
                      <span className="px-2 py-[2px] rounded-full text-[10px] font-bold"
                        style={{ background: c.paid ? 'rgba(16,185,129,.1)' : 'rgba(245,158,11,.1)', color: c.paid ? 'var(--green)' : 'var(--amber)' }}>
                        {c.paid ? `Pagado` : 'Pendiente'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span style={{ color: 'var(--muted)' }}>{label}</span>
      <span style={{ color: 'var(--text)' }}>{value}</span>
    </div>
  )
}
