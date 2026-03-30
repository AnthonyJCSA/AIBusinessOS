import { supabase, isSupabaseConfigured } from '../supabase'
import { Organization } from '@/types'

const TABLE = 'corivacore_organizations'

export const organizationService = {
  async create(org: Omit<Organization, 'id' | 'created_at' | 'updated_at'>): Promise<Organization> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured')

    // La tabla usa id TEXT — generamos un UUID v4 real en el código
    const orgId = crypto.randomUUID()

    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        id:            orgId,
        slug:          org.slug,
        name:          org.name,
        business_type: org.business_type,
        ruc:           org.ruc     || null,
        address:       org.address || null,
        phone:         org.phone   || null,
        email:         org.email   || null,
        settings:      org.settings,
        is_active:     org.is_active !== false,
      })
      .select()
      .single()

    if (error) throw error
    return data as Organization
  },

  async getById(id: string): Promise<Organization | null> {
    if (!isSupabaseConfigured()) return null
    
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null
    return data as Organization
  },

  async getBySlug(slug: string): Promise<Organization | null> {
    if (!isSupabaseConfigured()) return null

    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error) return null
    return data as Organization
  },

  async update(id: string, updates: Partial<Organization>): Promise<Organization> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from(TABLE)
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Organization
  }
}
