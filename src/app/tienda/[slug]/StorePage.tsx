'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useCart } from '@/hooks/useCart'

// ─── Types ───────────────────────────────────────────────────
interface Org {
  id: string
  name: string
  slug: string
  phone?: string
  settings?: { currency?: string }
}

interface Product {
  id: string
  name: string
  price: number
  stock: number
  category?: string
  icon?: string
  description?: string
}

interface StorePageProps {
  org: Org
  products: Product[]
}

// ─── Helpers ─────────────────────────────────────────────────
function waUrl(phone: string, msg: string) {
  const num = phone.replace(/\D/g, '')
  return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`
}

// ─── Header ──────────────────────────────────────────────────
function StoreHeader({ org, onCartOpen }: { org: Org; onCartOpen: () => void }) {
  const { getSummary } = useCart()
  const { totalItems } = getSummary()
  const currency = org.settings?.currency || 'S/'
  const phone = org.phone || ''
  const pedidoUrl = waUrl(phone, `Hola! Me interesa hacer un pedido en ${org.name}.`)

  return (
    <header className="sticky top-0 z-50 bg-gray-900 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center text-lg flex-shrink-0">🏪</div>
          <div>
            <div className="font-serif text-[17px] text-white leading-tight">{org.name}</div>
            <div className="text-[11px] text-white/40 mt-px">Catálogo digital</div>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2.5">
          <button
            onClick={onCartOpen}
            className="relative flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/15 text-white/80 text-sm font-medium hover:bg-white/15 hover:text-white transition-all"
          >
            🛒 <span className="hidden sm:inline">Pedido</span>
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] rounded-full bg-green-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-gray-900">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </button>
          {phone && (
            <Link href={pedidoUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-bold transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-green-500/30 whitespace-nowrap">
              💬 Hacer pedido
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

// ─── Banner ──────────────────────────────────────────────────
function StoreBanner({ org }: { org: Org }) {
  const phone = org.phone || ''
  const url = waUrl(phone, `Hola! Quiero hacer un pedido en ${org.name}.`)
  return (
    <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
      <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(37,211,102,0.08), transparent 70%)' }} />
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl text-white font-bold leading-tight mb-1.5">
            Tu tienda de confianza, <em className="not-italic text-green-400">siempre disponible.</em>
          </h1>
          <p className="text-sm text-white/45">Explora el catálogo y haz tu pedido en segundos por WhatsApp</p>
          <div className="flex flex-wrap gap-2 mt-3.5">
            {['Entrega rápida', 'Pago contra entrega', 'Atención personalizada'].map(label => (
              <span key={label} className="flex items-center gap-1.5 bg-white/7 border border-white/10 rounded-full px-3 py-1 text-xs font-medium text-white/55">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />{label}
              </span>
            ))}
          </div>
        </div>
        {phone && (
          <Link href={url} target="_blank" rel="noopener noreferrer"
            className="flex-shrink-0 flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-bold text-base whitespace-nowrap transition-all hover:-translate-y-px hover:shadow-xl hover:shadow-green-500/40">
            💬 Hacer pedido ahora →
          </Link>
        )}
      </div>
    </div>
  )
}

// ─── ProductCard ─────────────────────────────────────────────
function ProductCard({ product, org, onOpenModal }: { product: Product; org: Org; onCartOpen?: () => void; onOpenModal: (p: Product) => void }) {
  const { cart, addItem } = useCart()
  const inCart = !!(cart[product.id]?.qty > 0)
  const currency = org.settings?.currency || 'S/'
  const phone = org.phone || ''
  const waMsg = waUrl(phone, `Hola! Quiero pedir desde ${org.name}:\n• ${product.name} — ${currency} ${product.price.toFixed(2)}\n\n¿Está disponible?`)

  return (
    <article
      onClick={() => onOpenModal(product)}
      className="group bg-white border border-stone-200 rounded-2xl overflow-hidden flex flex-col cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.10)]"
    >
      <div className="aspect-square bg-stone-100 relative flex items-center justify-center overflow-hidden">
        <span className="text-[60px] transition-transform duration-300 group-hover:scale-110 select-none">
          {product.icon || '📦'}
        </span>
        <button
          onClick={e => { e.stopPropagation(); addItem({ id: product.id, name: product.name, price: product.price, emoji: product.icon || '📦' }) }}
          className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-xl font-light opacity-0 translate-y-1 scale-90 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 transition-all duration-200 hover:bg-green-500 border-0"
        >+</button>
      </div>
      <div className="p-3.5 flex-1 flex flex-col">
        {product.category && (
          <p className="text-[10px] font-semibold uppercase tracking-[1px] text-stone-400 mb-1">{product.category}</p>
        )}
        <h3 className="text-[15px] font-semibold text-gray-900 leading-snug mb-2.5 flex-1">{product.name}</h3>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="font-serif text-[22px] text-gray-900 tracking-tight">{currency} {product.price.toFixed(2)}</span>
        </div>
        <button
          onClick={e => { e.stopPropagation(); addItem({ id: product.id, name: product.name, price: product.price, emoji: product.icon || '📦' }) }}
          className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-all duration-150 mb-1.5 border ${inCart ? 'bg-gray-900 text-white border-transparent' : 'bg-stone-100 text-gray-700 border-stone-200 hover:bg-stone-200 hover:text-gray-900'}`}
        >
          {inCart ? '✓ Agregado' : '🛒 Agregar al pedido'}
        </button>
        {phone && (
          <Link href={waMsg} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="w-full py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-bold flex items-center justify-center gap-1.5 transition-colors hover:shadow-md hover:shadow-green-500/25">
            💬 Pedir por WhatsApp
          </Link>
        )}
      </div>
    </article>
  )
}

// ─── CartPanel ───────────────────────────────────────────────
function CartPanel({ org, isOpen, onClose }: { org: Org; isOpen: boolean; onClose: () => void }) {
  const { getSummary, changeQty } = useCart()
  const { items, totalItems, totalPrice } = getSummary()
  const currency = org.settings?.currency || 'S/'
  const phone = org.phone || ''

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const sendWA = () => {
    if (!items.length || !phone) return
    const lines = items.map(it => `• ${it.name} ×${it.qty} — ${currency} ${(it.price * it.qty).toFixed(2)}`).join('\n')
    const msg = `Hola! Quiero hacer el siguiente pedido desde ${org.name}:\n\n${lines}\n\n💰 Total: ${currency} ${totalPrice.toFixed(2)}\n\n¿Está disponible para entrega?`
    window.open(waUrl(phone, msg), '_blank')
  }

  return (
    <>
      <div onClick={onClose} className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[299] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} />
      <aside className={`fixed top-0 right-0 w-full max-w-[380px] h-svh bg-white z-[300] border-l border-stone-200 flex flex-col shadow-2xl transition-transform duration-300 ease-[cubic-bezier(.16,1,.3,1)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between px-5 py-5 border-b border-stone-100">
          <div>
            <h2 className="font-serif text-xl">Mi Pedido</h2>
            <p className="text-xs text-stone-400 mt-0.5">{totalItems} producto{totalItems !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 hover:bg-stone-200 transition-colors text-base">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto px-3.5 py-3.5 flex flex-col gap-2">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2.5 text-stone-400 text-center py-10">
              <span className="text-4xl opacity-25">🛒</span>
              <p className="text-sm">Tu pedido está vacío.<br />Agrega productos para comenzar.</p>
            </div>
          ) : items.map(item => (
            <div key={item.id} className="flex items-center gap-2.5 px-3 py-2.5 bg-stone-50 border border-stone-100 rounded-2xl">
              <span className="text-2xl flex-shrink-0">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{item.name}</p>
                <p className="text-xs text-stone-400 mt-0.5">{currency} {item.price.toFixed(2)} × {item.qty} = <span className="font-semibold text-gray-700">{currency} {(item.price * item.qty).toFixed(2)}</span></p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button onClick={() => changeQty(item.id, -1)} className="w-6 h-6 rounded-md border border-stone-200 bg-white flex items-center justify-center text-sm text-gray-600 hover:bg-stone-100 transition-colors leading-none">−</button>
                <span className="text-sm font-bold min-w-[16px] text-center">{item.qty}</span>
                <button onClick={() => changeQty(item.id, 1)} className="w-6 h-6 rounded-md border border-stone-200 bg-white flex items-center justify-center text-sm text-gray-600 hover:bg-stone-100 transition-colors leading-none">+</button>
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 py-4 border-t border-stone-100 flex flex-col gap-3">
          {items.length > 0 && (
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-sm text-stone-400"><span>Subtotal</span><span>{currency} {totalPrice.toFixed(2)}</span></div>
              <div className="flex justify-between items-baseline mt-1.5">
                <span className="text-base font-bold">Total</span>
                <span className="font-serif text-[26px] text-gray-900 tracking-tight leading-none">{currency} {totalPrice.toFixed(2)}</span>
              </div>
            </div>
          )}
          <button onClick={sendWA} disabled={items.length === 0}
            className="w-full py-3.5 rounded-2xl bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-base flex items-center justify-center gap-2.5 transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-green-500/30">
            💬 Enviar pedido por WhatsApp
          </button>
          <p className="text-[11px] text-stone-400 text-center leading-relaxed">Te contactaremos para confirmar entrega y pago</p>
        </div>
      </aside>
    </>
  )
}

// ─── ProductModal ────────────────────────────────────────────
function ProductModal({ product, org, onClose }: { product: Product | null; org: Org; onClose: () => void }) {
  const [qty, setQty] = useState(1)
  const { cart, addItem } = useCart()
  const isOpen = product !== null
  const inCart = product ? !!(cart[product.id]?.qty > 0) : false
  const currency = org.settings?.currency || 'S/'
  const phone = org.phone || ''

  useEffect(() => { if (product) setQty(1) }, [product?.id])
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!product) return null

  const handlePedirWA = () => {
    addItem({ id: product.id, name: product.name, price: product.price, emoji: product.icon || '📦' }, qty)
    const msg = `Hola! Quiero pedir desde ${org.name}:\n• ${product.name} ×${qty} — ${currency} ${(product.price * qty).toFixed(2)}\n\n¿Está disponible?`
    window.open(waUrl(phone, msg), '_blank')
    onClose()
  }

  return (
    <>
      <div onClick={onClose} className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[400] transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} />
      <div className="fixed inset-0 z-[401] flex items-center justify-center p-4 pointer-events-none">
        <div className={`bg-white rounded-3xl w-full max-w-[520px] overflow-hidden shadow-2xl pointer-events-auto transition-all duration-200 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} onClick={e => e.stopPropagation()}>
          <div className="relative aspect-video bg-stone-100 flex items-center justify-center">
            <span className="text-[80px] select-none">{product.icon || '📦'}</span>
            <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center text-base hover:bg-black/50 transition-colors border-0">✕</button>
          </div>
          <div className="p-6">
            {product.category && <p className="text-[11px] font-bold uppercase tracking-[1px] text-stone-400 mb-1.5">{product.category}</p>}
            <h2 className="font-serif text-[26px] leading-tight mb-2.5 tracking-tight">{product.name}</h2>
            {product.description && <p className="text-sm text-stone-500 leading-relaxed mb-4">{product.description}</p>}
            <div className="flex items-baseline gap-2.5 mb-5">
              <span className="font-serif text-[32px] tracking-tight leading-none">{currency} {product.price.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-semibold text-gray-700">Cantidad:</span>
              <div className="flex items-center gap-2 bg-stone-100 border border-stone-200 rounded-xl px-2 py-1">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-7 h-7 rounded-lg text-lg font-light text-gray-600 flex items-center justify-center hover:bg-stone-200 transition-colors border-0 bg-transparent">−</button>
                <span className="text-base font-bold min-w-[20px] text-center">{qty}</span>
                <button onClick={() => setQty(q => Math.min(20, q + 1))} className="w-7 h-7 rounded-lg text-lg font-light text-gray-600 flex items-center justify-center hover:bg-stone-200 transition-colors border-0 bg-transparent">+</button>
              </div>
              <span className="text-sm text-stone-400">= {currency} {(product.price * qty).toFixed(2)}</span>
            </div>
            <div className="flex flex-col gap-2">
              {phone && (
                <button onClick={handlePedirWA} className="w-full py-3.5 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-bold text-[15px] flex items-center justify-center gap-2.5 transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-green-500/30">
                  💬 Pedir por WhatsApp
                </button>
              )}
              <button
                onClick={() => { addItem({ id: product.id, name: product.name, price: product.price, emoji: product.icon || '📦' }, qty); onClose() }}
                className={`w-full py-3 rounded-2xl text-[14px] font-semibold flex items-center justify-center gap-2 transition-all border-[1.5px] ${inCart ? 'bg-gray-900 text-white border-transparent' : 'bg-stone-100 text-gray-700 border-stone-200 hover:bg-stone-200'}`}
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

// ─── Sidebar ─────────────────────────────────────────────────
function StoreSidebar({ org, categories, activeCategory, counts, totalCount, onCategoryChange }: {
  org: Org; categories: string[]; activeCategory: string; counts: Record<string, number>; totalCount: number; onCategoryChange: (c: string) => void
}) {
  const phone = org.phone || ''
  const consultaUrl = waUrl(phone, `Hola! Tengo una consulta sobre ${org.name}.`)
  const allCats = [{ name: 'Todos', count: totalCount }, ...categories.map(c => ({ name: c, count: counts[c] ?? 0 }))]

  return (
    <aside className="sticky top-20 flex flex-col gap-4">
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
        <div className="px-4 pt-3.5 pb-2.5 text-[10px] font-bold uppercase tracking-[1.2px] text-stone-400 border-b border-stone-100">Categorías</div>
        <nav className="p-2 flex flex-col gap-0.5">
          {allCats.map(cat => (
            <button key={cat.name} onClick={() => onCategoryChange(cat.name)}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-medium transition-all w-full text-left border ${activeCategory === cat.name ? 'bg-gray-900 text-white border-transparent' : 'text-gray-600 border-transparent hover:bg-stone-50 hover:border-stone-200'}`}>
              <span className="flex-1">{cat.name}</span>
              <span className={`text-[10px] font-bold px-1.5 py-px rounded-full ${activeCategory === cat.name ? 'bg-white/15 text-white/70' : 'bg-black/7 text-stone-400'}`}>{cat.count}</span>
            </button>
          ))}
        </nav>
      </div>
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
        <div className="px-4 pt-3.5 pb-2.5 text-[10px] font-bold uppercase tracking-[1.2px] text-stone-400 border-b border-stone-100">Información</div>
        <div className="p-4 flex flex-col gap-3">
          <div className="flex items-start gap-2.5"><span className="text-sm mt-px flex-shrink-0">📍</span><p className="text-xs text-stone-500 leading-relaxed"><strong className="text-stone-800 font-semibold">Delivery disponible</strong><br />Consulta cobertura por WhatsApp</p></div>
          <div className="flex items-start gap-2.5"><span className="text-sm mt-px flex-shrink-0">💳</span><p className="text-xs text-stone-500 leading-relaxed"><strong className="text-stone-800 font-semibold">Formas de pago</strong><br />Efectivo · Yape · Plin · Transferencia</p></div>
          <div className="flex items-start gap-2.5"><span className="text-sm mt-px flex-shrink-0">🕐</span><p className="text-xs text-stone-500 leading-relaxed"><strong className="text-stone-800 font-semibold">Horario</strong><br />Lun–Sáb: 8am–8pm · Dom: 9am–2pm</p></div>
        </div>
        {phone && (
          <div className="px-3 pb-3">
            <Link href={consultaUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-500 hover:bg-green-600 rounded-xl text-sm font-bold text-white transition-colors">
              💬 Consultar por WhatsApp
            </Link>
          </div>
        )}
      </div>
    </aside>
  )
}

// ─── Footer ──────────────────────────────────────────────────
function StoreFooter({ org }: { org: Org }) {
  const phone = org.phone || ''
  const url = waUrl(phone, `Hola! Necesito ayuda con mi pedido en ${org.name}.`)
  return (
    <footer className="bg-gray-900 px-4 sm:px-6 lg:px-10 py-7 text-center">
      <div className="max-w-6xl mx-auto">
        <p className="text-sm text-white/25 mb-3.5">¿Tienes dudas? ¿Quieres un pedido personalizado?</p>
        {phone && (
          <Link href={url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-bold text-sm transition-all hover:-translate-y-px mb-4">
            💬 Hablar por WhatsApp
          </Link>
        )}
        <div className="h-px bg-white/6 mb-4" />
        <p className="text-[11px] text-white/15">
          Tienda virtual creada con{' '}
          <a href="https://coriva.pe" className="text-white/30 hover:text-white/50 transition-colors">Coriva Core</a>
          {' '}· Sistema POS para negocios
        </p>
      </div>
    </footer>
  )
}

// ─── Main Export ─────────────────────────────────────────────
export default function StorePage({ org, products }: StorePageProps) {
  const [cartOpen, setCartOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('')

  const categories = useMemo(() => Array.from(new Set(products.map(p => p.category).filter(Boolean) as string[])), [products])

  const counts = useMemo(() => {
    const map: Record<string, number> = {}
    for (const p of products) { if (p.category) map[p.category] = (map[p.category] ?? 0) + 1 }
    return map
  }, [products])

  const filtered = useMemo(() => {
    let list = products.filter(p => {
      const matchCat = activeCategory === 'Todos' || p.category === activeCategory
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.category ?? '').toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
    if (sort === 'pa') list = [...list].sort((a, b) => a.price - b.price)
    if (sort === 'pd') list = [...list].sort((a, b) => b.price - a.price)
    if (sort === 'az') list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    return list
  }, [products, activeCategory, search, sort])

  const allCats = [{ name: 'Todos', emoji: '🏪' }, ...categories.map(c => ({ name: c, emoji: '📦' }))]

  return (
    <>
      <StoreHeader org={org} onCartOpen={() => setCartOpen(true)} />
      <StoreBanner org={org} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-7 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-7 items-start">

          {/* Desktop sidebar */}
          <div className="hidden lg:block">
            <StoreSidebar org={org} categories={categories} activeCategory={activeCategory} counts={counts} totalCount={products.length} onCategoryChange={setActiveCategory} />
          </div>

          {/* Products area */}
          <div className="flex flex-col gap-5">

            {/* Mobile category pills */}
            <div className="flex lg:hidden gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {allCats.map(cat => (
                <button key={cat.name} onClick={() => setActiveCategory(cat.name)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border-[1.5px] transition-all ${activeCategory === cat.name ? 'bg-gray-900 text-white border-transparent' : 'bg-white text-gray-600 border-stone-200 hover:border-gray-400'}`}>
                  {cat.emoji} {cat.name}
                </button>
              ))}
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-2.5">
              <div className="flex-1 flex items-center gap-2 bg-white border-[1.5px] border-stone-200 rounded-xl px-3.5 h-11 focus-within:border-gray-900 transition-all">
                <svg className="text-stone-400 flex-shrink-0" width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="6.5" cy="6.5" r="4.5" /><path d="M11 11l3 3" /></svg>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar producto..."
                  className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder:text-stone-400" />
                {search && <button onClick={() => setSearch('')} className="text-stone-400 hover:text-gray-700 text-xs">✕</button>}
              </div>
              <select value={sort} onChange={e => setSort(e.target.value)}
                className="h-11 px-3.5 pr-8 rounded-xl border-[1.5px] border-stone-200 bg-white text-sm font-medium text-gray-700 appearance-none outline-none focus:border-gray-900 cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23ABABAB' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}>
                <option value="">Ordenar</option>
                <option value="pa">Menor precio</option>
                <option value="pd">Mayor precio</option>
                <option value="az">Nombre A–Z</option>
              </select>
              <span className="hidden sm:block text-sm text-stone-400 whitespace-nowrap">{filtered.length} producto{filtered.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-stone-400">
                <div className="text-5xl mb-4 opacity-40">🔍</div>
                <h3 className="text-lg font-semibold text-stone-600 mb-1.5">Sin resultados</h3>
                <p className="text-sm">No encontramos productos con esa búsqueda</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {filtered.map(product => (
                  <ProductCard key={product.id} product={product} org={org} onOpenModal={setSelectedProduct} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <StoreFooter org={org} />
      <CartPanel org={org} isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <ProductModal product={selectedProduct} org={org} onClose={() => setSelectedProduct(null)} />
    </>
  )
}
