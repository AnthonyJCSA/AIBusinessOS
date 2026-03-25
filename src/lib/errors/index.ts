export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} no encontrado`, 404, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 422, 'CONFLICT')
    this.name = 'ConflictError'
  }
}

// Error lanzado cuando un proveedor externo falla (Nubefact, PeruAPI)
export class IntegrationError extends AppError {
  constructor(
    public readonly provider: string,
    message: string,
    public readonly providerCode?: string,
  ) {
    super(message, 502, 'INTEGRATION_ERROR')
    this.name = 'IntegrationError'
  }
}

export class IntegrationTimeoutError extends AppError {
  constructor(provider: string) {
    super(`Tiempo de espera agotado al conectar con ${provider}`, 503, 'INTEGRATION_TIMEOUT')
    this.name = 'IntegrationTimeoutError'
  }
}

/** Convierte cualquier error a una respuesta HTTP segura (sin stack traces) */
export function toHttpError(err: unknown): { status: number; body: { error: string; code: string } } {
  if (err instanceof AppError) {
    return { status: err.statusCode, body: { error: err.message, code: err.code } }
  }
  return { status: 500, body: { error: 'Error interno del servidor', code: 'INTERNAL_ERROR' } }
}
