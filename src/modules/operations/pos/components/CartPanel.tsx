'use client'
import { useCartStore } from '@/state/cart.store'
import type { Organization } from '@/types'

interface CartPanelProps {
  org: Organization | null
  onProcess: () => void
  processing: boolean
}

const PAYMENT_METHODS = [
  { key: 'EFECTIVO', icon: '💵', label: 'Efectivo' },
  { key: 'TARJETA',  icon: '💳', label: 'Tarjeta' },
  { key: 'YAPE',     icon: '📱', label: 'Yape' },
  { key: 'PLIN',     icon: '📲', label: 'Plin' },
] as const

const RECEIPT_TYPES = ['BOLETA', 'FACTURA', 'TICKET'] as const

export function CartPanel({ org, onProcess, processing }: CartPanelProps) {
  const {
    items, customerName, paymentMethod, receiptType, amountPaid, discount,
    updateQty, removeItem, setItemDiscount,
    setCustomerName, setPaymentMethod, setReceiptType, setAmountPaid, setDiscount,
    clear, subtotal, totalDiscount, tax, total, change,
  } = useCartStore()

  const currency = org?.settings?.currency ?? 'S/'
  const sub = subtotal()
  const disc = totalDiscount()
  const igv = tax()
  const tot = total()
  const chg = change()

  const canProcess =
    items.length > 0 &&
    !processing &&
    (paymentMethod !== 'EFECTIVO' || (!!amountPaid && Number(amountPaid) >= tot))

  return (
    <div
      className="flex flex-col rounded-[13px] overflow-hidden h-full"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div
        className="px-[14px] py-3 flex items-center justify-between flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>🛒 Venta actual</span>
        <span
          className="text-[10px] px-2 py-[2px] rounded-full font-bold"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          {items.length} items
        </span>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-[10px] touch-scroll">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-2" style={{ color: 'var(--sub)' }}>
            <div className="text-4xl opacity-20">🛍️</div>
            <div className="text-xs font-bold">Carrito vacío</div>
            <div className="text-[11px]">Haz clic en un producto</div>
          </div>
        ) : (
          items.map(item => (
            <div
              key={item.id}
              className="p-[10px] rounded-[9px] mb-[5px]"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold truncate" style={{ color: 'var(--text)' }}>{item.name}</div>
                  <div className="text-[11px]" style={{ color: 'var(--accent2)' }}>
                    {currency} {item.price.toFixed(2)} × {item.quantity}
                    {(item.itemDiscount ?? 0) > 0 && (
                      <span className="ml-1 text-[10px]" style={{ color: 'var(--amber)' }}>
                        -{item.itemDiscount}%
                      </span>
                    )}
                    {' '}= <strong>{currency} {(item.price * item.quantity * (1 - (item.itemDiscount ?? 0) / 100)).toFixed(2)}</strong>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => updateQty(item.id, -1)}
                    className="w-[22px] h-[22px] rounded-[6px] flex items-center justify-center text-xs font-bold"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  >−</button>
                  <span className="text-xs font-bold w-[18px] text-center" style={{ color: 'var(--text)' }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQty(item.id, 1)}
                    className="w-[22px] h-[22px] rounded-[6px] flex items-center justify-center text-xs font-bold"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  >+</button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="w-[22px] h-[22px] rounded-[6px] flex items-center justify-center text-xs"
                    style={{ color: 'var(--red)' }}
                  >✕</button>
                </div>
              </div>
              {/* Descuento por ítem */}
              <div className="flex items-center gap-2 mt-[6px]">
                <span className="text-[10px]" style={{ color: 'var(--sub)' }}>Desc. ítem:</span>
                <input
                  type="number" min="0" max="100" step="1"
                  value={item.itemDiscount ?? 0}
                  onChange={e => setItemDiscount(item.id, Number(e.target.value))}
                  className="w-[48px] px-1 py-[2px] rounded-[5px] text-[11px] text-center outline-none"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)' }}
                />
                <span className="text-[10px]" style={{ color: 'var(--sub)' }}>%</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-[12px] flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
        {/* Cliente */}
        <div
          className="flex items-center gap-2 px-[11px] py-2 rounded-lg mb-[10px]"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="var(--muted)" strokeWidth="1.5">
            <circle cx="8" cy="5" r="3" /><path d="M2 14c0-3.31 2.69-6 6-6s6 2.69 6 6" />
          </svg>
          <input
            value={customerName}
            onChange={e => setCustomerName(e.target.value)}
            placeholder="Agregar cliente (opcional)"
            className="flex-1 bg-transparent outline-none text-xs"
            style={{ color: 'var(--text)' }}
          />
        </div>

        {/* Comprobante */}
        <div className="mb-[9px]">
          <div className="text-[10px] font-bold uppercase tracking-[.5px] mb-[5px]" style={{ color: 'var(--sub)' }}>
            Comprobante
          </div>
          <div className="flex gap-[5px]">
            {RECEIPT_TYPES.map(t => (
              <button
                key={t}
                onClick={() => setReceiptType(t)}
                className="flex-1 py-[6px] rounded-lg text-[11px] font-semibold transition-all"
                style={{
                  background: receiptType === t ? 'rgba(6,182,212,.08)' : 'var(--surface)',
                  border: `1px solid ${receiptType === t ? 'var(--accent2)' : 'var(--border)'}`,
                  color: receiptType === t ? 'var(--accent2)' : 'var(--muted)',
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Pago */}
        <div className="mb-[9px]">
          <div className="text-[10px] font-bold uppercase tracking-[.5px] mb-[5px]" style={{ color: 'var(--sub)' }}>
            Método de pago
          </div>
          <div className="flex gap-[5px] flex-wrap">
            {PAYMENT_METHODS.map(m => (
              <button
                key={m.key}
                onClick={() => setPaymentMethod(m.key)}
                className="flex-1 py-[6px] rounded-lg text-[11px] font-semibold transition-all"
                style={{
                  background: paymentMethod === m.key ? 'rgba(6,182,212,.08)' : 'var(--surface)',
                  border: `1px solid ${paymentMethod === m.key ? 'var(--accent2)' : 'var(--border)'}`,
                  color: paymentMethod === m.key ? 'var(--accent2)' : 'var(--muted)',
                  minWidth: '60px',
                }}
              >
                {m.icon} {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Descuento global */}
        <div className="flex items-center gap-2 mb-[9px]">
          <span className="text-[10px] font-bold uppercase tracking-[.5px]" style={{ color: 'var(--sub)' }}>
            Desc. global:
          </span>
          <input
            type="number" min="0" max="100" step="1"
            value={discount}
            onChange={e => setDiscount(Number(e.target.value))}
            className="w-[52px] px-2 py-[4px] rounded-[7px] text-xs text-center outline-none"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
          />
          <span className="text-[10px]" style={{ color: 'var(--sub)' }}>%</span>
        </div>

        {/* Totales */}
        <div className="space-y-[3px] mb-2">
          <div className="flex justify-between text-[11px]" style={{ color: 'var(--muted)' }}>
            <span>Subtotal</span><span>{currency} {sub.toFixed(2)}</span>
          </div>
          {disc > 0 && (
            <div className="flex justify-between text-[11px]" style={{ color: 'var(--amber)' }}>
              <span>Descuento</span><span>-{currency} {disc.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-[11px]" style={{ color: 'var(--muted)' }}>
            <span>IGV (18%)</span><span>{currency} {igv.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex justify-between items-center py-2 mb-2" style={{ borderTop: '1px solid var(--border)' }}>
          <span className="text-sm font-extrabold" style={{ color: 'var(--text)' }}>TOTAL</span>
          <span className="text-2xl font-extrabold" style={{ color: 'var(--green)' }}>
            {currency} {tot.toFixed(2)}
          </span>
        </div>

        {/* Monto recibido */}
        {paymentMethod === 'EFECTIVO' && (
          <div className="mb-2">
            <input
              type="number" step="0.01"
              value={amountPaid}
              onChange={e => setAmountPaid(e.target.value)}
              placeholder="Monto recibido"
              className="w-full px-3 py-2 rounded-lg text-sm font-bold outline-none mb-1"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
            {amountPaid && Number(amountPaid) >= tot && (
              <div
                className="flex justify-between text-xs font-bold px-2 py-1 rounded-lg"
                style={{ background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.2)', color: 'var(--green)' }}
              >
                <span>💰 VUELTO</span><span>{currency} {chg.toFixed(2)}</span>
              </div>
            )}
            {amountPaid && Number(amountPaid) < tot && (
              <div
                className="text-xs font-medium px-2 py-1 rounded-lg"
                style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', color: 'var(--red)' }}
              >
                ⚠️ Falta: {currency} {(tot - Number(amountPaid)).toFixed(2)}
              </div>
            )}
          </div>
        )}

        {/* Botones */}
        <button
          onClick={onProcess}
          disabled={!canProcess}
          className="w-full py-3 rounded-xl text-sm font-bold text-white mb-[5px] transition-all disabled:opacity-40"
          style={{ background: 'rgba(16,185,129,.9)' }}
        >
          {processing ? '⏳ Procesando...' : '✓ Procesar Venta — F2'}
        </button>
        <button
          onClick={clear}
          className="w-full py-2 rounded-xl text-xs font-medium transition-all"
          style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--red)' }}
        >
          ✕ Limpiar — F1
        </button>
      </div>
    </div>
  )
}
