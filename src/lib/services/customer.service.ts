import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { DBCustomer } from '@/types/database.types'

const TABLE = 'corivacore_customers'

export const customerService = {
  async getAll(orgId: string): Promise<DBCustomer[]> {
    if (!isSupabaseConfigured()) return []
    const { data, error } = await supabase
      .from(TABLE).select('*')
      .eq('org_id', orgId).eq('is_active', true).order('name')
    if (error) throw error
    return data as DBCustomer[]
  },

  async create(orgId: string, customer: {
    name: string
    documentType?: string
    documentNumber?: string
    phone?: string
    email?: string
    address?: string
    birthDate?: string
    notes?: string
  }): Promise<DBCustomer> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        org_id:          orgId,
        name:            customer.name,
        document_type:   customer.documentType,
        document_number: customer.documentNumber,
        phone:           customer.phone,
        email:           customer.email,
        address:         customer.address,
        birth_date:      customer.birthDate || null,
        notes:           customer.notes,
        segment:         'nuevo',
        is_active:       true,
      })
      .select().single()
    if (error) throw error
    return data as DBCustomer
  },

  async update(id: string, updates: Partial<DBCustomer>): Promise<DBCustomer> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from(TABLE).update(updates).eq('id', id).select().single()
    if (error) throw error
    return data as DBCustomer
  },

  async search(orgId: string, query: string): Promise<DBCustomer[]> {
    if (!isSupabaseConfigured()) return []
    const { data, error } = await supabase
      .from(TABLE).select('*').eq('org_id', orgId)
      .or(`name.ilike.%${query}%,document_number.ilike.%${query}%,phone.ilike.%${query}%`)
      .limit(10)
    if (error) throw error
    return data as DBCustomer[]
  },

  async getBySegment(orgId: string, segment: DBCustomer['segment']): Promise<DBCustomer[]> {
    if (!isSupabaseConfigured()) return []
    const { data, error } = await supabase
      .from(TABLE).select('*')
      .eq('org_id', orgId).eq('segment', segment).eq('is_active', true)
    if (error) throw error
    return data as DBCustomer[]
  },

  async getTopCustomers(orgId: string, limit = 10): Promise<DBCustomer[]> {
    if (!isSupabaseConfigured()) return []
    const { data, error } = await supabase
      .from(TABLE).select('*')
      .eq('org_id', orgId).eq('is_active', true)
      .order('total_spent', { ascending: false })
      .limit(limit)
    if (error) throw error
    return data as DBCustomer[]
  },
}
