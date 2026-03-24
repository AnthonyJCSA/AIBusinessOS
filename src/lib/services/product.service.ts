import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { DBProduct, ExpiringProductRow } from '@/types/database.types'
import { Product } from '@/types'

const TABLE = 'corivacore_products'

export const productService = {
  async getAll(orgId: string): Promise<Product[]> {
    if (!isSupabaseConfigured()) return []
    const { data, error } = await supabase
      .from(TABLE).select('*')
      .eq('org_id', orgId).eq('is_active', true).order('name')
    if (error) throw error
    return data as Product[]
  },

  async create(orgId: string, product: Omit<Product, 'id'>): Promise<Product> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        org_id:            orgId,
        code:              product.code,
        name:              product.name,
        category:          product.category,
        price:             product.price,
        cost:              product.cost || 0,
        stock:             product.stock,
        min_stock:         product.min_stock || 10,
        unit:              (product as any).unit || 'unidad',
        description:       product.description,
        brand:             (product as any).brand,
        laboratory:        (product as any).laboratory,
        active_ingredient: (product as any).active_ingredient,
        supplier:          (product as any).supplier,
        expiry_date:       (product as any).expiry_date || null,
        barcode:           (product as any).barcode,
        location:          (product as any).location,
        is_active:         product.is_active !== false,
      })
      .select().single()
    if (error) throw error
    return data as Product
  },

  async update(id: string, updates: Partial<Product>): Promise<Product> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from(TABLE).update(updates).eq('id', id).select().single()
    if (error) throw error
    return data as Product
  },

  async updateStock(id: string, quantity: number): Promise<void> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured')
    const { error } = await supabase
      .from(TABLE).update({ stock: quantity }).eq('id', id)
    if (error) throw error
  },

  async decrementStock(id: string, quantity: number): Promise<void> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured')
    const { error } = await supabase.rpc('decrement_product_stock', {
      p_product_id: id, p_quantity: quantity,
    })
    if (error) throw error
  },

  async getExpiring(orgId: string, days = 30): Promise<ExpiringProductRow[]> {
    if (!isSupabaseConfigured()) return []
    const { data, error } = await supabase
      .rpc('get_expiring_products', { p_org_id: orgId, p_days: days })
    if (error) throw error
    return (data || []) as ExpiringProductRow[]
  },

  async hasProducts(orgId: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return false
    const { count, error } = await supabase
      .from(TABLE).select('*', { count: 'exact', head: true }).eq('org_id', orgId)
    if (error) throw error
    return (count || 0) > 0
  },

  async migrateFromLocalStorage(orgId: string, products: Product[]): Promise<void> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured')
    const rows = products.map(p => ({
      org_id: orgId, code: p.code, name: p.name, category: p.category,
      price: p.price, cost: p.cost || 0, stock: p.stock,
      min_stock: p.min_stock || 10, unit: (p as any).unit || 'unidad',
      is_active: p.is_active !== false,
    }))
    const { error } = await supabase.from(TABLE).insert(rows)
    if (error) throw error
  },
}
