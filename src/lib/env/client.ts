/**
 * Client Environment Variables
 * Solo variables que empiezan con NEXT_PUBLIC_
 * Estas son seguras para exponer al navegador
 */

const clientEnv = {
  // Supabase (Obligatorio)
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  
  // Analytics (Opcional)
  gtmId: process.env.NEXT_PUBLIC_GTM_ID,
  ga4Id: process.env.NEXT_PUBLIC_GA4_ID,
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID,
  
  // App Config (Opcional)
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '51913916967',
} as const

export function validateClientEnv() {
  const errors: string[] = []

  if (!clientEnv.supabaseUrl || clientEnv.supabaseUrl.includes('placeholder')) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL no está configurado o contiene placeholder')
  }

  if (!clientEnv.supabaseAnonKey || clientEnv.supabaseAnonKey.includes('placeholder')) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY no está configurado o contiene placeholder')
  }

  if (clientEnv.supabaseUrl && !clientEnv.supabaseUrl.startsWith('https://')) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL debe empezar con https://')
  }

  if (errors.length > 0) {
    throw new Error(
      `❌ Configuración de entorno inválida:\n${errors.map(e => `  - ${e}`).join('\n')}\n\n` +
      `Revisa tu archivo .env.local y asegúrate de tener todas las variables configuradas.`
    )
  }

  return true
}

export const env = {
  ...clientEnv,
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isTest: process.env.NODE_ENV === 'test',
} as const

if (typeof window !== 'undefined') {
  try {
    validateClientEnv()
  } catch (error) {
    console.error(error)
    if (env.isDevelopment) {
      document.body.innerHTML = `
        <div style="font-family: monospace; padding: 40px; background: #1a1a1a; color: #ff6b6b; min-height: 100vh;">
          <h1 style="color: #ff6b6b; margin-bottom: 20px;">⚠️ Error de Configuración</h1>
          <pre style="background: #2a2a2a; padding: 20px; border-radius: 8px; overflow-x: auto; color: #fff;">${(error as Error).message}</pre>
          <p style="margin-top: 20px; color: #aaa;">Revisa tu archivo <code>.env.local</code> y reinicia el servidor.</p>
        </div>
      `
    }
  }
}
