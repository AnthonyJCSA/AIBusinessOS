# 🔒 Plan de Endurecimiento para Producción — Coriva Core

**Fecha:** 2025-01-16  
**Versión:** 1.0  
**Arquitecto:** Staff Software Architect  
**Stack:** Next.js 14 + TypeScript + Supabase + Vercel

---

## 📊 RESUMEN EJECUTIVO

### Estado Actual
El proyecto **Coriva Core** es un SaaS multi-tenant funcional con 15+ módulos implementados, pero presenta **vulnerabilidades críticas de seguridad** que impiden su despliegue en producción real.

### Riesgos Críticos Identificados
1. ⚠️ **Autenticación insegura** - Comparación de contraseñas en texto plano
2. ⚠️ **Sesión inconsistente** - Mezcla de sessionStorage, Zustand y middleware desalineado
3. ⚠️ **Middleware débil** - No valida sesión real de Supabase
4. ⚠️ **Configuración hardcodeada** - IDs y URLs en código
5. ⚠️ **Sin validación de entorno** - Puede arrancar con configuración incompleta

### Objetivo
Transformar el proyecto en un sistema **production-ready** manteniendo:
- ✅ Stack actual (Vercel + Supabase)
- ✅ Arquitectura multi-tenant
- ✅ Funcionalidades existentes
- ✅ Costo operativo bajo

---

## 🔍 AUDITORÍA TÉCNICA DETALLADA

### 1. Estructura del Proyecto

```
AIBusinessOS/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── (auth)/            # Rutas públicas
│   │   ├── (dashboard)/       # Rutas protegidas
│   │   ├── api/               # API Routes
│   │   └── [modules]/         # 15+ módulos de negocio
│   ├── components/            # Componentes UI
│   ├── lib/
│   │   ├── services/          # Lógica de negocio
│   │   ├── auth/              # ⚠️ VACÍO - No existe auth real
│   │   ├── supabase/          # Cliente Supabase
│   │   └── integrations/      # Nubefact, OpenAI, etc.
│   ├── state/                 # Zustand stores
│   ├── types/                 # TypeScript types
│   └── modules/               # Módulos avanzados
├── database/
│   └── migrations/            # 12 migraciones SQL
├── middleware.ts              # ⚠️ Protección débil
└── .env.example               # ⚠️ Incompleto
```

**Hallazgos:**
- ✅ Estructura bien organizada
- ✅ TypeScript configurado correctamente
- ⚠️ Carpeta `lib/auth/` existe pero está vacía
- ⚠️ No hay separación clara entre client/server env
- ⚠️ No hay validación de configuración al inicio

---

### 2. Flujo de Autenticación Actual

#### 2.1 Login (`src/app/login/page.tsx`)
```typescript
// ⚠️ PROBLEMA CRÍTICO
const result = await authService.login(form.username, form.password)
if (result) {
  sessionStorage.setItem('coriva_user', JSON.stringify(result.user))
  sessionStorage.setItem('coriva_org', JSON.stringify(result.org))
  router.push('/dashboard')
}
```

**Problemas:**
1. ❌ Usa `sessionStorage` directamente (no seguro)
2. ❌ No genera token JWT
3. ❌ No usa Supabase Auth
4. ❌ Datos sensibles en localStorage del cliente

#### 2.2 Auth Service (`src/lib/services/auth.service.ts`)
```typescript
// ⚠️ VULNERABILIDAD CRÍTICA
if (users.password_hash !== password) return null
```

**Problemas:**
1. ❌ **Comparación de contraseña en texto plano**
2. ❌ No usa bcrypt/argon2
3. ❌ Campo `password_hash` contiene texto plano
4. ❌ Comentario admite que es "SOLO PARA DEMO"

#### 2.3 Middleware (`middleware.ts`)
```typescript
// ⚠️ PROTECCIÓN DÉBIL
const sessionCookie = req.cookies.get('coriva-session')
if (sessionCookie) {
  const session = JSON.parse(sessionCookie.value)
  if (session?.state?.isAuthenticated) return NextResponse.next()
}
```

**Problemas:**
1. ❌ Lee cookie de Zustand persist (manipulable)
2. ❌ No valida token JWT
3. ❌ No verifica con Supabase Auth
4. ❌ Permite bypass con cookie falsa

---

### 3. Flujo de Sesión Actual

#### 3.1 Session Store (`src/state/session.store.ts`)
```typescript
export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      org: null,
      isAuthenticated: false,
      setSession: (user, org) => set({ user, org, isAuthenticated: true }),
      clearSession: () => set({ user: null, org: null, isAuthenticated: false }),
    }),
    { name: 'coriva-session' }
  )
)
```

**Problemas:**
1. ⚠️ Zustand persist guarda en localStorage (no seguro para auth)
2. ⚠️ `isAuthenticated` es solo un flag local
3. ⚠️ No hay expiración de sesión
4. ⚠️ No hay refresh token

#### 3.2 Dashboard Hydration (`src/app/dashboard/page.tsx`)
```typescript
useEffect(() => {
  if (!isAuthenticated) {
    const savedUser = sessionStorage.getItem('coriva_user')
    const savedOrg  = sessionStorage.getItem('coriva_org')
    if (savedUser && savedOrg) {
      setSession(JSON.parse(savedUser), JSON.parse(savedOrg))
      // ⚠️ Migra de sessionStorage a Zustand
      sessionStorage.removeItem('coriva_user')
      sessionStorage.removeItem('coriva_org')
    } else {
      router.push('/login')
    }
  }
}, [isAuthenticated])
```

**Problemas:**
1. ⚠️ Mezcla sessionStorage legacy con Zustand
2. ⚠️ No valida que la sesión sea válida
3. ⚠️ Puede cargar datos expirados

---

### 4. Configuración y Entorno

#### 4.1 Variables de Entorno (`.env.example`)
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_GA4_ID=
NEXT_PUBLIC_GTM_ID=
```

**Problemas:**
1. ⚠️ No indica cuáles son obligatorias
2. ⚠️ No hay validación al inicio
3. ⚠️ Mezcla variables públicas y privadas sin separación clara
4. ⚠️ No hay `.env.development` / `.env.production`

#### 4.2 Supabase Client (`src/lib/supabase.ts`)
```typescript
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)
```

**Problemas:**
1. ⚠️ Crea cliente con placeholders (modo demo silencioso)
2. ⚠️ No falla si la configuración es inválida
3. ⚠️ Puede ejecutar en producción sin Supabase real

---

### 5. Seguridad Multi-Tenant

#### 5.1 RLS (Row Level Security)
```sql
-- database/migrations/000_prerequisites.sql
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS UUID AS $$
  SELECT NULLIF(current_setting('app.current_org_id', true), '')::UUID;
$$ LANGUAGE sql STABLE;
```

**Hallazgos:**
- ✅ RLS habilitado en todas las tablas
- ⚠️ Función `get_user_org_id()` es un stub (retorna NULL)
- ⚠️ Políticas usan `USING (true)` (permisivo)
- ⚠️ Aislamiento depende 100% de filtros en servicios

#### 5.2 Servicios
```typescript
// Ejemplo: productService.getAll()
const { data } = await supabase
  .from('corivacore_products')
  .select('*')
  .eq('org_id', orgId)  // ✅ Filtro manual por org_id
```

**Hallazgos:**
- ✅ Todos los servicios filtran por `org_id`
- ⚠️ Depende de disciplina del desarrollador
- ⚠️ No hay guard automático a nivel de DB

---

### 6. Roles y Permisos

#### 6.1 Definición (`src/lib/permissions.ts`)
```typescript
export const ROLES = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  VENDEDOR: 'VENDEDOR',
  VIEWER: 'VIEWER',
}
```

**Hallazgos:**
- ✅ Roles bien definidos
- ⚠️ No hay guards automáticos en UI
- ⚠️ No hay validación en API routes
- ⚠️ Sidebar muestra módulos sin verificar permisos

---

### 7. Integraciones Externas

#### 7.1 OpenAI (`src/app/api/ai/chat/route.ts`)
```typescript
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})
```

**Hallazgos:**
- ✅ API key en server-side
- ⚠️ No valida que exista antes de usar
- ⚠️ No maneja errores de rate limit

#### 7.2 Nubefact (`src/lib/integrations/nubefact/`)
```typescript
const NUBEFACT_API_URL = process.env.NUBEFACT_API_URL
const NUBEFACT_TOKEN = process.env.NUBEFACT_TOKEN
```

**Hallazgos:**
- ✅ Configuración server-side
- ⚠️ No valida formato de URL
- ⚠️ No maneja errores de integración

---

## 🚨 RIESGOS PRIORIZADOS

### Críticos (Bloquean Producción)
1. **🔴 P0 - Autenticación insegura**
   - Contraseñas en texto plano
   - No usa Supabase Auth
   - Sesión manipulable desde cliente

2. **🔴 P0 - Middleware débil**
   - No valida token real
   - Permite bypass con cookie falsa

3. **🔴 P0 - Sesión inconsistente**
   - Mezcla sessionStorage + Zustand
   - No hay expiración
   - No hay refresh

### Altos (Riesgo de Seguridad)
4. **🟠 P1 - Sin validación de entorno**
   - Puede arrancar sin configuración
   - Modo demo silencioso

5. **🟠 P1 - RLS permisivo**
   - Políticas con `USING (true)`
   - Aislamiento solo en app layer

### Medios (Deuda Técnica)
6. **🟡 P2 - Configuración hardcodeada**
   - IDs de GTM/GA4 en código
   - URLs de WhatsApp hardcoded

7. **🟡 P2 - Sin guards de rol en UI**
   - Sidebar muestra todo
   - No valida permisos en API

---

## 🎯 DECISIONES DE ARQUITECTURA

### 1. Autenticación
**Decisión:** Migrar a **Supabase Auth** completo

**Justificación:**
- ✅ Ya tenemos Supabase configurado
- ✅ Maneja JWT, refresh tokens, expiración
- ✅ Integración nativa con RLS
- ✅ Sin costo adicional
- ✅ Menos código custom a mantener

**Implementación:**
- Usar `@supabase/auth-helpers-nextjs`
- Login con `supabase.auth.signInWithPassword()`
- Sesión en cookies HTTP-only
- Middleware valida con `supabase.auth.getUser()`

### 2. Sesión
**Decisión:** Zustand solo para **estado UI**, no para auth

**Justificación:**
- ✅ Zustand excelente para carrito, notificaciones
- ❌ No debe ser fuente de verdad de seguridad
- ✅ Sesión real en cookies de Supabase

**Implementación:**
- Zustand: `cart`, `notifications`, `theme`
- Auth: Cookies HTTP-only de Supabase
- Hydration: Leer de `supabase.auth.getSession()`

### 3. Middleware
**Decisión:** Validar con **Supabase Auth real**

**Implementación:**
```typescript
export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  
  return res
}
```

### 4. Configuración
**Decisión:** Validación estricta al inicio

**Implementación:**
- Crear `src/lib/env/validate.ts`
- Validar en `middleware.ts` y API routes
- Fallar rápido si falta configuración crítica
- Separar `.env.development` / `.env.production`

### 5. Multi-Tenant
**Decisión:** Mantener filtro por `org_id` en app layer

**Justificación:**
- ✅ RLS completo requiere Supabase Auth (lo haremos)
- ✅ Filtro manual es suficiente con auth correcta
- ✅ Evita refactor masivo de DB

**Mejora:**
- Agregar helper `withOrgFilter()` para consistencia
- Validar `org_id` en todos los API routes

---

## 📋 PLAN DE EJECUCIÓN POR FASES

### FASE 1: Fundamentos de Seguridad (Crítico)
**Duración:** 2-3 horas  
**Objetivo:** Eliminar vulnerabilidades críticas

#### Tareas:
1. ✅ Crear estructura de auth
   - `src/lib/auth/supabase-server.ts`
   - `src/lib/auth/supabase-client.ts`
   - `src/lib/auth/middleware.ts`

2. ✅ Migrar a Supabase Auth
   - Instalar `@supabase/auth-helpers-nextjs`
   - Reescribir `login/page.tsx`
   - Reescribir `registro/page.tsx`
   - Actualizar `middleware.ts`

3. ✅ Limpiar sesión
   - Remover sessionStorage de auth
   - Actualizar `session.store.ts` (solo UI state)
   - Actualizar `dashboard/page.tsx`

4. ✅ Migrar usuarios existentes
   - Script SQL para crear usuarios en Supabase Auth
   - Hashear contraseñas con bcrypt
   - Mantener tabla `corivacore_users` para metadata

**Entregables:**
- Auth funcional con Supabase
- Middleware seguro
- Sesión en cookies HTTP-only
- Script de migración de usuarios

---

### FASE 2: Configuración y Entornos
**Duración:** 1-2 horas  
**Objetivo:** Configuración robusta y validada

#### Tareas:
1. ✅ Crear validador de entorno
   - `src/lib/env/client.ts`
   - `src/lib/env/server.ts`
   - `src/lib/env/validate.ts`

2. ✅ Actualizar `.env.example`
   - Documentar variables obligatorias
   - Separar públicas/privadas
   - Agregar valores de ejemplo

3. ✅ Crear archivos de entorno
   - `.env.development`
   - `.env.production.example`

4. ✅ Integrar validación
   - Validar en `middleware.ts`
   - Validar en API routes críticos
   - Fallar rápido si falta config

**Entregables:**
- Validación de entorno funcional
- Documentación clara de variables
- Archivos de ejemplo actualizados

---

### FASE 3: Guards de Rol y Permisos
**Duración:** 2 horas  
**Objetivo:** Control de acceso por rol

#### Tareas:
1. ✅ Crear sistema de permisos
   - `src/lib/permissions/roles.ts`
   - `src/lib/permissions/guards.ts`
   - `src/lib/permissions/hooks.ts`

2. ✅ Implementar guards en UI
   - Actualizar `Sidebar.tsx`
   - Ocultar módulos no permitidos
   - Agregar `usePermissions()` hook

3. ✅ Implementar guards en API
   - Middleware de validación de rol
   - Proteger endpoints sensibles
   - Retornar 403 si no autorizado

4. ✅ Testing de permisos
   - Probar cada rol
   - Verificar aislamiento

**Entregables:**
- Sistema de permisos funcional
- UI adaptada por rol
- API protegida por rol

---

### FASE 4: Producción y Calidad
**Duración:** 2 horas  
**Objetivo:** Preparar para deploy real

#### Tareas:
1. ✅ Actualizar `package.json`
   ```json
   {
     "scripts": {
       "dev": "next dev",
       "build": "next build",
       "start": "next start",
       "lint": "next lint",
       "typecheck": "tsc --noEmit",
       "check": "npm run lint && npm run typecheck",
       "verify": "npm run check && npm run build"
     }
   }
   ```

2. ✅ Crear GitHub Actions
   - `.github/workflows/ci.yml`
   - Lint + Typecheck + Build en PR

3. ✅ Mejorar manejo de errores
   - Crear `src/lib/errors/handler.ts`
   - Wrapper para API routes
   - Logging consistente

4. ✅ Documentación de deploy
   - `docs/DEPLOYMENT.md`
   - Checklist de producción
   - Instrucciones Vercel + Supabase

**Entregables:**
- Scripts de validación
- CI/CD básico
- Documentación de deploy

---

### FASE 5: Limpieza y Optimización
**Duración:** 1 hora  
**Objetivo:** Eliminar deuda técnica

#### Tareas:
1. ✅ Remover código demo
   - Eliminar placeholders
   - Limpiar comentarios "SOLO PARA DEMO"
   - Remover lógica condicional de demo

2. ✅ Centralizar configuración
   - Mover IDs hardcoded a env
   - Crear `src/lib/config.ts`
   - Documentar configuraciones

3. ✅ Optimizar imports
   - Usar barrel exports
   - Limpiar imports no usados

4. ✅ Actualizar README
   - Reflejar nueva arquitectura
   - Actualizar instrucciones de setup

**Entregables:**
- Código limpio sin demos
- Configuración centralizada
- Documentación actualizada

---

## ✅ CHECKLIST DE RELEASE

### Pre-Deploy
- [ ] Todas las variables de entorno configuradas en Vercel
- [ ] Supabase Auth habilitado y configurado
- [ ] Usuarios migrados a Supabase Auth
- [ ] RLS policies actualizadas
- [ ] Tests de permisos pasando
- [ ] Build exitoso sin warnings
- [ ] Typecheck sin errores

### Deploy
- [ ] Deploy a staging primero
- [ ] Probar login/logout
- [ ] Probar cada rol
- [ ] Probar multi-tenant (2+ orgs)
- [ ] Verificar integraciones (OpenAI, Nubefact)
- [ ] Verificar tracking (GTM, GA4)

### Post-Deploy
- [ ] Monitorear logs de Vercel
- [ ] Verificar métricas de Supabase
- [ ] Probar desde dispositivos reales
- [ ] Documentar issues encontrados

---

## 🔮 ROADMAP FUTURO (Post-MVP)

### Fase 6: Mejoras de Seguridad
- [ ] 2FA con Supabase Auth
- [ ] Rate limiting en API routes
- [ ] Audit log de acciones críticas
- [ ] Encriptación de datos sensibles

### Fase 7: Observabilidad
- [ ] Integrar Sentry para errores
- [ ] Logs estructurados
- [ ] Métricas de performance
- [ ] Alertas automáticas

### Fase 8: Arquitectura Híbrida AWS (Opcional)
- [ ] S3 para archivos grandes
- [ ] SQS para jobs asíncronos
- [ ] SES para emails transaccionales
- [ ] CloudFront para CDN
- [ ] Lambda para procesamiento pesado

**Nota:** Esta fase es opcional y solo se implementa si:
- El volumen de datos lo requiere
- Hay presupuesto para AWS
- Vercel + Supabase llegan a límites

---

## 📊 MÉTRICAS DE ÉXITO

### Seguridad
- ✅ 0 contraseñas en texto plano
- ✅ 100% de rutas protegidas validadas
- ✅ 0 datos sensibles en localStorage
- ✅ JWT con expiración < 1 hora

### Calidad
- ✅ Build sin errores
- ✅ Typecheck sin errores
- ✅ 0 warnings críticos de ESLint
- ✅ Cobertura de tests > 60% (futuro)

### Producción
- ✅ Deploy exitoso en Vercel
- ✅ Tiempo de respuesta < 500ms (p95)
- ✅ Uptime > 99.9%
- ✅ 0 incidentes de seguridad

---

## 🎯 CONCLUSIÓN

Este plan transforma **Coriva Core** de un prototipo funcional a un **sistema production-ready** en **8-10 horas de trabajo**.

**Prioridades:**
1. 🔴 **Seguridad primero** - Fases 1-2 son bloqueantes
2. 🟠 **Permisos segundo** - Fase 3 es crítica para multi-tenant
3. 🟡 **Calidad tercero** - Fases 4-5 son importantes pero no bloqueantes

**Resultado esperado:**
Un SaaS seguro, escalable y mantenible que puede:
- ✅ Aceptar usuarios reales
- ✅ Procesar pagos reales
- ✅ Escalar a 100+ organizaciones
- ✅ Cumplir con estándares de seguridad
- ✅ Desplegarse con confianza

---

**Próximo paso:** Ejecutar Fase 1 - Fundamentos de Seguridad
