# Coriva OS — AI Business OS

Sistema operativo para negocios: POS + CRM + Inventario + IA, construido como SaaS multi-tenant para Perú y USA.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 14 · TypeScript · Tailwind CSS |
| Estado | Zustand (session, cart, notifications) |
| Base de datos | Supabase (PostgreSQL + RLS) |
| IA | OpenAI GPT-4o-mini (server-side) |
| Deploy | Vercel |
| Analytics | Google Analytics 4 + Google Tag Manager |

## Instalación

```bash
git clone https://github.com/AnthonyJCSA/AIBusinessOS.git
cd AIBusinessOS
npm install
cp .env.example .env.local
npm run dev
# http://localhost:3000
```

## Variables de entorno

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx
OPENAI_API_KEY=xxxx
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX
```

## Arquitectura multi-tenant

```
corivacore_organizations
  ├── corivacore_users
  ├── corivacore_products
  ├── corivacore_sales
  │   └── corivacore_sale_items
  ├── corivacore_cash_movements
  ├── corivacore_cash_sessions
  ├── corivacore_inventory_movements
  ├── corivacore_customers
  ├── corivacore_leads
  ├── corivacore_pipeline_deals
  ├── corivacore_suppliers
  ├── corivacore_purchases
  │   └── corivacore_purchase_items
  └── corivacore_automations
```

Cada organización tiene aislamiento total via RLS. Todos los servicios filtran por `org_id`.

## Módulos del dashboard (`/src/app/`)

| Módulo | Descripción |
|---|---|
| `DashboardModule` | KPIs reales desde Supabase, gráfico 7 días, top productos, pipeline |
| `POSModule` | Punto de venta con atajos F1/F2/ESC, carrito Zustand, descuentos |
| `CashRegisterModule` | Apertura/cierre de caja con reconciliación |
| `InventoryModule` | CRUD productos, ajuste de stock con motivo |
| `PurchasesModule` | Órdenes de compra, proveedores, recepción con auto-stock |
| `CustomersModule` | CRM con perfil, historial, segmentación automática |
| `LeadsModule` | Pipeline Kanban drag & drop, 6 etapas |
| `ReportsModule` | Ventas por período, top productos, métodos de pago, OPPF/SNIPPF DIGEMID |
| `AIAssistantModule` | Chat GPT-4o-mini con contexto real del negocio + insights proactivos |
| `AutomationsModule` | Reglas de automatización por templates |
| `UsersModule` | CRUD usuarios con Supabase, 5 roles, reset password |
| `SettingsModule` | Configuración del negocio, tema, impuestos, IA |
| `BillingModule` | Facturación electrónica SUNAT |
| `CommunicationsModule` | Email & WhatsApp |
| `VirtualStoreModule` | Tienda online por slug |
| `CatalogModule` | Catálogo digital compartible |

## Servicios (`/src/lib/services/`)

| Servicio | Descripción |
|---|---|
| `authService` | Login con tabla `corivacore_users` |
| `productService` | CRUD productos, control de stock |
| `saleService` | Crear ventas, items, RPC de stock |
| `cashService` | Movimientos de caja legacy |
| `cashSessionService` | Sesiones formales open/close/reconciliation |
| `customerService` | CRUD clientes |
| `inventoryService` | Movimientos, ajuste de stock via RPC |
| `purchaseService` | Suppliers CRUD + Purchases + receive RPC |
| `userService` | CRUD usuarios en Supabase |
| `organizationService` | Crear/actualizar orgs, buscar por slug |
| `invoiceService` | Facturación electrónica |
| `syncService` | Migración localStorage → Supabase |
| `oppfService` | Reporte OPPF/SNIPPF para DIGEMID |

## Estado global (`/src/state/`)

| Store | Descripción |
|---|---|
| `session.store.ts` | Usuario y org autenticados, persiste en localStorage |
| `cart.store.ts` | Carrito POS con descuentos por ítem y global |
| `notifications.store.ts` | Notificaciones del sistema, máx. 50 |

## Roles y permisos

| Rol | Acceso |
|---|---|
| `OWNER` | Todo el sistema + billing |
| `ADMIN` | Todo excepto billing admin |
| `MANAGER` | POS, Caja, Inventario, Reportes, Clientes, Leads, Compras |
| `VENDEDOR` | Solo POS y registro de clientes |
| `VIEWER` | Solo Dashboard y Reportes (lectura) |

## Planes y feature flags

| Plan | Módulos incluidos |
|---|---|
| `starter` | POS, Inventario, Caja, Clientes, Reportes |
| `pro` | + Leads, Compras, Comunicaciones, Asistente IA |
| `premium` | + Facturación, Tienda Virtual, Catálogo, Automatizaciones |

## Inteligencia Artificial

### Asistente conversacional (`/api/ai/chat`)
- Modelo: `gpt-4o-mini` via OpenAI API (server-side)
- `buildBusinessContext(orgId)` — fetches datos reales de Supabase
- `buildSystemPrompt(ctx)` — genera prompt con contexto del negocio
- Panel de insights proactivos: stock crítico, leads sin contactar, ventas del día

### IA predictiva de stock (`/src/lib/ai-predictions.ts`)
- Lógica local, analiza historial de ventas 30 días
- Niveles: `critical` (≤3 días), `warning` (≤7 días), `ok`

## Migraciones SQL (`/database/migrations/`)

| Archivo | Contenido |
|---|---|
| `001_inventory_cash_rls.sql` | inventory_movements, cash_sessions legacy, RLS real, RPCs de stock |
| `002_purchases_suppliers.sql` | suppliers, purchases, purchase_items, RPC receive_purchase |
| `003_customers_leads_pipeline.sql` | métricas customers, leads, pipeline_stages, pipeline_deals |
| `004_purchase_number_rls.sql` | RPC generate_purchase_number, RLS suppliers/purchases, triggers |
| `005_cash_sessions.sql` | cash_sessions formal con RLS |
| `006_automations.sql` | automations table con RLS + trigger updated_at |
| `012_oppf_snippf.sql` | Campos DIGEMID, RPC generate_oppf_report |

> Ejecutar en orden en Supabase SQL Editor.

## RPCs de Supabase

| Función | Descripción |
|---|---|
| `generate_sale_number(p_org_id)` | Número correlativo de venta |
| `generate_purchase_number(p_org_id)` | Número correlativo de compra |
| `decrement_product_stock(p_product_id, p_quantity)` | Decrementa stock atómicamente |
| `adjust_product_stock(p_org_id, p_product_id, p_new_stock, p_reason, p_user_id)` | Ajuste con log |
| `receive_purchase(p_purchase_id, p_received_by)` | Recibe OC y actualiza stock |
| `get_customer_stats(p_customer_id, p_org_id)` | Estadísticas de compras del cliente |
| `get_user_org_id()` | Retorna org_id del usuario autenticado (usado en RLS) |
| `generate_oppf_report(p_org_id, p_month, p_year)` | Genera reporte mensual OPPF/SNIPPF para DIGEMID |

## Landing pages

- `/` — Home principal
- `/bodega` — Bodegas y minimarkets
- `/botica` — Farmacias y boticas
- `/precios` — Planes Starter / Pro / Premium
- `/comparacion` — Comparativa con competidores
- `/casos-de-uso/[tipo]` — Por tipo de negocio
- `/demo` — Demo interactivo
- `/registro` — Onboarding wizard
- `/tienda/[slug]` — Tienda virtual pública

## Deploy

```bash
npm run build   # build de producción (debe salir exit 0)
npm run start   # servidor de producción
vercel deploy   # deploy a Vercel
```

Variables de entorno configuradas en Vercel dashboard.

## Tipos de negocio soportados

`pharmacy` · `hardware` · `clothing` · `barbershop` · `restaurant` · `retail` · `other`

## Roadmap

- [ ] Autenticación Supabase Auth (migrar de tabla custom)
- [ ] Billing con Stripe
- [ ] Multi-sucursal
- [ ] Códigos de barras (ZXing)
- [ ] App móvil (React Native / Expo)
- [ ] API pública con API keys
- [ ] Webhooks para integraciones

## Soporte

- Email: soporte@corivape.com
- WhatsApp: +51 913 916 967
- Repositorio: https://github.com/AnthonyJCSA/AIBusinessOS
