'use client'

import { useSessionStore } from '@/state/session.store'
import { hasRole, canAccessModule } from './roles'
import type { Role } from './roles'

export function usePermissions() {
  const user = useSessionStore((state) => state.user)
  const userRole = user?.role as Role | undefined
  
  return {
    role: userRole,
    hasRole: (requiredRole: Role) => {
      if (!userRole) return false
      return hasRole(userRole, requiredRole)
    },
    canAccessModule: (module: string) => {
      if (!userRole) return false
      return canAccessModule(userRole, module)
    },
    isOwner: userRole === 'OWNER',
    isAdmin: userRole === 'ADMIN' || userRole === 'OWNER',
    isManager: userRole === 'MANAGER' || userRole === 'ADMIN' || userRole === 'OWNER',
  }
}
