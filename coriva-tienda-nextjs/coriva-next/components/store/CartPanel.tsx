'use client'

import { useCart } from '@/hooks/useCart'
import { buildCartMsg, buildWAUrl } from '@/lib/whatsapp'
import type { Store } from '@/types/store'

interface CartPanelProps {
  store: Store
  isOpen: boolean
  onClose: () => void
}

export function CartPanel({ store, isOpen, onClose }: CartPanelProps) {
  const { getSummary, changeQty } = useCart()
  const { items, totalItems, totalPrice } = getSummary()

  const handleSendWA = () => {
    const msg = buildCartMsg({
      storeName: store.name,
      currency: store.currency,
      cart: items,
    })
    window.open(buildWAUrl(store.whatsapp, msg), '_blank')
  }

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[299] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Panel */}
      <aside
        className={`fixed top-0 right-0 w-full max-w-[380px] h-svh bg-white z-[300] border-l border-stone-200 flex flex-col shadow-2xl transition-transform duration-300 ease-[cubic-bezier(.16,1,.3,1)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-stone-100">
          <div>
            <h2 className="font-serif text-xl">Mi Pedido</h2>
            <p className="text-xs text-stone-400 mt-0.5">
              {totalItems} producto{totalItems !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 hover:bg-stone-200 hover:text-gray-700 transition-colors text-base"
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-3.5 py-3.5 flex flex-col gap-2">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2.5 text-stone-400 text-center py-10">
              <span className="text-4xl opacity-25">🛒</span>
              <p className="text-sm">Tu pedido está vacío.<br />Agrega productos para comenzar.</p>
            </div>
          ) : (
            items.map(item => (
              <div
                key={item.id}
                className="flex items-center gap-2.5 px-3 py-2.5 bg-stone-50 border border-stone-100 rounded-2xl"
              >
                <span className="text-2xl flex-shrink-0">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{item.name}</p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {store.currency} {item.price.toFixed(2)} × {item.qty}
                    {' = '}
                    <span className="font-semibold text-gray-700">
                      {store.currency} {(item.price * item.qty).toFixed(2)}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => changeQty(item.id, -1)}
                    className="w-6 h-6 rounded-md border border-stone-200 bg-white flex items-center justify-center text-sm text-gray-600 hover:bg-stone-100 transition-colors leading-none"
                  >
                    −
                  </button>
                  <span className="text-sm font-bold min-w-[16px] text-center">{item.qty}</span>
                  <button
                    onClick={() => changeQty(item.id, 1)}
                    className="w-6 h-6 rounded-md border border-stone-200 bg-white flex items-center justify-center text-sm text-gray-600 hover:bg-stone-100 transition-colors leading-none"
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-stone-100 flex flex-col gap-3">
          {items.length > 0 && (
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-sm text-stone-400">
                <span>Subtotal</span>
                <span>{store.currency} {totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-baseline mt-1.5">
                <span className="text-base font-bold">Total</span>
                <span className="font-serif text-[26px] text-gray-900 tracking-tight leading-none">
                  {store.currency} {totalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleSendWA}
            disabled={items.length === 0}
            className="w-full py-3.5 rounded-2xl bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-base flex items-center justify-center gap-2.5 transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-green-500/30"
          >
            💬 Enviar pedido por WhatsApp
          </button>

          <p className="text-[11px] text-stone-400 text-center leading-relaxed">
            Te contactaremos para confirmar entrega y pago
          </p>
        </div>
      </aside>
    </>
  )
}
