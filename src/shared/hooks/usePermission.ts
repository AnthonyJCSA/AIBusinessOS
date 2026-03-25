import { useSessionStore } from '@/state/session.store'
import { hasPermission, canAccessModule } from '@/lib/permissions'
import type { Role } from '@/lib/permissions'

export function usePermission(module: string, action?: string) {
  const user = useSessionStore((s) => s.user)
  if (!user) return false
  const role = user.role as Role
  if (action) return hasPermission(role, module, action)
  return canAccessModule(role, module)
}
