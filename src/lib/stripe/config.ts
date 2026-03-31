// Stripe Configuration
export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  secretKey: process.env.STRIPE_SECRET_KEY || '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
}

export const STRIPE_PRODUCTS = {
  pro: {
    priceId: process.env.STRIPE_PRICE_PRO || 'price_pro_monthly',
    name: 'Plan Pro',
    amount: 9900,
    currency: 'pen',
    interval: 'month',
  },
  premium: {
    priceId: process.env.STRIPE_PRICE_PREMIUM || 'price_premium_monthly',
    name: 'Plan Premium',
    amount: 19900,
    currency: 'pen',
    interval: 'month',
  },
}

export function getStripePriceId(plan: 'pro' | 'premium'): string {
  return STRIPE_PRODUCTS[plan].priceId
}
