'use client'
import type { Product } from '@/types'

const CATEGORIES = [
  { key: '', label: 'Todos' },
  { key: 'bebidas', label: '🥤 Bebidas' },
  { key: 'snacks', label: '🍪 Snacks' },
  { key: 'lacteos', label: '🥛 Lácteos' },
  { key: 'limpieza', label: '🧹 Limpieza' },
  { key: 'abarrotes', label: '🛒 Abarrotes' },
  { key: 'medicamentos', label: '💊 Medicamentos' },
  { key: 'general', label: '📦 General' },
]

interface ProductGridProps {
  products: Product[]
  search: string
  category: string
  currency: string
  onSearch: (v: string) => void
  onCategory: (v: string) => void
  onAdd: (p: Product) => void
}

export function ProductGrid({ products, search, category, currency, onSearch, onCategory, onAdd }: ProductGridProps) {
  const filtered = products.filter(p => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase())
    const matchCat = !category || (p.category || '').toLowerCase() === category
    return matchSearch && matchCat
  })

  return (
    <div className="flex flex-col gap-[10px] min-h-0">
      {/* Search */}
      <div
        className="flex items-center gap-2 px-3 h-[42px] rounded-[9px] flex-shrink-0"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="var(--sub)" strokeWidth="1.5">
          <circle cx="6.5" cy="6.5" r="4.5" /><path d="M11 11l3 3" />
        </svg>
        <input
          value={search}
          onChange={e => onSearch(e.target.value)}
          placeholder="Buscar producto por nombre o código…"
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: 'var(--text)' }}
        />
        {search && (
          <button onClick={() => onSearch('')} style={{ color: 'var(--muted)', fontSize: 12 }}>✕</button>
        )}
      </div>

      {/* Categories */}
      <div className="flex gap-[6px] flex-wrap flex-shrink-0">
        {CATEGORIES.map(c => (
          <button
            key={c.key}
            onClick={() => onCategory(c.key)}
            className="px-[13px] py-[5px] rounded-full text-[11px] font-semibold transition-all"
            style={{
              background: category === c.key ? 'rgba(99,102,241,.15)' : 'var(--surface)',
              border: `1px solid ${category === c.key ? 'rgba(99,102,241,.3)' : 'var(--border)'}`,
              color: category === c.key ? 'var(--accent)' : 'var(--muted)',
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div
        className="grid overflow-y-auto touch-scroll flex-1 pb-1"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))', gap: '9px', alignContent: 'start' }}
      >
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-10 text-sm" style={{ color: 'var(--sub)' }}>
            Sin resultados
          </div>
        ) : (
          filtered.map(p => <ProductCard key={p.id} product={p} currency={currency} onAdd={onAdd} />)
        )}
      </div>
    </div>
  )
}

function ProductCard({ product: p, currency, onAdd }: { product: Product; currency: string; onAdd: (p: Product) => void }) {
  const stockStatus =
    p.stock === 0 ? 'out' : p.stock <= (p.min_stock || 5) ? 'low' : 'ok'

  const stockStyles = {
    ok:  { bg: 'rgba(16,185,129,.1)',  color: 'var(--green)', label: `${p.stock} uds` },
    low: { bg: 'rgba(245,158,11,.1)',  color: 'var(--amber)', label: `⚠️ ${p.stock} uds` },
    out: { bg: 'rgba(239,68,68,.1)',   color: 'var(--red)',   label: '🚨 Sin stock' },
  }[stockStatus]

  return (
    <button
      onClick={() => onAdd(p)}
      disabled={p.stock === 0}
      className="text-left rounded-xl p-[14px] transition-all relative disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-[1px]"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      <div className="text-[10px] font-mono" style={{ color: 'var(--sub)' }}>{p.code}</div>
      <div className="text-[13px] font-bold leading-[1.3] mb-[3px] mt-[6px]" style={{ color: 'var(--text)' }}>
        {p.name}
      </div>
      <div className="text-[17px] font-extrabold" style={{ color: 'var(--accent2)' }}>
        {currency} {p.price.toFixed(2)}
      </div>
      <div className="mt-[6px]">
        <span
          className="text-[10px] px-2 py-[2px] rounded-full font-semibold"
          style={{ background: stockStyles.bg, color: stockStyles.color }}
        >
          {stockStyles.label}
        </span>
      </div>
    </button>
  )
}
