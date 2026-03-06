import { supabase } from '../supabase'
import { DBCustomer } from '@/types/database.types'

const TABLE = 'corivacore_customers'

export const customerService = {
  async getAll(orgId: string): Promise<DBCustomer[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('org_id', orgId)
      .eq('is_active', true)
      .order('name')

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
  }): Promise<DBCustomer> {
    const dbCustomer: Omit<DBCustomer, 'id'> = {
      org_id: orgId,
      name: customer.name,
      document_type: customer.documentType,
      document_number: customer.documentNumber,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      is_active: true
    }

    const { data, error } = await supabase
      .from(TABLE)
      .insert(dbCustomer)
      .select()
      .single()

    if (error) throw error
    return data as DBCustomer
  },

  async update(id: string, updates: Partial<DBCustomer>): Promise<DBCustomer> {
    const { data, error } = await supabase
      .from(TABLE)
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as DBCustomer
  },

  async search(orgId: string, query: string): Promise<DBCustomer[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('org_id', orgId)
      .or(`name.ilike.%${query}%,document_number.ilike.%${query}%,phone.ilike.%${query}%`)
      .limit(10)

    if (error) throw error
    return data as DBCustomer[]
  }
}
