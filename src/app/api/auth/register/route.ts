import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/auth/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { organization, user } = body

    if (!organization || !user) {
      return NextResponse.json(
        { error: 'Datos incompletos' },
        { status: 400 }
      )
    }

    // Validaciones
    if (!user.email || !user.email.includes('@')) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    if (!user.password || user.password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      )
    }

    if (!organization.name || !organization.name.trim()) {
      return NextResponse.json(
        { error: 'Nombre del negocio requerido' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // 1. Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        full_name: user.full_name,
        username: user.username,
      },
    })

    if (authError || !authData.user) {
      console.error('Error creando usuario en Auth:', authError)
      return NextResponse.json(
        { error: `Error al crear usuario: ${authError?.message || 'Error desconocido'}` },
        { status: 500 }
      )
    }

    const authUserId = authData.user.id

    try {
      // 2. Crear organización
      const orgId = crypto.randomUUID()
      const { data: orgData, error: orgError } = await supabase
        .from('corivacore_organizations')
        .insert({
          id: orgId,
          slug: organization.slug,
          name: organization.name,
          business_type: organization.business_type,
          ruc: organization.ruc || null,
          address: organization.address || null,
          phone: organization.phone || null,
          email: organization.email || null,
          settings: organization.settings || { currency: 'S/', tax_rate: 0.18, plan: 'pro' },
          is_active: true,
        })
        .select()
        .single()

      if (orgError) {
        await supabase.auth.admin.deleteUser(authUserId)
        console.error('Error creando organización:', orgError)
        return NextResponse.json(
          { error: `Error al crear organización: ${orgError.message}` },
          { status: 500 }
        )
      }

      // 3. Crear usuario en nuestra tabla
      const userId = crypto.randomUUID()
      const { error: userError } = await supabase
        .from('corivacore_users')
        .insert({
          id: userId,
          org_id: orgId,
          auth_user_id: authUserId,
          username: user.username,
          email: user.email,
          full_name: user.full_name,
          role: 'OWNER',
          is_active: true,
        })

      if (userError) {
        await supabase.from('corivacore_organizations').delete().eq('id', orgId)
        await supabase.auth.admin.deleteUser(authUserId)
        console.error('Error creando usuario en tabla:', userError)
        return NextResponse.json(
          { error: `Error al crear usuario: ${userError.message}` },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Cuenta creada exitosamente',
        data: {
          userId,
          orgId,
          authUserId,
        },
      })

    } catch (error: any) {
      await supabase.auth.admin.deleteUser(authUserId)
      console.error('Error en proceso de registro:', error)
      return NextResponse.json(
        { error: error.message || 'Error en el proceso de registro' },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('Error en registro:', error)
    return NextResponse.json(
      { error: error.message || 'Error desconocido' },
      { status: 500 }
    )
  }
}
