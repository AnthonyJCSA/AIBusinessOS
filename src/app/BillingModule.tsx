'use client'

import { useState } from 'react'

interface Invoice {
  id: string
  number: string
  type: 'FACTURA' | 'BOLETA' | 'NOTA_CREDITO'
  client: string
  ruc: string
  date: string
  total: number
  status: 'EMITIDA' | 'ANULADA' | 'PENDIENTE'
  sunat_status: 'ACEPTADA' | 'RECHAZADA' | 'PENDIENTE'
  credits: Credit[]
}

interface Credit {
  id: string
  amount: number
  due_date: string
  paid: boolean
  paid_date?: string
}

const mockInvoices: Invoice[] = [
  {
    id: '1', number: 'F001-00001', type: 'FACTURA', client: 'Empresa ABC SAC',
    ruc: '20123456789', date: '2025-01-15', total: 1180.00, status: 'EMITIDA', sunat_status: 'ACEPTADA',
    credits: [
      { id: 'c1', amount: 393.33, due_date: '2025-02-15', paid: true, paid_date: '2025-02-10' },
      { id: 'c2', amount: 393.33, due_date: '2025-03-15', paid: false },
      { id: 'c3', amount: 393.34, due_date: '2025-04-15', paid: false },
    ],
  },
  {
    id: '2', number: 'B001-00045', type: 'BOLETA', client: 'Juan Pérez',
    ruc: '10456789012', date: '2025-01-20', total: 250.00, status: 'EMITIDA', sunat_status: 'ACEPTADA',
    credits: [],
  },
]

const typeStyles: Record<string, { bg: string; color: string }> = {
  FACTURA:      { bg: 'rgba(99,102,241,.1)',  color: 'var(--accent)' },
  BOLETA:       { bg: 'rgba(6,182,212,.1)',   color: 'var(--accent2)' },
  NOTA_CREDITO: { bg: 'rgba(245,158,11,.1)',  color: 'var(--amber)' },
}
const sunatStyles: Record<string, { bg: string; color: string }> = {
  ACEPTADA:  { bg: 'rgba(16,185,129,.1)',  color: 'var(--green)' },
  RECHAZADA: { bg: 'rgba(239,68,68,.1)',   color: 'var(--red)' },
  PENDIENTE: { bg: 'rgba(245,158,11,.1)',  color: 'var(--amber)' },
}

interface InvoiceForm {
  type: 'FACTURA' | 'BOLETA' | 'NOTA_CREDITO'
  client: string; ruc: string; address: string; email: string
  description: string; quantity: number; unit_price: number
  igv: number; credit_parts: number
}

const emptyInvoice: InvoiceForm = {
  type: 'FACTURA',
  client: '', ruc: '', address: '', email: '',
  description: '', quantity: 1, unit_price: 0,
  igv: 18, credit_parts: 1,
}

export default function BillingModule({ currentOrg }: { currentOrg: any }) {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices)
  const [showNew, setShowNew] = useState(false)
  const [selected, setSelected] = useState<Invoice | null>(null)
  const [form, setForm] = useState<InvoiceForm>(emptyInvoice)
  const currency = currentOrg?.settings?.currency || 'S/'

  const subtotal = form.quantity * form.unit_price
  const igvAmount = subtotal * (form.igv / 100)
  const total = subtotal + igvAmount

  const creditInstallments = form.credit_parts > 1
    ? Array.from({ length: form.credit_parts }, (_, i) => ({
        part: i + 1,
        amount: (total / form.credit_parts).toFixed(2),
      }))
    : []

  const pendingCredits = invoices.flatMap(inv =>
    inv.credits.filter(c => !c.paid).map(c => ({ ...c, invoice: inv.number, client: inv.client }))
  )

  const markPaid = (invoiceId: string, creditId: string) => {
    setInvoices(prev => prev.map(inv =>
      inv.id === invoiceId
        ? { ...inv, credits: inv.credits.map(c => c.id === creditId ? { ...c, paid: true, paid_date: new Date().toISOString().split('T')[0] } : c) }
        : inv
    ))
  }

  return (
    <div className="p-5 animate-fade-up">

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[10px] mb-4">
        {[
          { color: 'var(--blue)',  icon: '🧾', label: 'Comprobantes',     value: String(invoices.length) },
          { color: 'var(--green)', icon: '✅', label: 'Aceptadas SUNAT',  value: String(invoices.filter(i => i.sunat_status === 'ACEPTADA').length) },
          { color: 'var(--amber)', icon: '⏳', label: 'Créditos Pendientes', value: String(pendingCredits.length) },
          { color: 'var(--red)',   icon: '💰', label: 'Por Cobrar',
            value: `${currency} ${pendingCredits.reduce((s, c) => s + c.amount, 0).toFixed(2)}` },
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
            <button onClick={() => setShowNew(true)}
              className="px-3 py-[7px] rounded-[9px] text-xs font-semibold text-white transition-all"
              style={{ background: 'var(--gradient)' }}>
              + Nuevo Comprobante
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs" style={{ minWidth: '600px' }}>
              <thead>
                <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                  {['Número', 'Tipo', 'Cliente / RUC', 'Fecha', 'Total', 'SUNAT', 'Crédito', ''].map(h => (
                    <th key={h} className="px-[14px] py-[9px] text-left font-bold uppercase tracking-[.6px]"
                      style={{ color: 'var(--sub)', fontSize: '10px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => {
                  const ts = typeStyles[inv.type]
                  const ss = sunatStyles[inv.sunat_status]
                  const pendingCount = inv.credits.filter(c => !c.paid).length
                  return (
                    <tr key={inv.id} style={{ borderBottom: '1px solid rgba(30,45,69,.5)' }}>
                      <td className="px-[14px] py-[10px] font-mono text-[11px]" style={{ color: 'var(--accent2)' }}>{inv.number}</td>
                      <td className="px-[14px] py-[10px]">
                        <span className="px-2 py-[2px] rounded-full text-[10px] font-bold" style={{ background: ts.bg, color: ts.color }}>{inv.type}</span>
                      </td>
                      <td className="px-[14px] py-[10px]">
                        <div className="font-semibold" style={{ color: 'var(--text)' }}>{inv.client}</div>
                        <div className="text-[10px]" style={{ color: 'var(--muted)' }}>{inv.ruc}</div>
                      </td>
                      <td className="px-[14px] py-[10px]" style={{ color: 'var(--muted)' }}>{inv.date}</td>
                      <td className="px-[14px] py-[10px] font-bold" style={{ color: 'var(--green)' }}>{currency} {inv.total.toFixed(2)}</td>
                      <td className="px-[14px] py-[10px]">
                        <span className="px-2 py-[2px] rounded-full text-[10px] font-bold" style={{ background: ss.bg, color: ss.color }}>{inv.sunat_status}</span>
                      </td>
                      <td className="px-[14px] py-[10px]">
                        {inv.credits.length > 0
                          ? <span className="px-2 py-[2px] rounded-full text-[10px] font-bold"
                              style={{ background: pendingCount > 0 ? 'rgba(245,158,11,.1)' : 'rgba(16,185,129,.1)', color: pendingCount > 0 ? 'var(--amber)' : 'var(--green)' }}>
                              {pendingCount > 0 ? `${pendingCount} cuota(s) pendiente` : 'Pagado'}
                            </span>
                          : <span style={{ color: 'var(--sub)' }}>—</span>
                        }
                      </td>
                      <td className="px-[14px] py-[10px]">
                        <button onClick={() => setSelected(inv)}
                          className="px-2 py-[3px] rounded-[7px] text-[10px] font-semibold transition-all"
                          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
                          Ver
                        </button>
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
          <div className="p-3 flex flex-col gap-2">
            {pendingCredits.length === 0
              ? <p className="text-xs text-center py-6" style={{ color: 'var(--sub)' }}>Sin créditos pendientes</p>
              : pendingCredits.map(c => (
                <div key={c.id} className="rounded-[9px] p-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold" style={{ color: 'var(--text)' }}>{c.client}</span>
                    <span className="text-xs font-extrabold" style={{ color: 'var(--amber)' }}>{currency} {c.amount.toFixed(2)}</span>
                  </div>
                  <div className="text-[10px] mb-2" style={{ color: 'var(--muted)' }}>
                    {c.invoice} · Vence: {c.due_date}
                  </div>
                  <button
                    onClick={() => {
                      const inv = invoices.find(i => i.credits.some(cr => cr.id === c.id))
                      if (inv) markPaid(inv.id, c.id)
                    }}
                    className="w-full py-[6px] rounded-[7px] text-[10px] font-bold transition-all"
                    style={{ background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.2)', color: 'var(--green)' }}>
                    ✓ Marcar como pagado
                  </button>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {/* Modal nuevo comprobante */}
      {showNew && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto" style={{ background: 'var(--card)', border: '1px solid var(--border2)' }}>
            <div className="flex items-center justify-between mb-5">
              <span className="text-base font-extrabold" style={{ color: 'var(--text)' }}>🧾 Nuevo Comprobante</span>
              <button onClick={() => setShowNew(false)} className="w-[30px] h-[30px] rounded-[7px] flex items-center justify-center"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}>✕</button>
            </div>
            <div className="flex flex-col gap-3">
              {/* Tipo */}
              <div className="flex gap-2">
                {(['FACTURA', 'BOLETA', 'NOTA_CREDITO'] as const).map(t => (
                  <button key={t} onClick={() => setForm(p => ({ ...p, type: t }))}
                    className="flex-1 py-2 rounded-[9px] text-xs font-bold transition-all border"
                    style={{
                      background: form.type === t ? 'var(--accent)' : 'var(--surface)',
                      borderColor: form.type === t ? 'var(--accent)' : 'var(--border)',
                      color: form.type === t ? '#fff' : 'var(--muted)',
                    }}>{t}</button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FI label="Cliente / Razón Social">
                  <input className="fi-dark" value={form.client} onChange={e => setForm(p => ({ ...p, client: e.target.value }))} />
                </FI>
                <FI label="RUC / DNI">
                  <input className="fi-dark" value={form.ruc} onChange={e => setForm(p => ({ ...p, ruc: e.target.value }))} />
                </FI>
                <FI label="Dirección" full>
                  <input className="fi-dark" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
                </FI>
                <FI label="Descripción" full>
                  <input className="fi-dark" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                </FI>
                <FI label="Cantidad">
                  <input type="number" className="fi-dark" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: parseInt(e.target.value) || 1 }))} />
                </FI>
                <FI label="Precio Unitario">
                  <input type="number" step="0.01" className="fi-dark" value={form.unit_price} onChange={e => setForm(p => ({ ...p, unit_price: parseFloat(e.target.value) || 0 }))} />
                </FI>
                <FI label="IGV (%)">
                  <input type="number" className="fi-dark" value={form.igv} onChange={e => setForm(p => ({ ...p, igv: parseFloat(e.target.value) || 18 }))} />
                </FI>
                <FI label="Cuotas de crédito">
                  <select className="fi-dark" value={form.credit_parts} onChange={e => setForm(p => ({ ...p, credit_parts: parseInt(e.target.value) }))}>
                    <option value={1}>Pago al contado</option>
                    <option value={2}>2 cuotas</option>
                    <option value={3}>3 cuotas</option>
                    <option value={4}>4 cuotas</option>
                    <option value={6}>6 cuotas</option>
                  </select>
                </FI>
              </div>

              {/* Resumen */}
              <div className="rounded-[9px] p-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="flex justify-between text-xs mb-1"><span style={{ color: 'var(--muted)' }}>Subtotal</span><span style={{ color: 'var(--text)' }}>{currency} {subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-xs mb-1"><span style={{ color: 'var(--muted)' }}>IGV ({form.igv}%)</span><span style={{ color: 'var(--text)' }}>{currency} {igvAmount.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm font-bold"><span style={{ color: 'var(--text)' }}>Total</span><span style={{ color: 'var(--green)' }}>{currency} {total.toFixed(2)}</span></div>
              </div>

              {/* Cuotas preview */}
              {creditInstallments.length > 0 && (
                <div className="rounded-[9px] p-3" style={{ background: 'rgba(245,158,11,.06)', border: '1px solid rgba(245,158,11,.2)' }}>
                  <div className="text-[10px] font-bold uppercase tracking-[.5px] mb-2" style={{ color: 'var(--amber)' }}>Cronograma de pagos</div>
                  {creditInstallments.map(c => (
                    <div key={c.part} className="flex justify-between text-xs py-[3px]">
                      <span style={{ color: 'var(--muted)' }}>Cuota {c.part}</span>
                      <span style={{ color: 'var(--text)' }}>{currency} {c.amount}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-1">
                <button onClick={() => setShowNew(false)}
                  className="px-5 py-[9px] rounded-[9px] text-xs font-semibold"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}>Cancelar</button>
                <button onClick={() => setShowNew(false)}
                  className="px-5 py-[9px] rounded-[9px] text-xs font-semibold text-white"
                  style={{ background: 'var(--gradient)' }}>
                  Emitir y enviar a SUNAT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal detalle */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border2)' }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-base font-extrabold" style={{ color: 'var(--text)' }}>{selected.number}</span>
              <button onClick={() => setSelected(null)} className="w-[30px] h-[30px] rounded-[7px] flex items-center justify-center"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}>✕</button>
            </div>
            <div className="flex flex-col gap-2 text-xs mb-4">
              <Row label="Cliente" value={selected.client} />
              <Row label="RUC" value={selected.ruc} />
              <Row label="Fecha" value={selected.date} />
              <Row label="Total" value={`${currency} ${selected.total.toFixed(2)}`} />
              <Row label="Estado SUNAT" value={selected.sunat_status} />
            </div>
            {selected.credits.length > 0 && (
              <>
                <div className="text-[10px] font-bold uppercase tracking-[.5px] mb-2" style={{ color: 'var(--muted)' }}>Cuotas</div>
                {selected.credits.map((c, i) => (
                  <div key={c.id} className="flex items-center justify-between py-2 text-xs" style={{ borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--muted)' }}>Cuota {i + 1} · {c.due_date}</span>
                    <span style={{ color: 'var(--text)' }}>{currency} {c.amount.toFixed(2)}</span>
                    <span className="px-2 py-[2px] rounded-full text-[10px] font-bold"
                      style={{ background: c.paid ? 'rgba(16,185,129,.1)' : 'rgba(245,158,11,.1)', color: c.paid ? 'var(--green)' : 'var(--amber)' }}>
                      {c.paid ? `Pagado ${c.paid_date}` : 'Pendiente'}
                    </span>
                  </div>
                ))}
              </>
            )}
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
