import { NextRequest, NextResponse } from 'next/server'
import { invoiceService } from '@/lib/services/invoice.service'
import { toHttpError } from '@/lib/errors'

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await invoiceService.resend(params.id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    const { status, body } = toHttpError(err)
    return NextResponse.json(body, { status })
  }
}
