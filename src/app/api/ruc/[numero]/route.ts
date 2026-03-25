import { NextRequest, NextResponse } from 'next/server'
import { peruApiService } from '@/lib/integrations/peruapi/peruapi.service'
import { validateRucParam } from '@/lib/integrations/validators'
import { PeruApiError } from '@/lib/integrations/peruapi/peruapi.types'
import { toHttpError, ValidationError } from '@/lib/errors'

const ERROR_STATUS: Record<PeruApiError['code'], number> = {
  INVALID_FORMAT: 400,
  NOT_FOUND:      404,
  PROVIDER_ERROR: 502,
  TIMEOUT:        503,
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { numero: string } },
) {
  try {
    validateRucParam(params.numero)
    const result = await peruApiService.searchRuc(params.numero)
    return NextResponse.json(result)
  } catch (err: unknown) {
    const apiErr = err as PeruApiError
    if (apiErr?.code && ERROR_STATUS[apiErr.code]) {
      return NextResponse.json(
        { error: apiErr.message, code: apiErr.code },
        { status: ERROR_STATUS[apiErr.code] },
      )
    }
    const { status, body } = toHttpError(err instanceof ValidationError ? err : err)
    return NextResponse.json(body, { status })
  }
}
