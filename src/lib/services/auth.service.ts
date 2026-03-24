import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { User, Organization } from '@/types'

export const authService = {
  async login(username: string, password: string): Promise<{ user: User; org: Organization } | null> {
    if (!isSupabaseConfigured()) return null

    const { data: users, error } = await supabase
      .from('corivacore_users')
      .select('*, org:corivacore_organizations(*)')
      .eq('username', username)
      .eq('is_active', true)
      .single()

    if (error || !users) return null

    // En producción, verificar password_hash con bcrypt
    // Por ahora, comparación simple (SOLO PARA DEMO)
    if (users.password_hash !== password) return null

    const user: User = {
      id: users.id,
      organization_id: users.org_id,
      username: users.username,
      email: users.email,
      full_name: users.full_name,
      role: users.role,
      is_active: users.is_active,
      created_at: users.created_at
    }

    const org: Organization = {
      id: users.org.id,
      name: users.org.name,
      slug: users.org.slug,
      business_type: users.org.business_type,
      ruc: users.org.ruc,
      address: users.org.address,
      phone: users.org.phone,
      email: users.org.email,
      logo_url: users.org.logo_url,
      settings: users.org.settings,
      is_active: users.org.is_active,
      created_at: users.org.created_at,
      updated_at: users.org.updated_at
    }

    return { user, org }
  },

  async createUser(userData: {
    organization_id: string
    username: string
    password: string
    full_name: string
    email: string
    role: string
    is_active: boolean
  }): Promise<User> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured')

    // Generar ID único
    const userId = `user_${Date.now()}`

    const { data, error } = await supabase
      .from('corivacore_users')
      .insert({
        id: userId,
        org_id: userData.organization_id,
        username: userData.username,
        password_hash: userData.password, // En producción usar bcrypt
        full_name: userData.full_name,
        email: userData.email,
        role: userData.role,
        is_active: userData.is_active
      })
      .select()
      .single()

    if (error) throw error
    
    return {
      id: data.id,
      organization_id: data.org_id,
      username: data.username,
      email: data.email,
      full_name: data.full_name,
      role: data.role,
      is_active: data.is_active,
      created_at: data.created_at
    }
  },

  async getOrganization(orgId: string): Promise<Organization | null> {
    if (!isSupabaseConfigured()) return null

    const { data, error } = await supabase
      .from('corivacore_organizations')
      .select('*')
      .eq('id', orgId)
      .single()

    if (error || !data) return null

    return data as Organization
  }
}
