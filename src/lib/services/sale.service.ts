import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { DBSale, DBSaleItem, SalesDayRow, TopProductRow } from '@/types/database.types'
import { Sale, CartItem } from '@/types'

const SALES_TABLE = 'corivacore_sales'
const ITEMS_TABLE = 'corivacore_sale_items'

export const saleService = {
  async create(orgId: string, sale: {
    customerId?: string
    customerName?: string
    receiptType: string
    paymentMethod: string
    subtotal: number
    tax: number
    discount?: number
    total: number
    amountPaid?: number
    changeAmount?: number
    notes?: string
    items: CartItem[]
    createdBy?: string
  }): Promise<Sale> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured')

    const { data: saleNumber } = await supabase
      .rpc('generate_sale_number', { p_org_id: orgId })

    const dbSale: Omit<DBSale, 'id'> = {
      org_id:         orgId,
      sale_number:    saleNumber || `V-${Date.now()}`,
      customer_id:    sale.customerId,
      customer_name:  sale.customerName,
      receipt_type:   sale.receiptType,
      payment_method: sale.paymentMethod,
      subtotal:       sale.subtotal,
      tax:            sale.tax,
      discount:       sale.discount || 0,
      total:          sale.total,
      amount_paid:    sale.amountPaid,
      change_amount:  sale.changeAmount,
      notes:          sale.notes,
      status:         'completed',
      created_by:     sale.createdBy,
    }

    const { data: saleData, error: saleError } = await supabase
      .from(SALES_TABLE).insert(dbSale).select().single()
    if (saleError) throw saleError

    const dbItems: Omit<DBSaleItem, 'id'>[] = sale.items.map(item => ({
      sale_id:      saleData.id,
      product_id:   item.id,
      product_code: item.code,
      product_name: item.name,
      quantity:     item.quantity,
      unit_price:   item.price,
      subtotal:     item.price * item.quantity,
    }))

    const { error: itemsError } = await supabase.from(ITEMS_TABLE).insert(dbItems)
    if (itemsError) throw itemsError

    // Decrementar stock via RPC atómica
    for (const item of sale.items) {
      const { error } = await supabase.rpc('decrement_product_stock', {
        p_product_id: item.id, p_quantity: item.quantity,
      })
      if (error) console.error('Stock decrement error:', error)
    }

    return saleData as Sale
  },

  async cancel(saleId: string, cancelledBy: string, reason: string): Promise<void> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured')
    const { error } = await supabase
      .from(SALES_TABLE)
      .update({
        status:        'cancelled',
        cancelled_at:  new Date().toISOString(),
        cancelled_by:  cancelledBy,
        cancel_reason: reason,
      })
      .eq('id', saleId)
    if (error) throw error
    // El trigger trg_sale_cancel revierte stock y caja automáticamente
  },

  async getAll(orgId: string, limit = 100): Promise<Sale[]> {
    if (!isSupabaseConfigured()) return []
    const { data, error } = await supabase
      .from(SALES_TABLE).select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return data as Sale[]
  },

  async getById(id: string): Promise<Sale | null> {
    if (!isSupabaseConfigured()) return null
    const { data, error } = await supabase
      .from(SALES_TABLE).select('*').eq('id', id).single()
    if (error) return null
    return data as Sale
  },

  async getSaleItems(saleId: string): Promise<DBSaleItem[]> {
    if (!isSupabaseConfigured()) return []
    const { data, error } = await supabase
      .from(ITEMS_TABLE).select('*').eq('sale_id', saleId)
    if (error) throw error
    return data as DBSaleItem[]
  },

  async getTodaySales(orgId: string): Promise<Sale[]> {
    if (!isSupabaseConfigured()) return []
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from(SALES_TABLE).select('*')
      .eq('org_id', orgId)
      .gte('created_at', `${today}T00:00:00`)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as Sale[]
  },

  async getLast7Days(orgId: string): Promise<SalesDayRow[]> {
    if (!isSupabaseConfigured()) return []
    const { data, error } = await supabase
      .rpc('get_sales_last_7_days', { p_org_id: orgId })
    if (error) throw error
    return (data || []) as SalesDayRow[]
  },

  async getTopProducts(orgId: string, limit = 5): Promise<TopProductRow[]> {
    if (!isSupabaseConfigured()) return []
    const { data, error } = await supabase
      .rpc('get_top_products', { p_org_id: orgId, p_limit: limit })
    if (error) throw error
    return (data || []) as TopProductRow[]
  },
}
