import { NextRequest, NextResponse } from 'next/server'
import { invoiceService } from '@/lib/services/invoice.service'
import { toHttpError } from '@/lib/errors'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const invoice = await invoiceService.getById(params.id)
    return NextResponse.json(invoice)
  } catch (err) {
    const { status, body } = toHttpError(err)
    return NextResponse.json(body, { status })
  }
}
