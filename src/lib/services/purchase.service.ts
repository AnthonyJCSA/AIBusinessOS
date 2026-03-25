import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export interface Supplier {
  id: string
  org_id: string
  name: string
  contact_name?: string
  phone?: string
  email?: string
  ruc?: string
  address?: string
  notes?: string
  is_active?: boolean
  created_at?: string
}

export interface PurchaseItem {
  product_id?: string
  product_name: string
  quantity: number
  unit_cost: number
  subtotal: number
}

export interface Purchase {
  id: string
  org_id: string
  supplier_id?: string
  purchase_number?: string
  status: 'pending' | 'received' | 'partial' | 'cancelled'
  total: number
  notes?: string
  expected_at?: string
  received_at?: string
  created_by?: string
  created_at?: string
  supplier?: Supplier
  items?: PurchaseItem[]
}

export const purchaseService = {
  async getSuppliers(orgId: string): Promise<Supplier[]> {
    if (!isSupabaseConfigured()) return []
    const { data, error } = await supabase
      .from('corivacore_suppliers')
      .select('*').eq('org_id', orgId).eq('is_active', true).order('name')
    if (error) throw error
    return data as Supplier[]
  },

  async createSupplier(orgId: string, supplier: Omit<Supplier, 'id' | 'org_id' | 'created_at'>): Promise<Supplier> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from('corivacore_suppliers').insert({ ...supplier, org_id: orgId }).select().single()
    if (error) throw error
    return data as Supplier
  },

  async getAll(orgId: string): Promise<Purchase[]> {
    if (!isSupabaseConfigured()) return []
    const { data, error } = await supabase
      .from('corivacore_purchases')
      .select('*, supplier:corivacore_suppliers(name, phone), items:corivacore_purchase_items(*)')
      .eq('org_id', orgId).order('created_at', { ascending: false }).limit(50)
    if (error) throw error
    return data as Purchase[]
  },

  async create(orgId: string, purchase: { supplier_id?: string; items: PurchaseItem[]; notes?: string; expected_at?: string; created_by?: string }): Promise<Purchase> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured')
    const { data: numData } = await supabase.rpc('generate_purchase_number', { p_org_id: orgId })
    const total = purchase.items.reduce((s, i) => s + i.subtotal, 0)
    const { data, error } = await supabase
      .from('corivacore_purchases')
      .insert({ org_id: orgId, supplier_id: purchase.supplier_id ?? null, purchase_number: numData ?? `OC-${Date.now()}`, status: 'pending', total, notes: purchase.notes, expected_at: purchase.expected_at ?? null, created_by: purchase.created_by })
      .select().single()
    if (error) throw error
    const items = purchase.items.map(i => ({ ...i, purchase_id: data.id }))
    const { error: ie } = await supabase.from('corivacore_purchase_items').insert(items)
    if (ie) throw ie
    return data as Purchase
  },

  async receive(purchaseId: string, receivedBy?: string): Promise<void> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured')
    const { error } = await supabase.rpc('receive_purchase', { p_purchase_id: purchaseId, p_received_by: receivedBy ?? null })
    if (error) throw error
  },

  async cancel(purchaseId: string): Promise<void> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured')
    const { error } = await supabase.from('corivacore_purchases').update({ status: 'cancelled' }).eq('id', purchaseId)
    if (error) throw error
  },
}
