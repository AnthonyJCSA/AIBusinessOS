'use client'
import { useSessionStore } from '@/state/session.store'
import { hasPermission, canAccessModule } from '@/lib/permissions'
import type { Role } from '@/lib/permissions'

export function usePermission(module: string, action: string): boolean {
  const user = useSessionStore((s) => s.user)
  if (!user) return false
  return hasPermission(user.role as Role, module, action)
}

export function useCanAccess(module: string): boolean {
  const user = useSessionStore((s) => s.user)
  if (!user) return false
  return canAccessModule(user.role as Role, module)
}
