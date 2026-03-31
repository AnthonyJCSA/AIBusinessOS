'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { LOCALES, CURRENCIES, PRICING_BY_CURRENCY, detectUserLocale, detectUserCurrency, formatPrice, type Locale, type Currency } from '@/lib/i18n'
import { trackEvent } from '@/components/Analytics'

export default function PreciosPage() {
  const [locale, setLocale] = useState<Locale>('es')
  const [currency, setCurrency] = useState<Currency>('PEN')
  const [isYearly, setIsYearly] = useState(false)

  useEffect(() => {
    setLocale(detectUserLocale())
    setCurrency(detectUserCurrency())
  }, [])

  const t = LOCALES[locale]
  const prices = PRICING_BY_CURRENCY[currency]

  const plans = [
    {
      name: t.pricing.pro.name,
      price: isYearly ? prices.proYearly : prices.pro,
      originalPrice: isYearly ? Math.round(prices.pro * 12) : undefined,
      period: isYearly ? t.pricing.yearly : t.pricing.monthly,
      description: t.pricing.pro.desc,
      features: [
        'POS completo con atajos de teclado',
        'Gestión de inventario y stock',
        'Caja registradora con reconciliación',
        'CRM de clientes',
        'Pipeline de leads',
        'Gestión de compras y proveedores',
        'Reportes avanzados',
        'Facturación electrónica SUNAT',
        'Comunicaciones Email & WhatsApp',
        'Catálogo digital compartible',
        'Módulo farmacia DIGEMID',
        'Multi-usuario con roles',
        'Soporte prioritario'
      ],
      cta: t.pricing.cta.trial,
      popular: true,
      savings: isYearly ? '20% OFF' : undefined
    },
    {
      name: t.pricing.premium.name,
      price: isYearly ? prices.premiumYearly : prices.premium,
      originalPrice: isYearly ? Math.round(prices.premium * 12) : undefined,
      period: isYearly ? t.pricing.yearly : t.pricing.monthly,
      description: t.pricing.premium.desc,
      features: [
        '✨ Todo lo incluido en Plan Pro',
        '🤖 Asistente IA con GPT-4',
        '⚡ Automatizaciones inteligentes',
        '🛍️ Tienda virtual propia',
        '📊 Insights predictivos de IA',
        '🔔 Alertas automáticas de stock',
        '💬 Respuestas automáticas WhatsApp',
        '📈 Análisis avanzado con IA',
        '🎯 Recomendaciones personalizadas',
        '🚀 Acceso anticipado a nuevas features'
      ],
      cta: t.pricing.cta.trial,
      popular: false,
      savings: isYearly ? '20% OFF' : undefined
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">Coriva</span>
          </Link>
          <div className="flex items-center gap-4">
            <select value={locale} onChange={(e) => { setLocale(e.target.value as Locale); trackEvent('change_language', 'pricing', e.target.value) }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="es">🇪🇸 ES</option>
              <option value="en">🇺🇸 EN</option>
            </select>
            <select value={currency} onChange={(e) => { setCurrency(e.target.value as Currency); trackEvent('change_currency', 'pricing', e.target.value) }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              {Object.entries(CURRENCIES).map(([code, curr]) => (
                <option key={code} value={code}>{curr.flag} {curr.symbol}</option>
              ))}
            </select>
            <Link href="/registro" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all">
              {t.pricing.cta.trial}
            </Link>
          </div>
        </nav>
      </header>

      <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">{t.pricing.title}</h1>
          <p className="text-2xl text-gray-600 mb-8">{t.pricing.subtitle}</p>
          
          <div className="inline-flex items-center bg-white rounded-full p-1 shadow-lg mb-12">
            <button
              onClick={() => { setIsYearly(false); trackEvent('toggle_billing', 'pricing', 'monthly') }}
              className={`px-8 py-3 rounded-full font-semibold transition-all ${!isYearly ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'text-gray-600'}`}
            >
              {t.pricing.monthly}
            </button>
            <button
              onClick={() => { setIsYearly(true); trackEvent('toggle_billing', 'pricing', 'yearly') }}
              className={`px-8 py-3 rounded-full font-semibold transition-all ${isYearly ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'text-gray-600'}`}
            >
              {t.pricing.yearly}
              <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full">{t.pricing.save} 20%</span>
            </button>
          </div>
        </div>
      </section>

      <section className="py-20 -mt-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <div key={i} className={`relative bg-white rounded-2xl border-2 p-8 ${plan.popular ? 'border-indigo-500 shadow-2xl scale-105' : 'border-gray-200 shadow-lg'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                    {t.pricing.popular}
                  </div>
                )}
                {plan.savings && (
                  <div className="absolute -top-4 -right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {plan.savings}
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-gray-900">{formatPrice(plan.price, currency)}</span>
                    <span className="text-gray-600 ml-2">/ {plan.period}</span>
                  </div>
                  {plan.originalPrice && (
                    <div className="text-gray-500 line-through text-sm mt-1">{formatPrice(plan.originalPrice, currency)}</div>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link 
                  href="/registro" 
                  onClick={() => trackEvent('click_plan', 'pricing', plan.name, plan.price)}
                  className={`block text-center py-3 rounded-xl font-bold transition-all ${plan.popular ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center mt-12 text-gray-600 font-medium">{t.pricing.guarantee}</p>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">¿Preguntas sobre precios?</h2>
          <p className="text-xl text-gray-600 mb-8">Nuestro equipo está listo para ayudarte</p>
          <a 
            href="https://wa.me/51913916967" 
            target="_blank" 
            rel="noopener noreferrer" 
            onClick={() => trackEvent('click_whatsapp', 'pricing', 'contact_sales')}
            className="inline-block bg-green-500 hover:bg-green-600 text-white px-10 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
          >
            Hablar con ventas por WhatsApp →
          </a>
        </div>
      </section>
    </div>
  )
}
