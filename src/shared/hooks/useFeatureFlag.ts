import { useSessionStore } from '@/state/session.store'

type Plan = 'starter' | 'pro' | 'premium'

const PLAN_FEATURES: Record<Plan, string[]> = {
  starter: ['pos', 'inventory', 'cash', 'customers', 'reports'],
  pro:     ['pos', 'inventory', 'cash', 'customers', 'reports', 'leads', 'purchases', 'communications', 'billing', 'store', 'catalog', 'automations', 'pharma'],
  premium: ['pos', 'inventory', 'cash', 'customers', 'reports', 'leads', 'purchases', 'communications', 'billing', 'store', 'catalog', 'automations', 'pharma', 'asistente'],
}

// Todas las features disponibles — para OWNER siempre tiene acceso completo
const ALL_FEATURES = PLAN_FEATURES.premium

export function useFeatureFlag(feature: string): boolean {
  const org  = useSessionStore((s) => s.org)
  const user = useSessionStore((s) => s.user)

  // OWNER siempre tiene acceso a todo, independientemente del plan
  if (user?.role === 'OWNER') return true

  const plan = (org?.settings?.plan ?? 'pro') as Plan
  return PLAN_FEATURES[plan]?.includes(feature) ?? false
}
