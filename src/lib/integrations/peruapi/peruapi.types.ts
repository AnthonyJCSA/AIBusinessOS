// ─── Resultados normalizados (lo que devuelve el sistema al frontend) ─────────

export interface DniResult {
  dni: string
  nombres: string
  apellidoPaterno: string
  apellidoMaterno: string
  nombreCompleto: string
}

export interface RucResult {
  ruc: string
  razonSocial: string
  direccion: string
  estado: string       // 'ACTIVO' | 'BAJA DE OFICIO' | 'BAJA PROVISIONAL' | etc.
  condicion: string    // 'HABIDO' | 'NO HABIDO' | 'NO HALLADO' | etc.
  departamento?: string
  provincia?: string
  distrito?: string
}

// ─── Códigos de error tipados ─────────────────────────────────────────────────

export type PeruApiErrorCode =
  | 'INVALID_FORMAT'   // DNI no tiene 8 dígitos / RUC no tiene 11
  | 'NOT_FOUND'        // documento no existe en el padrón
  | 'PROVIDER_ERROR'   // Perú API devolvió error HTTP
  | 'TIMEOUT'          // la petición superó el timeout

export interface PeruApiError {
  code: PeruApiErrorCode
  message: string
}

// ─── Estructuras raw que puede devolver Perú API (varía según plan) ───────────
// Solo se usan dentro del servicio para normalizar

export interface RawDniResponse {
  dni?: string
  numero?: string
  nombres?: string
  nombre?: string
  apellidoPaterno?: string
  apellido_paterno?: string
  apellidoMaterno?: string
  apellido_materno?: string
  nombreCompleto?: string
  nombre_completo?: string
}

export interface RawRucResponse {
  ruc?: string
  numero?: string
  razonSocial?: string
  razon_social?: string
  nombre?: string
  direccion?: string
  domicilioFiscal?: string
  domicilio_fiscal?: string
  estado?: string
  condicion?: string
  departamento?: string
  provincia?: string
  distrito?: string
}
