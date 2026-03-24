import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { DBCustomer } from '@/types/database.types'

export type Segment = 'nuevo' | 'regular' | 'frecuente' | 'vip' | 'inactivo'

export interface CRMStats {
  total: number
  active: number
  vip: number
  newThisMonth: number
  inactive: number
  avgTicket: number
  totalRevenue: number
  retentionRate: number
}

export interface CustomerWithSegment extends DBCustomer {
  computed_segment: Segment
  days_since_last_purchase: number | null
}

export const crmService = {
  // Calcula segmento automáticamente basado en comportamiento real
  computeSegment(customer: DBCustomer): Segment {
    const daysSince = customer.last_purchase_at
      ? Math.floor((Date.now() - new Date(customer.last_purchase_at).getTime()) / 86400000)
      : null

    if (daysSince !== null && daysSince > 60) return 'inactivo'
    if ((customer.total_purchases ?? 0) >= 10 || (customer.total_spent ?? 0) >= 1000) return 'vip'
    if ((customer.total_purchases ?? 0) >= 4) return 'frecuente'

    const daysOld = customer.created_at
      ? Math.floor((Date.now() - new Date(customer.created_at).getTime()) / 86400000)
      : 999
    if (daysOld <= 14) return 'nuevo'

    return 'regular'
  },

  async getAll(orgId: string): Promise<CustomerWithSegment[]> {
    if (!isSupabaseConfigured()) return []
    const { data, error } = await supabase
      .from('corivacore_customers')
      .select('*')
      .eq('org_id', orgId)
      .eq('is_active', true)
      .order('total_spent', { ascending: false })
    if (error) throw error

    return (data as DBCustomer[]).map(c => ({
      ...c,
      computed_segment: crmService.computeSegment(c),
      days_since_last_purchase: c.last_purchase_at
        ? Math.floor((Date.now() - new Date(c.last_purchase_at).getTime()) / 86400000)
        : null,
    }))
  },

  async getStats(orgId: string): Promise<CRMStats> {
    if (!isSupabaseConfigured()) return {
      total: 0, active: 0, vip: 0, newThisMonth: 0,
      inactive: 0, avgTicket: 0, totalRevenue: 0, retentionRate: 0,
    }
    const customers = await crmService.getAll(orgId)
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const vip      = customers.filter(c => c.computed_segment === 'vip').length
    const inactive = customers.filter(c => c.computed_segment === 'inactivo').length
    const newMonth = customers.filter(c => c.created_at && c.created_at >= monthStart).length
    const totalRev = customers.reduce((s, c) => s + (c.total_spent ?? 0), 0)
    const totalPur = customers.reduce((s, c) => s + (c.total_purchases ?? 0), 0)
    const avgTicket = totalPur > 0 ? totalRev / totalPur : 0
    const active   = customers.filter(c => c.computed_segment !== 'inactivo').length
    const retentionRate = customers.length > 0
      ? Math.round((active / customers.length) * 100)
      : 0

    return {
      total: customers.length, active, vip, newThisMonth: newMonth,
      inactive, avgTicket, totalRevenue: totalRev, retentionRate,
    }
  },

  async getInactive(orgId: string, daysSince = 30): Promise<CustomerWithSegment[]> {
    if (!isSupabaseConfigured()) return []
    const cutoff = new Date(Date.now() - daysSince * 86400000).toISOString()
    const { data, error } = await supabase
      .from('corivacore_customers')
      .select('*')
      .eq('org_id', orgId)
      .eq('is_active', true)
      .lt('last_purchase_at', cutoff)
      .order('last_purchase_at', { ascending: true })
      .limit(20)
    if (error) throw error
    return (data as DBCustomer[]).map(c => ({
      ...c,
      computed_segment: 'inactivo' as Segment,
      days_since_last_purchase: Math.floor(
        (Date.now() - new Date(c.last_purchase_at!).getTime()) / 86400000
      ),
    }))
  },

  // Actualiza segmento en BD
  async syncSegment(customerId: string, segment: Segment): Promise<void> {
    if (!isSupabaseConfigured()) return
    await supabase
      .from('corivacore_customers')
      .update({ segment })
      .eq('id', customerId)
  },
}
