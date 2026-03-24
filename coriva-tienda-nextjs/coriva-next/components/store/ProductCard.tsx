'use client'

import Link from 'next/link'
import type { Product, Store } from '@/types/store'
import { useCart } from '@/hooks/useCart'
import { buildSingleProductMsg, buildWAUrl } from '@/lib/whatsapp'

const BADGE_STYLES: Record<string, string> = {
  new: 'bg-red-500 text-white',
  hot: 'bg-orange-500 text-white',
  promo: 'bg-purple-600 text-white',
}

const BADGE_LABELS: Record<string, string> = {
  new: '✨ Nuevo',
  hot: '🔥 Popular',
  promo: '💥 Promo',
}

interface ProductCardProps {
  product: Product
  store: Store
  onOpenModal: (product: Product) => void
}

export function ProductCard({ product, store, onOpenModal }: ProductCardProps) {
  const { cart, addItem } = useCart()
  const inCart = !!(cart[product.id]?.qty > 0)

  const waMsg = buildSingleProductMsg({
    storeName: store.name,
    currency: store.currency,
    product,
    qty: 1,
  })
  const waUrl = buildWAUrl(store.whatsapp, waMsg)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    addItem(product)
  }

  return (
    <article
      onClick={() => onOpenModal(product)}
      className="group bg-white border border-stone-200 rounded-2xl overflow-hidden flex flex-col cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.10),0_4px_12px_rgba(0,0,0,0.06)]"
    >
      {/* Image area */}
      <div className="aspect-square bg-stone-100 relative flex items-center justify-content-center overflow-hidden">
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-[60px] transition-transform duration-300 group-hover:scale-110 select-none">
            {product.emoji}
          </span>
        </div>

        {product.badge && (
          <div className={`absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide ${BADGE_STYLES[product.badge]}`}>
            {BADGE_LABELS[product.badge]}
          </div>
        )}

        {/* Quick add button */}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-xl font-light opacity-0 translate-y-1 scale-90 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 transition-all duration-200 hover:bg-green-500"
        >
          +
        </button>
      </div>

      {/* Info */}
      <div className="p-3.5 flex-1 flex flex-col">
        <p className="text-[10px] font-semibold uppercase tracking-[1px] text-stone-400 mb-1">
          {product.category?.name ?? ''}
        </p>
        <h3 className="text-[15px] font-semibold text-gray-900 leading-snug mb-2.5 flex-1">
          {product.name}
        </h3>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="font-serif text-[22px] text-gray-900 tracking-tight">
            {store.currency} {product.price.toFixed(2)}
          </span>
          {product.price_old && (
            <span className="text-[13px] text-stone-400 line-through">
              {store.currency} {product.price_old.toFixed(2)}
            </span>
          )}
        </div>

        {/* Add to cart */}
        <button
          onClick={handleAddToCart}
          className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-all duration-150 mb-1.5 border ${
            inCart
              ? 'bg-gray-900 text-white border-transparent'
              : 'bg-stone-100 text-gray-700 border-stone-200 hover:bg-stone-200 hover:border-stone-300 hover:text-gray-900'
          }`}
        >
          {inCart ? '✓ Agregado' : '🛒 Agregar al pedido'}
        </button>

        {/* Direct WA */}
        <Link
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="w-full py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-bold flex items-center justify-center gap-1.5 transition-colors hover:shadow-md hover:shadow-green-500/25"
        >
          💬 Pedir por WhatsApp
        </Link>
      </div>
    </article>
  )
}
