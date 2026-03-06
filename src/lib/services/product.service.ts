import { supabase } from '../supabase'
import { DBProduct } from '@/types/database.types'
import { Product } from '@/types'

const TABLE = 'corivacore_products'

export const productService = {
  async getAll(orgId: string): Promise<Product[]> {
    if (!supabase) return []
    
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('org_id', orgId)
      .eq('is_active', true)
      .order('name')

    if (error) throw error
    return data as Product[]
  },

  async create(orgId: string, product: Omit<Product, 'id'>): Promise<Product> {
    if (!supabase) throw new Error('Supabase not configured')
    
    const dbProduct: Omit<DBProduct, 'id'> = {
      org_id: orgId,
      code: product.code,
      name: product.name,
      category: product.category,
      price: product.price,
      cost: product.cost || 0,
      stock: product.stock,
      min_stock: product.min_stock || 10,
      unit: product.unit || 'unit',
      is_active: product.is_active !== false
    }

    const { data, error } = await supabase
      .from(TABLE)
      .insert(dbProduct)
      .select()
      .single()

    if (error) throw error
    return data as Product
  },

  async update(id: string, updates: Partial<Product>): Promise<Product> {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from(TABLE)
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Product
  },

  async updateStock(id: string, quantity: number): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { error } = await supabase
      .from(TABLE)
      .update({ stock: quantity })
      .eq('id', id)

    if (error) throw error
  },

  async decrementStock(id: string, quantity: number): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data: product } = await supabase
      .from(TABLE)
      .select('stock')
      .eq('id', id)
      .single()

    if (product) {
      await this.updateStock(id, product.stock - quantity)
    }
  },

  async migrateFromLocalStorage(orgId: string, products: Product[]): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured')
    
    const dbProducts = products.map(p => ({
      org_id: orgId,
      code: p.code,
      name: p.name,
      category: p.category,
      price: p.price,
      cost: p.cost || 0,
      stock: p.stock,
      min_stock: p.min_stock || 10,
      unit: p.unit || 'unit',
      is_active: p.is_active !== false
    }))

    const { error } = await supabase
      .from(TABLE)
      .insert(dbProducts)

    if (error) throw error
  },

  async hasProducts(orgId: string): Promise<boolean> {
    if (!supabase) return false
    
    const { count, error } = await supabase
      .from(TABLE)
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)

    if (error) throw error
    return (count || 0) > 0
  }
}
