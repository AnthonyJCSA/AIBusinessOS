import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/auth/supabase-server'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  try {
    const { plan, orgId } = await req.json()

    if (!plan || !orgId) {
      return NextResponse.json(
        { error: 'Plan y orgId requeridos' },
        { status: 400 }
      )
    }

    // Verificar que Stripe esté configurado
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY no configurada')
      return NextResponse.json(
        { error: 'Stripe no configurado. Contacta al administrador.' },
        { status: 500 }
      )
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const { data: userData } = await supabase
      .from('corivacore_users')
      .select('org_id')
      .eq('auth_user_id', user.id)
      .single()

    if (!userData || userData.org_id !== orgId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    })

    // Precios de test hardcodeados (crear estos en Stripe Dashboard)
    const priceIds = {
      pro: process.env.STRIPE_PRICE_PRO || 'price_test_pro',
      premium: process.env.STRIPE_PRICE_PREMIUM || 'price_test_premium',
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceIds[plan as 'pro' | 'premium'],
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/dashboard?payment=success`,
      cancel_url: `${appUrl}/registro?payment=cancelled`,
      client_reference_id: orgId,
      customer_email: user.email,
      metadata: {
        org_id: orgId,
        plan: plan,
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })

  } catch (error: any) {
    console.error('Error creando checkout:', error)
    return NextResponse.json(
      { error: error.message || 'Error al crear checkout' },
      { status: 500 }
    )
  }
}
