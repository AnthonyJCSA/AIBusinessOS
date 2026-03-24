'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import OnboardingWizard from '@/app/OnboardingWizard'
import { Organization } from '@/types'
import { organizationService, productService, authService } from '@/lib/services'
import { useSessionStore } from '@/state/session.store'

export default function RegistroPage() {
  const router = useRouter()
  const setSession = useSessionStore((s) => s.setSession)
  const [loading, setLoading] = useState(false)

  const handleOnboardingComplete = async (org: Organization, products: any[], isDemo: boolean) => {
    try {
      setLoading(true)
      
      console.log('Creating organization:', org)
      
      // Crear organización en Supabase
      const createdOrg = await organizationService.create(org)
      console.log('Organization created:', createdOrg)
      
      // Crear productos
      console.log('Creating products:', products.length)
      for (const product of products) {
        await productService.create(createdOrg.id, product)
      }
      console.log('Products created')
      
      // Crear usuario admin
      console.log('Creating admin user')
      const adminUser = await authService.createUser({
        organization_id: createdOrg.id,
        username: org.slug || 'admin',
        password: 'admin123',
        full_name: 'Administrador',
        email: org.email || 'admin@coriva.com',
        role: 'ADMIN',
        is_active: true
      })
      console.log('Admin user created:', adminUser)
      
      // Asegurar que createdOrg tenga todos los campos necesarios
      const completeOrg = {
        ...createdOrg,
        logo_url: createdOrg.logo_url || null
      }
      
      // Guardar sesión con Zustand
      setSession(adminUser, completeOrg)

      // Redirigir al dashboard
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Error completing onboarding:', error)
      const errorMessage = error?.message || error?.code || 'Error desconocido'
      alert(`Error al crear la organización: ${errorMessage}`)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Creando tu organización...</p>
        </div>
      </div>
    )
  }

  return (
    <OnboardingWizard
      onComplete={(org, products) => handleOnboardingComplete(org, products, false)}
      businessType={undefined}
    />
  )
}
