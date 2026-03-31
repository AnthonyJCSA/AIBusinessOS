'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import OnboardingWizard from '@/app/OnboardingWizard'
import { Organization } from '@/types'
import { createBrowserClient } from '@/lib/auth'

export default function RegistroPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleComplete = async (
    org: Organization, 
    _products: any[], 
    userData: { full_name: string; username: string; password: string; email: string }
  ) => {
    try {
      setLoading(true)
      setError('')
      
      // Validar email
      if (!userData.email || !userData.email.includes('@')) {
        throw new Error('Email inválido')
      }

      // Validar contraseña
      if (!userData.password || userData.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres')
      }

      // Llamar al API route para crear todo el registro
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization: org,
          user: userData,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear la cuenta')
      }

      // Login automático después del registro
      const supabase = createBrowserClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: userData.password,
      })

      if (signInError) {
        throw new Error('Cuenta creada pero error al iniciar sesión. Intenta iniciar sesión manualmente.')
      }

      // Redirigir al dashboard
      router.push('/dashboard')
      router.refresh()
      
    } catch (error: any) {
      console.error('Error en registro:', error)
      setError(error?.message || 'Error desconocido al crear la cuenta')
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
    <div>
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-md">
          <p className="font-semibold">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
      <OnboardingWizard
        onComplete={handleComplete}
        businessType={undefined}
      />
    </div>
  )
}
