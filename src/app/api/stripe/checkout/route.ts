import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/auth/supabase-server'
import { getStripePriceId } from '@/lib/stripe/config'

export async function POST(req: NextRequest) {
  try {
    const { plan, orgId } = await req.json()

    if (!plan || !orgId) {
      return NextResponse.json(
        { error: 'Plan y orgId requeridos' },
        { status: 400 }
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

    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
    const priceId = getStripePriceId(plan)

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/registro?payment=cancelled`,
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
