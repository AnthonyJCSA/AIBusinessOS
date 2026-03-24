import { NextRequest, NextResponse } from 'next/server'
import { buildBusinessContext } from '@/lib/ai/context-builder'
import { buildSystemPrompt } from '@/lib/ai/prompts'

export async function POST(req: NextRequest) {
  try {
    const { messages, orgId, businessType } = await req.json()

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key no configurada' }, { status: 500 })
    }

    // Construir contexto real del negocio si hay orgId
    let context = {}
    if (orgId) {
      try {
        context = await buildBusinessContext(orgId)
      } catch (e) {
        console.error('Error building context:', e)
        // Continuar sin contexto si falla
      }
    }

    const systemPrompt = buildSystemPrompt(businessType ?? 'retail', context)

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
          ...messages,
        ],
        max_tokens: 600,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      return NextResponse.json(
        { error: err.error?.message ?? 'Error OpenAI' },
        { status: 500 }
      )
    }

    const data = await response.json()
    const reply = data.choices[0]?.message?.content ?? 'Sin respuesta'

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('AI chat error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
