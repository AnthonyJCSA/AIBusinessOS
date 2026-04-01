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
  if (!ruc.startsWith('10') && !ruc.startsWith('20')) {
    return { code: 'INVALID_FORMAT', message: 'RUC inválido: debe comenzar con 10 o 20' }
  }
  return null
}

// ─── Estrategia: PeruAPI (si está configurada) → apis.net.pe (fallback público) ─

async function fetchWithPeruApi<T>(path: string): Promise<T> {
  const baseUrl = process.env.PERUAPI_BASE_URL
  const apiKey  = process.env.PERUAPI_KEY
  if (!baseUrl || !apiKey) throw new Error('no_config')

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(`${baseUrl}${path}?api_token=${apiKey}&summary=0&plan=0`, {
      headers: { 'X-API-KEY': apiKey, 'Accept': 'application/json' },
      signal: controller.signal,
    })
    if (!res.ok) throw new Error(`http_${res.status}`)
    return res.json() as Promise<T>
  } finally {
    clearTimeout(timer)
  }
}

async function fetchWithApisNetPe<T>(path: string): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(`https://apis.net.pe/api/v1${path}`, {
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    })
    if (res.status === 404) throw { code: 'NOT_FOUND', message: 'Documento no encontrado en el padrón' } as PeruApiError
    if (!res.ok) throw new Error(`http_${res.status}`)
    return res.json() as Promise<T>
  } finally {
    clearTimeout(timer)
  }
}

async function fetchPeruApi<T>(path: string): Promise<T> {
  // Intentar primero con PeruAPI configurada
  try {
    const result = await fetchWithPeruApi<T>(path)
    log.info('PeruAPI OK', { path })
    return result
  } catch (err: any) {
    if ((err as PeruApiError)?.code === 'NOT_FOUND') throw err
    log.info('PeruAPI no disponible, usando fallback apis.net.pe', { reason: err?.message })
  }

  // Fallback: apis.net.pe (público, sin auth, sin restricción de IP)
  try {
    const result = await fetchWithApisNetPe<T>(path)
    log.info('apis.net.pe OK', { path })
    return result
  } catch (err: any) {
    if ((err as PeruApiError)?.code) throw err
    if (err?.name === 'AbortError') throw { code: 'TIMEOUT', message: 'Tiempo de espera agotado' } as PeruApiError
    throw { code: 'PROVIDER_ERROR', message: 'No se pudo consultar el documento. Intenta de nuevo.' } as PeruApiError
  }
}

// ─── Normalizadores ───────────────────────────────────────────────────────────

function normalizeDni(raw: any, dni: string): DniResult {
  const nombres         = raw.nombres ?? raw.nombre ?? ''
  const apellidoPaterno = raw.apellidoPaterno ?? raw.apellido_paterno ?? ''
  const apellidoMaterno = raw.apellidoMaterno ?? raw.apellido_materno ?? ''
  const nombreCompleto  =
    raw.nombreCompleto ??
    raw.nombre_completo ??
    raw.cliente ??
    `${nombres} ${apellidoPaterno} ${apellidoMaterno}`.replace(/\s+/g, ' ').trim()

  return { dni: raw.dni ?? raw.numero ?? dni, nombres, apellidoPaterno, apellidoMaterno, nombreCompleto }
}

function normalizeRuc(raw: any, ruc: string): RucResult {
  return {
    ruc:          raw.ruc ?? raw.numero ?? ruc,
    razonSocial:  raw.razonSocial ?? raw.razon_social ?? raw.nombre ?? '',
    direccion:    raw.direccion ?? raw.domicilioFiscal ?? raw.domicilio_fiscal ?? '',
    estado:       raw.estado ?? '',
    condicion:    raw.condicion ?? '',
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
    log.info('Consultando DNI', { dni: `${dni.slice(0, 4)}****` })
    const raw = await fetchPeruApi<any>(`/dni/${dni}`)
    return normalizeDni(raw, dni)
  },

  async searchRuc(ruc: string): Promise<RucResult> {
    const validationErr = validateRuc(ruc)
    if (validationErr) throw validationErr
    log.info('Consultando RUC', { ruc })
    const raw = await fetchPeruApi<any>(`/ruc/${ruc}`)
    return normalizeRuc(raw, ruc)
  },
}
