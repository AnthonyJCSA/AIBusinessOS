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
  'caja-registradora': ['OWNER', 'ADMIN', 'MANAGER'],
  inventario: ['OWNER', 'ADMIN', 'MANAGER'],
  compras: ['OWNER', 'ADMIN', 'MANAGER'],
  clientes: ['OWNER', 'ADMIN', 'MANAGER', 'VENDEDOR'],
  leads: ['OWNER', 'ADMIN', 'MANAGER'],
  reportes: ['OWNER', 'ADMIN', 'MANAGER', 'VIEWER'],
  'asistente-ia': ['OWNER', 'ADMIN', 'MANAGER'],
  automations: ['OWNER', 'ADMIN', 'MANAGER'],
  usuarios: ['OWNER', 'ADMIN'],
  configuracion: ['OWNER', 'ADMIN'],
  facturacion: ['OWNER', 'ADMIN', 'MANAGER'],
  comunicaciones: ['OWNER', 'ADMIN', 'MANAGER'],
  'tienda-virtual': ['OWNER', 'ADMIN'],
  catalogo: ['OWNER', 'ADMIN', 'MANAGER'],
}

export function hasRole(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

export function canAccessModule(userRole: Role, module: string): boolean {
  const allowedRoles = MODULE_PERMISSIONS[module]
  return allowedRoles ? allowedRoles.includes(userRole) : false
}
