'use client'

import { useState, useMemo } from 'react'
import type { Product, Store, StoreCategory, SortOption } from '@/types/store'
import { ProductCard } from './ProductCard'
import { StoreSidebar } from './StoreSidebar'

interface ProductGridProps {
  store: Store
  categories: StoreCategory[]
  products: Product[]
  onOpenModal: (product: Product) => void
}

export function ProductGrid({ store, categories, products, onOpenModal }: ProductGridProps) {
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOption>('')

  // Count products per category
  const counts = useMemo(() => {
    const map: Record<string, number> = {}
    for (const p of products) {
      const catName = p.category?.name ?? 'Sin categoría'
      map[catName] = (map[catName] ?? 0) + 1
    }
    return map
  }, [products])

  // Filtered + sorted list
  const filtered = useMemo(() => {
    let list = products.filter(p => {
      const matchCat = activeCategory === 'Todos' || p.category?.name === activeCategory
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.category?.name ?? '').toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })

    if (sort === 'pa') list = [...list].sort((a, b) => a.price - b.price)
    if (sort === 'pd') list = [...list].sort((a, b) => b.price - a.price)
    if (sort === 'az') list = [...list].sort((a, b) => a.name.localeCompare(b.name))

    return list
  }, [products, activeCategory, search, sort])

  // Mobile category pills
  const allCats = [
    { name: 'Todos', emoji: '🏪' },
    ...categories.map(c => ({ name: c.name, emoji: c.emoji })),
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-7 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-7 items-start">

        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <StoreSidebar
            store={store}
            categories={categories}
            activeCategory={activeCategory}
            counts={counts}
            totalCount={products.length}
            onCategoryChange={setActiveCategory}
          />
        </div>

        {/* Products area */}
        <div className="flex flex-col gap-5">

          {/* Mobile category scroll */}
          <div className="flex lg:hidden gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {allCats.map(cat => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border-[1.5px] transition-all ${
                  activeCategory === cat.name
                    ? 'bg-gray-900 text-white border-transparent'
                    : 'bg-white text-gray-600 border-stone-200 hover:border-gray-400'
                }`}
              >
                {cat.emoji} {cat.name}
              </button>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-2.5">
            <div className="flex-1 flex items-center gap-2 bg-white border-[1.5px] border-stone-200 rounded-xl px-3.5 h-11 focus-within:border-gray-900 focus-within:shadow-[0_0_0_3px_rgba(26,26,26,0.07)] transition-all">
              <svg className="text-stone-400 flex-shrink-0" width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="6.5" cy="6.5" r="4.5" />
                <path d="M11 11l3 3" />
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar producto..."
                className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder:text-stone-400"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-stone-400 hover:text-gray-700 text-xs">✕</button>
              )}
            </div>

            <select
              value={sort}
              onChange={e => setSort(e.target.value as SortOption)}
              className="h-11 px-3.5 pr-8 rounded-xl border-[1.5px] border-stone-200 bg-white text-sm font-medium text-gray-700 appearance-none outline-none focus:border-gray-900 cursor-pointer transition-all"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23ABABAB' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
            >
              <option value="">Ordenar</option>
              <option value="pa">Menor precio</option>
              <option value="pd">Mayor precio</option>
              <option value="az">Nombre A–Z</option>
            </select>

            <span className="hidden sm:block text-sm text-stone-400 whitespace-nowrap">
              {filtered.length} producto{filtered.length !== 1 ? 's' : ''}
            </span>
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
                <ProductCard
                  key={product.id}
                  product={product}
                  store={store}
                  onOpenModal={onOpenModal}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
