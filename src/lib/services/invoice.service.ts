import { supabase } from '@/lib/supabase'
import { nubefactProvider } from '@/lib/integrations/nubefact/nubefact.service'
import {
  IInvoiceProvider,
  EmitInvoiceInput,
  EmitInvoiceResult,
  InvoiceType,
  DocumentType,
} from '@/lib/integrations/nubefact/nubefact.types'
import { DBSale, DBSaleItem } from '@/types/database.types'
import { NotFoundError, ConflictError, ValidationError } from '@/lib/errors'
import { createLogger } from '@/lib/logger'

const log = createLogger('InvoiceService')

// Inyección del proveedor — cambiar nubefactProvider por otro para swapear
const provider: IInvoiceProvider = nubefactProvider

export interface CreateInvoiceDTO {
  saleId: string
  orgId: string
  clientDocType?: DocumentType
  clientDocNumber?: string
  clientName?: string
  clientAddress?: string
  clientEmail?: string
  // Solo para notas
  modifiesType?: InvoiceType
  modifiesSeries?: string
  modifiesNumber?: number
  creditNoteType?: number
  debitNoteType?: number
}

export interface InvoiceRecord {
  id: string
  invoice_number: string
  status: string
  sunat_status: string
  pdf_url: string | null
  xml_url: string | null
  total: number
}

export const invoiceService = {
  async create(dto: CreateInvoiceDTO): Promise<{ invoice: InvoiceRecord; result: EmitInvoiceResult }> {
    // 1. Guardar que no exista ya un comprobante activo para esta venta
    const { data: existing } = await supabase
      .from('corivacore_invoices')
      .select('id, status')
      .eq('sale_id', dto.saleId)
      .in('status', ['EMITIDA', 'ACEPTADA'])
      .maybeSingle()

    if (existing) {
      throw new ConflictError('Esta venta ya tiene un comprobante emitido')
    }

    // 2. Obtener venta
    const { data: sale, error: saleErr } = await supabase
      .from('corivacore_sales')
      .select('*')
      .eq('id', dto.saleId)
      .single()

    if (saleErr || !sale) throw new NotFoundError('Venta')

    const dbSale = sale as DBSale
    if (dbSale.status === 'cancelled') {
      throw new ValidationError('No se puede emitir comprobante para una venta anulada')
    }

    // 3. Obtener ítems de la venta
    const { data: items, error: itemsErr } = await supabase
      .from('corivacore_sale_items')
      .select('*')
      .eq('sale_id', dto.saleId)

    if (itemsErr || !items?.length) throw new NotFoundError('Ítems de la venta')

    // 4. Obtener serie activa para el tipo de comprobante
    const receiptType = dbSale.receipt_type as InvoiceType
    const { data: seriesRow, error: seriesErr } = await supabase
      .from('corivacore_invoice_series')
      .select('*')
      .eq('org_id', dto.orgId)
      .eq('type', receiptType)
      .eq('is_active', true)
      .maybeSingle()

    if (seriesErr || !seriesRow) {
      throw new ValidationError(
        `No hay serie activa configurada para ${receiptType}. ` +
        `Ve a Configuración → Facturación y agrega una serie (ej: B001 para Boletas, F001 para Facturas).`
      )
    }

    const correlative = seriesRow.last_number + 1

    // 5. Construir input para el proveedor
    const emitInput: EmitInvoiceInput = {
      orgId:           dto.orgId,
      saleId:          dto.saleId,
      type:            receiptType,
      series:          seriesRow.series,
      correlative,
      fechaEmision:    dbSale.created_at ?? new Date().toISOString(),
      clientDocType:   dto.clientDocType ?? '',
      clientDocNumber: dto.clientDocNumber ?? '',
      clientName:      dto.clientName ?? dbSale.customer_name ?? 'CLIENTE VARIOS',
      clientAddress:   dto.clientAddress ?? '',
      clientEmail:     dto.clientEmail ?? '',
      items:           (items as DBSaleItem[]).map(i => ({
        codigo:         i.product_code ?? 'PROD',
        descripcion:    i.product_name,
        cantidad:       i.quantity,
        precioUnitario: i.unit_price,
      })),
      modifiesType:    dto.modifiesType,
      modifiesSeries:  dto.modifiesSeries,
      modifiesNumber:  dto.modifiesNumber,
      creditNoteType:  dto.creditNoteType,
      debitNoteType:   dto.debitNoteType,
    }

    // 6. Llamar al proveedor
    const result = await provider.emit(emitInput)

    // 7. Determinar estado final
    const invoiceStatus = result.success
      ? (result.accepted ? 'ACEPTADA' : 'RECHAZADA')
      : 'PENDIENTE'

    // 8. Persistir comprobante (siempre, incluso si fue rechazado — para auditoría)
    const { data: invoice, error: insertErr } = await supabase
      .from('corivacore_invoices')
      .insert({
        org_id:          dto.orgId,
        sale_id:         dto.saleId,
        invoice_number:  result.invoiceNumber,
        series:          seriesRow.series,
        correlative,
        type:            receiptType,
        client_name:     emitInput.clientName,
        client_doc_type: emitInput.clientDocType || null,
        client_doc:      emitInput.clientDocNumber || null,
        client_address:  emitInput.clientAddress || null,
        client_email:    emitInput.clientEmail || null,
        subtotal:        dbSale.subtotal,
        igv:             dbSale.tax,
        total:           dbSale.total,
        currency:        'PEN',
        status:          invoiceStatus,
        sunat_status:    result.accepted ? 'ACEPTADA' : 'PENDIENTE',
        sunat_response:  result.rawResponse,
        pdf_url:         result.pdfUrl,
        xml_url:         result.xmlUrl,
      })
      .select('id, invoice_number, status, sunat_status, pdf_url, xml_url, total')
      .single()

    if (insertErr) {
      log.error('Comprobante emitido pero no persistido', {
        invoiceNumber: result.invoiceNumber,
        error: insertErr.message,
      })
      // No lanzamos error — el comprobante ya fue enviado a SUNAT
      // Devolvemos el resultado con advertencia
    }

    // 9. Actualizar correlativo solo si la emisión fue exitosa
    if (result.success) {
      await supabase
        .from('corivacore_invoice_series')
        .update({ last_number: correlative })
        .eq('id', seriesRow.id)
    }

    return { invoice: invoice as InvoiceRecord, result }
  },

  async getById(id: string): Promise<InvoiceRecord> {
    const { data, error } = await supabase
      .from('corivacore_invoices')
      .select('id, invoice_number, status, sunat_status, pdf_url, xml_url, total')
      .eq('id', id)
      .single()

    if (error || !data) throw new NotFoundError('Comprobante')
    return data as InvoiceRecord
  },

  async getBySaleId(saleId: string): Promise<InvoiceRecord | null> {
    const { data } = await supabase
      .from('corivacore_invoices')
      .select('id, invoice_number, status, sunat_status, pdf_url, xml_url, total')
      .eq('sale_id', saleId)
      .maybeSingle()

    return data as InvoiceRecord | null
  },
}
