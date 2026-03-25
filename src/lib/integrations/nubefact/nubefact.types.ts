// ─── Tipos internos del sistema (agnósticos al proveedor) ────────────────────

export type InvoiceType = 'FACTURA' | 'BOLETA' | 'NOTA_CREDITO' | 'NOTA_DEBITO'
export type DocumentType = 'DNI' | 'RUC' | 'CE' | 'PASAPORTE' | ''
export type InvoiceStatus = 'PENDIENTE' | 'EMITIDA' | 'ACEPTADA' | 'RECHAZADA' | 'ANULADA'
export type SunatStatus  = 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA'

export interface InvoiceItemInput {
  codigo: string
  descripcion: string
  cantidad: number
  precioUnitario: number   // precio con IGV
  unidad?: string          // default 'NIU'
}

export interface EmitInvoiceInput {
  orgId: string
  saleId: string
  type: InvoiceType
  series: string
  correlative: number
  fechaEmision: string     // ISO string
  clientDocType: DocumentType
  clientDocNumber: string
  clientName: string
  clientAddress: string
  clientEmail: string
  items: InvoiceItemInput[]
  // Solo para notas de crédito/débito
  modifiesType?: InvoiceType
  modifiesSeries?: string
  modifiesNumber?: number
  creditNoteType?: number  // ver tabla Nubefact: 1=anulación, 2=descuento, etc.
  debitNoteType?: number
}

export interface EmitInvoiceResult {
  success: boolean
  accepted: boolean
  invoiceNumber: string    // ej: B001-00000001
  pdfUrl: string | null
  xmlUrl: string | null
  cdrUrl: string | null
  hash: string | null
  sunatCode: string | null
  sunatDescription: string | null
  rawResponse: Record<string, unknown>
  error?: string
}

// ─── Contrato del proveedor — implementar para swapear Nubefact ───────────────

export interface IInvoiceProvider {
  emit(input: EmitInvoiceInput): Promise<EmitInvoiceResult>
}

// ─── Tipos específicos de Nubefact (no exponer fuera del adaptador) ───────────

/** tipo_de_comprobante: 1=FACTURA, 2=BOLETA, 3=NOTA_CREDITO, 4=NOTA_DEBITO */
export type NubefactDocType = 1 | 2 | 3 | 4

export interface NubefactItem {
  unidad_de_medida: string
  codigo: string
  descripcion: string
  cantidad: number
  valor_unitario: number      // sin IGV
  precio_unitario: number     // con IGV
  descuento: number
  subtotal: number            // sin IGV
  tipo_de_igv: number         // 1=gravado, 2=exonerado, 3=inafecto
  igv: number
  total: number               // con IGV
  anticipo_regularizacion: boolean
}

export interface NubefactPayload {
  operacion: 'generar_comprobante'
  tipo_de_comprobante: NubefactDocType
  serie: string
  numero: number
  sunat_transaction: number
  cliente_tipo_de_documento: number  // 0=sin doc, 1=DNI, 4=CE, 6=RUC, 7=PASAPORTE
  cliente_numero_de_documento: string
  cliente_denominacion: string
  cliente_direccion: string
  cliente_email: string
  fecha_de_emision: string           // DD-MM-YYYY
  moneda: number                     // 1=PEN, 2=USD
  porcentaje_de_igv: number          // 18
  descuento_global: number
  total_descuento: number
  total_anticipo: number
  total_gravada: number
  total_inafecta: number
  total_exonerada: number
  total_igv: number
  total_gratuita: number
  total_otros_cargos: number
  total: number
  enviar_automaticamente_a_la_sunat: boolean
  enviar_automaticamente_al_cliente: boolean
  observaciones?: string
  documento_que_se_modifica_tipo?: number
  documento_que_se_modifica_serie?: string
  documento_que_se_modifica_numero?: number
  tipo_de_nota_de_credito?: number
  tipo_de_nota_de_debito?: number
  items: NubefactItem[]
}

export interface NubefactSuccessResponse {
  aceptada_por_sunat: boolean
  enlace_del_pdf: string
  enlace_del_xml: string
  enlace_del_cdr: string
  codigo_hash: string
  sunat_description: string
  sunat_note: string
  sunat_responsecode: string
  cadena_para_codigo_qr: string
}

export interface NubefactErrorResponse {
  errors: string[]
}
