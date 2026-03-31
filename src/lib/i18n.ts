export type Locale = 'es' | 'en'
export type Currency = 'PEN' | 'USD' | 'MXN' | 'COP' | 'CLP' | 'ARS' | 'BRL' | 'EUR'

export const LOCALES = {
  es: {
    hero: {
      eyebrow: "🚀 Más de 10,000 negocios ya confían en Coriva",
      headline: "Vende más, pierde menos.",
      subheadline: "Tu negocio en piloto automático.",
      description: "Coriva controla tu inventario, caja y ventas mientras tú te enfocas en crecer. Con IA que predice desabastecimientos y WhatsApp que cobra por ti.",
      ctaPrimary: "Empieza a vender en 60 segundos",
      ctaSecondary: "Ver demo en vivo",
      trust: ["Sin tarjeta de crédito", "Gratis por 30 días", "Soporte en español"]
    },
    pricing: {
      title: "Precios simples y transparentes",
      subtitle: "Sin contratos largos. Cancela cuando quieras.",
      monthly: "mes",
      yearly: "año",
      save: "Ahorra",
      guarantee: "💯 Garantía de 30 días. Si no te gusta, te devolvemos tu dinero.",
      popular: "🔥 Más Popular",
      pro: { name: "Plan Pro", desc: "Para negocios en crecimiento" },
      premium: { name: "Plan Premium", desc: "Todo Pro + IA avanzada" },
      cta: { trial: "Comenzar ahora", sales: "Hablar con ventas" }
    },
    common: {
      loading: "Cargando...",
      error: "Error",
      success: "Éxito",
      cancel: "Cancelar",
      save: "Guardar",
      delete: "Eliminar",
      edit: "Editar",
      search: "Buscar..."
    }
  },
  en: {
    hero: {
      eyebrow: "🚀 10,000+ businesses trust Coriva",
      headline: "Sell more, lose less.",
      subheadline: "Your business on autopilot.",
      description: "Coriva manages your inventory, cash, and sales while you focus on growth. AI predicts stockouts. WhatsApp collects payments for you.",
      ctaPrimary: "Start selling in 60 seconds",
      ctaSecondary: "Watch live demo",
      trust: ["No credit card", "Free for 30 days", "24/7 support"]
    },
    pricing: {
      title: "Simple, transparent pricing",
      subtitle: "No long-term contracts. Cancel anytime.",
      monthly: "month",
      yearly: "year",
      save: "Save",
      guarantee: "💯 30-day money-back guarantee. No questions asked.",
      popular: "🔥 Most Popular",
      pro: { name: "Pro Plan", desc: "For growing businesses" },
      premium: { name: "Premium Plan", desc: "All Pro + Advanced AI" },
      cta: { trial: "Get started", sales: "Talk to sales" }
    },
    common: {
      loading: "Loading...",
      error: "Error",
      success: "Success",
      cancel: "Cancel",
      save: "Save",
      delete: "Delete",
      edit: "Edit",
      search: "Search..."
    }
  }
}

export const CURRENCIES = {
  PEN: { symbol: 'S/', name: 'Soles Peruanos', country: 'PE', flag: '🇵🇪' },
  USD: { symbol: '$', name: 'US Dollars', country: 'US', flag: '🇺🇸' },
  MXN: { symbol: '$', name: 'Pesos Mexicanos', country: 'MX', flag: '🇲🇽' },
  COP: { symbol: '$', name: 'Pesos Colombianos', country: 'CO', flag: '🇨🇴' },
  CLP: { symbol: '$', name: 'Pesos Chilenos', country: 'CL', flag: '🇨🇱' },
  ARS: { symbol: '$', name: 'Pesos Argentinos', country: 'AR', flag: '🇦🇷' },
  BRL: { symbol: 'R$', name: 'Reais Brasileños', country: 'BR', flag: '🇧🇷' },
  EUR: { symbol: '€', name: 'Euros', country: 'EU', flag: '🇪🇺' }
}

export const PRICING_BY_CURRENCY = {
  PEN: { pro: 99, premium: 199, proYearly: 950, premiumYearly: 1910 },
  USD: { pro: 26, premium: 52, proYearly: 250, premiumYearly: 500 },
  MXN: { pro: 499, premium: 999, proYearly: 4790, premiumYearly: 9590 },
  COP: { pro: 99000, premium: 199000, proYearly: 950000, premiumYearly: 1910000 },
  CLP: { pro: 23900, premium: 47900, proYearly: 229440, premiumYearly: 459840 },
  ARS: { pro: 25900, premium: 51900, proYearly: 248640, premiumYearly: 498240 },
  BRL: { pro: 139, premium: 279, proYearly: 1334, premiumYearly: 2678 },
  EUR: { pro: 24, premium: 48, proYearly: 230, premiumYearly: 461 }
}

export function detectUserLocale(): Locale {
  if (typeof window === 'undefined') return 'es'
  const lang = navigator.language.split('-')[0]
  return lang === 'en' ? 'en' : 'es'
}

export function detectUserCurrency(): Currency {
  if (typeof window === 'undefined') return 'PEN'
  const locale = navigator.language
  const countryMap: Record<string, Currency> = {
    'es-PE': 'PEN', 'es-MX': 'MXN', 'es-CO': 'COP', 'es-CL': 'CLP',
    'es-AR': 'ARS', 'pt-BR': 'BRL', 'en-US': 'USD', 'en-GB': 'EUR'
  }
  return countryMap[locale] || 'USD'
}

export function formatPrice(amount: number, currency: Currency): string {
  const curr = CURRENCIES[currency]
  return `${curr.symbol}${amount.toLocaleString()}`
}
