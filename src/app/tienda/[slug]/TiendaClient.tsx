'use client'

import { useState } from 'react'

const C = {
  ink: '#0C0E12',
  bg: '#FAFAF8',
  lime: '#C8F23A',
  green: '#0D9C6E',
  wa: '#25D366',
  muted: '#6B7280',
  border: '#E5E7EB',
  card: '#FFFFFF',
}

const CATEGORY_ICONS: Record<string, string> = {
  bebidas: '🥤', panadería: '🍞', lácteos: '🥛', abarrotes: '🛒',
  snacks: '🍿', limpieza: '🧹', medicamentos: '💊', ferretería: '🔧',
  ropa: '👕', tecnología: '💻', default: '📦',
}

function getIcon(category?: string) {
  if (!category) return '📦'
  const key = category.toLowerCase()
  return Object.entries(CATEGORY_ICONS).find(([k]) => key.includes(k))?.[1] ?? '📦'
}

export default function TiendaClient({ org, products }: { org: any; products: any[] }) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('Todos')
  const currency = org?.settings?.currency || 'S/'
  const waPhone = org?.phone?.replace(/\D/g, '') || ''

  const categories = ['Todos', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))]

  const filtered = products.filter(p => {
    const matchCat = activeCategory === 'Todos' || p.category === activeCategory
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch && p.stock > 0
  })

  const orderWA = (product?: any) => {
    const msg = product
      ? `Hola ${org.name}! Quiero pedir: *${product.name}* (${currency} ${product.price?.toFixed(2)})`
      : `Hola ${org.name}! Vi su catálogo y quiero hacer un pedido.`
    window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;1,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Header */}
      <header style={{ background: C.ink, padding: '20px 24px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 700, color: '#fff' }}>
              {org.name}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>
              {products.length} productos disponibles
            </div>
          </div>
          {waPhone && (
            <button
              onClick={() => orderWA()}
              style={{ background: C.wa, color: '#fff', border: 'none', borderRadius: 10, padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <span>📱</span> Hacer pedido
            </button>
          )}
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

        {/* Search */}
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar producto..."
          style={{ width: '100%', padding: '12px 18px', borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 14, outline: 'none', marginBottom: 20, boxSizing: 'border-box', background: C.card }}
        />

        {/* Categories */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '7px 16px', borderRadius: 99, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none',
                background: activeCategory === cat ? C.ink : C.card,
                color: activeCategory === cat ? C.lime : C.muted,
                boxShadow: activeCategory === cat ? 'none' : `0 0 0 1.5px ${C.border}`,
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: C.muted }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>No se encontraron productos</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {filtered.map(p => (
              <div
                key={p.id}
                style={{ background: C.card, borderRadius: 16, border: `1.5px solid ${C.border}`, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ background: '#F3F4F6', height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52 }}>
                  {getIcon(p.category)}
                </div>
                <div style={{ padding: '14px 14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, lineHeight: 1.3 }}>{p.name}</div>
                  {p.category && (
                    <div style={{ fontSize: 11, color: C.muted }}>{p.category}</div>
                  )}
                  <div style={{ fontSize: 20, fontWeight: 800, color: C.ink, marginTop: 4 }}>
                    {currency} {p.price?.toFixed(2)}
                  </div>
                  <button
                    onClick={() => orderWA(p)}
                    style={{ marginTop: 'auto', background: C.wa, color: '#fff', border: 'none', borderRadius: 9, padding: '9px 0', fontSize: 12, fontWeight: 700, cursor: 'pointer', width: '100%' }}
                  >
                    📱 Pedir por WhatsApp
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '32px 24px', color: C.muted, fontSize: 12, borderTop: `1px solid ${C.border}`, marginTop: 40 }}>
        Catálogo digital creado con <strong style={{ color: C.ink }}>Coriva</strong> · <a href="/" style={{ color: C.green, textDecoration: 'none' }}>Crea el tuyo gratis</a>
      </footer>
    </div>
  )
}
