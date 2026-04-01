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
    const plans = [
      {
        id: 'pro' as const,
        name: 'Pro',
        price: 99,
        badge: null,
        color: '#0C0E12',
        highlight: false,
        desc: 'Todo lo que necesitas para operar tu negocio',
        feats: [
          'Punto de Venta (POS) completo',
          'Inventario y control de stock',
          'Caja con reconciliación',
          'CRM de clientes y leads',
          'Compras y proveedores',
          'Reportes avanzados',
          'Facturación electrónica SUNAT',
          'Módulo Farmacia DIGEMID',
          'Multi-usuario con roles',
          'Soporte en Perú',
        ],
      },
      {
        id: 'premium' as const,
        name: 'Premium',
        price: 199,
        badge: '🔥 Más popular',
        color: '#6366F1',
        highlight: true,
        desc: 'Todo en Pro más inteligencia artificial avanzada',
        feats: [
          'Todo lo incluido en Pro',
          'Asistente IA conversacional (GPT-4)',
          'Predicción de ventas con IA',
          'Automatizaciones inteligentes',
          'Tienda virtual propia',
          'Campañas WhatsApp con IA',
          'Segmentación automática de clientes',
          'Insights predictivos de stock',
          'Acceso anticipado a nuevas features',
          'Soporte prioritario',
        ],
      },
    ]

    const selected = plans.find(p => p.id === selectedPlan)!

    return (
      <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: "'Outfit', sans-serif" }}>
        {/* Header */}
        <div style={{ borderBottom: '1px solid #E5E3DE', background: '#fff', padding: '16px clamp(20px,5vw,60px)' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, background: '#0C0E12', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Fraunces',Georgia,serif", fontSize: 18, fontWeight: 900, color: '#C8F23A' }}>A</div>
              <span style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 18, fontWeight: 700, color: '#0C0E12' }}>AI Business OS</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6B7280' }}>
              <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#0D9C6E', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11 }}>✓</span>
              Cuenta creada
              <span style={{ color: '#D4D2CC' }}>›</span>
              <span style={{ fontWeight: 700, color: '#0C0E12' }}>Elige tu plan</span>
              <span style={{ color: '#D4D2CC' }}>›</span>
              Pago
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(32px,5vw,64px) clamp(20px,5vw,60px)' }}>
          {/* Título */}
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h1 style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900, letterSpacing: -1.5, color: '#0C0E12', marginBottom: 12 }}>
              Elige tu plan
            </h1>
            <p style={{ fontSize: 16, color: '#6B7280' }}>Sin contratos · Cancela cuando quieras · Implementación incluida</p>
          </div>

          {/* Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, maxWidth: 780, margin: '0 auto 40px' }}>
            {plans.map(plan => {
              const isSelected = selectedPlan === plan.id
              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  style={{
                    background: '#fff',
                    border: `2px solid ${isSelected ? plan.color : '#E5E3DE'}`,
                    borderRadius: 20,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all .2s',
                    boxShadow: isSelected ? `0 8px 32px ${plan.color}22` : '0 2px 8px rgba(12,14,18,0.06)',
                    transform: isSelected ? 'translateY(-2px)' : 'none',
                    position: 'relative',
                  }}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <div style={{ background: plan.color, padding: '8px 20px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#fff', letterSpacing: .5 }}>
                      {plan.badge}
                    </div>
                  )}

                  {/* Selector */}
                  <div style={{ position: 'absolute', top: plan.badge ? 52 : 20, right: 20, width: 22, height: 22, borderRadius: '50%', border: `2px solid ${isSelected ? plan.color : '#D4D2CC'}`, background: isSelected ? plan.color : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}>
                    {isSelected && <span style={{ color: '#fff', fontSize: 12, fontWeight: 900 }}>✓</span>}
                  </div>

                  <div style={{ padding: '24px 28px 28px' }}>
                    {/* Nombre y precio */}
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: plan.color, marginBottom: 6 }}>Plan {plan.name}</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                        <span style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 52, fontWeight: 900, color: '#0C0E12', letterSpacing: -2, lineHeight: 1 }}>S/ {plan.price}</span>
                        <span style={{ fontSize: 14, color: '#6B7280', fontWeight: 500 }}>/mes</span>
                      </div>
                      <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>{plan.desc}</p>
                    </div>

                    <div style={{ height: 1, background: '#F3F2EF', margin: '0 0 20px' }} />

                    {/* Features */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {plan.feats.map(f => (
                        <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                          <span style={{ width: 18, height: 18, borderRadius: '50%', background: `${plan.color}15`, color: plan.color, fontSize: 11, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>✓</span>
                          <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.4 }}>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Resumen + CTA */}
          <div style={{ maxWidth: 780, margin: '0 auto' }}>
            <div style={{ background: '#fff', border: '1px solid #E5E3DE', borderRadius: 16, padding: '20px 28px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Resumen de tu suscripción</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#0C0E12' }}>Plan {selected.name} · S/ {selected.price}/mes</div>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#6B7280' }}>
                <span>✅ Sin permanencia</span>
                <span>✅ Cancela cuando quieras</span>
              </div>
            </div>

            {error && (
              <div style={{ background: 'rgba(220,38,38,0.07)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: '#DC2626', fontWeight: 500, marginBottom: 16 }}>
                ⚠️ {error}
              </div>
            )}

            <button
              onClick={handlePayment}
              disabled={loading}
              style={{ width: '100%', padding: '16px', borderRadius: 14, fontSize: 17, fontWeight: 800, background: selected.color, color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1, transition: 'all .2s', letterSpacing: -.3 }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = '' }}
            >
              {loading ? '⏳ Redirigiendo...' : `Continuar al pago — S/ ${selected.price}/mes →`}
            </button>

            {/* Trust badges */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 20, flexWrap: 'wrap' }}>
              {['🔒 Pago seguro con Stripe', '📧 soporte@corivape.com', '📞 +51 913 916 967'].map(t => (
                <span key={t} style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>{t}</span>
              ))}
            </div>
          </div>
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
