'use client'

import Link from 'next/link'
import type { StoreCategory, Store } from '@/types/store'

interface StoreSidebarProps {
  store: Store
  categories: StoreCategory[]
  activeCategory: string
  counts: Record<string, number>
  totalCount: number
  onCategoryChange: (cat: string) => void
}

export function StoreSidebar({
  store,
  categories,
  activeCategory,
  counts,
  totalCount,
  onCategoryChange,
}: StoreSidebarProps) {
  const allCats = [
    { name: 'Todos', emoji: '🏪', count: totalCount },
    ...categories.map(c => ({ name: c.name, emoji: c.emoji, count: counts[c.name] ?? 0 })),
  ]

  const waConsultaUrl = `https://wa.me/${store.whatsapp}?text=${encodeURIComponent(`Hola! Tengo una consulta sobre ${store.name}.`)}`

  return (
    <aside className="sticky top-20 flex flex-col gap-4">

      {/* Categories */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
        <div className="px-4 pt-3.5 pb-2.5 text-[10px] font-bold uppercase tracking-[1.2px] text-stone-400 border-b border-stone-100">
          Categorías
        </div>
        <nav className="p-2 flex flex-col gap-0.5">
          {allCats.map(cat => {
            const isActive = activeCategory === cat.name
            return (
              <button
                key={cat.name}
                onClick={() => onCategoryChange(cat.name)}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 w-full text-left border ${
                  isActive
                    ? 'bg-gray-900 text-white border-transparent'
                    : 'text-gray-600 border-transparent hover:bg-stone-50 hover:border-stone-200'
                }`}
              >
                <span className="text-base w-5 text-center flex-shrink-0">{cat.emoji}</span>
                <span className="flex-1">{cat.name}</span>
                <span className={`text-[10px] font-bold px-1.5 py-px rounded-full ${
                  isActive
                    ? 'bg-white/15 text-white/70'
                    : 'bg-black/7 text-stone-400'
                }`}>
                  {cat.count}
                </span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Store info */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
        <div className="px-4 pt-3.5 pb-2.5 text-[10px] font-bold uppercase tracking-[1.2px] text-stone-400 border-b border-stone-100">
          Información
        </div>
        <div className="p-4 flex flex-col gap-3">
          <div className="flex items-start gap-2.5">
            <span className="text-sm mt-px flex-shrink-0">📍</span>
            <p className="text-xs text-stone-500 leading-relaxed">
              <strong className="text-stone-800 font-semibold">Delivery disponible</strong><br />
              {store.delivery_info}
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="text-sm mt-px flex-shrink-0">💳</span>
            <p className="text-xs text-stone-500 leading-relaxed">
              <strong className="text-stone-800 font-semibold">Formas de pago</strong><br />
              {store.payment_methods}
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="text-sm mt-px flex-shrink-0">🕐</span>
            <p className="text-xs text-stone-500 leading-relaxed">
              <strong className="text-stone-800 font-semibold">Horario</strong><br />
              {store.hours}
            </p>
          </div>
        </div>
        <div className="px-3 pb-3">
          <Link
            href={waConsultaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-500 hover:bg-green-600 rounded-xl text-sm font-bold text-white transition-colors"
          >
            💬 Consultar por WhatsApp
          </Link>
        </div>
      </div>
    </aside>
  )
}
