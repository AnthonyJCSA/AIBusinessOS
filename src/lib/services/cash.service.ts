import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { DBCashMovement, CashSummaryRow } from '@/types/database.types'

const TABLE = 'corivacore_cash_movements'

export const cashService = {
  async create(orgId: string, movement: {
    type: DBCashMovement['type']
    amount: number
    balance?: number
    description?: string
    category?: string
    referenceId?: string
    createdBy?: string
  }): Promise<DBCashMovement> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        org_id:       orgId,
        type:         movement.type,
        amount:       movement.amount,
        balance:      movement.balance,
        description:  movement.description,
        category:     movement.category,
        reference_id: movement.referenceId,
        created_by:   movement.createdBy,
      })
      .select().single()
    if (error) throw error
    return data as DBCashMovement
  },

  async getAll(orgId: string): Promise<DBCashMovement[]> {
    if (!isSupabaseConfigured()) return []
    const { data, error } = await supabase
      .from(TABLE).select('*').eq('org_id', orgId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as DBCashMovement[]
  },

  async getTodayMovements(orgId: string): Promise<DBCashMovement[]> {
    if (!isSupabaseConfigured()) return []
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from(TABLE).select('*').eq('org_id', orgId)
      .gte('created_at', `${today}T00:00:00`)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as DBCashMovement[]
  },

  async getSummary(orgId: string): Promise<CashSummaryRow> {
    if (!isSupabaseConfigured()) return {
      opening_amount: 0, sales_amount: 0, expenses_amount: 0,
      refunds_amount: 0, current_balance: 0,
    }
    const { data, error } = await supabase
      .rpc('get_cash_summary', { p_org_id: orgId })
    if (error) throw error
    return (data?.[0] || {
      opening_amount: 0, sales_amount: 0, expenses_amount: 0,
      refunds_amount: 0, current_balance: 0,
    }) as CashSummaryRow
  },

  async getBalance(orgId: string): Promise<number> {
    const summary = await this.getSummary(orgId)
    return summary.current_balance
  },

  async openCash(orgId: string, initialAmount: number, createdBy?: string): Promise<DBCashMovement> {
    return this.create(orgId, {
      type: 'opening', amount: initialAmount, balance: initialAmount,
      description: 'Apertura de caja', createdBy,
    })
  },

  async closeCash(orgId: string, finalAmount: number, createdBy?: string): Promise<DBCashMovement> {
    const balance = await this.getBalance(orgId)
    return this.create(orgId, {
      type: 'closing', amount: finalAmount, balance,
      description: 'Cierre de caja', createdBy,
    })
  },

  async registerExpense(orgId: string, amount: number, description: string, category?: string, createdBy?: string): Promise<DBCashMovement> {
    const balance = await this.getBalance(orgId)
    return this.create(orgId, {
      type: 'expense', amount, balance: balance - amount,
      description, category, createdBy,
    })
  },

  async registerSale(orgId: string, saleId: string, amount: number, createdBy?: string): Promise<DBCashMovement> {
    const balance = await this.getBalance(orgId)
    return this.create(orgId, {
      type: 'sale', amount, balance: balance + amount,
      description: 'Venta registrada', referenceId: saleId, createdBy,
    })
  },
}
