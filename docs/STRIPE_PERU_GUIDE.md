# Stripe en Perú - Guía de Integración

## ¿Stripe funciona en Perú?

**SÍ**, Stripe funciona en Perú, pero con algunas consideraciones importantes:

## 1. Requisitos para usar Stripe en Perú

### Opción A: Cuenta de Empresa Peruana (RECOMENDADO)
Stripe **SÍ acepta empresas peruanas** desde 2023. Necesitas:

- ✅ RUC de empresa (persona jurídica)
- ✅ Cuenta bancaria empresarial en Perú
- ✅ Documentos de constitución de la empresa
- ✅ Identificación del representante legal

**Bancos compatibles en Perú:**
- BCP (Banco de Crédito del Perú)
- Interbank
- BBVA Perú
- Scotiabank Perú

### Opción B: Cuenta Digital (Alternativa)
Si no tienes empresa constituida, puedes usar:

- **Payoneer** - Recibe pagos de Stripe en cuenta virtual USD
- **Wise (TransferWise)** - Cuenta bancaria internacional
- **Stripe Atlas** - Crea una LLC en USA (costo: $500)

## 2. Configuración Actual del Proyecto

### Variables de Entorno Necesarias

```env
# Stripe Keys (obtener en https://dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Stripe Price IDs (crear en Stripe Dashboard)
STRIPE_PRICE_PRO=price_xxxxx
STRIPE_PRICE_PREMIUM=price_xxxxx

# Supabase Service Role (para webhook)
SUPABASE_SERVICE_ROLE_KEY=xxxxx
```

## 3. Pasos para Configurar Stripe

### Paso 1: Crear Cuenta Stripe
1. Ir a https://dashboard.stripe.com/register
2. Seleccionar "Perú" como país
3. Completar datos de la empresa
4. Verificar identidad y cuenta bancaria

### Paso 2: Crear Productos y Precios
```bash
# En Stripe Dashboard:
1. Products → Create Product
2. Nombre: "Plan Pro"
3. Precio: S/ 99.00 PEN (o USD $27)
4. Recurrencia: Mensual
5. Copiar el Price ID: price_xxxxx

# Repetir para Plan Premium (S/ 199)
```

### Paso 3: Configurar Webhook
```bash
# En Stripe Dashboard:
1. Developers → Webhooks → Add endpoint
2. URL: https://tu-dominio.com/api/stripe/webhook
3. Eventos a escuchar:
   - checkout.session.completed
   - customer.subscription.deleted
   - invoice.payment_failed
4. Copiar el Webhook Secret: whsec_xxxxx
```

### Paso 4: Probar en Modo Test
```bash
# Usar tarjetas de prueba de Stripe:
4242 4242 4242 4242  # Pago exitoso
4000 0000 0000 0002  # Pago rechazado
```

## 4. Monedas Soportadas

Stripe en Perú acepta:
- ✅ **PEN (Soles)** - Recomendado para clientes peruanos
- ✅ **USD (Dólares)** - Para clientes internacionales
- ✅ Conversión automática de divisas

**Configuración actual del proyecto:**
```typescript
// src/lib/stripe/config.ts
currency: 'pen',  // Soles peruanos
amount: 9900,     // S/ 99.00 (en centavos)
```

## 5. Comisiones de Stripe en Perú

- **Tarjetas peruanas:** 3.99% + S/ 1.00 por transacción
- **Tarjetas internacionales:** 4.4% + S/ 1.00
- **Sin costos mensuales fijos**
- **Sin costos de setup**

## 6. Alternativas a Stripe en Perú

Si prefieres opciones locales:

### Culqi (Peruana)
- ✅ Empresa peruana
- ✅ Integración similar a Stripe
- ✅ Soporte en español
- ✅ Comisión: 3.99% + IGV
- 🔗 https://culqi.com

### Niubiz (Visa Perú)
- ✅ Respaldado por Visa
- ✅ Amplia aceptación en Perú
- ❌ Proceso de aprobación más lento
- 🔗 https://www.niubiz.com.pe

### Mercado Pago
- ✅ Muy popular en Perú
- ✅ Acepta múltiples métodos de pago
- ✅ Incluye Yape, Plin
- 🔗 https://www.mercadopago.com.pe

## 7. Implementación en el Proyecto

### Archivos Modificados
```
src/
├── app/api/stripe/
│   ├── checkout/route.ts      # Crear sesión de pago
│   └── webhook/route.ts       # Recibir eventos de Stripe
├── types/index.ts             # Tipos con payment_status
└── app/registro/page.tsx      # Flujo de registro + pago

database/migrations/
└── 013_payment_status.sql     # Campos de pago en DB
```

### Flujo Implementado
1. Usuario se registra → `payment_status: 'pending'`
2. Redirige a Stripe Checkout
3. Usuario paga → Webhook actualiza a `'active'`
4. Si cancela → Redirige a `/registro?step=payment`
5. Dashboard valida `payment_status` antes de permitir acceso

## 8. Cuentas Digitales Recomendadas

### Opción 1: Cuenta Empresarial Tradicional
- **Interbank Cuenta Empresa**
  - Apertura online
  - Sin costo mensual (con movimiento)
  - Compatible con Stripe
  
- **BCP Empresa Digital**
  - Apertura 100% digital
  - App móvil completa
  - Integración con pasarelas

### Opción 2: Billeteras Digitales
- **Yape Empresas** (BCP)
  - Solo para recibir pagos locales
  - No compatible con Stripe directamente
  
- **Plin Empresas**
  - Similar a Yape
  - No compatible con Stripe

### Opción 3: Cuentas Internacionales
- **Payoneer**
  - Recibe USD de Stripe
  - Retira a banco peruano
  - Comisión: 1-3%
  
- **Wise Business**
  - Cuenta en múltiples monedas
  - Conversión a PEN económica
  - Comisión: 0.5-1%

## 9. Recomendación Final

**Para Coriva Core, recomiendo:**

1. **Corto plazo (MVP):**
   - Usar **Culqi** (pasarela peruana)
   - Más fácil de configurar
   - Soporte local en español
   - Acepta tarjetas peruanas directamente

2. **Mediano plazo (Escalamiento):**
   - Migrar a **Stripe** con cuenta empresarial
   - Mejor para expansión internacional
   - Más features (suscripciones, facturación)
   - Mejor documentación y APIs

3. **Cuenta bancaria:**
   - Abrir cuenta empresarial en **Interbank** o **BCP**
   - Ambos son compatibles con Stripe
   - Proceso de apertura: 3-5 días hábiles

## 10. Próximos Pasos

```bash
# 1. Ejecutar migración SQL
psql -h [supabase-host] -U postgres -d postgres -f database/migrations/013_payment_status.sql

# 2. Configurar variables de entorno en Vercel
vercel env add STRIPE_SECRET_KEY
vercel env add STRIPE_WEBHOOK_SECRET
vercel env add SUPABASE_SERVICE_ROLE_KEY

# 3. Probar flujo completo en modo test
npm run dev
# Registrar usuario → Ir a pago → Usar tarjeta test

# 4. Configurar webhook en Stripe Dashboard
# URL: https://tu-dominio.vercel.app/api/stripe/webhook
```

## Soporte

- **Stripe Perú:** https://support.stripe.com
- **Documentación:** https://stripe.com/docs
- **Status:** https://status.stripe.com

---

**Última actualización:** Enero 2025
