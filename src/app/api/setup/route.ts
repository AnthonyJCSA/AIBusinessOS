import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// RUTA TEMPORAL — solo para setup inicial de base de datos
// Requiere SUPABASE_SERVICE_ROLE_KEY en .env.local

export async function POST(req: NextRequest) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const url        = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!serviceKey) {
    return NextResponse.json({
      error: 'Falta SUPABASE_SERVICE_ROLE_KEY en .env.local',
      hint:  'Supabase Dashboard → Settings → API → service_role (secret)'
    }, { status: 500 })
  }

  const { statements } = await req.json() as { statements: string[] }
  if (!statements?.length) {
    return NextResponse.json({ error: 'statements[] requerido' }, { status: 400 })
  }

  const supabase = createClient(url!, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  const results: { sql: string; ok: boolean; error?: string }[] = []

  for (const sql of statements) {
    const trimmed = sql.trim()
    if (!trimmed) continue

    // Supabase service role puede ejecutar SQL via rpc si existe la función,
    // o via el endpoint de administración
    const res = await fetch(`${url}/rest/v1/rpc/run_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ query: trimmed })
    })

    if (res.ok) {
      results.push({ sql: trimmed.slice(0, 60) + '...', ok: true })
    } else {
      const body = await res.json().catch(() => ({}))
      results.push({ sql: trimmed.slice(0, 60) + '...', ok: false, error: (body as any).message })
    }
  }

  return NextResponse.json({ results })
}
