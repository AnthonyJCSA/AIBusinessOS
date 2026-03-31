// Re-export roles
export { ROLES, ROLE_HIERARCHY, MODULE_PERMISSIONS, hasRole, canAccessModule } from './roles'
export type { Role } from './roles'

// Re-export guards
export { requireAuth, requireRole, requireModule } from './guards'

// Re-export hooks
export { usePermissions } from './hooks'
