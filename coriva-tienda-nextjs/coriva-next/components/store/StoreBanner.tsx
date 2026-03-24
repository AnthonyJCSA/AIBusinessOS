import Link from 'next/link'
import type { Store } from '@/types/store'
import { buildWAUrl } from '@/lib/whatsapp'

interface StoreBannerProps {
  store: Store
}

export function StoreBanner({ store }: StoreBannerProps) {
  const waUrl = buildWAUrl(
    store.whatsapp,
    `Hola! Quiero hacer un pedido en ${store.name}.`
  )

  return (
    <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
      {/* Glow */}
      <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-radial-gradient pointer-events-none opacity-10"
           style={{ background: 'radial-gradient(circle, #25D366, transparent 70%)' }} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">

        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-white leading-tight mb-1.5">
            {store.banner_title}{' '}
            <em className="not-italic text-green-400">{store.banner_subtitle}</em>
          </h1>
          <p className="text-sm text-white/45">{store.banner_desc}</p>

          {/* Pills */}
          <div className="flex flex-wrap gap-2 mt-3.5">
            {['Entrega rápida', 'Pago contra entrega', 'Atención personalizada'].map(label => (
              <span
                key={label}
                className="flex items-center gap-1.5 bg-white/7 border border-white/10 rounded-full px-3 py-1 text-xs font-medium text-white/55"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                {label}
              </span>
            ))}
          </div>
        </div>

        <Link
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-bold text-base whitespace-nowrap transition-all duration-200 hover:-translate-y-px hover:shadow-xl hover:shadow-green-500/40"
        >
          💬 Hacer pedido ahora →
        </Link>
      </div>
    </div>
  )
}
