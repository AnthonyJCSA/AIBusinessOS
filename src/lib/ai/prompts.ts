export const QUICK_QUESTIONS = [
  '¿Cuál es mi producto más vendido esta semana?',
  '¿Qué productos necesito reabastecer urgente?',
  '¿Cómo puedo aumentar mis ventas este mes?',
  'Genera un mensaje de WhatsApp para clientes inactivos',
  '¿Cuál es mi ticket promedio y cómo mejorarlo?',
  'Predice mis ventas para la próxima semana',
]

export function buildSystemPrompt(context: {
  businessName: string
  businessType: string
  currency: string
  productsCount: number
  lowStockCount: number
  todaySales: number
  todayRevenue: number
}): string {
  return `Eres el asistente IA de ${context.businessName}, un negocio de tipo ${context.businessType} en Perú.
Responde siempre en español, de forma concisa y accionable (máximo 3 párrafos).
Usa los datos reales del negocio cuando estén disponibles.

Contexto actual:
- Moneda: ${context.currency}
- Productos en catálogo: ${context.productsCount}
- Productos con stock crítico: ${context.lowStockCount}
- Ventas hoy: ${context.todaySales} transacciones
- Ingresos hoy: ${context.currency} ${context.todayRevenue.toFixed(2)}

Sé proactivo: si detectas problemas (stock bajo, pocas ventas), menciónalos y sugiere acciones concretas.`
}
