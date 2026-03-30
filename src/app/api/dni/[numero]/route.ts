import { NextRequest, NextResponse } from 'next/server'
import { peruApiService }   from '@/lib/integrations/peruapi/peruapi.service'
import { documentCache }    from '@/lib/integrations/peruapi/document.cache'
import { validateDniParam } from '@/lib/integrations/validators'
import { PeruApiError }     from '@/lib/integrations/peruapi/peruapi.types'
import { toHttpError }      from '@/lib/errors'

const ERROR_STATUS: Record<PeruApiError['code'], number> = {
  INVALID_FORMAT: 400,
  NOT_FOUND:      404,
  PROVIDER_ERROR: 502,
  TIMEOUT:        503,
}

export async function GET(
  req: NextRequest,
  { params }: { params: { numero: string } },
) {
  try {
    validateDniParam(params.numero)

    // 1. Intentar caché
    const cached = await documentCache.get('DNI', params.numero)
    if (cached) {
      await documentCache.logQuery('DNI', params.numero, true)
      return NextResponse.json(cached, {
        headers: { 'X-Cache': 'HIT' },
      })
    }

    // 2. Consultar PeruAPI
    const result = await peruApiService.searchDni(params.numero)

    // 3. Guardar en caché y auditar (no bloquean la respuesta)
    await Promise.allSettled([
      documentCache.set('DNI', params.numero, result),
      documentCache.logQuery('DNI', params.numero, false),
    ])

    return NextResponse.json(result, {
      headers: { 'X-Cache': 'MISS' },
    })
  } catch (err: unknown) {
    const apiErr = err as PeruApiError
    if (apiErr?.code && ERROR_STATUS[apiErr.code]) {
      return NextResponse.json(
        { error: apiErr.message, code: apiErr.code },
        { status: ERROR_STATUS[apiErr.code] },
      )
    }
    const { status, body } = toHttpError(err)
    return NextResponse.json(body, { status })
  }
}
