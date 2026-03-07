'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import OnboardingFlow from '@/app/OnboardingFlow'
import { Organization } from '@/types'
import { productService, authService } from '@/lib/services'
import { v4 as uuidv4 } from 'uuid'

export default function RegistroPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleOnboardingComplete = async (org: Organization, products: any[], isDemo: boolean) => {
    try {
      setLoading(true)
      
      // Crear ID único para la organización
      const orgId = uuidv4()
      const createdOrg = { ...org, id: orgId }
      
      // Guardar organización en localStorage
      const orgs = JSON.parse(localStorage.getItem('coriva_organizations') || '[]')
      orgs.push(createdOrg)
      localStorage.setItem('coriva_organizations', JSON.stringify(orgs))
      
      // Guardar productos en localStorage
      const allProducts = JSON.parse(localStorage.getItem('coriva_products') || '[]')
      const newProducts = products.map(p => ({ ...p, organization_id: orgId, id: uuidv4() }))
      localStorage.setItem('coriva_products', JSON.stringify([...allProducts, ...newProducts]))
      
      // Crear usuario admin
      const adminUser = {
        id: uuidv4(),
        organization_id: orgId,
        username: org.slug || 'admin',
        full_name: 'Administrador',
        email: org.email,
        role: 'admin',
        is_active: true
      }
      
      const allUsers = JSON.parse(localStorage.getItem('coriva_users') || '[]')
      allUsers.push(adminUser)
      localStorage.setItem('coriva_users', JSON.stringify(allUsers))
      
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
