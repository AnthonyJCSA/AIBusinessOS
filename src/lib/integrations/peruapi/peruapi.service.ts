import {
  DniResult,
  RucResult,
  PeruApiError,
  RawDniResponse,
  RawRucResponse,
} from './peruapi.types'
import { createLogger } from '@/lib/logger'

const log = createLogger('PeruAPI')
const TIMEOUT_MS = 8_000

// ─── Validadores de formato ───────────────────────────────────────────────────

export function validateDni(dni: string): PeruApiError | null {
  if (!/^\d{8}$/.test(dni)) {
    return { code: 'INVALID_FORMAT', message: 'El DNI debe tener exactamente 8 dígitos numéricos' }
  }
  return null
}

export function validateRuc(ruc: string): PeruApiError | null {
  if (!/^\d{11}$/.test(ruc)) {
    return { code: 'INVALID_FORMAT', message: 'El RUC debe tener exactamente 11 dígitos numéricos' }
  }
  // RUC peruano: debe empezar con 10 (persona natural) o 20 (empresa)
  if (!ruc.startsWith('10') && !ruc.startsWith('20')) {
    return { code: 'INVALID_FORMAT', message: 'RUC inválido: debe comenzar con 10 o 20' }
  }
  return null
}

// ─── HTTP helper ──────────────────────────────────────────────────────────────

function getConfig(): { baseUrl: string; apiKey: string } {
  const baseUrl = process.env.PERUAPI_BASE_URL
  const apiKey  = process.env.PERUAPI_KEY
  log.info('PeruAPI config check', { hasBaseUrl: !!baseUrl, hasApiKey: !!apiKey, keyLength: apiKey?.length ?? 0 })
  if (!baseUrl || !apiKey) {
    throw { code: 'PROVIDER_ERROR', message: 'Variables PERUAPI_BASE_URL y PERUAPI_KEY no configuradas' } as PeruApiError
  }
  return { baseUrl, apiKey }
}

async function fetchPeruApi<T>(path: string): Promise<T> {
  const { baseUrl, apiKey } = getConfig()
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  // peruapi.com requiere 'X-API-KEY' como header o 'api_token' como query param
  const allowedIp = process.env.PERUAPI_ALLOWED_IP
  const separator = path.includes('?') ? '&' : '?'
  const ipParam = allowedIp ? `&ip=${allowedIp}` : ''
  const fullUrl = `${baseUrl}${path}${separator}api_token=${apiKey}${ipParam}`
  log.info('Llamando PeruAPI', { url: fullUrl.replace(apiKey, '***'), keyLength: apiKey.length, allowedIp })

  let res: Response
  try {
    res = await fetch(fullUrl, {
      headers: {
        'X-API-KEY': apiKey,
        'Accept': 'application/json',
      },
      signal: controller.signal,
    })
  } catch (err: unknown) {
    clearTimeout(timer)
    if ((err as { name?: string }).name === 'AbortError') {
      throw { code: 'TIMEOUT', message: 'Tiempo de espera agotado al consultar Perú API' } as PeruApiError
    }
    throw { code: 'PROVIDER_ERROR', message: `Error de red: ${(err as Error).message}` } as PeruApiError
  } finally {
    clearTimeout(timer)
  }

  if (res.status === 404) {
    throw { code: 'NOT_FOUND', message: 'Documento no encontrado en el padrón' } as PeruApiError
  }
  if (res.status === 401 || res.status === 403) {
    const body = await res.text().catch(() => '')
    log.error('Auth error PeruAPI', { status: res.status, path, body })
    throw { code: 'PROVIDER_ERROR', message: `Error de autenticación PeruAPI (${res.status}): ${body || 'API key inválida'}` } as PeruApiError
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    log.error('Error HTTP PeruAPI', { status: res.status, path, body })
    throw { code: 'PROVIDER_ERROR', message: `Error PeruAPI HTTP ${res.status}: ${body}` } as PeruApiError
  }

  return res.json() as Promise<T>
}

// ─── Normalizadores ───────────────────────────────────────────────────────────

function normalizeDni(raw: RawDniResponse, dni: string): DniResult {
  const nombres         = raw.nombres ?? raw.nombre ?? ''
  const apellidoPaterno = raw.apellidoPaterno ?? raw.apellido_paterno ?? ''
  const apellidoMaterno = raw.apellidoMaterno ?? raw.apellido_materno ?? ''
  const nombreCompleto  =
    raw.nombreCompleto ??
    raw.nombre_completo ??
    `${nombres} ${apellidoPaterno} ${apellidoMaterno}`.replace(/\s+/g, ' ').trim()

  return {
    dni:             raw.dni ?? raw.numero ?? dni,
    nombres,
    apellidoPaterno,
    apellidoMaterno,
    nombreCompleto,
  }
}

function normalizeRuc(raw: RawRucResponse, ruc: string): RucResult {
  return {
    ruc:         raw.ruc ?? raw.numero ?? ruc,
    razonSocial: raw.razonSocial ?? raw.razon_social ?? raw.nombre ?? '',
    direccion:   raw.direccion ?? raw.domicilioFiscal ?? raw.domicilio_fiscal ?? '',
    estado:      raw.estado ?? '',
    condicion:   raw.condicion ?? '',
    departamento: raw.departamento,
    provincia:    raw.provincia,
    distrito:     raw.distrito,
  }
}

// ─── Servicio público ─────────────────────────────────────────────────────────

export const peruApiService = {
  async searchDni(dni: string): Promise<DniResult> {
    const validationErr = validateDni(dni)
    if (validationErr) throw validationErr

    log.info('Consultando DNI', { dni: `${dni.slice(0, 4)}****` }) // no loguear DNI completo
    const raw = await fetchPeruApi<RawDniResponse>(`/dni/${dni}`)
    const result = normalizeDni(raw, dni)
    log.info('DNI encontrado', { dni: `${dni.slice(0, 4)}****` })
    return result
  },

  async searchRuc(ruc: string): Promise<RucResult> {
    const validationErr = validateRuc(ruc)
    if (validationErr) throw validationErr

    log.info('Consultando RUC', { ruc })
    const raw = await fetchPeruApi<RawRucResponse>(`/ruc/${ruc}`)
    const result = normalizeRuc(raw, ruc)
    log.info('RUC encontrado', { ruc, razonSocial: result.razonSocial })
    return result
  },
}
