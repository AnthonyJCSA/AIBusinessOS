'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Product, Store } from '@/types/store'
import { useCart } from '@/hooks/useCart'
import { buildSingleProductMsg, buildCartMsg, buildWAUrl } from '@/lib/whatsapp'

interface ProductModalProps {
  product: Product | null
  store: Store
  onClose: () => void
}

export function ProductModal({ product, store, onClose }: ProductModalProps) {
  const [qty, setQty] = useState(1)
  const { cart, addItem, getSummary } = useCart()

  const isOpen = product !== null
  const inCart = product ? !!(cart[product.id]?.qty > 0) : false

  // Reset qty when product changes
  useEffect(() => {
    if (product) setQty(1)
  }, [product?.id])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleAddToCart = () => {
    if (!product) return
    addItem(product, qty)
  }

  const handlePedirWA = () => {
    if (!product) return
    addItem(product, qty)
    const msg = buildSingleProductMsg({
      storeName: store.name,
      currency: store.currency,
      product,
      qty,
    })
    window.open(buildWAUrl(store.whatsapp, msg), '_blank')
    onClose()
  }

  if (!product) return null

  const waMsg = buildSingleProductMsg({
    storeName: store.name,
    currency: store.currency,
    product,
    qty,
  })
  const waUrl = buildWAUrl(store.whatsapp, waMsg)

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[400] transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Modal */}
      <div
        className={`fixed inset-0 z-[401] flex items-center justify-center p-4 pointer-events-none`}
      >
        <div
          className={`bg-white rounded-3xl w-full max-w-[520px] overflow-hidden shadow-2xl pointer-events-auto transition-all duration-250 ease-[cubic-bezier(.16,1,.3,1)] ${
            isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'
          }`}
          onClick={e => e.stopPropagation()}
        >
          {/* Image */}
          <div className="relative aspect-video bg-stone-100 flex items-center justify-center">
            <span className="text-[80px] select-none">{product.emoji}</span>
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center text-base hover:bg-black/50 transition-colors border-0"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            <p className="text-[11px] font-bold uppercase tracking-[1px] text-stone-400 mb-1.5">
              {product.category?.name}
            </p>
            <h2 className="font-serif text-[26px] leading-tight mb-2.5 tracking-tight">
              {product.name}
            </h2>
            {product.description && (
              <p className="text-sm text-stone-500 leading-relaxed mb-4">
                {product.description}
              </p>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-2.5 mb-5">
              <span className="font-serif text-[32px] tracking-tight leading-none">
                {store.currency} {product.price.toFixed(2)}
              </span>
              {product.price_old && (
                <span className="text-base text-stone-400 line-through">
                  {store.currency} {product.price_old.toFixed(2)}
                </span>
              )}
            </div>

            {/* Qty selector */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-semibold text-gray-700">Cantidad:</span>
              <div className="flex items-center gap-2 bg-stone-100 border border-stone-200 rounded-xl px-2 py-1">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-7 h-7 rounded-lg text-lg font-light text-gray-600 flex items-center justify-center hover:bg-stone-200 transition-colors border-0 bg-transparent"
                >
                  −
                </button>
                <span className="text-base font-bold min-w-[20px] text-center">{qty}</span>
                <button
                  onClick={() => setQty(q => Math.min(20, q + 1))}
                  className="w-7 h-7 rounded-lg text-lg font-light text-gray-600 flex items-center justify-center hover:bg-stone-200 transition-colors border-0 bg-transparent"
                >
                  +
                </button>
              </div>
              <span className="text-sm text-stone-400">
                = {store.currency} {(product.price * qty).toFixed(2)}
              </span>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handlePedirWA}
                className="w-full py-3.5 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-bold text-[15px] flex items-center justify-center gap-2.5 transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-green-500/30"
              >
                💬 Pedir por WhatsApp
              </button>
              <button
                onClick={handleAddToCart}
                className={`w-full py-3 rounded-2xl text-[14px] font-semibold flex items-center justify-center gap-2 transition-all border-[1.5px] ${
                  inCart
                    ? 'bg-gray-900 text-white border-transparent'
                    : 'bg-stone-100 text-gray-700 border-stone-200 hover:bg-stone-200 hover:border-stone-300'
                }`}
              >
                {inCart ? '✓ Ya en el pedido' : '🛒 Agregar al pedido'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
