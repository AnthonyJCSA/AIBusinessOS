require('dotenv').config({ path: '.env.local' })
const Stripe = require('stripe')

async function setupStripe() {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
  })

  console.log('🔧 Configurando productos en Stripe...\n')

  try {
    const proProd = await stripe.products.create({
      name: 'Plan Pro',
      description: 'POS completo, inventario, caja, CRM, reportes y facturación SUNAT',
    })

    const proPrice = await stripe.prices.create({
      product: proProd.id,
      unit_amount: 9900,
      currency: 'pen',
      recurring: {
        interval: 'month',
      },
    })

    console.log('✅ Plan Pro creado:')
    console.log(`   Price ID: ${proPrice.id}\n`)

    const premiumProd = await stripe.products.create({
      name: 'Plan Premium',
      description: 'Todo en Pro + Asistente IA, Automatizaciones y Tienda Virtual',
    })

    const premiumPrice = await stripe.prices.create({
      product: premiumProd.id,
      unit_amount: 19900,
      currency: 'pen',
      recurring: {
        interval: 'month',
      },
    })

    console.log('✅ Plan Premium creado:')
    console.log(`   Price ID: ${premiumPrice.id}\n`)

    console.log('📝 Agrega a .env.local:')
    console.log(`STRIPE_PRICE_PRO=${proPrice.id}`)
    console.log(`STRIPE_PRICE_PREMIUM=${premiumPrice.id}`)

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

setupStripe()
