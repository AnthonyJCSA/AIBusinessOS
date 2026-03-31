import { useSessionStore } from '@/state/session.store'

type Plan = 'pro' | 'premium'

const PLAN_FEATURES: Record<Plan, string[]> = {
  pro: ['dashboard', 'pos', 'inventory', 'cash', 'customers', 'reports', 'leads', 'purchases', 'communications', 'billing', 'catalog', 'users', 'settings', 'pharma'],
  premium: ['dashboard', 'pos', 'inventory', 'cash', 'customers', 'reports', 'leads', 'purchases', 'communications', 'billing', 'catalog', 'users', 'settings', 'pharma', 'store', 'automations', 'asistente'],
}

// Todas las features disponibles — para OWNER siempre tiene acceso completo
const ALL_FEATURES = PLAN_FEATURES.premium

export function useFeatureFlag(feature: string): boolean {
  const org  = useSessionStore((s) => s.org)
  const user = useSessionStore((s) => s.user)

  // OWNER siempre tiene acceso completo a todo, independientemente del plan
  if (user?.role === 'OWNER') return true

  const plan = (org?.settings?.plan ?? 'pro') as Plan
  return PLAN_FEATURES[plan]?.includes(feature) ?? false
}
