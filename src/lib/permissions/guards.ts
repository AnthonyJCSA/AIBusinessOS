import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/auth/supabase-server'
import { hasRole, canAccessModule } from './roles'
import type { Role } from './roles'

export async function requireAuth(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }
  
  const { data: userData } = await supabase
    .from('corivacore_users')
    .select('id, role, org_id')
    .eq('auth_user_id', user.id)
    .single()
  
  if (!userData) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
  }
  
  return { user: userData, supabase }
}

export async function requireRole(req: NextRequest, requiredRole: Role) {
  const authResult = await requireAuth(req)
  
  if (authResult instanceof NextResponse) {
    return authResult
  }
  
  const { user } = authResult
  
  if (!hasRole(user.role as Role, requiredRole)) {
    return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 })
  }
  
  return authResult
}

export async function requireModule(req: NextRequest, module: string) {
  const authResult = await requireAuth(req)
  
  if (authResult instanceof NextResponse) {
    return authResult
  }
  
  const { user } = authResult
  
  if (!canAccessModule(user.role as Role, module)) {
    return NextResponse.json({ error: 'Acceso denegado al modulo' }, { status: 403 })
  }
  
  return authResult
}
