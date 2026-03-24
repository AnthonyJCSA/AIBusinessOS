import { supabase, isSupabaseConfigured } from '@/lib/supabase'

const MOVEMENTS_TABLE = 'corivacore_inventory_movements'

export interface InventoryMovement {
  id: string
  org_id: string
  product_id: string
  type: 'sale' | 'purchase' | 'adjustment' | 'return' | 'initial'
  quantity: number
  stock_before?: number
  stock_after?: number
  reference_type?: string
  reference_id?: string
  notes?: string
  created_by?: string
  created_at?: string
}

export const inventoryService = {
  async getMovements(orgId: string, productId?: string, limit = 50): Promise<InventoryMovement[]> {
    if (!isSupabaseConfigured()) return []
    let query = supabase
      .from(MOVEMENTS_TABLE)
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (productId) query = query.eq('product_id', productId)

    const { data, error } = await query
    if (error) throw error
    return data as InventoryMovement[]
  },

  async adjustStock(
    productId: string,
    newStock: number,
    reason: string,
    createdBy?: string
  ): Promise<void> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured')
    const { error } = await supabase.rpc('adjust_product_stock', {
      p_product_id: productId,
      p_new_stock: newStock,
      p_reason: reason,
      p_created_by: createdBy ?? null,
    })
    if (error) throw error
  },

  async getMovementsSummary(orgId: string): Promise<{
    total_in: number
    total_out: number
    adjustments: number
  }> {
    if (!isSupabaseConfigured()) return { total_in: 0, total_out: 0, adjustments: 0 }
    const { data, error } = await supabase
      .from(MOVEMENTS_TABLE)
      .select('type, quantity')
      .eq('org_id', orgId)
      .gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString())

    if (error) throw error

    return (data ?? []).reduce(
      (acc, m) => {
        if (m.quantity > 0) acc.total_in += m.quantity
        else if (m.type === 'sale') acc.total_out += Math.abs(m.quantity)
        else if (m.type === 'adjustment') acc.adjustments++
        return acc
      },
      { total_in: 0, total_out: 0, adjustments: 0 }
    )
  },
}
