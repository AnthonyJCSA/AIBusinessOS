import { createClient } from '@/lib/supabase/server'
import type { Store, StoreCategory, Product } from '@/types/store'

// ─── Fetch store by slug ───────────────────────────────────────
export async function getStoreBySlug(slug: string): Promise<Store | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .single()

  if (error || !data) return null
  return data as Store
}

// ─── Fetch categories for a store ─────────────────────────────
export async function getStoreCategories(storeId: string): Promise<StoreCategory[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('store_categories')
    .select('*')
    .eq('store_id', storeId)
    .order('sort_order', { ascending: true })

  if (error || !data) return []
  return data as StoreCategory[]
}

// ─── Fetch products for a store (with category join) ──────────
export async function getStoreProducts(storeId: string): Promise<Product[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:store_categories (
        id,
        name,
        emoji,
        sort_order
      )
    `)
    .eq('store_id', storeId)
    .eq('active', true)
    .order('sort_order', { ascending: true })

  if (error || !data) return []
  return data as Product[]
}

// ─── Fetch all store data in one call ─────────────────────────
export async function getStoreData(slug: string) {
  const store = await getStoreBySlug(slug)
  if (!store) return null

  const [categories, products] = await Promise.all([
    getStoreCategories(store.id),
    getStoreProducts(store.id),
  ])

  return { store, categories, products }
}
