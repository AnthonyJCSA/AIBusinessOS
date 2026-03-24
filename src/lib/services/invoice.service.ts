import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { DBInvoice, DBInvoiceCredit } from '@/types/database.types'

const INV_TABLE    = 'corivacore_invoices'
const CREDIT_TABLE = 'corivacore_invoice_credits'

export const invoiceService = {
  async create(orgId: string, invoice: {
    saleId?: string
    type: DBInvoice['type']
    series: string
    clientName: string
    clientDocType?: string
    clientDoc?: string
    clientAddress?: string
    clientEmail?: string
    subtotal: number
    igv: number
    total: number
    creditDays?: number
    creditParts?: number
    createdBy?: string
  }): Promise<DBInvoice> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured')

    // Generar número correlativo atómico
    const { data: numData, error: numError } = await supabase
      .rpc('generate_invoice_number', { p_org_id: orgId, p_series: invoice.series })
    if (numError) throw numError

    const row = numData?.[0]
    const { data, error } = await supabase
      .from(INV_TABLE)
      .insert({
        org_id:         orgId,
        sale_id:        invoice.saleId || null,
        invoice_number: row.invoice_number,
        series:         invoice.series,
        correlative:    row.correlative,
        type:           invoice.type,
        client_name:    invoice.clientName,
        client_doc_type: invoice.clientDocType,
        client_doc:     invoice.clientDoc,
        client_address: invoice.clientAddress,
        client_email:   invoice.clientEmail,
        subtotal:       invoice.subtotal,
        igv:            invoice.igv,
        total:          invoice.total,
        credit_days:    invoice.creditDays || 0,
        due_date:       invoice.creditDays
          ? new Date(Date.now() + invoice.creditDays * 86400000).toISOString().split('T')[0]
          : null,
        status:         'EMITIDA',
        sunat_status:   'PENDIENTE',
        created_by:     invoice.createdBy,
      })
      .select().single()
    if (error) throw error

    // Crear cuotas si aplica
    if (invoice.creditParts && invoice.creditParts > 1) {
      const partAmount = Math.round((invoice.total / invoice.creditParts) * 100) / 100
      const credits = Array.from({ length: invoice.creditParts }, (_, i) => ({
        invoice_id: data.id,
        org_id:     orgId,
        part:       i + 1,
        amount:     i === invoice.creditParts! - 1
          ? invoice.total - partAmount * (invoice.creditParts! - 1) // última cuota ajusta diferencia
          : partAmount,
        due_date: new Date(Date.now() + (i + 1) * 30 * 86400000).toISOString().split('T')[0],
        paid: false,
      }))
      const { error: creditError } = await supabase.from(CREDIT_TABLE).insert(credits)
      if (creditError) throw creditError
    }

    return data as DBInvoice
  },

  async getAll(orgId: string): Promise<DBInvoice[]> {
    if (!isSupabaseConfigured()) return []
    const { data, error } = await supabase
      .from(INV_TABLE).select('*').eq('org_id', orgId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as DBInvoice[]
  },

  async getCredits(invoiceId: string): Promise<DBInvoiceCredit[]> {
    if (!isSupabaseConfigured()) return []
    const { data, error } = await supabase
      .from(CREDIT_TABLE).select('*').eq('invoice_id', invoiceId).order('part')
    if (error) throw error
    return data as DBInvoiceCredit[]
  },

  async getPendingCredits(orgId: string): Promise<(DBInvoiceCredit & { invoice_number: string; client_name: string })[]> {
    if (!isSupabaseConfigured()) return []
    const { data, error } = await supabase
      .from(CREDIT_TABLE)
      .select('*, invoice:corivacore_invoices(invoice_number, client_name)')
      .eq('org_id', orgId).eq('paid', false)
      .order('due_date')
    if (error) throw error
    return (data || []).map((c: any) => ({
      ...c,
      invoice_number: c.invoice?.invoice_number,
      client_name:    c.invoice?.client_name,
    }))
  },

  async markCreditPaid(creditId: string, paidBy: string): Promise<void> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured')
    const { error } = await supabase
      .from(CREDIT_TABLE)
      .update({ paid: true, paid_at: new Date().toISOString(), paid_by: paidBy })
      .eq('id', creditId)
    if (error) throw error
  },

  async cancel(invoiceId: string): Promise<void> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured')
    const { error } = await supabase
      .from(INV_TABLE).update({ status: 'ANULADA' }).eq('id', invoiceId)
    if (error) throw error
  },

  async getBySaleId(saleId: string): Promise<DBInvoice | null> {
    if (!isSupabaseConfigured()) return null
    const { data, error } = await supabase
      .from(INV_TABLE).select('*').eq('sale_id', saleId).single()
    if (error) return null
    return data as DBInvoice
  },
}
