import {
  IInvoiceProvider,
  EmitInvoiceInput,
  EmitInvoiceResult,
  NubefactPayload,
  NubefactSuccessResponse,
} from './nubefact.types'
import { mapToNubefactPayload } from './nubefact.mapper'
import { IntegrationError, IntegrationTimeoutError } from '@/lib/errors'
import { createLogger } from '@/lib/logger'

const log = createLogger('Nubefact')
const TIMEOUT_MS = 15_000

function getConfig(): { url: string; token: string } {
  const url   = process.env.NUBEFACT_API_URL
  const token = process.env.NUBEFACT_TOKEN
  if (!url) {
    throw new IntegrationError('Nubefact', 'NUBEFACT_API_URL no configurada en variables de entorno')
  }
  if (!token) {
    throw new IntegrationError('Nubefact', 'NUBEFACT_TOKEN no configurado. Agrega tu token de Nubefact en las variables de entorno de Vercel.')
  }
  return { url, token }
}

async function postToNubefact(
  payload: NubefactPayload,
  url: string,
  token: string,
): Promise<NubefactSuccessResponse> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  let res: Response
  try {
    res = await fetch(url, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization:  `Token token="${token}"`,
      },
      body:   JSON.stringify(payload),
      signal: controller.signal,
    })
  } catch (err: unknown) {
    clearTimeout(timer)
    if ((err as { name?: string }).name === 'AbortError') {
      throw new IntegrationTimeoutError('Nubefact')
    }
    throw new IntegrationError('Nubefact', `Error de red: ${(err as Error).message}`)
  } finally {
    clearTimeout(timer)
  }

  const body = await res.json()

  if (!res.ok) {
    let msg = `HTTP ${res.status}`
    const raw = (body as any)?.errors
    if (Array.isArray(raw)) {
      msg = raw.join(' | ')
    } else if (raw && typeof raw === 'object') {
      msg = Object.values(raw).flat().join(' | ')
    } else if (typeof raw === 'string') {
      msg = raw
    } else if ((body as any)?.message) {
      msg = (body as any).message
    }
    log.error('Respuesta de error Nubefact', { status: res.status, body })
    throw new IntegrationError('Nubefact', msg)
  }

  return body as NubefactSuccessResponse
}

// ─── Implementación del contrato IInvoiceProvider ────────────────────────────

export const nubefactProvider: IInvoiceProvider = {
  async emit(input: EmitInvoiceInput): Promise<EmitInvoiceResult> {
    const { url, token } = getConfig()
    const invoiceNumber = `${input.series}-${String(input.correlative).padStart(8, '0')}`

    log.info('Emitiendo comprobante', {
      orgId:         input.orgId,
      saleId:        input.saleId,
      type:          input.type,
      invoiceNumber,
    })

    const payload = mapToNubefactPayload(input)

    let raw: NubefactSuccessResponse
    try {
      raw = await postToNubefact(payload, url, token)
    } catch (err) {
      if (err instanceof IntegrationError || err instanceof IntegrationTimeoutError) {
        log.error('Fallo al emitir', { invoiceNumber, error: err.message })
        return {
          success:          false,
          accepted:         false,
          invoiceNumber,
          pdfUrl:           null,
          xmlUrl:           null,
          cdrUrl:           null,
          hash:             null,
          sunatCode:        null,
          sunatDescription: null,
          rawResponse:      {},
          error:            err.message,
        }
      }
      throw err
    }

    const accepted = raw.aceptada_por_sunat
    log.info('Comprobante procesado', {
      invoiceNumber,
      accepted,
      sunatCode:        raw.sunat_responsecode,
      sunatDescription: raw.sunat_description,
      sunatNote:        raw.sunat_note,
    })

    return {
      success:          true,
      accepted,
      invoiceNumber,
      pdfUrl:           raw.enlace_del_pdf    || null,
      xmlUrl:           raw.enlace_del_xml    || null,
      cdrUrl:           raw.enlace_del_cdr    || null,
      hash:             raw.codigo_hash       || null,
      sunatCode:        raw.sunat_responsecode || null,
      sunatDescription: raw.sunat_description  || null,
      rawResponse:      raw as unknown as Record<string, unknown>,
    }
  },
}
