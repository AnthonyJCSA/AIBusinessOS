'use client'
import { useSessionStore } from '@/state/session.store'

const PLAN_FLAGS: Record<string, string[]> = {
  starter: [
    'core:pos',
    'core:inventory',
    'core:cash',
    'core:customers_basic',
    'analytics:reports_basic',
  ],
  pro: [
    'core:pos',
    'core:inventory',
    'core:cash',
    'core:customers_full',
    'core:purchases',
    'growth:leads',
    'growth:pipeline',
    'analytics:reports',
    'analytics:reports_basic',
    'ai:assistant',
    'ai:alerts',
  ],
  premium: ['*'],
}

export function useFeatureFlag(flag: string): boolean {
  const plan = useSessionStore((s) => s.org?.settings?.plan ?? 'starter')
  const flags = PLAN_FLAGS[plan as string] ?? PLAN_FLAGS.starter
  return flags.includes('*') || flags.includes(flag)
}

export function usePlan(): string {
  return useSessionStore((s) => s.org?.settings?.plan ?? 'starter') as string
}
