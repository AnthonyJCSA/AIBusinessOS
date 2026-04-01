export const ROLES = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  VENDEDOR: 'VENDEDOR',
  VIEWER: 'VIEWER',
} as const

export type Role = typeof ROLES[keyof typeof ROLES]

export const ROLE_HIERARCHY: Record<Role, number> = {
  OWNER: 5,
  ADMIN: 4,
  MANAGER: 3,
  VENDEDOR: 2,
  VIEWER: 1,
}

export const MODULE_PERMISSIONS: Record<string, Role[]> = {
  dashboard: ['OWNER', 'ADMIN', 'MANAGER', 'VENDEDOR', 'VIEWER'],
  pos: ['OWNER', 'ADMIN', 'MANAGER', 'VENDEDOR'],
  cash: ['OWNER', 'ADMIN', 'MANAGER'],
  inventory: ['OWNER', 'ADMIN', 'MANAGER'],
  purchases: ['OWNER', 'ADMIN', 'MANAGER'],
  customers: ['OWNER', 'ADMIN', 'MANAGER', 'VENDEDOR'],
  leads: ['OWNER', 'ADMIN', 'MANAGER'],
  reports: ['OWNER', 'ADMIN', 'MANAGER', 'VIEWER'],
  asistente: ['OWNER', 'ADMIN', 'MANAGER'],
  automations: ['OWNER', 'ADMIN', 'MANAGER'],
  users: ['OWNER', 'ADMIN'],
  settings: ['OWNER', 'ADMIN'],
  billing: ['OWNER', 'ADMIN', 'MANAGER'],
  facturacion: ['OWNER', 'ADMIN', 'MANAGER'],
  communications: ['OWNER', 'ADMIN', 'MANAGER'],
  store: ['OWNER', 'ADMIN'],
  catalog: ['OWNER', 'ADMIN', 'MANAGER'],
  pharma: ['OWNER', 'ADMIN', 'MANAGER'],
}

export function hasRole(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

export function canAccessModule(userRole: Role, module: string): boolean {
  const allowedRoles = MODULE_PERMISSIONS[module]
  return allowedRoles ? allowedRoles.includes(userRole) : false
}
