# AIBusinessOS — Coriva Core

> Sistema POS Multi-Tenant SaaS con IA para negocios en Perú y USA.
> Bodegas · Boticas · Tiendas · Barberías · Restaurantes · Retail

[![Deploy on Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 14 + TypeScript + Tailwind CSS |
| Estado | Zustand v5 |
| Base de datos | Supabase (PostgreSQL) |
| Autenticación | Supabase Auth |
| IA | OpenAI GPT-4o-mini |
| Deploy | Vercel |
| Analytics | Google Analytics 4 + Google Tag Manager |

---

## Instalación Local

### 1. Clonar el repositorio

```bash
git clone https://github.com/AnthonyJCSA/AIBusinessOS.git
cd AIBusinessOS
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx

# OpenAI (server-side, sin NEXT_PUBLIC_)
OPENAI_API_KEY=sk-xxxx

# Analytics (opcionales en desarrollo)
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX
```

### 4. Configurar la base de datos en Supabase

Ejecuta los scripts SQL en este orden en el **SQL Editor de Supabase**:

| # | Archivo | Descripción |
|---|---|---|
| 1 | `database/SETUP_SUPABASE.sql` | Tablas base: organizations, users, products, sales, cash |
| 2 | `database/migration_v2_complete.sql` | Columnas extendidas, invoices, triggers, RPCs de reportes |
| 3 | `database/migrations/001_inventory_cash_rls.sql` | inventory_movements, cash_sessions, ai_insights, RLS real |
| 4 | `database/migrations/002_purchases_suppliers.sql` | suppliers, purchases, purchase_items |
| 5 | `database/migrations/003_customers_leads_pipeline.sql` | CRM columns, leads, pipeline_stages, pipeline_deals |
| 6 | `database/migrations/004_purchase_number_rls.sql` | Fix generate_purchase_number, RLS suppliers/purchases |
| 7 | `database/migrations/005_lead_notes_sprint6.sql` | lead_notes, estimated_value en leads |
| 8 | `database/migrations/006_automations_sprint7.sql` | automations, automation_logs, RPC increment_run_count |

> **Importante**: Ejecutar en orden estricto. Cada script depende del anterior.

### 5. Correr en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo (puerto 3000)
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # ESLint
npm run type-check   # TypeScript sin emitir archivos
```

---

## Arquitectura Multi-Tenant

```
corivacore_organizations (org_id: TEXT)
  ├── corivacore_users
  ├── corivacore_products
  ├── corivacore_sales
  │   └── corivacore_sale_items
  ├── corivacore_cash_sessions
  │   └── corivacore_cash_movements
  ├── corivacore_customers
  │   └── corivacore_lead_notes
  ├── corivacore_leads
  │   └── corivacore_pipeline_deals
  ├── corivacore_suppliers
  │   └── corivacore_purchases
  │       └── corivacore_purchase_items
  ├── corivacore_invoices
  │   └── corivacore_invoice_credits
  ├── corivacore_automations
  │   └── corivacore_automation_logs
  └── corivacore_ai_insights
```

Cada organización tiene aislamiento total via Row Level Security (RLS). Todos los servicios filtran por `org_id`.

---

## Módulos del Sistema

| Módulo | Ruta | Descripción |
|---|---|---|
| POSModule | `/dashboard` → POS | Punto de venta, atajos F1/F2/ESC/ENTER |
| InventoryModule | `/dashboard` → Inventario | CRUD productos, ajuste stock, importación CSV |
| CashRegisterModule | `/dashboard` → Caja | Apertura/cierre, seguimiento en tiempo real |
| ReportsModule | `/dashboard` → Reportes | Ventas por período, anulaciones, exportación Excel |
| CustomersModule | `/dashboard` → Clientes | CRM con auto-segmentación, historial de compras |
| LeadsModule | `/dashboard` → Leads | Kanban drag & drop, notas, pipeline de ventas |
| BillingModule | `/dashboard` → Facturación | Facturas, créditos, cuotas, correlativo automático |
| PurchasesModule | `/dashboard` → Compras | Órdenes de compra, proveedores, recepción |
| AutomationsModule | `/dashboard` → Automatizaciones | Workflows, templates, logs de ejecución |
| AIAssistantModule | `/dashboard` → IA | Chat con GPT-4o-mini, historial persistente |
| UsersModule | `/dashboard` → Usuarios | CRUD usuarios, roles y permisos |
| SettingsModule | `/dashboard` → Configuración | Logo, impuestos, colores, datos del negocio |

---

## Servicios (`/src/lib/services/`)

| Servicio | Descripción |
|---|---|
| `authService` | Login, creación de usuarios, obtener organización |
| `productService` | CRUD productos, control de stock |
| `saleService` | Crear ventas, items, actualizar stock vía RPC |
| `cashService` | Sesiones de caja, movimientos |
| `customerService` | CRUD clientes |
| `crmService` | Auto-segmentación, stats de retención, clientes inactivos |
| `invoiceService` | CRUD facturas, créditos, correlativo, cancelación |
| `automation.service` | CRUD automatizaciones, templates, logs |
| `organizationService` | Crear/actualizar organizaciones, buscar por slug |
| `syncService` | Sincronización localStorage ↔ Supabase |

---

## Inteligencia Artificial

### Asistente Conversacional
- Modelo: `gpt-4o-mini` via OpenAI API (server-side)
- Endpoint: `POST /api/ai/chat`
- Historial persistente en localStorage por `orgId` (máx 40 mensajes)
- Contexto real del negocio: productos, ventas del día, stock crítico

### Insights Automáticos
- Endpoint: `POST /api/ai/insights`
- Retorna: `{ summary, trend, score, actions, alerts, highlight }`
- Cache en sessionStorage (15 min)
- Falla silenciosamente si OpenAI no está configurado

### Predicción de Stock
- Lógica local en `/src/lib/ai-predictions.ts` (sin API externa)
- Analiza historial de ventas últimos 30 días
- Niveles: `critical` (≤3 días), `warning` (≤7 días), `ok`
- Genera recomendaciones de compra para 30 días de stock

---

## Roles y Permisos

| Rol | Acceso |
|---|---|
| `ADMIN` | Todo el sistema |
| `MANAGER` | POS, Caja, Inventario, Reportes, Clientes, Leads, Facturación |
| `VENDEDOR` | Solo POS y registro de clientes |

---

## Tipos de Negocio Soportados

`pharmacy` · `hardware` · `clothing` · `barbershop` · `restaurant` · `retail` · `other`

---

## Landing Pages

| Ruta | Descripción |
|---|---|
| `/` | Home principal |
| `/bodega` | Bodegas y minimarkets |
| `/botica` | Farmacias y boticas |
| `/tienda` | Tiendas de ropa |
| `/precios` | Planes Starter / Pro / Premium |
| `/comparacion` | Comparativa con competidores |
| `/casos-de-uso` | Por tipo de negocio |
| `/demo` | Demo interactivo |
| `/registro` | Onboarding wizard (3 pasos) |

---

## Variables de Entorno

| Variable | Requerida | Descripción |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Clave anon de Supabase |
| `OPENAI_API_KEY` | ⚠️ | API key OpenAI (IA falla silenciosamente sin ella) |
| `NEXT_PUBLIC_GTM_ID` | ❌ | ID Google Tag Manager |
| `NEXT_PUBLIC_GA4_ID` | ❌ | ID Google Analytics 4 |

---

## Funciones RPC en Supabase

| Función | Descripción |
|---|---|
| `generate_sale_number(p_org_id)` | Número correlativo de venta |
| `generate_invoice_number(p_org_id)` | Número correlativo de factura |
| `generate_purchase_number(p_org_id)` | Número correlativo de compra |
| `decrement_product_stock(p_product_id, p_quantity)` | Decrementa stock atómicamente |
| `adjust_product_stock(p_product_id, p_quantity, p_reason, p_org_id)` | Ajuste de stock con movimiento |
| `receive_purchase(p_purchase_id)` | Recibe compra y actualiza stock |
| `get_sales_last_7_days(p_org_id)` | Ventas agrupadas por día (7 días) |
| `get_top_products(p_org_id, p_limit)` | Productos más vendidos |
| `get_cash_summary(p_org_id)` | Resumen de caja actual |
| `get_expiring_products(p_org_id, p_days)` | Productos próximos a vencer |
| `increment_automation_run_count(p_automation_id)` | Incrementa contador de ejecuciones |

---

## Deploy en Vercel

```bash
npm run build   # Verificar build limpio antes de deploy
```

1. Conectar repositorio en [vercel.com](https://vercel.com)
2. Framework preset: `Next.js`
3. Configurar variables de entorno en Vercel Dashboard
4. Deploy automático en cada push a `main`

Ver `DEPLOY.md` para guía completa de producción.

---

## Estructura del Proyecto

```
AIBusinessOS/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Login, registro
│   │   ├── (dashboard)/        # App principal
│   │   ├── (marketing)/        # Landing pages
│   │   ├── api/                # API Routes (AI, etc.)
│   │   └── *.tsx               # Módulos del sistema
│   ├── components/             # Componentes compartidos
│   ├── hooks/                  # Custom hooks
│   ├── lib/
│   │   ├── ai/                 # Prompts y lógica IA
│   │   ├── services/           # Servicios Supabase
│   │   └── supabase/           # Cliente Supabase
│   ├── modules/                # Módulos por dominio
│   ├── state/                  # Zustand stores
│   └── types/                  # TypeScript types
├── database/
│   ├── SETUP_SUPABASE.sql      # Script base (ejecutar primero)
│   ├── migration_v2_complete.sql
│   └── migrations/             # 001 → 006
├── docs/                       # Documentación adicional
├── public/                     # Assets estáticos
├── .env.example                # Variables de entorno ejemplo
├── next.config.js              # Config Next.js + security headers
├── vercel.json                 # Config Vercel
└── DEPLOY.md                   # Guía de producción
```

---

## Documentación Adicional

| Archivo | Descripción |
|---|---|
| `DEPLOY.md` | Guía completa de deploy a producción |
| `PRODUCTION_CHECKLIST.md` | 40+ items de verificación pre-deploy |
| `docs/DOCUMENTACION_TECNICA.md` | Arquitectura y decisiones técnicas |
| `docs/GUIA_USUARIO.md` | Manual de usuario del sistema |
| `database/README_SUPABASE.md` | Guía de configuración de base de datos |

---

## Soporte

- Email: soporte@corivape.com
- WhatsApp: +51 913 916 967
