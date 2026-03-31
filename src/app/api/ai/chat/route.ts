import { NextRequest, NextResponse } from 'next/server'
import { buildBusinessContext } from '@/lib/ai/context-builder'
import { buildSystemPrompt } from '@/lib/ai/prompts'
import { requireModule } from '@/lib/permissions/guards'

export async function POST(req: NextRequest) {
  const authResult = await requireModule(req, 'asistente-ia')
  if (authResult instanceof NextResponse) return authResult
  
  const { user } = authResult
  
  try {
    const { messages, businessType } = await req.json()
    const orgId = user.org_id

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key no configurada' }, { status: 500 })
    }

    // Build context from real Supabase data
    let systemPrompt: string
    try {
      const ctx = orgId
        ? await buildBusinessContext(orgId)
        : {
            businessName: 'Mi Negocio', businessType: businessType ?? 'retail',
            currency: 'S/', plan: 'pro',
            productsCount: 0, lowStockCount: 0, outOfStockCount: 0,
            todaySales: 0, todayRevenue: 0, weekRevenue: 0,
            pendingInvoices: 0, rejectedInvoices: 0,
            expiringBatches: 0, expiredBatches: 0, prescriptionSales: 0,
            activeLeads: 0, pendingPurchases: 0,
          }
      systemPrompt = buildSystemPrompt(ctx)
    } catch {
      systemPrompt = `Eres el asistente IA de Coriva, un sistema POS para negocios en Perú. Responde en español, de forma concisa y accionable.`
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        max_tokens: 600,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      return NextResponse.json({ error: err.error?.message || 'Error OpenAI' }, { status: 500 })
    }

    const data = await response.json()
    return NextResponse.json({ reply: data.choices[0]?.message?.content || 'Sin respuesta' })
  } catch (error) {
    console.error('AI chat error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
