# ✅ Production Checklist v1.0 — Coriva Core

## 🗄️ Base de Datos (Supabase)

- [ ] Schema principal ejecutado (`corivacore-mvp-schema.sql`)
- [ ] Migration 001: inventory + cash RLS
- [ ] Migration 002: purchases + suppliers
- [ ] Migration 003: customers + leads + pipeline
- [ ] Migration 004: purchase number RLS
- [ ] Migration 005: lead notes (Sprint 6)
- [ ] Migration 006: automations (Sprint 7)
- [ ] RLS habilitado en todas las tablas
- [ ] Funciones RPC verificadas (generate_sale_number, decrement_product_stock, etc.)
- [ ] Índices creados correctamente

## 🔐 Seguridad

- [ ] `OPENAI_API_KEY` configurada solo server-side (sin `NEXT_PUBLIC_`)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` es la clave anon (no service_role)
- [ ] Headers de seguridad activos (X-Frame-Options, CSP, HSTS)
- [ ] `poweredByHeader: false` en next.config.js
- [ ] Middleware protege `/dashboard` y rutas privadas
- [ ] RLS en Supabase filtra por `org_id`

## ⚡ Performance

- [ ] `npm run build` sin warnings críticos
- [ ] Bundle `/dashboard` < 200kB First Load JS ✅ (191kB actual)
- [ ] Imágenes con formato WebP/AVIF configurado
- [ ] Cache de assets estáticos: `max-age=31536000`
- [ ] `compress: true` en next.config.js

## 🤖 IA

- [ ] `OPENAI_API_KEY` válida y con créditos
- [ ] `/api/ai/chat` responde correctamente
- [ ] `/api/ai/insights` responde correctamente
- [ ] Timeout de funciones: 30s configurado en vercel.json
- [ ] Fallo silencioso cuando OpenAI no disponible ✅

## 📊 Analytics

- [ ] GTM_ID configurado en variables de entorno
- [ ] GA4_ID configurado
- [ ] Sitemap accesible en `/sitemap.xml`
- [ ] Robots.txt correcto en `/robots.txt`
- [ ] OG tags verificados con [opengraph.xyz](https://opengraph.xyz)

## 🧪 Testing funcional

- [ ] Registro de nuevo negocio (onboarding completo)
- [ ] Login / logout
- [ ] POS: venta completa con impresión de comprobante
- [ ] Inventario: agregar, editar, ajustar stock
- [ ] Caja: apertura → venta → gasto → cierre
- [ ] Clientes: crear, segmentar, ver historial
- [ ] Leads: crear, mover en kanban, agregar nota, convertir a cliente
- [ ] Compras: crear orden, recibir (actualiza stock)
- [ ] Facturación: emitir boleta/factura, marcar crédito pagado
- [ ] Automatizaciones: crear desde plantilla, pausar, activar
- [ ] Asistente IA: responde preguntas del negocio
- [ ] Notificaciones: alertas de stock aparecen al cargar
- [ ] Reportes: gráfico 7 días, top productos, exportar CSV
- [ ] Settings: cambiar tema, guardar configuración

## 🌐 Deploy

- [ ] Vercel conectado al repositorio GitHub
- [ ] Variables de entorno configuradas en Vercel Dashboard
- [ ] Dominio personalizado configurado (opcional)
- [ ] `NEXT_PUBLIC_APP_URL` apunta al dominio de producción
- [ ] Deploy exitoso sin errores en Vercel logs
- [ ] Preview deployment funciona antes de promover a producción

## 📱 Mobile

- [ ] Dashboard usable en móvil (sidebar hamburger)
- [ ] POS funciona en tablet
- [ ] Modales no se cortan en pantallas pequeñas
- [ ] Touch targets ≥ 44px

## 🔄 Post-Deploy

- [ ] Crear organización de prueba real
- [ ] Cargar 10+ productos reales
- [ ] Procesar 3 ventas de prueba
- [ ] Verificar que stock se decrementa en Supabase
- [ ] Verificar que insights de IA usan datos reales
- [ ] Monitorear errores en Vercel logs por 24h

---

**Fecha de deploy**: _______________
**Versión**: v1.0.0
**Responsable**: _______________
**URL producción**: https://coriva-core.vercel.app
