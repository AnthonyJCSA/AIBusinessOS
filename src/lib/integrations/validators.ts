import { ValidationError } from '@/lib/errors'
import { CreateInvoiceDTO } from '@/lib/services/invoice.service'
import { InvoiceType, DocumentType } from '@/lib/integrations/nubefact/nubefact.types'

const VALID_INVOICE_TYPES: InvoiceType[] = ['FACTURA', 'BOLETA', 'NOTA_CREDITO', 'NOTA_DEBITO']
const VALID_DOC_TYPES: DocumentType[]    = ['DNI', 'RUC', 'CE', 'PASAPORTE', '']

// ─── Invoice ──────────────────────────────────────────────────────────────────

export function validateCreateInvoice(body: unknown): CreateInvoiceDTO {
  if (!body || typeof body !== 'object') {
    throw new ValidationError('El cuerpo de la solicitud es inválido')
  }

  const b = body as Record<string, unknown>

  if (!b.saleId || typeof b.saleId !== 'string') {
    throw new ValidationError('saleId es requerido y debe ser un string')
  }
  if (!b.orgId || typeof b.orgId !== 'string') {
    throw new ValidationError('orgId es requerido y debe ser un string')
  }
  if (b.clientDocType && !VALID_DOC_TYPES.includes(b.clientDocType as DocumentType)) {
    throw new ValidationError(`clientDocType inválido. Valores permitidos: ${VALID_DOC_TYPES.join(', ')}`)
  }
  if (b.clientDocType === 'RUC' && b.clientDocNumber && !/^\d{11}$/.test(String(b.clientDocNumber))) {
    throw new ValidationError('clientDocNumber para RUC debe tener 11 dígitos')
  }
  if (b.clientDocType === 'DNI' && b.clientDocNumber && !/^\d{8}$/.test(String(b.clientDocNumber))) {
    throw new ValidationError('clientDocNumber para DNI debe tener 8 dígitos')
  }
  if (b.modifiesType && !VALID_INVOICE_TYPES.includes(b.modifiesType as InvoiceType)) {
    throw new ValidationError(`modifiesType inválido. Valores permitidos: ${VALID_INVOICE_TYPES.join(', ')}`)
  }
  if (b.invoiceType && !VALID_INVOICE_TYPES.includes(b.invoiceType as InvoiceType)) {
    throw new ValidationError(`invoiceType inválido. Valores permitidos: ${VALID_INVOICE_TYPES.join(', ')}`)
  }

  return {
    saleId:          b.saleId as string,
    orgId:           b.orgId as string,
    invoiceType:     b.invoiceType as InvoiceType | undefined,
    clientDocType:   (b.clientDocType as DocumentType) ?? '',
    clientDocNumber: b.clientDocNumber ? String(b.clientDocNumber) : '',
    clientName:      b.clientName ? String(b.clientName) : undefined,
    clientAddress:   b.clientAddress ? String(b.clientAddress) : undefined,
    clientEmail:     b.clientEmail ? String(b.clientEmail) : undefined,
    modifiesType:    b.modifiesType as InvoiceType | undefined,
    modifiesSeries:  b.modifiesSeries ? String(b.modifiesSeries) : undefined,
    modifiesNumber:  b.modifiesNumber ? Number(b.modifiesNumber) : undefined,
    creditNoteType:  b.creditNoteType ? Number(b.creditNoteType) : undefined,
    debitNoteType:   b.debitNoteType  ? Number(b.debitNoteType)  : undefined,
  }
}

// ─── DNI ──────────────────────────────────────────────────────────────────────

export function validateDniParam(numero: string): void {
  if (!/^\d{8}$/.test(numero)) {
    throw new ValidationError('El DNI debe tener exactamente 8 dígitos numéricos')
  }
}

// ─── RUC ──────────────────────────────────────────────────────────────────────

export function validateRucParam(numero: string): void {
  if (!/^\d{11}$/.test(numero)) {
    throw new ValidationError('El RUC debe tener exactamente 11 dígitos numéricos')
  }
  if (!numero.startsWith('10') && !numero.startsWith('20')) {
    throw new ValidationError('RUC inválido: debe comenzar con 10 (persona natural) o 20 (empresa)')
  }
}
