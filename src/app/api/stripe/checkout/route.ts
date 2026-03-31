import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/auth/supabase-server'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  try {
    const { plan, orgId } = await req.json()

    console.log('[Stripe] Request:', { plan, orgId })

    if (!plan || !orgId) {
      console.error('[Stripe] Datos incompletos')
      return NextResponse.json(
        { error: 'Plan y orgId requeridos' },
        { status: 400 }
      )
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('[Stripe] STRIPE_SECRET_KEY no configurada')
      return NextResponse.json(
        { error: 'Stripe no configurado' },
        { status: 500 }
      )
    }

    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('[Stripe] Error auth:', authError)
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    console.log('[Stripe] Usuario:', user.id)

    const { data: userData, error: userError } = await supabase
      .from('corivacore_users')
      .select('org_id')
      .eq('auth_user_id', user.id)
      .single()

    if (userError || !userData) {
      console.error('[Stripe] Error usuario:', userError)
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    if (userData.org_id !== orgId) {
      console.error('[Stripe] Org mismatch')
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

    const priceIds = {
      pro: process.env.STRIPE_PRICE_PRO,
      premium: process.env.STRIPE_PRICE_PREMIUM,
    }

    const priceId = priceIds[plan as 'pro' | 'premium']
    console.log('[Stripe] Price ID:', priceId)

    if (!priceId) {
      console.error('[Stripe] Price ID no configurado para plan:', plan)
      return NextResponse.json(
        { error: 'Plan no configurado' },
        { status: 500 }
      )
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ai-business-os-nu.vercel.app'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
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

    console.log('[Stripe] Session created:', session.id)

    return NextResponse.json({ sessionId: session.id, url: session.url })

  } catch (error: any) {
    console.error('[Stripe] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Error al crear checkout' },
      { status: 500 }
    )
  }
}
