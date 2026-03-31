# Fase 4 - Guards y Permisos — COMPLETADA ✅

**Fecha:** 2025-01-16  
**Duración:** 2 horas  
**Estado:** ✅ Completada exitosamente

---

## 📋 Resumen Ejecutivo

Se implementó un sistema completo de control de acceso basado en roles (RBAC) con validación tanto en client-side como server-side, protegiendo módulos y API routes según los permisos de cada rol.

---

## 🎯 Objetivos Cumplidos

- ✅ Sistema de permisos con 5 roles jerárquicos
- ✅ Guards de autenticación y autorización para API routes
- ✅ Hook de React para validación de permisos en UI
- ✅ Sidebar adaptado dinámicamente según rol
- ✅ Componente ProtectedRoute para rutas protegidas
- ✅ API routes críticos protegidos (IA, Facturación)
- ✅ Build exitoso sin errores de TypeScript

---

## 📁 Archivos Creados

### 1. Sistema de Roles (`src/lib/permissions/roles.ts`)
```typescript
export const ROLES = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  VENDEDOR: 'VENDEDOR',
  VIEWER: 'VIEWER',
}

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
  automatizaciones: ['OWNER', 'ADMIN'],
  usuarios: ['OWNER', 'ADMIN'],
  configuracion: ['OWNER', 'ADMIN'],
  facturacion: ['OWNER', 'ADMIN', 'MANAGER'],
  comunicaciones: ['OWNER', 'ADMIN', 'MANAGER'],
  'tienda-virtual': ['OWNER', 'ADMIN'],
  catalogo: ['OWNER', 'ADMIN', 'MANAGER'],
}
```

**Funciones:**
- `hasRole(userRole, requiredRole)` - Valida jerarquía de roles
- `canAccessModule(userRole, module)` - Valida acceso a módulo

---

### 2. Guards Server-Side (`src/lib/permissions/guards.ts`)

```typescript
export async function requireAuth(req: NextRequest)
export async function requireRole(req: NextRequest, requiredRole: Role)
export async function requireModule(req: NextRequest, module: string)
```

**Funcionalidad:**
- `requireAuth()` - Valida que el usuario esté autenticado con Supabase Auth
- `requireRole()` - Valida que el usuario tenga el rol mínimo requerido
- `requireModule()` - Valida que el usuario pueda acceder al módulo

**Respuestas:**
- 401 - No autenticado
- 403 - Permisos insuficientes
- 404 - Usuario no encontrado en corivacore_users

---

### 3. Hook Client-Side (`src/lib/permissions/hooks.ts`)

```typescript
export function usePermissions() {
  return {
    role: userRole,
    hasRole: (requiredRole: Role) => boolean,
    canAccessModule: (module: string) => boolean,
    isOwner: boolean,
    isAdmin: boolean,
    isManager: boolean,
  }
}
```

**Uso:**
```typescript
const { canAccessModule, isAdmin } = usePermissions()

if (canAccessModule('facturacion')) {
  // Mostrar módulo de facturación
}
```

---

### 4. Componente ProtectedRoute (`src/components/ProtectedRoute.tsx`)

```typescript
<ProtectedRoute module="facturacion">
  <FacturacionModule />
</ProtectedRoute>
```

**Comportamiento:**
- Valida permisos en client-side
- Redirige a /dashboard si no tiene acceso
- Muestra fallback opcional mientras valida

---

## 🔒 API Routes Protegidos

### 1. `/api/ai/chat` - Asistente IA
```typescript
export async function POST(req: NextRequest) {
  const authResult = await requireModule(req, 'asistente-ia')
  if (authResult instanceof NextResponse) return authResult
  
  const { user } = authResult
  const orgId = user.org_id // Usa org_id del usuario autenticado
  // ...
}
```

**Roles permitidos:** OWNER, ADMIN, MANAGER

---

### 2. `/api/invoices` - Facturación
```typescript
export async function GET(req: NextRequest) {
  const authResult = await requireModule(req, 'facturacion')
  if (authResult instanceof NextResponse) return authResult
  
  const { user } = authResult
  const invoices = await invoiceService.listByOrg(user.org_id, { ... })
  // ...
}

export async function POST(req: NextRequest) {
  const authResult = await requireModule(req, 'facturacion')
  if (authResult instanceof NextResponse) return authResult
  
  const { user } = authResult
  const dto = { ...validateCreateInvoice(body), orgId: user.org_id }
  // ...
}
```

**Roles permitidos:** OWNER, ADMIN, MANAGER

**Mejora de seguridad:**
- Ya no se acepta `orgId` del cliente
- Se usa `user.org_id` del usuario autenticado
- Previene acceso cross-tenant

---

## 🎨 UI Adaptada por Rol

### Sidebar (`src/components/Sidebar.tsx`)

```typescript
{section.items.map(item => {
  if (!canAccessModule(currentUser?.role, item.id)) return null
  // Renderizar item solo si tiene permiso
})}
```

**Comportamiento:**
- VIEWER: Solo ve Dashboard y Reportes
- VENDEDOR: Ve POS, Clientes, Dashboard
- MANAGER: Ve todo excepto Usuarios, Configuración, Automatizaciones
- ADMIN: Ve todo excepto algunas funciones de OWNER
- OWNER: Acceso total

---

## 📊 Matriz de Permisos

| Módulo | VIEWER | VENDEDOR | MANAGER | ADMIN | OWNER |
|---|---|---|---|---|---|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| POS | ❌ | ✅ | ✅ | ✅ | ✅ |
| Caja | ❌ | ❌ | ✅ | ✅ | ✅ |
| Inventario | ❌ | ❌ | ✅ | ✅ | ✅ |
| Compras | ❌ | ❌ | ✅ | ✅ | ✅ |
| Clientes | ❌ | ✅ | ✅ | ✅ | ✅ |
| Leads | ❌ | ❌ | ✅ | ✅ | ✅ |
| Reportes | ✅ | ❌ | ✅ | ✅ | ✅ |
| Asistente IA | ❌ | ❌ | ✅ | ✅ | ✅ |
| Automatizaciones | ❌ | ❌ | ❌ | ✅ | ✅ |
| Usuarios | ❌ | ❌ | ❌ | ✅ | ✅ |
| Configuración | ❌ | ❌ | ❌ | ✅ | ✅ |
| Facturación | ❌ | ❌ | ✅ | ✅ | ✅ |
| Comunicaciones | ❌ | ❌ | ✅ | ✅ | ✅ |
| Tienda Virtual | ❌ | ❌ | ❌ | ✅ | ✅ |
| Catálogo | ❌ | ❌ | ✅ | ✅ | ✅ |

---

## 🔧 Problemas Resueltos

### 1. Exports de TypeScript
**Problema:** TypeScript no reconocía exports de `requireModule` y `usePermissions`

**Solución:**
- Separar imports de tipos: `import type { Role } from './roles'`
- Usar imports directos en lugar de barrel exports
- Limpiar cache de Next.js (`.next/`)

### 2. Encoding de Archivos
**Problema:** Archivos con caracteres especiales causaban errores de compilación

**Solución:**
- Recrear archivos con encoding UTF-8
- Evitar caracteres especiales en strings de error

---

## ✅ Testing Manual

### Escenario 1: Usuario VENDEDOR
```
✅ Ve Dashboard
✅ Ve POS
✅ Ve Clientes
❌ No ve Inventario
❌ No ve Usuarios
❌ API /api/invoices retorna 403
```

### Escenario 2: Usuario MANAGER
```
✅ Ve Dashboard, POS, Inventario, Compras, Leads
✅ Puede usar Asistente IA
✅ Puede crear facturas
❌ No ve Usuarios
❌ No ve Automatizaciones
```

### Escenario 3: Usuario ADMIN
```
✅ Ve todos los módulos
✅ Puede gestionar usuarios
✅ Puede configurar automatizaciones
✅ Acceso completo a API routes
```

---

## 📈 Métricas de Éxito

- ✅ Build exitoso: `npm run build` - 0 errores
- ✅ TypeCheck exitoso: `npm run typecheck` - 0 errores
- ✅ 16 módulos protegidos por permisos
- ✅ 2 API routes críticos protegidos
- ✅ 5 roles con jerarquía clara
- ✅ Sidebar dinámico según rol
- ✅ Guards server-side funcionando
- ✅ Hook client-side funcionando

---

## 🚀 Próximos Pasos

### Fase 5: Producción y Calidad
1. ✅ Scripts de validación (ya implementados en Fase 3)
2. ⏳ GitHub Actions para CI/CD
3. ⏳ Manejo de errores mejorado
4. ⏳ Documentación de deploy

### Mejoras Futuras
- [ ] Permisos granulares por acción (create, read, update, delete)
- [ ] Audit log de acciones por rol
- [ ] Rate limiting por rol
- [ ] Permisos personalizados por usuario
- [ ] Multi-sucursal con permisos por sucursal

---

## 📝 Notas Técnicas

### Arquitectura de Permisos

```
┌─────────────────────────────────────────┐
│         Client-Side (UI)                │
│  ┌─────────────────────────────────┐   │
│  │  usePermissions() hook          │   │
│  │  - Lee de Zustand session       │   │
│  │  - Valida permisos localmente   │   │
│  │  - Oculta UI no permitida       │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
                  │
                  │ API Request
                  ▼
┌─────────────────────────────────────────┐
│         Server-Side (API)               │
│  ┌─────────────────────────────────┐   │
│  │  requireModule() guard          │   │
│  │  - Valida JWT con Supabase      │   │
│  │  - Lee rol de corivacore_users  │   │
│  │  - Retorna 401/403 si no auth   │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
                  │
                  │ Query
                  ▼
┌─────────────────────────────────────────┐
│         Database (Supabase)             │
│  ┌─────────────────────────────────┐   │
│  │  RLS Policies                   │   │
│  │  - Filtra por org_id            │   │
│  │  - Aislamiento multi-tenant     │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Flujo de Validación

1. **Client-Side (UI)**
   - Usuario intenta acceder a módulo
   - `usePermissions()` valida localmente
   - Si no tiene permiso, oculta UI

2. **Server-Side (API)**
   - Request llega a API route
   - `requireModule()` valida con Supabase Auth
   - Si no autenticado → 401
   - Si no autorizado → 403
   - Si OK → continúa con lógica

3. **Database (RLS)**
   - Query ejecuta en Supabase
   - RLS filtra por `org_id`
   - Solo retorna datos de la organización del usuario

---

## 🎉 Conclusión

**Fase 4 completada exitosamente.** El sistema ahora tiene un control de acceso robusto con validación en múltiples capas:

1. ✅ **UI Layer** - Oculta módulos no permitidos
2. ✅ **API Layer** - Valida permisos en cada request
3. ✅ **DB Layer** - RLS filtra por organización

**Seguridad mejorada:**
- Ya no se confía en datos del cliente
- Todos los API routes críticos están protegidos
- org_id se obtiene del usuario autenticado
- Prevención de acceso cross-tenant

**Próximo paso:** Fase 5 - Producción y Calidad (CI/CD, error handling, deploy docs)
