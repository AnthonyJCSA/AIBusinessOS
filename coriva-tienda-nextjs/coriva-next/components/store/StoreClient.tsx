'use client'

import { useState } from 'react'
import type { Store, StoreCategory, Product } from '@/types/store'
import { StoreHeader } from './StoreHeader'
import { StoreBanner } from './StoreBanner'
import { ProductGrid } from './ProductGrid'
import { CartPanel } from './CartPanel'
import { ProductModal } from './ProductModal'
import { StoreFooter } from './StoreFooter'

interface StoreClientProps {
  store: Store
  categories: StoreCategory[]
  products: Product[]
}

export function StoreClient({ store, categories, products }: StoreClientProps) {
  const [cartOpen, setCartOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  return (
    <>
      <StoreHeader
        store={store}
        onCartOpen={() => setCartOpen(true)}
      />

      <StoreBanner store={store} />

      <ProductGrid
        store={store}
        categories={categories}
        products={products}
        onOpenModal={setSelectedProduct}
      />

      <StoreFooter store={store} />

      <CartPanel
        store={store}
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
      />

      <ProductModal
        product={selectedProduct}
        store={store}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  )
}
