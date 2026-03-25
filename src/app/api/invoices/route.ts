import { NextRequest, NextResponse } from 'next/server'
import { invoiceService } from '@/lib/services/invoice.service'
import { validateCreateInvoice } from '@/lib/integrations/validators'
import { toHttpError } from '@/lib/errors'
import { createLogger } from '@/lib/logger'

const log = createLogger('API:invoices')

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const dto  = validateCreateInvoice(body)

    log.info('POST /api/invoices', { saleId: dto.saleId, orgId: dto.orgId })

    const { invoice, result } = await invoiceService.create(dto)

    return NextResponse.json({ invoice, nubefact: result }, { status: 201 })
  } catch (err) {
    const { status, body } = toHttpError(err)
    if (status >= 500) log.error('Error en POST /api/invoices', { error: (err as Error).message })
    return NextResponse.json(body, { status })
  }
}
