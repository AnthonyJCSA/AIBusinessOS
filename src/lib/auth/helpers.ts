import { createClient as createServerClient } from './supabase-server'
import { User, Organization } from '@/types'

/**
 * Obtiene el usuario autenticado y su organización
 * Solo para Server Components y API Routes
 */
export async function getAuthUser(): Promise<{ user: User; org: Organization } | null> {
  const supabase = createServerClient()
  
  const { data: { user: authUser }, error } = await supabase.auth.getUser()
  
  if (error || !authUser) {
    return null
  }

  // Obtener datos del usuario desde nuestra tabla
  const { data: userData, error: userError } = await supabase
    .from('corivacore_users')
    .select('*, org:corivacore_organizations(*)')
    .eq('auth_user_id', authUser.id)
    .eq('is_active', true)
    .single()

  if (userError || !userData) {
    return null
  }

  const user: User = {
    id: userData.id,
    organization_id: userData.org_id,
    username: userData.username,
    email: userData.email,
    full_name: userData.full_name,
    role: userData.role,
    is_active: userData.is_active,
    created_at: userData.created_at,
  }

  const org: Organization = {
    id: userData.org.id,
    name: userData.org.name,
    slug: userData.org.slug,
    business_type: userData.org.business_type,
    ruc: userData.org.ruc,
    address: userData.org.address,
    phone: userData.org.phone,
    email: userData.org.email,
    logo_url: userData.org.logo_url,
    digemid_establishment_code: userData.org.digemid_establishment_code,
    settings: userData.org.settings,
    is_active: userData.org.is_active,
    created_at: userData.org.created_at,
    updated_at: userData.org.updated_at,
  }

  return { user, org }
}

/**
 * Verifica si el usuario tiene un rol específico
 */
export async function hasRole(allowedRoles: string[]): Promise<boolean> {
  const authData = await getAuthUser()
  if (!authData) return false
  return allowedRoles.includes(authData.user.role)
}

/**
 * Verifica si Supabase está configurado correctamente
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  return !!(
    url && 
    key && 
    !url.includes('placeholder') && 
    !key.includes('placeholder')
  )
}
