export type Role = 'OWNER' | 'ADMIN' | 'MANAGER' | 'VENDEDOR' | 'VIEWER'

export interface Permission {
  module: string
  actions: string[]
}

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  OWNER: [
    { module: 'dashboard',       actions: ['view'] },
    { module: 'asistente',       actions: ['view'] },
    { module: 'pos',             actions: ['view', 'create', 'cancel'] },
    { module: 'cash',            actions: ['view', 'open', 'close'] },
    { module: 'inventory',       actions: ['view', 'create', 'edit', 'delete', 'adjust'] },
    { module: 'purchases',       actions: ['view', 'create', 'edit', 'delete'] },
    { module: 'billing',         actions: ['view', 'create', 'cancel'] },
    { module: 'store',           actions: ['view', 'edit'] },
    { module: 'catalog',         actions: ['view', 'edit'] },
    { module: 'communications',  actions: ['view', 'create'] },
    { module: 'reports',         actions: ['view', 'export'] },
    { module: 'customers',       actions: ['view', 'create', 'edit', 'delete'] },
    { module: 'leads',           actions: ['view', 'create', 'edit', 'delete'] },
    { module: 'pipeline',        actions: ['view', 'create', 'edit', 'delete'] },
    { module: 'ai',              actions: ['view'] },
    { module: 'automations',     actions: ['view', 'create', 'edit', 'delete'] },
    { module: 'settings',        actions: ['view', 'edit'] },
    { module: 'users',           actions: ['view', 'create', 'edit', 'delete'] },
    { module: 'billing_admin',   actions: ['view', 'edit'] }, // solo OWNER
  ],
  ADMIN: [
    { module: 'dashboard',       actions: ['view'] },
    { module: 'asistente',       actions: ['view'] },
    { module: 'pos',             actions: ['view', 'create', 'cancel'] },
    { module: 'cash',            actions: ['view', 'open', 'close'] },
    { module: 'inventory',       actions: ['view', 'create', 'edit', 'delete', 'adjust'] },
    { module: 'purchases',       actions: ['view', 'create', 'edit'] },
    { module: 'billing',         actions: ['view', 'create', 'cancel'] },
    { module: 'store',           actions: ['view', 'edit'] },
    { module: 'catalog',         actions: ['view', 'edit'] },
    { module: 'communications',  actions: ['view', 'create'] },
    { module: 'reports',         actions: ['view', 'export'] },
    { module: 'customers',       actions: ['view', 'create', 'edit', 'delete'] },
    { module: 'leads',           actions: ['view', 'create', 'edit', 'delete'] },
    { module: 'pipeline',        actions: ['view', 'create', 'edit', 'delete'] },
    { module: 'ai',              actions: ['view'] },
    { module: 'automations',     actions: ['view', 'create', 'edit'] },
    { module: 'settings',        actions: ['view', 'edit'] },
    { module: 'users',           actions: ['view', 'create', 'edit', 'delete'] },
  ],
  MANAGER: [
    { module: 'dashboard',       actions: ['view'] },
    { module: 'asistente',       actions: ['view'] },
    { module: 'pos',             actions: ['view', 'create', 'cancel'] },
    { module: 'cash',            actions: ['view', 'open', 'close'] },
    { module: 'inventory',       actions: ['view', 'edit', 'adjust'] },
    { module: 'purchases',       actions: ['view', 'create'] },
    { module: 'billing',         actions: ['view', 'create'] },
    { module: 'store',           actions: ['view'] },
    { module: 'catalog',         actions: ['view'] },
    { module: 'communications',  actions: ['view', 'create'] },
    { module: 'reports',         actions: ['view', 'export'] },
    { module: 'customers',       actions: ['view', 'create', 'edit'] },
    { module: 'leads',           actions: ['view', 'create', 'edit'] },
    { module: 'pipeline',        actions: ['view', 'create', 'edit'] },
    { module: 'ai',              actions: ['view'] },
  ],
  VENDEDOR: [
    { module: 'dashboard',       actions: ['view'] },
    { module: 'pos',             actions: ['view', 'create'] },
    { module: 'cash',            actions: ['view'] },
    { module: 'inventory',       actions: ['view'] },
    { module: 'customers',       actions: ['view', 'create'] },
  ],
  VIEWER: [
    { module: 'dashboard',       actions: ['view'] },
    { module: 'reports',         actions: ['view'] },
    { module: 'inventory',       actions: ['view'] },
    { module: 'customers',       actions: ['view'] },
  ],
}

export const hasPermission = (role: Role, module: string, action: string): boolean => {
  const permissions = ROLE_PERMISSIONS[role]
  if (!permissions) return false
  const modulePermission = permissions.find((p) => p.module === module)
  return modulePermission ? modulePermission.actions.includes(action) : false
}

export const canAccessModule = (role: Role, module: string): boolean => {
  const permissions = ROLE_PERMISSIONS[role]
  if (!permissions) return false
  return permissions.some((p) => p.module === module)
}

// Roles que pueden acceder a administración
export const ADMIN_ROLES: Role[] = ['OWNER', 'ADMIN']
export const MANAGER_ROLES: Role[] = ['OWNER', 'ADMIN', 'MANAGER']
export const ALL_ROLES: Role[] = ['OWNER', 'ADMIN', 'MANAGER', 'VENDEDOR', 'VIEWER']
