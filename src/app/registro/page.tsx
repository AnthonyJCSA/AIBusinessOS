'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import OnboardingWizard from '@/app/OnboardingWizard'
import { Organization } from '@/types'
import { createBrowserClient } from '@/lib/auth'

export default function RegistroPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'form' | 'payment'>('form')
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'premium'>('pro')
  const [orgData, setOrgData] = useState<any>(null)

  // Verificar si viene con step=payment en la URL
  useEffect(() => {
    const stepParam = searchParams.get('step')
    if (stepParam === 'payment') {
      // Cargar datos de la sesión actual
      const loadCurrentOrg = async () => {
        const supabase = createBrowserClient()
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          const response = await fetch('/api/auth/session')
          if (response.ok) {
            const { org } = await response.json()
            setOrgData({ orgId: org.id, email: session.user.email })
            setStep('payment')
          }
        }
      }
      loadCurrentOrg()
    }
  }, [searchParams])

  const handleComplete = async (
    org: Organization, 
    _products: any[], 
    userData: { full_name: string; username: string; password: string; email: string }
  ) => {
    try {
      setLoading(true)
      setError('')
      
      if (!userData.email || !userData.email.includes('@')) {
        throw new Error('Email inválido')
      }

      if (!userData.password || userData.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres')
      }

      const supabase = createBrowserClient()

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.full_name,
            username: userData.username,
          },
        },
      })

      if (authError || !authData.user) {
        throw new Error(`Error al crear usuario: ${authError?.message || 'Error desconocido'}`)
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization: org,
          user: userData,
          authUserId: authData.user.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        await supabase.auth.signOut()
        throw new Error(data.error || 'Error al crear la cuenta')
      }

      // Guardar datos para el pago
      setOrgData({ orgId: data.data.orgId, email: userData.email })
      setStep('payment')
      setLoading(false)
      
    } catch (error: any) {
      console.error('Error en registro:', error)
      setError(error?.message || 'Error desconocido al crear la cuenta')
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    try {
      setLoading(true)
      setError('')
      
      console.log('Iniciando pago con:', { plan: selectedPlan, orgId: orgData.orgId })
      
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selectedPlan,
          orgId: orgData.orgId,
        }),
      })

      const data = await response.json()
      console.log('Respuesta de checkout:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear checkout')
      }

      if (!data.url) {
        throw new Error('No se recibió URL de pago')
      }

      window.location.href = data.url
      
    } catch (error: any) {
      console.error('Error en pago:', error)
      setError(error?.message || 'Error al procesar el pago')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAFAF8' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: '#0C0E12', borderTopColor: 'transparent' }} />
          <p className="text-sm font-semibold" style={{ color: '#6B7280' }}>
            {step === 'form' ? 'Creando tu cuenta...' : 'Redirigiendo al pago...'}
          </p>
        </div>
      </div>
    )
  }

  if (step === 'payment') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#FAFAF8' }}>
        <div className="w-full max-w-2xl">
          <h1 className="text-3xl font-bold mb-8 text-center">Selecciona tu plan</h1>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div 
              onClick={() => setSelectedPlan('pro')}
              className={`p-6 rounded-xl cursor-pointer transition-all ${
                selectedPlan === 'pro' ? 'ring-2 ring-indigo-600' : ''
              }`}
              style={{ background: '#fff', border: '2px solid #e5e7eb' }}
            >
              <h3 className="text-xl font-bold mb-2">Plan Pro</h3>
              <p className="text-3xl font-bold mb-4">S/ 99<span className="text-sm">/mes</span></p>
              <ul className="space-y-2 text-sm">
                <li>✓ POS completo</li>
                <li>✓ Inventario y caja</li>
                <li>✓ CRM y reportes</li>
                <li>✓ Facturación SUNAT</li>
              </ul>
            </div>

            <div 
              onClick={() => setSelectedPlan('premium')}
              className={`p-6 rounded-xl cursor-pointer transition-all ${
                selectedPlan === 'premium' ? 'ring-2 ring-indigo-600' : ''
              }`}
              style={{ background: '#fff', border: '2px solid #e5e7eb' }}
            >
              <h3 className="text-xl font-bold mb-2">Plan Premium</h3>
              <p className="text-3xl font-bold mb-4">S/ 199<span className="text-sm">/mes</span></p>
              <ul className="space-y-2 text-sm">
                <li>✓ Todo en Pro</li>
                <li>✓ Asistente IA</li>
                <li>✓ Automatizaciones</li>
                <li>✓ Tienda virtual</li>
              </ul>
            </div>
          </div>

          <button
            onClick={handlePayment}
            className="w-full py-4 rounded-xl text-white font-bold text-lg"
            style={{ background: '#0C0E12' }}
          >
            Continuar al pago
          </button>
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
