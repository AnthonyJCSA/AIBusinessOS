import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export interface CashSession {
  id: string
  org_id: string
  opened_by: string
  closed_by?: string
  opening_amount: number
  closing_amount?: number
  expected_amount?: number
  difference?: number
  status: 'open' | 'closed'
  opened_at: string
  closed_at?: string
  notes?: string
}

export const cashSessionService = {
  async getActive(orgId: string): Promise<CashSession | null> {
    if (!isSupabaseConfigured()) return null
    const { data } = await supabase
      .from('corivacore_cash_sessions')
      .select('*')
      .eq('org_id', orgId)
      .eq('status', 'open')
      .order('opened_at', { ascending: false })
      .limit(1)
      .single()
    return data as CashSession | null
  },

  async open(orgId: string, openingAmount: number, userId: string): Promise<CashSession> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from('corivacore_cash_sessions')
      .insert({ org_id: orgId, opening_amount: openingAmount, opened_by: userId, status: 'open' })
      .select().single()
    if (error) throw error
    return data as CashSession
  },

  async close(sessionId: string, closingAmount: number, expectedAmount: number, userId: string, notes?: string): Promise<void> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured')
    const { error } = await supabase
      .from('corivacore_cash_sessions')
      .update({
        closing_amount: closingAmount,
        expected_amount: expectedAmount,
        difference: closingAmount - expectedAmount,
        closed_by: userId,
        status: 'closed',
        closed_at: new Date().toISOString(),
        notes,
      })
      .eq('id', sessionId)
    if (error) throw error
  },

  async getHistory(orgId: string, limit = 20): Promise<CashSession[]> {
    if (!isSupabaseConfigured()) return []
    const { data } = await supabase
      .from('corivacore_cash_sessions')
      .select('*')
      .eq('org_id', orgId)
      .order('opened_at', { ascending: false })
      .limit(limit)
    return (data as CashSession[]) || []
  },
}
