# Coriva Core — Sistema POS Multi-Tenant SaaS

Plataforma de punto de venta para cualquier tipo de negocio: bodegas, boticas, tiendas de ropa, barberías, restaurantes y más.

## Stack Tecnológico

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Base de Datos**: Supabase (PostgreSQL)
- **Deploy**: Vercel
- **Analytics**: Google Analytics 4 + Google Tag Manager
- **IA**: OpenAI API (asistente y predicciones)

## Instalación

```bash
git clone https://github.com/coriva/coriva-core.git
cd coriva-core
npm install
```

Copia `.env.example` a `.env.local` y completa las variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx
OPENAI_API_KEY=xxxx
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX
```

```bash
npm run dev
# http://localhost:3000
```

## Arquitectura Multi-Tenant

```
corivacore_organizations
  ├── corivacore_users
  ├── corivacore_products
  ├── corivacore_sales
  │   └── corivacore_sale_items
  └── corivacore_cash_movements
```

Cada organización tiene aislamiento total. Los servicios siempre filtran por `org_id`.

## Servicios (`/src/lib/services/`)

| Servicio | Descripción |
|---|---|
| `authService` | Login, creación de usuarios, obtener organización |
| `productService` | CRUD productos, control de stock, migración desde localStorage |
| `saleService` | Crear ventas, items, actualizar stock vía RPC, ventas del día |
| `cashService` | Sesiones de caja, movimientos |
| `customerService` | CRUD clientes |
| `organizationService` | Crear/actualizar organizaciones, buscar por slug |
| `syncService` | Sincronización localStorage ↔ Supabase (migración) |

## Módulos del Sistema (`/src/app/`)

- **POSModule** — Punto de venta con atajos de teclado (F1, F2, ESC, ENTER)
- **InventoryModule** — CRUD productos, ajuste de stock, importación CSV/Excel
- **CashRegisterModule** — Apertura/cierre de caja, seguimiento en tiempo real
- **ReportsModule** — Ventas por período, anulaciones, exportación Excel
- **CustomersModule** — Base de clientes, historial de compras
- **UsersModule** — CRUD usuarios, roles y permisos
- **SettingsModule** — Configuración del negocio, logo, impuestos, colores
- **AIAssistantModule** — Asistente IA con OpenAI
- **NotificationsPanel** — Alertas de stock bajo, resumen de ventas

## Roles y Permisos

| Rol | Acceso |
|---|---|
| `ADMIN` | Todo el sistema |
| `MANAGER` | POS, Caja, Inventario, Reportes, Clientes |
| `VENDEDOR` | Solo POS y registro de clientes |

## Tipos de Negocio Soportados

`pharmacy` · `hardware` · `clothing` · `barbershop` · `restaurant` · `retail` · `other`

## Landing Pages

- `/` — Home principal
- `/bodega` — Bodegas y minimarkets
- `/botica` — Farmacias y boticas
- `/tienda` — Tiendas de ropa
- `/precios` — Planes (Starter / Pro / Premium)
- `/comparacion` — Comparativa con competidores
- `/casos-de-uso` — Por tipo de negocio
- `/demo` — Demo interactivo
- `/registro` — Onboarding wizard (3 pasos)

## Variables de Entorno

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anon de Supabase |
| `OPENAI_API_KEY` | API key de OpenAI (server-side) |
| `NEXT_PUBLIC_GTM_ID` | ID de Google Tag Manager |
| `NEXT_PUBLIC_GA4_ID` | ID de Google Analytics 4 |

## Deploy

El proyecto está desplegado en Vercel con framework preset `nextjs`. Las variables de entorno se configuran directamente en el dashboard de Vercel.

```bash
npm run build   # build de producción
npm run start   # servidor de producción
```

## Base de Datos

Los schemas SQL están en `/database/`. El schema principal es `corivacore-mvp-schema.sql`.

Funciones RPC usadas:
- `generate_sale_number(p_org_id)` — Genera número correlativo de venta
- `decrement_product_stock(p_product_id, p_quantity)` — Decrementa stock atómicamente

## Inteligencia Artificial

El sistema tiene dos capas de IA:

### 1. Asistente Conversacional (`AIAssistantModule` + `/api/ai/chat`)

- Modelo: `gpt-4o-mini` vía OpenAI API (server-side)
- El frontend envía el historial de mensajes + un contexto del negocio al endpoint `POST /api/ai/chat`
- El contexto incluye: nombre del negocio, tipo, moneda, total de productos, productos en stock crítico, ventas del día e ingresos totales
- El system prompt instruye al asistente a responder en español, de forma concisa y accionable, usando los datos reales del negocio
- Preguntas rápidas predefinidas: producto más vendido, reabastecimiento urgente, mensaje para clientes inactivos, predicción de ventas, etc.

### 2. IA Predictiva de Stock (`StockPredictionAI` en `/src/lib/ai-predictions.ts`)

- Lógica local (sin API externa), analiza el historial de ventas de los últimos 30 días
- Calcula el promedio diario de ventas por producto y predice cuándo se agotará el stock
- Niveles de alerta: `critical` (≤3 días), `warning` (≤7 días), `ok`
- Genera recomendaciones de compra: cantidad sugerida para cubrir 30 días de stock
- Usada por `NotificationsPanel` para mostrar alertas proactivas

## Roadmap

- [ ] Autenticación con hash de passwords (bcrypt)
- [ ] Billing y planes (Stripe)
- [ ] Multi-sucursal
- [ ] Códigos de barras
- [ ] App móvil
- [ ] API pública

## Soporte

- Email: soporte@corivape.com
- WhatsApp: +51 913 916 967
