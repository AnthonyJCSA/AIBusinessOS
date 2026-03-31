import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  console.log('[Webhook] Event:', event.type)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const orgId = session.metadata?.org_id
        const plan = session.metadata?.plan

        if (!orgId) {
          console.error('[Webhook] No org_id in metadata')
          break
        }

        console.log('[Webhook] Activando suscripción:', { orgId, plan })

        // Actualizar organización
        const { error } = await supabaseAdmin
          .from('corivacore_organizations')
          .update({
            payment_status: 'active',
            subscription_id: session.subscription as string,
            settings: { plan: plan || 'pro' },
          })
          .eq('id', orgId)

        if (error) {
          console.error('[Webhook] Error actualizando org:', error)
        } else {
          console.log('[Webhook] Organización activada exitosamente')
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Buscar organización por subscription_id
        const { data: org } = await supabaseAdmin
          .from('corivacore_organizations')
          .select('id')
          .eq('subscription_id', subscription.id)
          .single()

        if (org) {
          await supabaseAdmin
            .from('corivacore_organizations')
            .update({
              payment_status: 'cancelled',
              is_active: false,
            })
            .eq('id', org.id)

          console.log('[Webhook] Suscripción cancelada:', org.id)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        
        if (invoice.subscription) {
          const { data: org } = await supabaseAdmin
            .from('corivacore_organizations')
            .select('id')
            .eq('subscription_id', invoice.subscription as string)
            .single()

          if (org) {
            await supabaseAdmin
              .from('corivacore_organizations')
              .update({ payment_status: 'pending' })
              .eq('id', org.id)

            console.log('[Webhook] Pago fallido:', org.id)
          }
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('[Webhook] Error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
