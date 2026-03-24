import { supabase, isSupabaseConfigured } from '@/lib/supabase'

const SESSIONS_TABLE  = 'corivacore_cash_sessions'
const MOVEMENTS_TABLE = 'corivacore_cash_movements'

export interface CashSession {
  id: string
  org_id: string
  opened_by?: string
  closed_by?: string
  opening_amount: number
  expected_amount?: number
  counted_amount?: number
  difference?: number
  status: 'open' | 'closed'
  notes?: string
  opened_at: string
  closed_at?: string
}

export const cashSessionService = {
  async getActive(orgId: string): Promise<CashSession | null> {
    if (!isSupabaseConfigured()) return null
    const { data } = await supabase
      .from(SESSIONS_TABLE)
      .select('*')
      .eq('org_id', orgId)
      .eq('status', 'open')
      .order('opened_at', { ascending: false })
      .limit(1)
      .single()
    return data as CashSession | null
  },

  async open(orgId: string, openingAmount: number, openedBy?: string): Promise<CashSession> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from(SESSIONS_TABLE)
      .insert({ org_id: orgId, opening_amount: openingAmount, opened_by: openedBy, status: 'open' })
      .select()
      .single()
    if (error) throw error
    return data as CashSession
  },

  async close(
    sessionId: string,
    orgId: string,
    countedAmount: number,
    closedBy?: string,
    notes?: string
  ): Promise<CashSession> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured')

    // Calcular monto esperado desde movimientos del día
    const { data: movements } = await supabase
      .from(MOVEMENTS_TABLE)
      .select('type, amount')
      .eq('org_id', orgId)
      .gte('created_at', new Date().toISOString().split('T')[0] + 'T00:00:00')

    const expected = (movements ?? []).reduce((sum, m) => {
      if (m.type === 'opening' || m.type === 'sale') return sum + (m.amount ?? 0)
      if (m.type === 'expense' || m.type === 'refund') return sum - (m.amount ?? 0)
      return sum
    }, 0)

    const { data, error } = await supabase
      .from(SESSIONS_TABLE)
      .update({
        status: 'closed',
        closed_by: closedBy,
        counted_amount: countedAmount,
        expected_amount: expected,
        closed_at: new Date().toISOString(),
        notes,
      })
      .eq('id', sessionId)
      .select()
      .single()
    if (error) throw error
    return data as CashSession
  },

  async getHistory(orgId: string, limit = 10): Promise<CashSession[]> {
    if (!isSupabaseConfigured()) return []
    const { data } = await supabase
      .from(SESSIONS_TABLE)
      .select('*')
      .eq('org_id', orgId)
      .order('opened_at', { ascending: false })
      .limit(limit)
    return (data ?? []) as CashSession[]
  },
}
