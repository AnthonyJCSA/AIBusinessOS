#!/usr/bin/env node
/**
 * run-migrations.mjs
 * Ejecuta MASTER_SETUP.sql directamente en Supabase
 *
 * Uso:
 *   1. Agrega SUPABASE_SERVICE_ROLE_KEY=xxx en .env.local
 *   2. node run-migrations.mjs
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dir = dirname(fileURLToPath(import.meta.url))

// ── Leer .env.local ──────────────────────────────────────────
const env = readFileSync(join(__dir, '.env.local'), 'utf8')
const get = (key) => env.match(new RegExp(`^${key}=(.+)`, 'm'))?.[1]?.trim()

const SUPABASE_URL      = get('NEXT_PUBLIC_SUPABASE_URL')
const SERVICE_ROLE_KEY  = get('SUPABASE_SERVICE_ROLE_KEY')
const ANON_KEY          = get('NEXT_PUBLIC_SUPABASE_ANON_KEY')

if (!SUPABASE_URL) { console.error('❌ NEXT_PUBLIC_SUPABASE_URL no encontrado'); process.exit(1) }

if (!SERVICE_ROLE_KEY) {
  console.error('\n❌ SUPABASE_SERVICE_ROLE_KEY no encontrado en .env.local')
  console.error('\n📋 Para obtenerlo:')
  console.error('   1. Ve a https://supabase.com/dashboard/project/yxjkuyrluipnxufjasyw/settings/api')
  console.error('   2. Copia el valor de "service_role" (secret)')
  console.error('   3. Agrega en .env.local:')
  console.error('      SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...\n')
  process.exit(1)
}

// ── Leer SQL ─────────────────────────────────────────────────
const sql = readFileSync(join(__dir, 'database', 'MASTER_SETUP.sql'), 'utf8')

// ── Dividir en statements individuales ───────────────────────
// Separar por ; pero respetar bloques $$ ... $$
function splitStatements(sql) {
  const statements = []
  let current = ''
  let inDollar = false

  const lines = sql.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('--')) { current += line + '\n'; continue }

    if (trimmed.includes('$$')) {
      const count = (trimmed.match(/\$\$/g) || []).length
      if (count % 2 !== 0) inDollar = !inDollar
    }

    current += line + '\n'

    if (!inDollar && trimmed.endsWith(';')) {
      const stmt = current.trim()
      if (stmt && stmt !== ';') statements.push(stmt)
      current = ''
    }
  }
  if (current.trim()) statements.push(current.trim())
  return statements.filter(s => s.length > 5 && !s.startsWith('--'))
}

// ── Ejecutar via Management API ───────────────────────────────
async function execSQL(statement) {
  const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]

  // Intentar Management API
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ query: statement })
  })

  if (res.ok) {
    const data = await res.json()
    return { ok: true, data }
  }

  // Fallback: intentar via REST con service role
  const res2 = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ sql_text: statement })
  })

  const body2 = await res2.json().catch(() => ({}))
  return { ok: res2.ok, error: body2.message || body2.error || JSON.stringify(body2) }
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
  console.log('\n🚀 Coriva OS — Ejecutando migraciones en Supabase')
  console.log(`   URL: ${SUPABASE_URL}`)
  console.log(`   Key: ${SERVICE_ROLE_KEY.slice(0, 20)}...\n`)

  const statements = splitStatements(sql)
  console.log(`📋 ${statements.length} statements encontrados\n`)

  let ok = 0, fail = 0

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i]
    const preview = stmt.replace(/\s+/g, ' ').slice(0, 70)

    process.stdout.write(`[${i+1}/${statements.length}] ${preview}... `)

    const result = await execSQL(stmt)

    if (result.ok) {
      console.log('✅')
      ok++
    } else {
      console.log(`❌ ${result.error || 'Error desconocido'}`)
      fail++
    }
  }

  console.log(`\n${'─'.repeat(60)}`)
  console.log(`✅ Exitosos: ${ok}`)
  console.log(`❌ Fallidos: ${fail}`)

  if (fail > 0) {
    console.log('\n💡 Los errores "already exists" son normales si ya se ejecutó antes.')
    console.log('   Si hay errores reales, ejecuta MASTER_SETUP.sql en el SQL Editor de Supabase.')
  } else {
    console.log('\n🎉 ¡Todas las migraciones ejecutadas correctamente!')
  }
}

main().catch(console.error)
