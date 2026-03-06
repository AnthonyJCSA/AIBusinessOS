import { supabase } from '../supabase'
import { DBSale, DBSaleItem } from '@/types/database.types'
import { Sale, CartItem } from '@/types'

const SALES_TABLE = 'corivacore_sales'
const ITEMS_TABLE = 'corivacore_sale_items'

export const saleService = {
  async create(orgId: string, sale: {
    customerName?: string
    receiptType: string
    paymentMethod: string
    subtotal: number
    tax: number
    total: number
    amountPaid?: number
    changeAmount?: number
    items: CartItem[]
    createdBy?: string
  }): Promise<Sale> {
    if (!supabase) throw new Error('Supabase not configured')
    
    // Generar número de venta
    const { data: saleNumber } = await supabase
      .rpc('generate_sale_number', { p_org_id: orgId })

    // Crear venta
    const dbSale: Omit<DBSale, 'id'> = {
      org_id: orgId,
      sale_number: saleNumber || `V-${Date.now()}`,
      customer_name: sale.customerName,
      receipt_type: sale.receiptType,
      payment_method: sale.paymentMethod,
      subtotal: sale.subtotal,
      tax: sale.tax,
      total: sale.total,
      amount_paid: sale.amountPaid,
      change_amount: sale.changeAmount,
      status: 'completed',
      created_by: sale.createdBy
    }

    const { data: saleData, error: saleError } = await supabase
      .from(SALES_TABLE)
      .insert(dbSale)
      .select()
      .single()

    if (saleError) throw saleError

    // Crear items
    const dbItems: Omit<DBSaleItem, 'id'>[] = sale.items.map(item => ({
      sale_id: saleData.id,
      product_id: item.id,
      product_code: item.code,
      product_name: item.name,
      quantity: item.quantity,
      unit_price: item.price,
      subtotal: item.price * item.quantity
    }))

    const { error: itemsError } = await supabase
      .from(ITEMS_TABLE)
      .insert(dbItems)

    if (itemsError) throw itemsError

    // Actualizar stock
    for (const item of sale.items) {
      const { error } = await supabase.rpc('decrement_product_stock', {
        p_product_id: item.id,
        p_quantity: item.quantity
      })
      if (error) console.error('Error updating stock:', error)
    }

    return saleData as Sale
  },

  async getAll(orgId: string): Promise<Sale[]> {
    if (!supabase) return []
    
    const { data, error } = await supabase
      .from(SALES_TABLE)
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Sale[]
  },

  async getById(id: string): Promise<Sale | null> {
    const { data, error } = await supabase
      .from(SALES_TABLE)
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Sale
  },

  async getSaleItems(saleId: string): Promise<DBSaleItem[]> {
    const { data, error } = await supabase
      .from(ITEMS_TABLE)
      .select('*')
      .eq('sale_id', saleId)

    if (error) throw error
    return data as DBSaleItem[]
  },

  async getTodaySales(orgId: string): Promise<Sale[]> {
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from(SALES_TABLE)
      .select('*')
      .eq('org_id', orgId)
      .gte('created_at', `${today}T00:00:00`)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Sale[]
  }
}
