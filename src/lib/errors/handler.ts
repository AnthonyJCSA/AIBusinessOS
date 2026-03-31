import { NextResponse } from 'next/server'

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
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

export class UnauthorizedError extends AppError {
  constructor(message: string = 'No autenticado') {
    super(message, 401, 'UNAUTHORIZED')
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Acceso denegado') {
    super(message, 403, 'FORBIDDEN')
    this.name = 'ForbiddenError'
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Recurso no encontrado') {
    super(message, 404, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT')
    this.name = 'ConflictError'
  }
}

export class IntegrationError extends AppError {
  constructor(message: string, public integration: string) {
    super(message, 502, 'INTEGRATION_ERROR')
    this.name = 'IntegrationError'
  }
}

export class IntegrationTimeoutError extends IntegrationError {
  constructor(integration: string) {
    super(`Timeout en integracion con ${integration}`, integration)
    this.name = 'IntegrationTimeoutError'
  }
}

export function toHttpError(error: unknown): { status: number; body: any } {
  console.error('Error:', error)
  
  if (error instanceof AppError) {
    return {
      status: error.statusCode,
      body: { error: error.message, code: error.code }
    }
  }
  
  if (error instanceof Error) {
    return {
      status: 500,
      body: { error: error.message, code: 'INTERNAL_ERROR' }
    }
  }
  
  return {
    status: 500,
    body: { error: 'Error interno del servidor', code: 'UNKNOWN_ERROR' }
  }
}

export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error)
  
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    )
  }
  
  if (error instanceof Error) {
    return NextResponse.json(
      { error: error.message, code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
  
  return NextResponse.json(
    { error: 'Error interno del servidor', code: 'UNKNOWN_ERROR' },
    { status: 500 }
  )
}

export async function withErrorHandler<T>(
  handler: () => Promise<T>
): Promise<T | NextResponse> {
  try {
    return await handler()
  } catch (error) {
    return handleApiError(error)
  }
}
