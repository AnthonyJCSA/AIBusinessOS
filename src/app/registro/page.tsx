'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import OnboardingWizard from '@/app/OnboardingWizard'
import { Organization } from '@/types'
import { organizationService } from '@/lib/services'
import { createBrowserClient } from '@/lib/auth'

export default function RegistroPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleComplete = async (
    org: Organization, 
    _products: any[], 
    userData: { full_name: string; username: string; password: string; email: string }
  ) => {
    try {
      setLoading(true)
      const supabase = createBrowserClient()

      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.full_name,
            username: userData.username,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (authError) {
        throw new Error(`Error al crear usuario: ${authError.message}`)
      }

      if (!authData.user) {
        throw new Error('No se pudo crear el usuario en Supabase Auth')
      }

      const authUserId = authData.user.id

      // 2. Crear organización
      const createdOrg = await organizationService.create(org)

      // 3. Crear usuario en nuestra tabla con auth_user_id
      const { error: userError } = await supabase
        .from('corivacore_users')
        .insert({
          id: crypto.randomUUID(),
          org_id: createdOrg.id,
          auth_user_id: authUserId,
          username: userData.username,
          email: userData.email,
          full_name: userData.full_name,
          role: 'OWNER',
          is_active: true,
        })

      if (userError) {
        // Si falla, eliminar usuario de Supabase Auth
        await supabase.auth.admin.deleteUser(authUserId)
        throw new Error(`Error al crear usuario en base de datos: ${userError.message}`)
      }

      // 4. Login automático (ya está logueado por signUp)
      // Supabase Auth ya creó la sesión automáticamente
      
      // 5. Redirigir al dashboard
      router.push('/dashboard')
      router.refresh()
      
    } catch (error: any) {
      console.error('Error en registro:', error)
      alert(`Error al crear la cuenta: ${error?.message || 'Error desconocido'}`)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAFAF8' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: '#0C0E12', borderTopColor: 'transparent' }} />
          <p className="text-sm font-semibold" style={{ color: '#6B7280' }}>Creando tu cuenta...</p>
        </div>
      </div>
    )
  }

  return (
    <OnboardingWizard
      onComplete={handleComplete}
      businessType={undefined}
    />
  )
}
