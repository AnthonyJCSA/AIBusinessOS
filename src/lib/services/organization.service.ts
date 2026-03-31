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
    
    // Preparar objeto de actualización limpio
    const updateData: any = {}
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.slug !== undefined) updateData.slug = updates.slug
    if (updates.business_type !== undefined) updateData.business_type = updates.business_type
    if (updates.ruc !== undefined) updateData.ruc = updates.ruc
    if (updates.address !== undefined) updateData.address = updates.address
    if (updates.phone !== undefined) updateData.phone = updates.phone
    if (updates.email !== undefined) updateData.email = updates.email
    if (updates.logo_url !== undefined) updateData.logo_url = updates.logo_url
    if (updates.digemid_establishment_code !== undefined) updateData.digemid_establishment_code = updates.digemid_establishment_code
    if (updates.settings !== undefined) updateData.settings = updates.settings
    if (updates.is_active !== undefined) updateData.is_active = updates.is_active
    
    const { data, error } = await supabase
      .from(TABLE)
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Organization
  }
}
