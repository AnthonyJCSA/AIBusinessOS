# Documentación del Proyecto — Coriva OS

## Resumen ejecutivo

**Coriva OS** es un sistema operativo para negocios: POS + CRM + Inventario + IA, construido como SaaS multi-tenant para el mercado peruano y latinoamericano.

**Estado actual**: Producción — 7 sprints completados, build limpio, listo para deploy.

**Repositorio**: https://github.com/AnthonyJCSA/AIBusinessOS

---

## Modelo de negocio

### SaaS multi-tenant
Cada negocio (tenant) tiene datos completamente aislados via RLS en Supabase. Un solo deployment sirve a todos los clientes.

### Planes

| Plan | Precio | Módulos |
|---|---|---|
| Starter | $19/mes | POS, Inventario, Caja, Clientes, Reportes |
| Pro | $49/mes | + Leads, Compras, Comunicaciones, Asistente IA |
| Premium | $99/mes | + Facturación SUNAT, Tienda Virtual, Automatizaciones |

### Tipos de negocio soportados
`pharmacy` · `hardware` · `clothing` · `barbershop` · `restaurant` · `retail` · `other`

---

## Funcionalidades implementadas

### Operaciones (Core)
- **POS** — Punto de venta con atajos de teclado (F1 limpiar, F2 procesar), carrito Zustand con descuentos por ítem y global, múltiples métodos de pago, impresión de comprobante
- **Caja** — Apertura/cierre formal con reconciliación (esperado vs. contado), historial de sesiones, registro de gastos
- **Inventario** — CRUD productos, ajuste de stock con motivo (reabastecimiento, merma, robo, corrección), log de movimientos
- **Compras** — Órdenes de compra con número correlativo (OC-YY-0001), gestión de proveedores, recepción automática actualiza stock via RPC

### CRM & Crecimiento
- **Clientes** — Perfil completo, historial de compras, segmentación automática (nuevo/regular/frecuente/VIP/inactivo), métricas (ticket promedio, días desde última compra), botón WhatsApp directo
- **Leads** — Pipeline Kanban con 6 etapas (Nuevo → Contactado → Calificado → Propuesta → Ganado → Perdido), drag & drop HTML5 nativo, link directo a WhatsApp

### Análisis
- **Dashboard** — KPIs reales desde Supabase: ventas hoy, gráfico 7 días con datos reales, top productos por ventas, leads activos, compras pendientes
- **Reportes** — Ventas por período, top productos, desglose por método de pago, exportación

### Inteligencia Artificial
- **Asistente IA** — Chat GPT-4o-mini con contexto real del negocio (ventas hoy, stock crítico, tipo de negocio), panel de insights proactivos, 6 preguntas rápidas predefinidas
- **Insights proactivos** — Detecta automáticamente: productos sin stock, stock bajo, leads sin contactar, ventas del día
- **Predicción de stock** — Lógica local que analiza historial 30 días y predice agotamiento

### Sistema
- **Usuarios** — CRUD completo en Supabase, 5 roles (OWNER/ADMIN/MANAGER/VENDEDOR/VIEWER), toggle activo/inactivo, reset de contraseña
- **Automatizaciones** — Templates: alerta stock crítico, bienvenida cliente nuevo, resumen diario, reactivar clientes inactivos
- **Configuración** — Nombre, tipo de negocio, RUC, moneda, IGV, pie de comprobante, tema (dark/light), color del sistema, toggles de IA
- **Notificaciones** — Campana en Topbar conectada a Zustand store, severidades (info/warning/critical), marcar como leídas

---

## Arquitectura técnica

### Stack
- **Frontend**: Next.js 14 App Router + TypeScript + Tailwind CSS
- **Estado**: Zustand (session, cart, notifications) con persist middleware
- **Base de datos**: Supabase (PostgreSQL + RLS)
- **IA**: OpenAI GPT-4o-mini (server-side via `/api/ai/chat`)
- **Deploy**: Vercel
- **Analytics**: Google Analytics 4 + Google Tag Manager

### Patrones clave
- **Multi-tenant via RLS**: `get_user_org_id()` filtra automáticamente por organización
- **Services layer**: 12 servicios Supabase como objetos planos con métodos async
- **Feature flags**: Plan-based gating via `useFeatureFlag(feature)`
- **RBAC**: `canAccessModule(role, module)` en Sidebar, `usePermission(module, action)` en componentes
- **Demo mode**: `isSupabaseConfigured()` — si no hay credenciales, los servicios retornan arrays vacíos sin errores

### Base de datos — tablas principales

| Tabla | Descripción |
|---|---|
| `corivacore_organizations` | Tenants del sistema |
| `corivacore_users` | Usuarios por organización |
| `corivacore_products` | Catálogo de productos |
| `corivacore_sales` + `sale_items` | Ventas e ítems |
| `corivacore_cash_movements` | Movimientos de caja legacy |
| `corivacore_cash_sessions` | Sesiones formales de caja |
| `corivacore_inventory_movements` | Log de movimientos de stock |
| `corivacore_customers` | Base de clientes |
| `corivacore_leads` | Pipeline de prospectos |
| `corivacore_pipeline_stages` + `pipeline_deals` | CRM pipeline |
| `corivacore_suppliers` | Proveedores |
| `corivacore_purchases` + `purchase_items` | Órdenes de compra |
| `corivacore_automations` | Reglas de automatización |

---

## Seguridad

### Autenticación actual
- Tabla `corivacore_users` con `password_hash` (comparación directa — deuda técnica)
- Sesión persistida en Zustand + localStorage (`coriva-session`)
- Middleware Next.js verifica cookie en rutas `/dashboard/*`

### Deuda técnica de seguridad
- Passwords en texto plano → migrar a bcrypt o Supabase Auth
- Sin rate limiting en login
- Sin 2FA

### RLS (Row Level Security)
Todas las tablas tienen RLS habilitado. La función `get_user_org_id()` vincula `auth.uid()` con `corivacore_users.org_id`. Actualmente las migraciones 001-006 deben ejecutarse para activar RLS real (sin ellas, las políticas son permisivas).

---

## Migraciones pendientes

Ejecutar en orden en Supabase SQL Editor:

```
database/migrations/001_inventory_cash_rls.sql
database/migrations/002_purchases_suppliers.sql
database/migrations/003_customers_leads_pipeline.sql
database/migrations/004_purchase_number_rls.sql
database/migrations/005_cash_sessions.sql
database/migrations/006_automations.sql
```

---

## Deploy

### Vercel (producción)
1. Conectar repositorio GitHub en Vercel
2. Framework preset: `Next.js`
3. Configurar variables de entorno en Vercel dashboard
4. Deploy automático en cada push a `main`

### Variables requeridas en Vercel
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
OPENAI_API_KEY
NEXT_PUBLIC_GTM_ID
NEXT_PUBLIC_GA4_ID
```

---

## Sprints completados

| Sprint | Contenido | Estado |
|---|---|---|
| Sprint 1 | Supabase client/server, middleware auth, Zustand stores, RBAC, feature flags | ✅ |
| Sprint 2 | POS refactor con hooks, CartStore, DashboardShell, AI context builder | ✅ |
| Sprint 3 | Cash sessions, Purchases+Suppliers, Customers CRM, Reports reales, Settings | ✅ |
| Sprint 4 | PurchasesModule UI, LeadsModule Kanban, NotificationsPanel Zustand, Topbar | ✅ |
| Sprint 5 | DashboardModule KPIs reales, UsersModule Supabase, AIAssistant insights | ✅ |
| Sprint 6 | API IA con contexto real, todos los servicios en disco, middleware, shared hooks | ✅ |
| Sprint 7 | StockAdjustModal, cart.store, DashboardShell, AutomationsModule, migrations 005-006 | ✅ |

---

## Roadmap

### Próximo (Sprint 8)
- [ ] Migrar autenticación a Supabase Auth (bcrypt + JWT)
- [ ] Billing con Stripe (planes, suscripciones, webhooks)
- [ ] Onboarding wizard conectado a Supabase

### Futuro
- [ ] Multi-sucursal
- [ ] Códigos de barras (ZXing)
- [ ] App móvil (React Native / Expo)
- [ ] API pública con API keys
- [ ] Webhooks para integraciones externas
- [ ] Facturación electrónica SUNAT real

---

## Contacto

- Email: soporte@corivape.com
- WhatsApp: +51 913 916 967
- Repositorio: https://github.com/AnthonyJCSA/AIBusinessOS

**Última actualización**: Sprint 7 completado — build limpio ✅
