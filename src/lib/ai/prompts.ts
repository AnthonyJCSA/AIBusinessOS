import type { BusinessContext } from './context-builder'

// ── Preguntas rápidas por tipo de negocio ─────────────────────────────────────

const QUICK_QUESTIONS_PHARMACY = [
  '¿Qué productos están por vencer en los próximos 7 días?',
  '¿Cuáles son mis medicamentos más vendidos esta semana?',
  '¿Qué productos con receta vendí hoy?',
  '¿Tengo comprobantes rechazados por SUNAT pendientes?',
  '¿Qué lotes debo retirar por vencimiento?',
  'Genera un mensaje para avisar a clientes sobre promociones',
]

const QUICK_QUESTIONS_GENERAL = [
  '¿Cuál es mi producto más vendido esta semana?',
  '¿Qué productos necesito reabastecer urgente?',
  '¿Cómo puedo aumentar mis ventas este mes?',
  'Genera un mensaje de WhatsApp para clientes inactivos',
  '¿Cuál es mi ticket promedio y cómo mejorarlo?',
  'Predice mis ventas para la próxima semana',
]

export function getQuickQuestions(businessType: string): string[] {
  return businessType === 'pharmacy' ? QUICK_QUESTIONS_PHARMACY : QUICK_QUESTIONS_GENERAL
}

// Exportar también el set general para compatibilidad con imports existentes
export const QUICK_QUESTIONS = QUICK_QUESTIONS_GENERAL

// ── System prompt ─────────────────────────────────────────────────────────────

export function buildSystemPrompt(ctx: BusinessContext): string {
  const isPharma = ctx.businessType === 'pharmacy'

  const pharmaSection = isPharma ? `
MÓDULO FARMACIA:
- Lotes próximos a vencer (≤30 días): ${ctx.expiringBatches}
- Lotes vencidos con stock: ${ctx.expiredBatches}
- Comprobantes SUNAT pendientes: ${ctx.pendingInvoices}
- Comprobantes SUNAT rechazados: ${ctx.rejectedInvoices}

REGLAS REGULATORIAS PERÚ (DIGEMID):
- Los productos controlados requieren receta médica archivada
- Los lotes vencidos deben retirarse y registrarse como baja
- Las facturas electrónicas deben estar aceptadas por SUNAT
- Alertar siempre sobre vencimientos críticos (≤7 días)` : `
FACTURACIÓN:
- Comprobantes SUNAT pendientes: ${ctx.pendingInvoices}
- Comprobantes SUNAT rechazados: ${ctx.rejectedInvoices}`

  return `Eres el asistente IA de ${ctx.businessName}, un negocio de tipo ${ctx.businessType} en Perú.
Responde siempre en español, de forma concisa y accionable (máximo 3 párrafos).
Usa los datos reales del negocio cuando estén disponibles.
Plan actual: ${ctx.plan.toUpperCase()}

CONTEXTO DEL NEGOCIO:
- Moneda: ${ctx.currency}
- Productos en catálogo: ${ctx.productsCount}
- Sin stock: ${ctx.outOfStockCount} | Stock bajo: ${ctx.lowStockCount}
- Ventas hoy: ${ctx.todaySales} transacciones · ${ctx.currency} ${ctx.todayRevenue.toFixed(2)}
- Ingresos esta semana: ${ctx.currency} ${ctx.weekRevenue.toFixed(2)}
- Leads activos en pipeline: ${ctx.activeLeads}
- Órdenes de compra pendientes: ${ctx.pendingPurchases}
${pharmaSection}

INSTRUCCIONES:
- Si detectas problemas críticos (stock agotado, lotes vencidos, SUNAT rechazado), menciónalos primero
- Sugiere acciones concretas y medibles
- Para farmacias, prioriza cumplimiento regulatorio sobre optimización comercial
- Nunca inventes datos que no estén en el contexto`
}
