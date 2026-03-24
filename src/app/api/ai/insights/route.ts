import { NextRequest, NextResponse } from 'next/server'
import { buildBusinessContext } from '@/lib/ai/context-builder'
import { buildInsightsPrompt } from '@/lib/ai/prompts'

export async function POST(req: NextRequest) {
  try {
    const { orgId, businessType } = await req.json()

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key no configurada' }, { status: 500 })
    }
    if (!orgId) {
      return NextResponse.json({ error: 'orgId requerido' }, { status: 400 })
    }

    const context = await buildBusinessContext(orgId)
    const systemPrompt = buildInsightsPrompt(businessType ?? 'retail', context)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: 'Genera el resumen ejecutivo de hoy con insights accionables. Responde en JSON con el formato indicado.',
          },
        ],
        max_tokens: 800,
        temperature: 0.4,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      return NextResponse.json({ error: err.error?.message ?? 'Error OpenAI' }, { status: 500 })
    }

    const data = await response.json()
    const raw = data.choices[0]?.message?.content ?? '{}'

    let insights
    try {
      insights = JSON.parse(raw)
    } catch {
      insights = { summary: raw, actions: [], alerts: [] }
    }

    return NextResponse.json({ insights, context, generatedAt: new Date().toISOString() })
  } catch (error) {
    console.error('AI insights error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
