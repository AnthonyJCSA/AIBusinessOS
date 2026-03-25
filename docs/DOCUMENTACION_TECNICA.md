# Documentación Técnica — Coriva OS

## Stack tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| Next.js | 14.0.4 | Framework frontend + API routes |
| TypeScript | 5.x | Type safety en todo el proyecto |
| Tailwind CSS | 3.x | Layout y spacing (colores via CSS vars) |
| Zustand | 4.x | Estado global (session, cart, notifications) |
| @supabase/supabase-js | 2.x | Cliente Supabase |
| OpenAI | API REST | GPT-4o-mini server-side |
| Vercel | — | Deploy y hosting |

---

## Configuración del proyecto

### Variables de entorno (`.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx
OPENAI_API_KEY=xxxx                    # Solo server-side
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX
```

### `tsconfig.json`
- Path alias `@/*` → `./src/*`
- Excluye: `coriva-tienda-nextjs`, `database`, `docs`, `email-templates`

### `next.config.js`
- webpack watchOptions ignora `coriva-tienda-nextjs/`

---

## Cliente Supabase

### `src/lib/supabase.ts`
```typescript
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)
export const isSupabaseConfigured = () => !!supabaseUrl && !!supabaseAnonKey
```

El cliente siempre se crea (con URLs placeholder si no hay config). `isSupabaseConfigured()` se usa en todos los servicios para retornar datos vacíos en modo demo.

### `src/lib/supabase/index.ts`
Re-export para compatibilidad con imports `@/lib/supabase`.

---

## Servicios Supabase (`/src/lib/services/`)

Todos los servicios siguen el mismo patrón:
```typescript
export const xService = {
  async method(orgId: string, ...): Promise<T> {
    if (!isSupabaseConfigured()) return [] // o null o throw
    const { data, error } = await supabase.from('table')...
    if (error) throw error
    return data as T
  }
}
```

### `auth.service.ts`
- `login(username, password)` — query a `corivacore_users` JOIN `corivacore_organizations`
- `createUser(userData)` — INSERT en `corivacore_users`
- `getOrganization(orgId)` — SELECT `corivacore_organizations`

> ⚠️ Passwords comparados en texto plano. Deuda técnica: migrar a bcrypt o Supabase Auth.

### `product.service.ts`
- `getAll(orgId)`, `create(orgId, data)`, `update(id, data)`, `delete(id)`
- `getByCode(orgId, code)`, `getLowStock(orgId)`

### `sale.service.ts`
- `create(orgId, saleData)` — usa RPC `generate_sale_number` + `decrement_product_stock`
- `getAll(orgId)`, `getToday(orgId)`, `getLast7Days(orgId)`, `getTopProducts(orgId)`

### `cashSession.service.ts`
- `getActive(orgId)` — sesión con status `'open'`
- `open(orgId, openingAmount, userId)` — INSERT nueva sesión
- `close(sessionId, closingAmount, expectedAmount, userId, notes?)` — UPDATE con diferencia calculada
- `getHistory(orgId, limit?)` — últimas N sesiones

### `inventory.service.ts`
- `getMovements(orgId, limit?)` — con JOIN a `corivacore_products`
- `adjustStock(orgId, productId, newStock, reason, userId)` — RPC `adjust_product_stock`
- `getMovementsSummary(orgId)` — conteo IN/OUT/ADJUSTMENT últimos 30 días

### `purchase.service.ts`
- `getSuppliers(orgId)`, `createSupplier(orgId, data)`
- `getAll(orgId)` — con JOIN a suppliers e items
- `create(orgId, {supplier_id, items, notes, expected_at})` — usa RPC `generate_purchase_number`
- `receive(purchaseId, receivedBy?)` — RPC `receive_purchase` (actualiza stock + log)
- `cancel(purchaseId)`

### `customer.service.ts`
- `getAll(orgId)`, `create(orgId, data)`, `update(id, data)`
- `getStats(customerId, orgId)` — RPC `get_customer_stats`
- `getPurchaseHistory(customerId, orgId)`

### `user.service.ts`
- `getAll(orgId)` — mapea `org_id` → `organization_id`
- `create(orgId, {username, password, full_name, email, role})`
- `update(userId, payload)`, `toggleActive(userId, isActive)`
- `resetPassword(userId, newPassword)`

---

## Estado global (Zustand)

### `session.store.ts`
```typescript
interface SessionState {
  user: User | null
  org: Organization | null
  isAuthenticated: boolean
  setSession(user, org): void
  updateOrg(org): void
  clearSession(): void
}
// persist → localStorage key: 'coriva-session'
```

### `cart.store.ts`
```typescript
interface CartState {
  items: CartItem[]           // CartItem extends Product + { quantity, itemDiscount }
  globalDiscount: number      // 0-100 porcentaje
  paymentMethod: 'EFECTIVO' | 'TARJETA' | 'YAPE' | 'PLIN' | 'TRANSFERENCIA'
  amountPaid: number
  receiptType: 'BOLETA' | 'FACTURA' | 'TICKET'
  customerName: string
  // Computed
  subtotal(): number          // precio × qty × (1 - itemDiscount/100)
  totalDiscount(): number     // subtotal × globalDiscount/100
  tax(): number               // (subtotal - totalDiscount) × 0.18/1.18
  total(): number             // subtotal - totalDiscount
  change(): number            // max(0, amountPaid - total)
}
```

### `notifications.store.ts`
```typescript
interface AppNotification {
  id: string
  type: 'stock_alert' | 'insight' | 'task' | 'sale' | 'system'
  title: string
  body: string
  severity: 'info' | 'warning' | 'critical'
  isRead: boolean
  createdAt: string
}
// Máximo 50 notificaciones (slice al agregar)
```

---

## Middleware de autenticación

### `middleware.ts`
```typescript
// Protege /dashboard/*
// Verifica cookie 'coriva-session' (Zustand persist)
// Permite acceso si Supabase no está configurado (demo mode)
// Redirige a /login?from=<pathname> si no hay sesión
```

---

## Inteligencia Artificial

### `src/lib/ai/context-builder.ts` (server-side)
```typescript
async function buildBusinessContext(orgId: string) {
  // Queries paralelas a Supabase:
  // - corivacore_organizations (nombre, tipo, moneda)
  // - corivacore_sales (ventas de hoy)
  // - corivacore_products (total y stock crítico)
  return { businessName, businessType, currency, productsCount, lowStockCount, todaySales, todayRevenue }
}
```

### `src/lib/ai/prompts.ts`
```typescript
export const QUICK_QUESTIONS: string[]  // 6 preguntas predefinidas
export function buildSystemPrompt(ctx): string  // System prompt con datos reales
```

### `/api/ai/chat/route.ts`
```
POST { messages, orgId, businessType }
→ buildBusinessContext(orgId)
→ buildSystemPrompt(ctx)
→ OpenAI gpt-4o-mini (max_tokens: 600, temperature: 0.7)
← { reply: string }
```

---

## RBAC — Permisos

### `src/lib/permissions.ts`
```typescript
export type Role = 'OWNER' | 'ADMIN' | 'MANAGER' | 'VENDEDOR' | 'VIEWER'

export const ROLE_PERMISSIONS: Record<Role, Permission[]>
export function hasPermission(role, module, action): boolean
export function canAccessModule(role, module): boolean
```

### Shared hooks
```typescript
useCurrentUser()           // → User | null desde Zustand
useOrganization()          // → Organization | null desde Zustand
usePermission(module, action?)  // → boolean (RBAC check)
useFeatureFlag(feature)    // → boolean (plan-based gating)
```

---

## Tipos principales (`/src/types/index.ts`)

```typescript
interface Organization {
  id: string; name: string; slug: string
  business_type: 'pharmacy' | 'hardware' | 'clothing' | 'barbershop' | 'restaurant' | 'retail' | 'other'
  settings: OrganizationSettings  // currency, tax_rate, plan, theme_color, tax_name, tax_included, ...
}

interface User {
  id: string; organization_id: string; username: string
  role: 'OWNER' | 'ADMIN' | 'MANAGER' | 'VENDEDOR' | 'VIEWER'
  is_active: boolean
}

interface Product {
  id: string; code: string; name: string
  price: number; cost?: number; stock: number; min_stock: number
  metadata?: ProductMetadata  // campos específicos por tipo de negocio
}

interface CartItem extends Product {
  quantity: number
  itemDiscount: number  // porcentaje 0-100
}
```

---

## Convenciones de código

### Módulos del dashboard
- Siempre `'use client'`
- Props mínimas: `currentUser: User`, `orgId: string` o `currentOrg: Organization`
- Carga de datos con `useCallback` + `useEffect`
- Error handling: estado `error: string` local, no `alert()`

### Servicios
- Objetos planos (no clases)
- Siempre verificar `isSupabaseConfigured()` primero
- Lanzar el error de Supabase directamente (`if (error) throw error`)
- Retornar tipos explícitos con `as T`

### CSS
- Colores y tema: CSS variables (`var(--text)`, `var(--accent)`, `var(--green)`, etc.)
- Layout/spacing: clases Tailwind
- Bordes y fondos de cards: inline styles con CSS vars
- No usar colores Tailwind directamente (para soportar dark/light mode)

### Nombres de tablas
- Prefijo `corivacore_` en todas las tablas
- IDs: UUID via `gen_random_uuid()`
- Timestamps: `TIMESTAMPTZ DEFAULT NOW()`
- Soft delete: columna `is_active` (no DELETE físico en producción)

---

## RPCs de Supabase

```sql
-- Genera número correlativo de venta
generate_sale_number(p_org_id UUID) → TEXT  -- V-YY-0001

-- Genera número correlativo de compra
generate_purchase_number(p_org_id UUID) → TEXT  -- OC-YY-0001

-- Decrementa stock (usado en ventas)
decrement_product_stock(p_product_id UUID, p_quantity INT) → VOID

-- Ajusta stock con log de movimiento
adjust_product_stock(p_org_id UUID, p_product_id UUID, p_new_stock INT, p_reason TEXT, p_user_id UUID) → VOID

-- Recibe una orden de compra y actualiza stock
receive_purchase(p_purchase_id UUID, p_received_by UUID) → VOID

-- Estadísticas de un cliente
get_customer_stats(p_customer_id UUID, p_org_id UUID) → TABLE(total_purchases, total_spent, avg_ticket, last_purchase, first_purchase)

-- Retorna org_id del usuario autenticado (usado en RLS)
get_user_org_id() → UUID
```

---

## Migraciones SQL

Ubicación: `database/migrations/`

| Archivo | Descripción |
|---|---|
| `001_inventory_cash_rls.sql` | Tablas inventory_movements, ai_insights. RLS real via get_user_org_id(). RPCs decrement y adjust stock |
| `002_purchases_suppliers.sql` | Tablas suppliers, purchases, purchase_items. RPC receive_purchase |
| `003_customers_leads_pipeline.sql` | Columnas métricas en customers. RPC get_customer_stats. Tablas leads, pipeline_stages, pipeline_deals |
| `004_purchase_number_rls.sql` | RPC generate_purchase_number. RLS para suppliers/purchases/purchase_items. Triggers updated_at |
| `005_cash_sessions.sql` | Tabla cash_sessions con RLS |
| `006_automations.sql` | Tabla automations con RLS + trigger updated_at |

> Ejecutar en orden. Requiere que `get_user_org_id()` exista (creada en 001).

---

## Performance

- `/dashboard` First Load JS: ~178 kB (incluye todos los módulos)
- Todos los módulos en el mismo bundle (no lazy loading aún)
- Queries Supabase en paralelo con `Promise.allSettled()` en DashboardModule
- `useCallback` en todos los data loaders para evitar re-renders

### Optimizaciones pendientes
- Lazy loading de módulos con `dynamic(() => import(...))`
- Paginación en tablas grandes (productos, ventas, movimientos)
- Debounce en búsquedas del POS e Inventario
