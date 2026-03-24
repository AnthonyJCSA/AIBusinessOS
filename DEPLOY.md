# 🚀 Deploy v1.0 — Coriva Core

## Pre-requisitos

- [ ] Cuenta en [Vercel](https://vercel.com)
- [ ] Proyecto en [Supabase](https://supabase.com)
- [ ] API Key de [OpenAI](https://platform.openai.com/api-keys)
- [ ] Repositorio en GitHub

---

## Paso 1 — Supabase: ejecutar migrations

En el SQL Editor de Supabase, ejecutar **en orden**:

```
1. database/corivacore-mvp-schema.sql
2. database/migrations/001_inventory_cash_rls.sql
3. database/migrations/002_purchases_suppliers.sql
4. database/migrations/003_customers_leads_pipeline.sql
5. database/migrations/004_purchase_number_rls.sql
6. database/migrations/005_lead_notes_sprint6.sql
7. database/migrations/006_automations_sprint7.sql
```

Verificar que existen estas tablas:
- `corivacore_organizations`
- `corivacore_users`
- `corivacore_products`
- `corivacore_sales` + `corivacore_sale_items`
- `corivacore_customers`
- `corivacore_cash_movements` + `corivacore_cash_sessions`
- `corivacore_suppliers` + `corivacore_purchases` + `corivacore_purchase_items`
- `corivacore_invoices` + `corivacore_invoice_credits`
- `corivacore_leads` + `corivacore_lead_notes`
- `corivacore_automations` + `corivacore_automation_logs`

Verificar que existen estas funciones RPC:
- `generate_sale_number(p_org_id)`
- `generate_purchase_number(p_org_id)`
- `generate_invoice_number(p_org_id, p_series)`
- `decrement_product_stock(p_product_id, p_quantity)`
- `receive_purchase(p_purchase_id, p_received_by)`
- `get_sales_last_7_days(p_org_id)`
- `get_top_products(p_org_id, p_limit)`
- `get_cash_summary(p_org_id)`
- `increment_automation_run_count(p_id)`

---

## Paso 2 — Variables de entorno en Vercel

En Vercel Dashboard → Settings → Environment Variables, agregar:

| Variable | Entorno | Valor |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | All | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All | `eyJ...` |
| `OPENAI_API_KEY` | Production + Preview | `sk-proj-...` |
| `NEXT_PUBLIC_APP_URL` | Production | `https://tu-dominio.com` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | All | `51913916967` |
| `NEXT_PUBLIC_GTM_ID` | Production | `GTM-XXXXXXX` |
| `NEXT_PUBLIC_GA4_ID` | Production | `G-XXXXXXXXXX` |

> ⚠️ `OPENAI_API_KEY` NO debe tener el prefijo `NEXT_PUBLIC_` — es server-side only.

---

## Paso 3 — Deploy en Vercel

```bash
# Opción A: desde CLI
npm i -g vercel
vercel login
vercel --prod

# Opción B: push a main (auto-deploy si está conectado)
git add .
git commit -m "chore: v1.0 production deploy"
git push origin main
```

Configuración del proyecto en Vercel:
- **Framework**: Next.js
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Node.js Version**: 20.x

---

## Paso 4 — Verificación post-deploy

### Funcionalidades críticas a testear

**Auth & Onboarding**
- [ ] `/registro` carga correctamente
- [ ] Crear organización nueva funciona
- [ ] Login con usuario existente funciona
- [ ] Redirect a `/dashboard` tras login

**POS**
- [ ] Buscar producto funciona
- [ ] Agregar al carrito funciona
- [ ] Procesar venta guarda en Supabase
- [ ] Stock se decrementa correctamente
- [ ] Comprobante se imprime

**Inventario**
- [ ] Lista de productos carga desde Supabase
- [ ] Agregar producto funciona
- [ ] Editar precio/stock funciona

**Caja**
- [ ] Apertura de caja funciona
- [ ] Gastos se registran
- [ ] Cierre de caja con diferencia funciona

**IA**
- [ ] Asistente IA responde (requiere OPENAI_API_KEY)
- [ ] Insights del dashboard cargan
- [ ] Alertas de stock aparecen en notificaciones

**Automatizaciones**
- [ ] Módulo carga sin error
- [ ] Crear automatización desde plantilla funciona

**Billing**
- [ ] Lista de comprobantes carga
- [ ] Crear comprobante funciona

---

## Paso 5 — Dominio personalizado (opcional)

En Vercel Dashboard → Settings → Domains:
1. Agregar `app.coriva.pe` o `coriva-core.vercel.app`
2. Configurar DNS en tu proveedor
3. Actualizar `NEXT_PUBLIC_APP_URL` con el dominio final
4. Actualizar `metadataBase` en `src/app/layout.tsx`

---

## Monitoreo en producción

| Herramienta | URL | Qué monitorear |
|---|---|---|
| Vercel Analytics | vercel.com/dashboard | Performance, errores |
| Supabase Dashboard | supabase.com/dashboard | Queries, RLS, storage |
| Google Analytics 4 | analytics.google.com | Tráfico, conversiones |
| OpenAI Usage | platform.openai.com/usage | Tokens consumidos, costos |

---

## Rollback de emergencia

```bash
# Ver deployments anteriores
vercel ls

# Promover deployment anterior a producción
vercel promote <deployment-url>
```

---

## Costos estimados v1.0 (Perú, primeros 100 clientes)

| Servicio | Plan | Costo/mes |
|---|---|---|
| Vercel | Pro | $20 |
| Supabase | Pro | $25 |
| OpenAI | Pay-per-use | ~$15-50 |
| **Total** | | **~$60-95/mes** |

Con 100 clientes en plan Pro ($29/mes) = **$2,900 MRR** → margen ~97%

---

## Contacto

- Email: soporte@corivape.com
- WhatsApp: +51 913 916 967
- GitHub: https://github.com/AnthonyJCSA/coriva-core
