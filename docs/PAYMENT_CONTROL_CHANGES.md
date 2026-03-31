# Cambios Implementados - Control de Pagos y Módulo Farmacia

## 📋 Resumen de Cambios

Se implementaron 3 mejoras principales:

### 1. ✅ Módulo Farmacia solo para negocios tipo "pharmacy"

**Problema:** El módulo de farmacia se mostraba para todos los tipos de negocio.

**Solución:** 
- El módulo `pharma` ahora solo se muestra cuando `org.business_type === 'pharmacy'`
- Funciona independientemente del plan (Pro o Premium)
- Si el negocio no es farmacia, el módulo no aparece en el sidebar

**Archivos modificados:**
- `src/components/Sidebar.tsx` - Validación de business_type

---

### 2. ✅ Control de acceso sin pago completado

**Problema:** Los usuarios podían registrarse, cancelar el pago en Stripe, y aún así acceder al dashboard.

**Solución implementada:**

#### A. Nuevos campos en la base de datos
```sql
-- database/migrations/013_payment_status.sql
ALTER TABLE corivacore_organizations
ADD COLUMN payment_status TEXT DEFAULT 'pending',
ADD COLUMN subscription_id TEXT,
ADD COLUMN trial_ends_at TIMESTAMPTZ;
```

Estados de pago:
- `pending` - Registro completado pero sin pago
- `active` - Pago confirmado, acceso completo
- `cancelled` - Suscripción cancelada
- `trial` - En período de prueba

#### B. Flujo de registro actualizado
1. Usuario completa formulario de registro
2. Se crea la organización con `payment_status: 'pending'`
3. Redirige a selección de plan
4. Redirige a Stripe Checkout
5. Si cancela → puede volver a `/registro?step=payment`
6. Si completa → Webhook actualiza a `active`

#### C. Webhook de Stripe
- Archivo: `src/app/api/stripe/webhook/route.ts`
- Escucha eventos:
  - `checkout.session.completed` → Activa la cuenta
  - `customer.subscription.deleted` → Cancela la cuenta
  - `invoice.payment_failed` → Marca como pendiente

#### D. Banner de pago pendiente
- Componente: `src/components/PaymentPendingBanner.tsx`
- Se muestra en el dashboard si `payment_status === 'pending'`
- Permite acceso limitado pero con recordatorio visible
- Botón para completar el pago

**Archivos modificados:**
- `src/types/index.ts` - Tipos actualizados
- `src/app/api/auth/register/route.ts` - Estado inicial pending
- `src/app/registro/page.tsx` - Manejo de step=payment
- `src/app/dashboard/page.tsx` - Validación y banner
- `src/components/PaymentPendingBanner.tsx` - Nuevo componente

---

### 3. ✅ Información sobre Stripe en Perú

**Documento creado:** `docs/STRIPE_PERU_GUIDE.md`

#### Respuestas clave:

**¿Stripe funciona en Perú?**
✅ SÍ, desde 2023 Stripe acepta empresas peruanas.

**Requisitos:**
- RUC de empresa (persona jurídica)
- Cuenta bancaria empresarial
- Documentos de constitución
- Identificación del representante legal

**Bancos compatibles:**
- ✅ BCP (Banco de Crédito del Perú)
- ✅ Interbank
- ✅ BBVA Perú
- ✅ Scotiabank Perú

**¿Puede recibir en cuentas digitales?**
- ✅ **Interbank Cuenta Empresa** - Recomendado
- ✅ **BCP Empresa Digital** - Apertura 100% digital
- ✅ **Payoneer** - Recibe USD, retira a banco peruano
- ✅ **Wise Business** - Cuenta internacional, conversión económica
- ❌ **Yape/Plin** - No compatible con Stripe directamente

**Comisiones:**
- Tarjetas peruanas: 3.99% + S/ 1.00
- Tarjetas internacionales: 4.4% + S/ 1.00
- Sin costos mensuales fijos

**Alternativas locales:**
- **Culqi** (peruana) - Más fácil de configurar
- **Niubiz** (Visa Perú) - Respaldado por Visa
- **Mercado Pago** - Incluye Yape, Plin

---

## 🚀 Pasos para Activar

### 1. Ejecutar migración SQL
```bash
# Conectar a Supabase y ejecutar:
psql -h [supabase-host] -U postgres -d postgres -f database/migrations/013_payment_status.sql
```

O copiar y pegar en Supabase SQL Editor:
```sql
ALTER TABLE corivacore_organizations
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS subscription_id TEXT,
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_organizations_subscription_id 
ON corivacore_organizations(subscription_id);

-- Actualizar organizaciones existentes a 'active'
UPDATE corivacore_organizations
SET payment_status = 'active'
WHERE payment_status IS NULL;
```

### 2. Configurar variables de entorno

Agregar en Vercel o `.env.local`:

```env
# Stripe (obtener en https://dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Stripe Price IDs (crear productos en Stripe)
STRIPE_PRICE_PRO=price_xxxxx
STRIPE_PRICE_PREMIUM=price_xxxxx

# Supabase Service Role (para webhook)
SUPABASE_SERVICE_ROLE_KEY=xxxxx
```

### 3. Configurar Stripe

#### A. Crear cuenta Stripe
1. Ir a https://dashboard.stripe.com/register
2. Seleccionar "Perú" como país
3. Completar datos de empresa
4. Verificar cuenta bancaria

#### B. Crear productos
```
Producto 1:
- Nombre: Plan Pro
- Precio: S/ 99.00 PEN
- Recurrencia: Mensual
- Copiar Price ID → STRIPE_PRICE_PRO

Producto 2:
- Nombre: Plan Premium
- Precio: S/ 199.00 PEN
- Recurrencia: Mensual
- Copiar Price ID → STRIPE_PRICE_PREMIUM
```

#### C. Configurar webhook
```
URL: https://tu-dominio.vercel.app/api/stripe/webhook

Eventos:
✓ checkout.session.completed
✓ customer.subscription.deleted
✓ invoice.payment_failed

Copiar Webhook Secret → STRIPE_WEBHOOK_SECRET
```

### 4. Probar en modo test

```bash
# Usar tarjetas de prueba:
4242 4242 4242 4242  # Pago exitoso
4000 0000 0000 0002  # Pago rechazado

# Flujo completo:
1. Registrar usuario nuevo
2. Seleccionar plan
3. Usar tarjeta de prueba
4. Verificar que payment_status cambia a 'active'
```

---

## 📁 Archivos Nuevos

```
src/
├── app/api/stripe/webhook/
│   └── route.ts                    # Webhook de Stripe
├── components/
│   └── PaymentPendingBanner.tsx    # Banner de pago pendiente

database/migrations/
└── 013_payment_status.sql          # Migración de campos de pago

docs/
└── STRIPE_PERU_GUIDE.md            # Guía completa de Stripe en Perú
```

## 📝 Archivos Modificados

```
src/
├── types/index.ts                  # Tipos con payment_status
├── components/Sidebar.tsx          # Validación business_type
├── app/
│   ├── registro/page.tsx           # Manejo de step=payment
│   ├── dashboard/page.tsx          # Validación y banner
│   └── api/auth/register/route.ts  # Estado inicial pending
```

---

## 🧪 Testing

### Caso 1: Usuario nuevo con pago exitoso
```
1. Registrar → payment_status: 'pending'
2. Pagar en Stripe → Webhook actualiza a 'active'
3. Dashboard → Sin banner, acceso completo
```

### Caso 2: Usuario cancela pago
```
1. Registrar → payment_status: 'pending'
2. Cancelar en Stripe → Redirige a /registro?step=payment
3. Login → Dashboard muestra banner rojo
4. Click "Completar Pago" → Vuelve a Stripe
```

### Caso 3: Módulo farmacia
```
Negocio tipo 'pharmacy':
✓ Módulo visible en sidebar

Negocio tipo 'retail':
✗ Módulo NO visible en sidebar
```

---

## 🔐 Seguridad

- ✅ Webhook valida firma de Stripe
- ✅ Solo Supabase Service Role puede actualizar payment_status
- ✅ Middleware valida sesión antes de acceder al dashboard
- ✅ Banner visible pero no bloquea acceso (permite explorar)

---

## 📞 Soporte

**Stripe:**
- Documentación: https://stripe.com/docs
- Soporte: https://support.stripe.com

**Alternativas:**
- Culqi: https://culqi.com
- Niubiz: https://www.niubiz.com.pe

---

**Última actualización:** Enero 2025
