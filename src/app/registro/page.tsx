'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import OnboardingWizard from '@/app/OnboardingWizard'
import { Organization } from '@/types'
import { organizationService, authService } from '@/lib/services'

export default function RegistroPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleComplete = async (org: Organization, _products: any[], userData: { full_name: string; username: string; password: string; email: string }) => {
    try {
      setLoading(true)

      // 1. Crear organización — Supabase genera el UUID real
      const createdOrg = await organizationService.create(org)

      // 2. Crear usuario admin con el UUID real de la org
      const adminUser = await authService.createUser({
        organization_id: createdOrg.id,   // UUID real de Supabase
        username:        userData.username,
        password:        userData.password,
        full_name:       userData.full_name,
        email:           userData.email || createdOrg.email || '',
        role:            'OWNER',
        is_active:       true,
      })

      // 3. Guardar sesión y redirigir
      sessionStorage.setItem('coriva_user', JSON.stringify(adminUser))
      sessionStorage.setItem('coriva_org',  JSON.stringify(createdOrg))

      window.location.href = '/dashboard'
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
