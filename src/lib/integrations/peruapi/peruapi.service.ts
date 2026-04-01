import {
  DniResult,
  RucResult,
  PeruApiError,
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

// ─── HTTP helper — api.apis.net.pe/v1 (público, sin token, sin restricción IP) ─

async function fetchApisNetPe<T>(endpoint: string, numero: string): Promise<T> {
  const url = `https://api.apis.net.pe/v1/${endpoint}?numero=${numero}`
  log.info('Consultando api.apis.net.pe', { endpoint, numero: numero.slice(0, 4) + '****' })

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  let res: Response
  try {
    res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    })
  } catch (err: any) {
    clearTimeout(timer)
    if (err?.name === 'AbortError') {
      throw { code: 'TIMEOUT', message: 'Tiempo de espera agotado al consultar el padrón' } as PeruApiError
    }
    throw { code: 'PROVIDER_ERROR', message: `Error de red: ${err?.message}` } as PeruApiError
  } finally {
    clearTimeout(timer)
  }

  if (res.status === 404) {
    throw { code: 'NOT_FOUND', message: 'Documento no encontrado en el padrón' } as PeruApiError
  }
  if (res.status === 422) {
    const body = await res.json().catch(() => ({}))
    throw { code: 'INVALID_FORMAT', message: (body as any).error ?? 'Formato de documento inválido' } as PeruApiError
  }
  if (!res.ok) {
    log.error('Error HTTP api.apis.net.pe', { status: res.status, endpoint })
    throw { code: 'PROVIDER_ERROR', message: `Error del proveedor: HTTP ${res.status}` } as PeruApiError
  }

  return res.json() as Promise<T>
}

// ─── Normalizadores ───────────────────────────────────────────────────────────

function normalizeDni(raw: any, dni: string): DniResult {
  const nombres         = raw.nombres ?? raw.nombre?.split(' ').slice(2).join(' ') ?? ''
  const apellidoPaterno = raw.apellidoPaterno ?? ''
  const apellidoMaterno = raw.apellidoMaterno ?? ''
  const nombreCompleto  = raw.nombre ?? `${nombres} ${apellidoPaterno} ${apellidoMaterno}`.trim()

  return { dni: raw.numeroDocumento ?? dni, nombres, apellidoPaterno, apellidoMaterno, nombreCompleto }
}

function normalizeRuc(raw: any, ruc: string): RucResult {
  return {
    ruc:          raw.numeroDocumento ?? ruc,
    razonSocial:  raw.nombre ?? raw.razonSocial ?? '',
    direccion:    raw.direccion ?? '',
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
    const err = validateDni(dni)
    if (err) throw err
    const raw = await fetchApisNetPe<any>('dni', dni)
    log.info('DNI encontrado', { dni: dni.slice(0, 4) + '****' })
    return normalizeDni(raw, dni)
  },

  async searchRuc(ruc: string): Promise<RucResult> {
    const err = validateRuc(ruc)
    if (err) throw err
    const raw = await fetchApisNetPe<any>('ruc', ruc)
    log.info('RUC encontrado', { ruc, razonSocial: raw.nombre ?? raw.razonSocial })
    return normalizeRuc(raw, ruc)
  },
}
