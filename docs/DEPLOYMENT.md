# 🚀 Guía de Deployment — Coriva Core

**Última actualización:** 2025-01-16  
**Stack:** Next.js 14 + Supabase + Vercel  
**Arquitectura:** Multi-tenant SaaS

---

## 📋 Pre-requisitos

### Cuentas Necesarias
- ✅ Cuenta de GitHub (código fuente)
- ✅ Cuenta de Vercel (hosting frontend)
- ✅ Cuenta de Supabase (base de datos + auth)
- ⚠️ Cuenta de OpenAI (opcional - para IA)
- ⚠️ Cuenta de Nubefact (opcional - para facturación)

### Herramientas Locales
- Node.js 18+ 
- npm o yarn
- Git
- Editor de código (VS Code recomendado)

---

## 🗄️ Paso 1: Configurar Supabase

### 1.1 Crear Proyecto
1. Ir a [supabase.com](https://supabase.com)
2. Crear nuevo proyecto
3. Elegir región (preferiblemente South America)
4. Guardar contraseña de base de datos

### 1.2 Ejecutar Migraciones
1. Ir a SQL Editor en Supabase Dashboard
2. Ejecutar migraciones en orden:
   ```
   database/migrations/000_prerequisites.sql
   database/migrations/001_inventory_cash_rls.sql
   database/migrations/002_purchases_suppliers.sql
   database/migrations/003_customers_leads_pipeline.sql
   database/migrations/004_purchase_number_rls.sql
   database/migrations/005_cash_sessions.sql
   database/migrations/006_automations.sql
   database/migrations/012_oppf_snippf.sql
   database/migrations/013_supabase_auth.sql
   ```

### 1.3 Habilitar Supabase Auth
1. Ir a Authentication > Providers
2. Habilitar Email provider
3. Configurar:
   - Enable email confirmations: OFF (para desarrollo)
   - Enable email confirmations: ON (para producción)
4. Configurar Site URL: `https://tu-dominio.vercel.app`
5. Agregar Redirect URLs:
   - `https://tu-dominio.vercel.app/dashboard`
   - `http://localhost:3000/dashboard` (desarrollo)

### 1.4 Obtener Credenciales
1. Ir a Settings > API
2. Copiar:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 🔐 Paso 2: Configurar Variables de Entorno

### 2.1 Variables Obligatorias

```env
# Supabase (OBLIGATORIO)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2.2 Variables Opcionales

```env
# OpenAI (opcional - para Asistente IA)
OPENAI_API_KEY=sk-proj-xxxxx

# Nubefact (opcional - para facturación electrónica)
NUBEFACT_API_URL=https://api.nubefact.com/api/v1
NUBEFACT_TOKEN=tu-token-nubefact

# PeruAPI (opcional - para validación DNI/RUC)
PERUAPI_TOKEN=tu-token-peruapi

# Analytics (opcional)
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX
```

---

## 🚀 Paso 3: Deploy en Vercel

### 3.1 Conectar Repositorio
1. Ir a [vercel.com](https://vercel.com)
2. Click en "Add New Project"
3. Importar repositorio de GitHub
4. Seleccionar `AIBusinessOS`

### 3.2 Configurar Build
Vercel detecta automáticamente Next.js, pero verifica:
- Framework Preset: **Next.js**
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm ci`

### 3.3 Agregar Variables de Entorno
1. En Project Settings > Environment Variables
2. Agregar todas las variables del paso 2
3. Seleccionar environments:
   - Production ✅
   - Preview ✅
   - Development ✅

### 3.4 Deploy
1. Click en "Deploy"
2. Esperar 2-3 minutos
3. Verificar que el build sea exitoso

---

## 👤 Paso 4: Crear Primer Usuario

### 4.1 Crear Usuario en Supabase Auth
1. Ir a Supabase Dashboard > Authentication > Users
2. Click en "Add user"
3. Ingresar:
   - Email: `admin@tuempresa.com`
   - Password: `contraseña-segura`
   - Auto Confirm User: ✅

### 4.2 Crear Organización y Usuario en DB
```sql
-- 1. Crear organización
INSERT INTO corivacore_organizations (id, name, slug, business_type, settings)
VALUES (
  gen_random_uuid(),
  'Mi Empresa',
  'mi-empresa',
  'retail',
  '{"plan": "pro", "currency": "S/", "tax_rate": 18}'::jsonb
)
RETURNING id;

-- 2. Crear usuario (reemplazar auth_user_id con UUID de Supabase Auth)
INSERT INTO corivacore_users (
  auth_user_id,
  org_id,
  email,
  full_name,
  role,
  is_active
)
VALUES (
  'uuid-del-usuario-en-auth-users', -- Copiar de Authentication > Users
  'uuid-de-la-organizacion',        -- Del paso anterior
  'admin@tuempresa.com',
  'Administrador',
  'OWNER',
  true
);
```

### 4.3 Verificar Login
1. Ir a `https://tu-dominio.vercel.app/login`
2. Ingresar credenciales
3. Verificar acceso al dashboard

---

## ✅ Paso 5: Verificación Post-Deploy

### 5.1 Checklist Funcional
- [ ] Login funciona correctamente
- [ ] Dashboard carga sin errores
- [ ] Módulos visibles según rol
- [ ] POS permite crear ventas
- [ ] Inventario muestra productos
- [ ] Reportes generan datos

### 5.2 Checklist de Seguridad
- [ ] HTTPS habilitado (Vercel lo hace automático)
- [ ] Variables de entorno no expuestas en cliente
- [ ] Supabase Auth funcionando
- [ ] RLS habilitado en todas las tablas
- [ ] Middleware protegiendo rutas

### 5.3 Checklist de Performance
- [ ] Lighthouse Score > 80
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3s
- [ ] No errores en consola del navegador

---

## 🔧 Paso 6: Configuración Adicional

### 6.1 Dominio Personalizado (Opcional)
1. En Vercel > Project Settings > Domains
2. Agregar dominio personalizado
3. Configurar DNS según instrucciones
4. Actualizar Site URL en Supabase

### 6.2 Analytics (Opcional)
Si configuraste GTM/GA4:
1. Verificar que GTM se carga en el sitio
2. Configurar eventos en Google Tag Manager
3. Verificar tracking en Google Analytics

### 6.3 Facturación Electrónica (Opcional)
Si configuraste Nubefact:
1. Verificar credenciales en Nubefact Dashboard
2. Probar emisión de comprobante de prueba
3. Configurar certificado digital (producción)

---

## 🐛 Troubleshooting

### Error: "Dynamic server usage: cookies"
**Causa:** API route usa cookies() sin dynamic export  
**Solución:** Agregar `export const dynamic = 'force-dynamic'` al inicio del archivo

### Error: "Module not found: @/lib/..."
**Causa:** Alias de TypeScript no configurado  
**Solución:** Verificar `tsconfig.json` tiene `"@/*": ["./src/*"]`

### Error: "Supabase client error"
**Causa:** Variables de entorno incorrectas  
**Solución:** Verificar NEXT_PUBLIC_SUPABASE_URL y ANON_KEY en Vercel

### Error: "User not found in corivacore_users"
**Causa:** Usuario existe en Supabase Auth pero no en tabla custom  
**Solución:** Ejecutar INSERT en corivacore_users con auth_user_id correcto

### Build falla con "Type error"
**Causa:** Errores de TypeScript  
**Solución:** Ejecutar `npm run typecheck` localmente y corregir errores

---

## 📊 Monitoreo

### Vercel Analytics
- Ir a Project > Analytics
- Monitorear:
  - Page views
  - Unique visitors
  - Top pages
  - Performance metrics

### Supabase Metrics
- Ir a Project > Database > Usage
- Monitorear:
  - Database size
  - Active connections
  - API requests
  - Auth users

### Logs
- **Vercel:** Project > Deployments > [deployment] > Logs
- **Supabase:** Project > Logs > API Logs

---

## 🔄 Actualizaciones

### Deploy de Cambios
1. Hacer commit y push a GitHub
2. Vercel detecta automáticamente y deploya
3. Verificar en Preview URL antes de merge a main

### Rollback
1. Ir a Vercel > Project > Deployments
2. Encontrar deployment anterior
3. Click en "..." > Promote to Production

### Migraciones de Base de Datos
1. Crear nueva migración en `database/migrations/`
2. Ejecutar en Supabase SQL Editor
3. Documentar cambios en README

---

## 🚨 Seguridad en Producción

### Checklist de Seguridad
- [ ] Supabase RLS habilitado en todas las tablas
- [ ] Variables sensibles solo en server-side
- [ ] HTTPS forzado (Vercel lo hace automático)
- [ ] Rate limiting configurado (Supabase lo incluye)
- [ ] Backup automático habilitado en Supabase
- [ ] Monitoreo de errores activo

### Recomendaciones
- ✅ Cambiar contraseñas de admin regularmente
- ✅ Revisar logs de Supabase semanalmente
- ✅ Mantener dependencias actualizadas
- ✅ Hacer backups manuales antes de cambios grandes
- ✅ Probar en staging antes de producción

---

## 📞 Soporte

### Recursos
- **Documentación Next.js:** https://nextjs.org/docs
- **Documentación Supabase:** https://supabase.com/docs
- **Documentación Vercel:** https://vercel.com/docs

### Contacto
- Email: soporte@corivape.com
- WhatsApp: +51 913 916 967
- GitHub Issues: https://github.com/AnthonyJCSA/AIBusinessOS/issues

---

## 🎉 ¡Listo!

Tu aplicación Coriva Core está ahora en producción. 

**Próximos pasos:**
1. Crear más usuarios y organizaciones
2. Configurar integraciones opcionales
3. Personalizar branding
4. Monitorear métricas
5. Iterar basado en feedback de usuarios
