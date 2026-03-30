# Variables de entorno — Coriva OS

Copia este archivo como `.env.local` y completa los valores.

```env
# ── Supabase ──────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx

# ── OpenAI ────────────────────────────────────────────────────
# Modelo: gpt-4o-mini (server-side únicamente)
OPENAI_API_KEY=sk-xxxx

# ── Nubefact (Facturación electrónica SUNAT) ──────────────────
# Obtener en: https://www.nubefact.com/
# URL de producción:  https://api.nubefact.com/api/v1/{ruc}
# URL de pruebas:     https://api.nubefact.com/api/v1/{ruc}  (modo demo con token demo)
NUBEFACT_API_URL=https://api.nubefact.com/api/v1/TU_RUC
NUBEFACT_TOKEN=tu_token_nubefact

# ── PeruAPI (Consulta DNI/RUC) ────────────────────────────────
# Obtener en: https://apis.net.pe/ o https://apiperu.dev/
# La URL base varía según el proveedor elegido
PERUAPI_BASE_URL=https://api.apis.net.pe/v2
PERUAPI_KEY=tu_api_key_peruapi

# ── Analytics (opcional) ──────────────────────────────────────
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX
```

## Notas de configuración

### Nubefact
- En modo demo, usar token `demo` y RUC `20000000001`
- En producción, el token se obtiene desde el panel de Nubefact
- La URL incluye el RUC de la empresa emisora: `https://api.nubefact.com/api/v1/{RUC_EMPRESA}`
- Configurar series en Supabase antes de emitir (ver migración `007_invoices.sql`)

### PeruAPI
- Proveedores compatibles: `apis.net.pe`, `apiperu.dev`, `consultaruc.com`
- El sistema normaliza la respuesta independientemente del proveedor
- Las consultas se cachean 24h en `corivacore_document_cache` (migración `010`)

### Supabase
- Ejecutar migraciones en orden: `005` → `006` → `007` → `008` → `009` → `010`
- Activar RLS en todas las tablas (ya incluido en las migraciones)
- La función `get_user_org_id()` debe existir antes de ejecutar `008`

### Orden de migraciones SQL
```
005_cash_sessions.sql
006_automations.sql
007_invoices.sql              ← Tablas de facturación
008_rls_fix_pharma_prep.sql   ← RLS real + columnas pharma en productos
009_pharma.sql                ← Lotes, kardex, RPCs
010_document_cache.sql        ← Caché DNI/RUC
```
