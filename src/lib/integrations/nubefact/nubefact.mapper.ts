import {
  EmitInvoiceInput,
  InvoiceType,
  DocumentType,
  NubefactPayload,
  NubefactItem,
  NubefactDocType,
} from './nubefact.types'

const IGV_RATE = 0.18

const NUBEFACT_DOC_TYPE: Record<InvoiceType, NubefactDocType> = {
  FACTURA:      1,
  BOLETA:       2,
  NOTA_CREDITO: 3,
  NOTA_DEBITO:  4,
}

const NUBEFACT_CLIENT_DOC: Record<DocumentType, number> = {
  DNI:       1,
  CE:        4,
  RUC:       6,
  PASAPORTE: 7,
  '':        0,
}

function toDD_MM_YYYY(iso: string): string {
  const d = new Date(iso)
  return [
    String(d.getDate()).padStart(2, '0'),
    String(d.getMonth() + 1).padStart(2, '0'),
    d.getFullYear(),
  ].join('-')
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function mapItem(item: EmitInvoiceInput['items'][number]): NubefactItem {
  // Los precios del sistema incluyen IGV — descomponemos
  const precioConIgv  = item.precioUnitario
  const valorSinIgv   = round2(precioConIgv / (1 + IGV_RATE))
  const subtotalSinIgv = round2(valorSinIgv * item.cantidad)
  const igv            = round2(subtotalSinIgv * IGV_RATE)
  const total          = round2(subtotalSinIgv + igv)

  return {
    unidad_de_medida:       item.unidad ?? 'NIU',
    codigo:                 item.codigo,
    descripcion:            item.descripcion,
    cantidad:               item.cantidad,
    valor_unitario:         valorSinIgv,
    precio_unitario:        precioConIgv,
    descuento:              0,
    subtotal:               subtotalSinIgv,
    tipo_de_igv:            1,   // gravado
    igv,
    total,
    anticipo_regularizacion: false,
  }
}

export function mapToNubefactPayload(input: EmitInvoiceInput): NubefactPayload {
  const mappedItems   = input.items.map(mapItem)
  const totalGravada  = round2(mappedItems.reduce((s, i) => s + i.subtotal, 0))
  const totalIgv      = round2(mappedItems.reduce((s, i) => s + i.igv, 0))
  const total         = round2(totalGravada + totalIgv)

  const payload: NubefactPayload = {
    operacion:                        'generar_comprobante',
    tipo_de_comprobante:              NUBEFACT_DOC_TYPE[input.type],
    serie:                            input.series,
    numero:                           input.correlative,
    sunat_transaction:                1,
    cliente_tipo_de_documento:        NUBEFACT_CLIENT_DOC[input.clientDocType],
    cliente_numero_de_documento:      input.clientDocNumber,
    cliente_denominacion:             input.clientName,
    cliente_direccion:                input.clientAddress,
    cliente_email:                    input.clientEmail,
    fecha_de_emision:                 toDD_MM_YYYY(input.fechaEmision),
    moneda:                           1,
    porcentaje_de_igv:                18,
    descuento_global:                 0,
    total_descuento:                  0,
    total_anticipo:                   0,
    total_gravada:                    totalGravada,
    total_inafecta:                   0,
    total_exonerada:                  0,
    total_igv:                        totalIgv,
    total_gratuita:                   0,
    total_otros_cargos:               0,
    total,
    enviar_automaticamente_a_la_sunat: true,
    enviar_automaticamente_al_cliente: !!input.clientEmail,
    items:                            mappedItems,
  }

  // Notas de crédito / débito requieren referencia al comprobante original
  if (input.modifiesType && input.modifiesSeries && input.modifiesNumber) {
    payload.documento_que_se_modifica_tipo   = NUBEFACT_DOC_TYPE[input.modifiesType]
    payload.documento_que_se_modifica_serie  = input.modifiesSeries
    payload.documento_que_se_modifica_numero = input.modifiesNumber
    if (input.creditNoteType) payload.tipo_de_nota_de_credito = input.creditNoteType
    if (input.debitNoteType)  payload.tipo_de_nota_de_debito  = input.debitNoteType
  }

  return payload
}
