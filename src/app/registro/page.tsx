'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import OnboardingFlow from '@/app/OnboardingFlow'
import { Organization } from '@/types'
import { organizationService, productService, authService } from '@/lib/services'

export default function RegistroPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleOnboardingComplete = async (org: Organization, products: any[], isDemo: boolean) => {
    try {
      setLoading(true)
      
      // Crear organización en Supabase
      const createdOrg = await organizationService.create(org)
      
      // Crear productos
      for (const product of products) {
        await productService.create(createdOrg.id, product)
      }
      
      // Crear usuario admin
      const adminUser = await authService.createUser({
        organization_id: createdOrg.id,
        username: org.slug || 'admin',
        password: 'admin123',
        full_name: 'Administrador',
        email: org.email || 'admin@coriva.com',
        role: 'admin',
        is_active: true
      })
      
      // Guardar sesión
      sessionStorage.setItem('coriva_user', JSON.stringify(adminUser))
      sessionStorage.setItem('coriva_org', JSON.stringify(createdOrg))
      
      // Redirigir al dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Error completing onboarding:', error)
      alert('Error al crear la organización. Por favor intenta de nuevo.')
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

  return <OnboardingFlow onComplete={handleOnboardingComplete} />
}
