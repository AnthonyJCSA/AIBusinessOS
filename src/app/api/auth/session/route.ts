import { NextResponse } from 'next/server'
import { createClient } from '@/lib/auth/supabase-server'

export async function GET() {
  try {
    const supabase = createClient()
    
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !authUser) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { data: userData, error: userError } = await supabase
      .from('corivacore_users')
      .select('*, org:corivacore_organizations(*)')
      .eq('auth_user_id', authUser.id)
      .eq('is_active', true)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const user = {
      id: userData.id,
      organization_id: userData.org_id,
      username: userData.username,
      email: userData.email,
      full_name: userData.full_name,
      role: userData.role,
      is_active: userData.is_active,
      created_at: userData.created_at,
    }

    const org = {
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

    return NextResponse.json({ user, org })
  } catch (error) {
    console.error('Error en /api/auth/session:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
