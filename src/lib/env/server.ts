/**
 * Server Environment Variables
 * Variables privadas que NUNCA deben exponerse al cliente
 * Solo accesibles en API routes y Server Components
 */

const serverEnv = {
  // OpenAI (Obligatorio para IA)
  openaiApiKey: process.env.OPENAI_API_KEY,
  
  // Nubefact (Obligatorio para facturación)
  nubefactApiUrl: process.env.NUBEFACT_API_URL,
  nubefactToken: process.env.NUBEFACT_TOKEN,
  
  // Perú API (Obligatorio para DNI/RUC)
  peruApiBaseUrl: process.env.PERUAPI_BASE_URL,
  peruApiKey: process.env.PERUAPI_KEY,
  peruApiAllowedIp: process.env.PERUAPI_ALLOWED_IP,
} as const

export function validateServerEnv(options: {
  requireOpenAI?: boolean
  requireNubefact?: boolean
  requirePeruApi?: boolean
} = {}) {
  const errors: string[] = []

  // OpenAI (solo si se requiere)
  if (options.requireOpenAI) {
    if (!serverEnv.openaiApiKey) {
      errors.push('OPENAI_API_KEY no está configurado')
    } else if (!serverEnv.openaiApiKey.startsWith('sk-')) {
      errors.push('OPENAI_API_KEY tiene formato inválido (debe empezar con sk-)')
    }
  }

  // Nubefact (solo si se requiere)
  if (options.requireNubefact) {
    if (!serverEnv.nubefactApiUrl) {
      errors.push('NUBEFACT_API_URL no está configurado')
    }
    if (!serverEnv.nubefactToken) {
      errors.push('NUBEFACT_TOKEN no está configurado')
    }
  }

  // Perú API (solo si se requiere)
  if (options.requirePeruApi) {
    if (!serverEnv.peruApiBaseUrl) {
      errors.push('PERUAPI_BASE_URL no está configurado')
    }
    if (!serverEnv.peruApiKey) {
      errors.push('PERUAPI_KEY no está configurado')
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `❌ Configuración de servidor inválida:\n${errors.map(e => `  - ${e}`).join('\n')}`
    )
  }

  return true
}

export const serverConfig = {
  ...serverEnv,
  
  // Helpers
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  
  // Feature flags basados en configuración
  hasOpenAI: !!serverEnv.openaiApiKey,
  hasNubefact: !!serverEnv.nubefactApiUrl && !!serverEnv.nubefactToken,
  hasPeruApi: !!serverEnv.peruApiBaseUrl && !!serverEnv.peruApiKey,
} as const
