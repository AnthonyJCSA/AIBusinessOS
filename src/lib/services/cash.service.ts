import { supabase } from '../supabase'
import { DBCashMovement } from '@/types/database.types'

const TABLE = 'corivacore_cash_movements'

export const cashService = {
  async create(orgId: string, movement: {
    type: 'opening' | 'closing' | 'sale' | 'expense' | 'adjustment'
    amount: number
    balance?: number
    description?: string
    referenceId?: string
    createdBy?: string
  }): Promise<DBCashMovement> {
    if (!supabase) throw new Error('Supabase not configured')
    
    const dbMovement: Omit<DBCashMovement, 'id'> = {
      org_id: orgId,
      type: movement.type,
      amount: movement.amount,
      balance: movement.balance,
      description: movement.description,
      reference_id: movement.referenceId,
      created_by: movement.createdBy
    }

    const { data, error } = await supabase
      .from(TABLE)
      .insert(dbMovement)
      .select()
      .single()

    if (error) throw error
    return data as DBCashMovement
  },

  async getAll(orgId: string): Promise<DBCashMovement[]> {
    if (!supabase) return []
    
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as DBCashMovement[]
  },

  async getTodayMovements(orgId: string): Promise<DBCashMovement[]> {
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('org_id', orgId)
      .gte('created_at', `${today}T00:00:00`)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as DBCashMovement[]
  },

  async getBalance(orgId: string): Promise<number> {
    const movements = await this.getTodayMovements(orgId)
    return movements.reduce((acc, m) => {
      if (m.type === 'opening' || m.type === 'sale') return acc + m.amount
      if (m.type === 'expense') return acc - m.amount
      return acc
    }, 0)
  },

  async openCash(orgId: string, initialAmount: number, createdBy?: string): Promise<DBCashMovement> {
    return this.create(orgId, {
      type: 'opening',
      amount: initialAmount,
      balance: initialAmount,
      description: 'Apertura de caja',
      createdBy
    })
  },

  async closeCash(orgId: string, finalAmount: number, createdBy?: string): Promise<DBCashMovement> {
    const balance = await this.getBalance(orgId)
    return this.create(orgId, {
      type: 'closing',
      amount: finalAmount,
      balance: balance,
      description: 'Cierre de caja',
      createdBy
    })
  },

  async registerSale(orgId: string, saleId: string, amount: number): Promise<DBCashMovement> {
    const balance = await this.getBalance(orgId)
    return this.create(orgId, {
      type: 'sale',
      amount: amount,
      balance: balance + amount,
      description: 'Venta registrada',
      referenceId: saleId
    })
  }
}
