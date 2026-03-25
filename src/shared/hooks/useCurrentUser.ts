import { useSessionStore } from '@/state/session.store'

export function useCurrentUser() {
  return useSessionStore((s) => s.user)
}
