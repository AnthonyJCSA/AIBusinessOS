# Arquitectura — Coriva OS

## Diagrama general

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER                              │
│                                                             │
│  Next.js 14 App Router                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Dashboard│  │   POS    │  │  Leads   │  │   IA     │   │
│  │ Module   │  │ Module   │  │ Module   │  │Assistant │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       │              │              │              │         │
│  ┌────▼──────────────▼──────────────▼──────────────▼─────┐  │
│  │              Zustand Stores                           │  │
│  │  session.store · cart.store · notifications.store     │  │
│  └────────────────────────┬──────────────────────────────┘  │
│                           │                                 │
│  ┌────────────────────────▼──────────────────────────────┐  │
│  │              Services Layer (/src/lib/services/)      │  │
│  │  auth · product · sale · cash · inventory · purchase  │  │
│  │  customer · user · organization · cashSession · etc   │  │
│  └────────────────────────┬──────────────────────────────┘  │
└───────────────────────────┼─────────────────────────────────┘
                            │ @supabase/supabase-js
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      SUPABASE                               │
│                                                             │
│  PostgreSQL + RLS (Row Level Security)                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  get_user_org_id() → filtra por org en cada tabla   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Tablas principales:                                        │
│  organizations · users · products · sales · sale_items      │
│  cash_movements · cash_sessions · inventory_movements       │
│  customers · leads · pipeline_deals · pipeline_stages       │
│  suppliers · purchases · purchase_items · automations       │
│                                                             │
│  RPCs:                                                      │
│  generate_sale_number · generate_purchase_number            │
│  decrement_product_stock · adjust_product_stock             │
│  receive_purchase · get_customer_stats                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼ (server-side only)
┌─────────────────────────────────────────────────────────────┐
│                    OPENAI API                               │
│  /api/ai/chat → buildBusinessContext() → buildSystemPrompt()│
│  Modelo: gpt-4o-mini · max_tokens: 600                      │
└─────────────────────────────────────────────────────────────┘
```

## Estructura de directorios

```
src/
├── app/
│   ├── (auth)/                    # Rutas de autenticación
│   ├── (dashboard)/               # Rutas del dashboard
│   ├── (marketing)/               # Landing pages
│   ├── api/ai/chat/route.ts       # Endpoint IA (server-side)
│   ├── dashboard/page.tsx         # Shell principal del dashboard
│   ├── DashboardModule.tsx        # KPIs reales + gráfico 7d
│   ├── POSModule.tsx              # Punto de venta
│   ├── CashRegisterModule.tsx     # Gestión de caja
│   ├── InventoryModule.tsx        # Inventario + ajuste stock
│   ├── PurchasesModule.tsx        # Compras & proveedores
│   ├── CustomersModule.tsx        # CRM clientes
│   ├── LeadsModule.tsx            # Pipeline Kanban
│   ├── ReportsModule.tsx          # Reportes con datos reales
│   ├── AIAssistantModule.tsx      # Chat IA + insights
│   ├── AutomationsModule.tsx      # Automatizaciones
│   ├── UsersModule.tsx            # Gestión de usuarios
│   ├── SettingsModule.tsx         # Configuración
│   ├── NotificationsPanel.tsx     # Campana Zustand
│   └── ...
│
├── components/
│   ├── Sidebar.tsx                # Navegación lateral (16 módulos)
│   └── Topbar.tsx                 # Barra superior + NotificationsPanel
│
├── lib/
│   ├── ai/
│   │   ├── context-builder.ts     # Fetches datos reales de Supabase
│   │   └── prompts.ts             # buildSystemPrompt + QUICK_QUESTIONS
│   ├── services/
│   │   ├── index.ts               # Re-exports de los 12 servicios
│   │   ├── auth.service.ts
│   │   ├── product.service.ts
│   │   ├── sale.service.ts
│   │   ├── cash.service.ts
│   │   ├── cashSession.service.ts
│   │   ├── inventory.service.ts
│   │   ├── purchase.service.ts
│   │   ├── customer.service.ts
│   │   ├── user.service.ts
│   │   ├── organization.service.ts
│   │   ├── invoice.service.ts
│   │   └── sync.service.ts
│   ├── supabase/
│   │   └── index.ts               # Re-export del cliente Supabase
│   ├── permissions.ts             # RBAC 5 roles
│   ├── supabase.ts                # createClient + isSupabaseConfigured()
│   └── theme.ts                   # loadThemeFromOrg, applyTheme
│
├── modules/
│   └── operations/
│       └── inventory/
│           └── components/
│               └── StockAdjustModal.tsx
│
├── shared/
│   ├── components/
│   │   └── layout/
│   │       └── DashboardShell.tsx  # Layout reutilizable
│   └── hooks/
│       ├── useCurrentUser.ts
│       ├── useOrganization.ts
│       ├── usePermission.ts
│       └── useFeatureFlag.ts
│
├── state/
│   ├── session.store.ts           # Zustand + persist
│   ├── cart.store.ts              # Carrito POS
│   └── notifications.store.ts    # Notificaciones
│
└── types/
    └── index.ts                   # Organization, User, Product, Sale, etc.
```

## Flujo de autenticación

```
1. /login → authService.login(username, password)
2. Supabase query → corivacore_users JOIN corivacore_organizations
3. useSessionStore.setSession(user, org) → persiste en localStorage
4. middleware.ts verifica cookie 'coriva-session' en rutas /dashboard/*
5. loadThemeFromOrg(org) → aplica CSS vars del negocio
```

## Flujo de venta (POS)

```
1. useCartStore.addItem(product)     → valida stock
2. useCartStore.total()              → subtotal - descuentos
3. saleService.create(orgId, data)   → INSERT corivacore_sales + items
4. RPC decrement_product_stock()     → actualiza stock atómicamente
5. cashService.registerSale()        → registra movimiento de caja
6. printReceipt()                    → abre ventana de impresión
```

## Flujo de compra (Purchases)

```
1. purchaseService.create(orgId, {items, supplier_id})
2. RPC generate_purchase_number()    → OC-YY-0001
3. INSERT corivacore_purchases + purchase_items
4. purchaseService.receive(id)
5. RPC receive_purchase()            → actualiza stock + log inventario
```

## Flujo de IA

```
Client → POST /api/ai/chat { messages, orgId, businessType }
Server → buildBusinessContext(orgId)   → Supabase queries
Server → buildSystemPrompt(ctx)        → prompt con datos reales
Server → OpenAI gpt-4o-mini            → respuesta
Client ← { reply: string }
```

## Multi-tenancy y RLS

Cada tabla tiene `org_id UUID NOT NULL`. La función `get_user_org_id()` retorna el `org_id` del usuario autenticado via `auth.uid()`. Las políticas RLS usan esta función:

```sql
CREATE POLICY "org_isolation" ON corivacore_products
  FOR ALL USING (org_id = get_user_org_id());
```

En modo demo (Supabase no configurado), `isSupabaseConfigured()` retorna `false` y los servicios devuelven arrays vacíos sin lanzar errores.

## Gestión de estado

```
useSessionStore (persist)
  ├── user: User | null
  ├── org: Organization | null
  ├── isAuthenticated: boolean
  ├── setSession(user, org)
  ├── updateOrg(org)
  └── clearSession()

useCartStore
  ├── items: CartItem[]          (con itemDiscount por ítem)
  ├── globalDiscount: number
  ├── paymentMethod
  ├── subtotal() / total() / tax() / change()
  └── addItem / removeItem / updateQty / clear

useNotificationsStore
  ├── notifications: AppNotification[]  (máx. 50)
  ├── unreadCount()
  ├── add / markRead / markAllRead / remove / clear
  └── severity: 'info' | 'warning' | 'critical'
```

## RBAC — Roles y permisos

```
OWNER    → todo el sistema (billing_admin incluido)
ADMIN    → todo excepto billing_admin
MANAGER  → dashboard, pos, cash, inventory, purchases, customers, leads, reports, communications
VENDEDOR → dashboard, pos, customers
VIEWER   → dashboard, reports (solo lectura)
```

`canAccessModule(role, moduleId)` — usado en Sidebar para mostrar/ocultar items.
`usePermission(module, action?)` — hook para guards en componentes.
`useFeatureFlag(feature)` — gating por plan (starter/pro/premium).

## Feature flags por plan

```
starter  → pos, inventory, cash, customers, reports
pro      → + leads, purchases, communications, asistente
premium  → + billing, store, catalog, automations
```

## Convenciones de código

- Todos los módulos son `'use client'` con hooks propios
- Los servicios son objetos planos (no clases) con métodos async
- CSS via CSS variables (`var(--text)`, `var(--accent)`, etc.) — sin clases Tailwind para colores
- Tailwind solo para layout/spacing/flex/grid
- Nombres de tablas: `corivacore_*` (prefijo consistente)
- IDs: UUID generados por Supabase (`gen_random_uuid()`)
