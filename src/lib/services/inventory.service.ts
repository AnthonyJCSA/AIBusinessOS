import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export interface InventoryMovement {
  id: string
  org_id: string
  product_id: string
  product_name?: string
  movement_type: 'IN' | 'OUT' | 'ADJUSTMENT'
  quantity: number
  previous_stock?: number
  new_stock?: number
  reason?: string
  reference_type?: string
  reference_id?: string
  user_id?: string
  notes?: string
  created_at: string
}

export const inventoryService = {
  async getMovements(orgId: string, limit = 50): Promise<InventoryMovement[]> {
    if (!isSupabaseConfigured()) return []
    const { data, error } = await supabase
      .from('corivacore_inventory_movements')
      .select('*, product:corivacore_products(name)')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return (data || []).map((m: any) => ({ ...m, product_name: m.product?.name })) as InventoryMovement[]
  },

  async adjustStock(orgId: string, productId: string, newStock: number, reason: string, userId: string): Promise<void> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured')
    const { error } = await supabase.rpc('adjust_product_stock', {
      p_org_id: orgId,
      p_product_id: productId,
      p_new_stock: newStock,
      p_reason: reason,
      p_user_id: userId,
    })
    if (error) throw error
  },

  async getMovementsSummary(orgId: string) {
    if (!isSupabaseConfigured()) return { in: 0, out: 0, adjustments: 0 }
    const { data } = await supabase
      .from('corivacore_inventory_movements')
      .select('movement_type')
      .eq('org_id', orgId)
      .gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString())
    const rows = data || []
    return {
      in: rows.filter((r: any) => r.movement_type === 'IN').length,
      out: rows.filter((r: any) => r.movement_type === 'OUT').length,
      adjustments: rows.filter((r: any) => r.movement_type === 'ADJUSTMENT').length,
    }
  },
}
