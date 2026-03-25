import { useSessionStore } from '@/state/session.store'

type Plan = 'starter' | 'pro' | 'premium'

const PLAN_FEATURES: Record<Plan, string[]> = {
  starter: ['pos', 'inventory', 'cash', 'customers', 'reports'],
  pro:     ['pos', 'inventory', 'cash', 'customers', 'reports', 'leads', 'purchases', 'communications', 'asistente'],
  premium: ['pos', 'inventory', 'cash', 'customers', 'reports', 'leads', 'purchases', 'communications', 'asistente', 'billing', 'store', 'catalog', 'automations'],
}

export function useFeatureFlag(feature: string): boolean {
  const org = useSessionStore((s) => s.org)
  const plan = (org?.settings?.plan ?? 'pro') as Plan
  return PLAN_FEATURES[plan]?.includes(feature) ?? true
}
