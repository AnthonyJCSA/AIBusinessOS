'use client'

import Link from 'next/link'
import { useCart } from '@/hooks/useCart'
import type { Store } from '@/types/store'
import { buildWAUrl } from '@/lib/whatsapp'

interface StoreHeaderProps {
  store: Store
  onCartOpen: () => void
}

export function StoreHeader({ store, onCartOpen }: StoreHeaderProps) {
  const { getSummary } = useCart()
  const { totalItems } = getSummary()

  const waUrl = buildWAUrl(
    store.whatsapp,
    `Hola! Me interesa hacer un pedido en ${store.name}.`
  )

  return (
    <header className="sticky top-0 z-50 bg-gray-900 border-b border-white/8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center gap-4">

        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
            {store.logo_emoji}
          </div>
          <div>
            <div className="font-serif text-[17px] text-white leading-tight">
              {store.name}
            </div>
            <div className="text-[11px] text-white/40 mt-px">
              {store.tagline}
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2.5">

          {/* Cart button */}
          <button
            onClick={onCartOpen}
            className="relative flex items-center gap-2 px-4 py-2 rounded-xl bg-white/8 border border-white/12 text-white/80 text-sm font-medium hover:bg-white/14 hover:text-white transition-all duration-150"
          >
            <span>🛒</span>
            <span className="hidden sm:inline">Pedido</span>
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] rounded-full bg-green-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-gray-900">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </button>

          {/* WhatsApp CTA */}
          <Link
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-bold transition-all duration-150 hover:-translate-y-px hover:shadow-lg hover:shadow-green-500/30 whitespace-nowrap"
          >
            <span>💬</span>
            <span>Hacer pedido</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
