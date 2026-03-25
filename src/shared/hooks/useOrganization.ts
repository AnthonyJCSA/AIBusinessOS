import { useSessionStore } from '@/state/session.store'

export function useOrganization() {
  return useSessionStore((s) => s.org)
}
