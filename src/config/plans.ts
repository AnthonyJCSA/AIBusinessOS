// 🚀 Coriva Core - Configuración de Planes

export type Plan = 'pro' | 'premium'

export interface PlanConfig {
  id: Plan
  name: string
  price: number
  currency: string
  interval: 'monthly'
  features: string[]
  modules: string[]
  popular?: boolean
}

export const PLANS: Record<Plan, PlanConfig> = {
  pro: {
    id: 'pro',
    name: 'Plan Pro',
    price: 99,
    currency: 'PEN',
    interval: 'monthly',
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
      'Soporte prioritario',
    ],
    modules: [
      'dashboard',
      'pos',
      'inventory',
      'cash',
      'customers',
      'reports',
      'leads',
      'purchases',
      'communications',
      'billing',
      'catalog',
      'users',
      'settings',
      'pharma',
    ],
    popular: true,
  },
  premium: {
    id: 'premium',
    name: 'Plan Premium',
    price: 199,
    currency: 'PEN',
    interval: 'monthly',
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
      '🚀 Acceso anticipado a nuevas features',
    ],
    modules: [
      'dashboard',
      'pos',
      'inventory',
      'cash',
      'customers',
      'reports',
      'leads',
      'purchases',
      'communications',
      'billing',
      'catalog',
      'users',
      'settings',
      'pharma',
      'store',
      'automations',
      'asistente',
    ],
  },
}

export const DEFAULT_PLAN: Plan = 'pro'

export function getPlanModules(plan: Plan): string[] {
  return PLANS[plan]?.modules || PLANS.pro.modules
}

export function canAccessModule(plan: Plan, module: string): boolean {
  return getPlanModules(plan).includes(module)
}

export function getPlanPrice(plan: Plan): string {
  const config = PLANS[plan]
  return `S/ ${config.price}`
}
