'use client'

import { useState, useEffect, useCallback } from 'react'
import { Product, CartItem, Organization, User } from '@/types'
import { saleService, cashService } from '@/lib/services'
import { InvoiceModal } from '@/modules/billing'

interface POSProps {
  products: Product[]
  sales: any[]
  currentOrg: Organization | null
  currentUser: User | null
  onSaleComplete: () => Promise<void>
}

const CATEGORIES = [
  { key: '', label: 'Todos' },
  { key: 'bebidas', label: '🥤 Bebidas' },
  { key: 'snacks', label: '🍪 Snacks' },
  { key: 'lacteos', label: '🥛 Lácteos' },
  { key: 'limpieza', label: '🧹 Limpieza' },
  { key: 'abarrotes', label: '🛒 Abarrotes' },
]

export default function POSModule({ products, currentOrg, currentUser, onSaleComplete }: POSProps) {
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerName, setCustomerName] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'EFECTIVO' | 'TARJETA' | 'YAPE' | 'PLIN' | 'TRANSFERENCIA'>('EFECTIVO')
  const [receiptType, setReceiptType] = useState<'BOLETA' | 'FACTURA' | 'TICKET'>('BOLETA')
  const [amountPaid, setAmountPaid] = useState('')
  const [processing, setProcessing] = useState(false)
  const [showSuccess, setShowSuccess] = useState<{ number: string; total: number } | null>(null)
  const [pendingInvoice, setPendingInvoice] = useState<{ saleId: string; total: number } | null>(null)

  const currency = currentOrg?.settings?.currency || 'S/'

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase())
    const matchCat = !cat || (p.category || '').toLowerCase() === cat
    return matchSearch && matchCat
  })

  const addToCart = (product: Product) => {
    if (product.stock === 0) return
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) {
        if (existing.quantity >= product.stock) return prev
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const updateQty = (id: string, delta: number) => {
    setCart(prev => {
      const item = prev.find(i => i.id === id)
      if (!item) return prev
      const newQty = item.quantity + delta
      if (newQty <= 0) return prev.filter(i => i.id !== id)
      const product = products.find(p => p.id === id)
      if (product && newQty > product.stock) return prev
      return prev.map(i => i.id === id ? { ...i, quantity: newQty } : i)
    })
  }

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0)
  const igv = subtotal * 0.18 / 1.18
  const opGravadas = subtotal - igv
  const total = subtotal
  const change = amountPaid ? Math.max(0, Number(amountPaid) - total) : 0

  const printReceipt = (saleNumber: string) => {
    const lines = cart.map(i => `${i.quantity}x ${i.name.padEnd(20)} ${currency} ${(i.price * i.quantity).toFixed(2)}`).join('\n')
    const content = `================================\n${currentOrg?.name?.toUpperCase()}\n${currentOrg?.ruc ? `RUC: ${currentOrg.ruc}` : ''}\n================================\n${receiptType}: ${saleNumber}\nFecha: ${new Date().toLocaleString('es-PE')}\n${customerName ? `Cliente: ${customerName}` : ''}\n================================\n${lines}\n================================\nOP. GRAVADAS: ${currency} ${opGravadas.toFixed(2)}\nIGV (18%):    ${currency} ${igv.toFixed(2)}\nTOTAL:        ${currency} ${total.toFixed(2)}\nPago: ${paymentMethod}${change > 0 ? `\nVuelto: ${currency} ${change.toFixed(2)}` : ''}\n================================\n¡Gracias por su compra!\n${currentOrg?.settings?.receipt_footer || ''}\n================================`
    const w = window.open('', '_blank')
    if (w) {
      w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><style>*{margin:0;padding:0}body{font-family:'Courier New',monospace;font-size:12px;padding:10mm}pre{white-space:pre-wrap}@media print{@page{size:80mm auto;margin:0}}</style></head><body><pre>${content}</pre><script>window.onload=function(){window.print();setTimeout(function(){window.close()},1000)}</script></body></html>`)
      w.document.close()
    }
  }

  const processSale = async () => {
    if (cart.length === 0) return
    if (paymentMethod === 'EFECTIVO' && (!amountPaid || Number(amountPaid) < total)) {
      alert('El monto recibido debe ser mayor o igual al total')
      return
    }
    if (!currentOrg) return
    setProcessing(true)
    try {
      const sale = await saleService.create(currentOrg.id, {
        customerName: customerName || 'Cliente General',
        receiptType, paymentMethod,
        subtotal: opGravadas, tax: igv, total,
        amountPaid: amountPaid ? Number(amountPaid) : undefined,
        changeAmount: change > 0 ? change : undefined,
        items: cart,
        createdBy: currentUser?.username,
      })
      await cashService.registerSale(currentOrg.id, sale.id, total)
      await onSaleComplete()
      printReceipt(sale.sale_number)
      setShowSuccess({ number: sale.sale_number, total })
      // Guardar venta pendiente de comprobante electrónico
      if (receiptType !== 'TICKET') {
        setPendingInvoice({ saleId: sale.id, total })
      }
      setCart([]); setCustomerName(''); setAmountPaid('')
    } catch (e) {
      console.error(e); alert('❌ Error al procesar la venta')
    } finally {
      setProcessing(false)
    }
  }

  // Keyboard shortcuts
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'F2') { e.preventDefault(); processSale() }
    if (e.key === 'F1') { e.preventDefault(); setCart([]); setCustomerName(''); setAmountPaid('') }
    if (e.key === 'Escape') { setSearch('') }
  }, [cart, paymentMethod, amountPaid])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  return (
    <div className="animate-fade-up" style={{ height: 'calc(100vh - 100px)' }}>
      <div className="grid h-full" style={{ gridTemplateColumns: '1fr 340px', gap: '14px', padding: '20px' }}>

        {/* Left — productos */}
        <div className="flex flex-col gap-[10px] min-h-0">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 h-[42px] rounded-[9px] flex-shrink-0"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="var(--sub)" strokeWidth="1.5"><circle cx="6.5" cy="6.5" r="4.5"/><path d="M11 11l3 3"/></svg>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar producto por nombre o código…"
              className="flex-1 bg-transparent outline-none text-sm" style={{ color: 'var(--text)' }} />
          </div>

          {/* Categories */}
          <div className="flex gap-[6px] flex-wrap flex-shrink-0">
            {CATEGORIES.map(c => (
              <button key={c.key} onClick={() => setCat(c.key)}
                className="px-[13px] py-[5px] rounded-full text-[11px] font-semibold transition-all"
                style={{
                  background: cat === c.key ? 'rgba(99,102,241,.15)' : 'var(--surface)',
                  border: `1px solid ${cat === c.key ? 'rgba(99,102,241,.3)' : 'var(--border)'}`,
                  color: cat === c.key ? 'var(--accent)' : 'var(--muted)',
                }}>
                {c.label}
              </button>
            ))}
          </div>

          {/* Product grid */}
          <div className="grid overflow-y-auto touch-scroll flex-1 pb-1"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))', gap: '9px', alignContent: 'start' }}>
            {filtered.length === 0 ? (
              <div className="col-span-full text-center py-10 text-sm" style={{ color: 'var(--sub)' }}>Sin resultados</div>
            ) : filtered.map(p => {
              const stockStatus = p.stock === 0 ? 'sout' : p.stock <= (p.min_stock || 5) ? 'slow' : 'sok'
              const stockStyles = {
                sok: { bg: 'rgba(16,185,129,.1)', color: 'var(--green)', label: `${p.stock} uds` },
                slow: { bg: 'rgba(245,158,11,.1)', color: 'var(--amber)', label: `⚠️ ${p.stock} uds` },
                sout: { bg: 'rgba(239,68,68,.1)', color: 'var(--red)', label: '🚨 Sin stock' },
              }[stockStatus]
              return (
                <button key={p.id} onClick={() => addToCart(p)} disabled={p.stock === 0}
                  className="text-left rounded-xl p-[14px] transition-all relative disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <div className="text-[10px] font-mono" style={{ color: 'var(--sub)' }}>{p.code}</div>
                  <div className="text-[13px] font-bold leading-[1.3] mb-[3px] mt-[6px]" style={{ color: 'var(--text)' }}>{p.name}</div>
                  <div className="text-[17px] font-extrabold" style={{ color: 'var(--accent2)' }}>{currency} {p.price.toFixed(2)}</div>
                  <div className="mt-[6px]">
                    <span className="text-[10px] px-2 py-[2px] rounded-full font-semibold"
                      style={{ background: stockStyles.bg, color: stockStyles.color }}>{stockStyles.label}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right — cart */}
        <div className="flex flex-col rounded-[13px] overflow-hidden h-full"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>

          {/* Cart header */}
          <div className="px-[14px] py-3 flex items-center justify-between flex-shrink-0"
            style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>🛒 Venta actual</span>
            <span className="text-[10px] px-2 py-[2px] rounded-full font-bold"
              style={{ background: 'var(--accent)', color: '#fff' }}>{cart.length} items</span>
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto p-[10px] touch-scroll">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-2" style={{ color: 'var(--sub)' }}>
                <div className="text-4xl opacity-20">🛍️</div>
                <div className="text-xs font-bold">Carrito vacío</div>
                <div className="text-[11px]">Haz clic en un producto</div>
              </div>
            ) : cart.map(item => (
              <div key={item.id} className="flex items-center gap-2 p-[10px] rounded-[9px] mb-[5px]"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold truncate" style={{ color: 'var(--text)' }}>{item.name}</div>
                  <div className="text-[11px]" style={{ color: 'var(--accent2)' }}>
                    {currency} {item.price.toFixed(2)} × {item.quantity} = <strong>{currency} {(item.price * item.quantity).toFixed(2)}</strong>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => updateQty(item.id, -1)}
                    className="w-[22px] h-[22px] rounded-[6px] flex items-center justify-center text-xs font-bold"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)' }}>−</button>
                  <span className="text-xs font-bold w-[18px] text-center" style={{ color: 'var(--text)' }}>{item.quantity}</span>
                  <button onClick={() => updateQty(item.id, 1)}
                    className="w-[22px] h-[22px] rounded-[6px] flex items-center justify-center text-xs font-bold"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)' }}>+</button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart footer */}
          <div className="p-[12px] flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
            {/* Customer */}
            <div className="flex items-center gap-2 px-[11px] py-2 rounded-lg mb-[10px] cursor-pointer"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="var(--muted)" strokeWidth="1.5"><circle cx="8" cy="5" r="3"/><path d="M2 14c0-3.31 2.69-6 6-6s6 2.69 6 6"/></svg>
              <input value={customerName} onChange={e => setCustomerName(e.target.value)}
                placeholder="Agregar cliente"
                className="flex-1 bg-transparent outline-none text-xs" style={{ color: 'var(--text)' }} />
            </div>

            {/* Comprobante */}
            <div className="mb-[9px]">
              <div className="text-[10px] font-bold uppercase tracking-[.5px] mb-[5px]" style={{ color: 'var(--sub)' }}>Comprobante</div>
              <div className="flex gap-[5px]">
                {(['BOLETA', 'FACTURA', 'TICKET'] as const).map(t => (
                  <button key={t} onClick={() => setReceiptType(t)}
                    className="flex-1 py-[6px] rounded-lg text-[11px] font-semibold transition-all"
                    style={{
                      background: receiptType === t ? 'rgba(6,182,212,.08)' : 'var(--surface)',
                      border: `1px solid ${receiptType === t ? 'var(--accent2)' : 'var(--border)'}`,
                      color: receiptType === t ? 'var(--accent2)' : 'var(--muted)',
                    }}>{t}</button>
                ))}
              </div>
            </div>

            {/* Pago */}
            <div className="mb-[9px]">
              <div className="text-[10px] font-bold uppercase tracking-[.5px] mb-[5px]" style={{ color: 'var(--sub)' }}>Pago</div>
              <div className="flex gap-[5px]">
                {(['EFECTIVO', 'TARJETA', 'YAPE'] as const).map(m => (
                  <button key={m} onClick={() => setPaymentMethod(m)}
                    className="flex-1 py-[6px] rounded-lg text-[11px] font-semibold transition-all"
                    style={{
                      background: paymentMethod === m ? 'rgba(6,182,212,.08)' : 'var(--surface)',
                      border: `1px solid ${paymentMethod === m ? 'var(--accent2)' : 'var(--border)'}`,
                      color: paymentMethod === m ? 'var(--accent2)' : 'var(--muted)',
                    }}>
                    {m === 'EFECTIVO' ? '💵' : m === 'TARJETA' ? '💳' : '📱'} {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Totales */}
            <div className="space-y-[3px] mb-2">
              <div className="flex justify-between text-[11px]" style={{ color: 'var(--muted)' }}>
                <span>Subtotal</span><span>{currency} {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px]" style={{ color: 'var(--muted)' }}>
                <span>IGV (18%)</span><span>{currency} {igv.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center py-2 mb-2" style={{ borderTop: '1px solid var(--border)' }}>
              <span className="text-sm font-extrabold" style={{ color: 'var(--text)' }}>TOTAL</span>
              <span className="text-2xl font-extrabold" style={{ color: 'var(--green)' }}>{currency} {total.toFixed(2)}</span>
            </div>

            {/* Monto recibido */}
            {paymentMethod === 'EFECTIVO' && (
              <div className="mb-2">
                <input type="number" step="0.01" value={amountPaid} onChange={e => setAmountPaid(e.target.value)}
                  placeholder="Monto recibido"
                  className="w-full px-3 py-2 rounded-lg text-sm font-bold outline-none mb-1"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                {amountPaid && Number(amountPaid) >= total && (
                  <div className="flex justify-between text-xs font-bold px-2 py-1 rounded-lg"
                    style={{ background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.2)', color: 'var(--green)' }}>
                    <span>💰 VUELTO</span><span>{currency} {change.toFixed(2)}</span>
                  </div>
                )}
                {amountPaid && Number(amountPaid) < total && (
                  <div className="text-xs font-medium px-2 py-1 rounded-lg"
                    style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', color: 'var(--red)' }}>
                    ⚠️ Falta: {currency} {(total - Number(amountPaid)).toFixed(2)}
                  </div>
                )}
              </div>
            )}

            {/* Buttons */}
            <button onClick={processSale}
              disabled={cart.length === 0 || processing || (paymentMethod === 'EFECTIVO' && (!amountPaid || Number(amountPaid) < total))}
              className="w-full py-3 rounded-xl text-sm font-bold text-white mb-[5px] transition-all disabled:opacity-40"
              style={{ background: 'rgba(16,185,129,.9)' }}>
              {processing ? '⏳ Procesando...' : '✓ Procesar Venta — F2'}
            </button>
            <button onClick={() => { setCart([]); setCustomerName(''); setAmountPaid('') }}
              className="w-full py-2 rounded-xl text-xs font-medium transition-all"
              style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--red)' }}>
              ✕ Limpiar — F1
            </button>
          </div>
        </div>
      </div>

      {/* Success modal */}
      {showSuccess && !pendingInvoice && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl p-6 text-center" style={{ background: 'var(--card)', border: '1px solid var(--border2)' }}>
            <div className="text-5xl mb-3">🎉</div>
            <div className="text-2xl font-extrabold mb-1" style={{ color: 'var(--green)' }}>
              {currency} {showSuccess.total.toFixed(2)}
            </div>
            <div className="text-xs mb-5" style={{ color: 'var(--muted)' }}>
              {showSuccess.number} — Venta registrada exitosamente
            </div>
            <div className="flex gap-2 justify-center">
              <button onClick={() => setShowSuccess(null)}
                className="px-4 py-[9px] rounded-[9px] text-xs font-semibold transition-all"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
                Cerrar
              </button>
              <button onClick={() => setShowSuccess(null)}
                className="px-4 py-[9px] rounded-[9px] text-xs font-semibold text-white transition-all"
                style={{ background: 'var(--gradient)' }}>
                Nueva Venta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de comprobante electrónico */}
      {pendingInvoice && currentOrg && (
        <InvoiceModal
          saleId={pendingInvoice.saleId}
          orgId={currentOrg.id}
          total={pendingInvoice.total}
          currency={currency}
          onSuccess={() => {
            setPendingInvoice(null)
            setShowSuccess(null)
          }}
          onClose={() => {
            setPendingInvoice(null)
            setShowSuccess(null)
          }}
        />
      )}
    </div>
  )
}
