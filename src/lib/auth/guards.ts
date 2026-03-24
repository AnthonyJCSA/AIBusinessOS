import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Role } from '@/lib/permissions'

/**
 * Verifica que haya sesión activa.
 * Redirige a /login si no hay sesión.
 * Usar en Server Components y layouts del dashboard.
 */
export async function requireAuth() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')
  return session
}

/**
 * Verifica sesión + rol del usuario.
 * Redirige a /dashboard si el rol no está permitido.
 */
export async function requireRole(allowedRoles: Role[]) {
  const session = await requireAuth()
  const supabase = createClient()

  const { data: user } = await supabase
    .from('corivacore_users')
    .select('role, org_id')
    .eq('id', session.user.id)
    .single()

  if (!user || !allowedRoles.includes(user.role as Role)) {
    redirect('/dashboard')
  }

  return { session, role: user.role as Role, orgId: user.org_id }
}

/**
 * Obtiene el usuario y org actuales desde el servidor.
 * Útil para layouts que necesitan datos del usuario sin redirigir.
 */
export async function getServerSession() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null

  const { data: user } = await supabase
    .from('corivacore_users')
    .select('*, org:corivacore_organizations(*)')
    .eq('id', session.user.id)
    .single()

  return user ?? null
}
