// Roles and Permissions System

export type Role = 'ADMIN' | 'MANAGER' | 'VENDEDOR'

export interface Permission {
  module: string
  actions: string[]
}

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    { module: 'dashboard', actions: ['view'] },
    { module: 'asistente', actions: ['view'] },
    { module: 'pos', actions: ['view', 'create', 'cancel'] },
    { module: 'cash', actions: ['view', 'open', 'close'] },
    { module: 'inventory', actions: ['view', 'create', 'edit', 'delete'] },
    { module: 'billing', actions: ['view', 'create', 'cancel'] },
    { module: 'store', actions: ['view', 'edit'] },
    { module: 'catalog', actions: ['view', 'edit'] },
    { module: 'communications', actions: ['view', 'create'] },
    { module: 'reports', actions: ['view', 'export'] },
    { module: 'customers', actions: ['view', 'create', 'edit', 'delete'] },
    { module: 'settings', actions: ['view', 'edit'] },
    { module: 'users', actions: ['view', 'create', 'edit', 'delete'] }
  ],
  MANAGER: [
    { module: 'dashboard', actions: ['view'] },
    { module: 'asistente', actions: ['view'] },
    { module: 'pos', actions: ['view', 'create', 'cancel'] },
    { module: 'cash', actions: ['view', 'open', 'close'] },
    { module: 'inventory', actions: ['view', 'edit'] },
    { module: 'billing', actions: ['view', 'create'] },
    { module: 'store', actions: ['view'] },
    { module: 'catalog', actions: ['view'] },
    { module: 'communications', actions: ['view', 'create'] },
    { module: 'reports', actions: ['view'] },
    { module: 'customers', actions: ['view', 'create', 'edit'] }
  ],
  VENDEDOR: [
    { module: 'dashboard', actions: ['view'] },
    { module: 'pos', actions: ['view', 'create'] },
    { module: 'customers', actions: ['view', 'create'] }
  ]
}

export const hasPermission = (role: Role, module: string, action: string): boolean => {
  const permissions = ROLE_PERMISSIONS[role]
  const modulePermission = permissions.find(p => p.module === module)
  return modulePermission ? modulePermission.actions.includes(action) : false
}

export const canAccessModule = (role: Role, module: string): boolean => {
  const permissions = ROLE_PERMISSIONS[role]
  if (!permissions) return false
  return permissions.some(p => p.module === module)
}
