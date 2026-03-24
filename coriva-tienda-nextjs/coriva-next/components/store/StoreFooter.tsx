import Link from 'next/link'
import type { Store } from '@/types/store'

interface StoreFooterProps {
  store: Store
}

export function StoreFooter({ store }: StoreFooterProps) {
  const waUrl = `https://wa.me/${store.whatsapp}?text=${encodeURIComponent(`Hola! Necesito ayuda con mi pedido en ${store.name}.`)}`

  return (
    <footer className="bg-gray-900 px-4 sm:px-6 lg:px-10 py-7 text-center">
      <div className="max-w-6xl mx-auto">
        <p className="text-sm text-white/25 mb-3.5">
          ¿Tienes dudas? ¿Quieres un pedido personalizado?
        </p>
        <Link
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-bold text-sm transition-all hover:-translate-y-px mb-4"
        >
          💬 Hablar por WhatsApp
        </Link>
        <div className="h-px bg-white/6 mb-4" />
        <p className="text-[11px] text-white/15">
          Tienda virtual creada con{' '}
          <a href="https://coriva.pe" className="text-white/30 hover:text-white/50 transition-colors">
            Coriva Core
          </a>
          {' '}· Sistema POS para negocios
        </p>
      </div>
    </footer>
  )
}
