import { supabase } from '@/lib/supabase'
import { ValidationError } from '@/lib/errors'
import type { DBProductBatch, ExpiringBatchRow, KardexRow } from '@/types/pharma.types'

export interface CreateBatchDTO {
  orgId: string
  productId: string
  batchNumber: string
  expiryDate: string
  quantity: number
  costPrice?: number
  supplierId?: string
  createdBy?: string
}

export interface AddKardexDTO {
  orgId: string
  productId: string
  batchId?: string
  movementType: 'ENTRADA' | 'SALIDA' | 'AJUSTE' | 'VENCIMIENTO' | 'DEVOLUCION'
  quantity: number
  balanceAfter: number
  referenceType?: string
  referenceId?: string
  notes?: string
  createdBy?: string
}

export const pharmaService = {

  // ── Lotes ──────────────────────────────────────────────────────────────────

  async getBatches(orgId: string, productId: string): Promise<DBProductBatch[]> {
    const { data, error } = await supabase
      .from('corivacore_product_batches')
      .select('*')
      .eq('org_id', orgId)
      .eq('product_id', productId)
      .order('expiry_date', { ascending: true })

    if (error) throw new Error(error.message)
    return (data ?? []) as DBProductBatch[]
  },

  async createBatch(dto: CreateBatchDTO): Promise<DBProductBatch> {
    if (!dto.batchNumber.trim()) throw new ValidationError('Número de lote requerido')
    if (!dto.expiryDate)         throw new ValidationError('Fecha de vencimiento requerida')
    if (dto.quantity < 0)        throw new ValidationError('Cantidad no puede ser negativa')

    const { data, error } = await supabase
      .from('corivacore_product_batches')
      .insert({
        org_id:       dto.orgId,
        product_id:   dto.productId,
        batch_number: dto.batchNumber,
        expiry_date:  dto.expiryDate,
        quantity:     dto.quantity,
        cost_price:   dto.costPrice ?? null,
        supplier_id:  dto.supplierId ?? null,
        created_by:   dto.createdBy ?? null,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as DBProductBatch
  },

  async updateBatchQuantity(batchId: string, quantity: number): Promise<void> {
    const { error } = await supabase
      .from('corivacore_product_batches')
      .update({ quantity })
      .eq('id', batchId)
    if (error) throw new Error(error.message)
  },

  // ── Alertas de vencimiento — query directa sin RPC ─────────────────────────

  async getExpiringBatches(orgId: string, days = 365): Promise<ExpiringBatchRow[]> {
    const today  = new Date()
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() + days)

    // 1. Traer lotes de la org
    const { data: batches, error: bErr } = await supabase
      .from('corivacore_product_batches')
      .select('id, product_id, batch_number, expiry_date, quantity')
      .eq('org_id', orgId)
      .gt('quantity', 0)
      .lte('expiry_date', cutoff.toISOString().split('T')[0])
      .order('expiry_date', { ascending: true })

    if (bErr || !batches?.length) return []

    // 2. Traer nombres de productos
    const productIds = batches.map(b => b.product_id).filter((v, i, a) => a.indexOf(v) === i)
    const { data: products } = await supabase
      .from('corivacore_products')
      .select('id, name')
      .in('id', productIds)

    const nameMap: Record<string, string> = {}
    for (const p of products ?? []) nameMap[p.id] = p.name

    // 3. Combinar
    return batches.map(b => ({
      batch_id:     b.id,
      product_id:   b.product_id,
      product_name: nameMap[b.product_id] ?? 'Producto',
      batch_number: b.batch_number,
      expiry_date:  b.expiry_date,
      quantity:     b.quantity,
      days_left:    Math.floor(
        (new Date(b.expiry_date).getTime() - today.setHours(0,0,0,0)) / 86400000
      ),
    })) as ExpiringBatchRow[]
  },

  classifyExpiry(daysLeft: number): 'expired' | 'critical' | 'warning' | 'ok' {
    if (daysLeft <= 0)  return 'expired'
    if (daysLeft <= 7)  return 'critical'
    if (daysLeft <= 30) return 'warning'
    return 'ok'
  },

  // ── Kardex — query directa sin RPC ─────────────────────────────────────────

  async getKardex(orgId: string, productId: string, limit = 50): Promise<KardexRow[]> {
    const { data, error } = await supabase
      .from('corivacore_inventory_kardex')
      .select('id, movement_type, quantity, balance_after, reference_type, notes, created_at, batch_id')
      .eq('org_id', orgId)
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw new Error(error.message)
    if (!data?.length) return []

    // Traer batch_numbers si hay batch_ids
    const batchIds = data.filter(k => k.batch_id).map(k => k.batch_id)
    const batchMap: Record<string, string> = {}

    if (batchIds.length > 0) {
      const { data: batchData } = await supabase
        .from('corivacore_product_batches')
        .select('id, batch_number')
        .in('id', batchIds)
      for (const b of batchData ?? []) batchMap[b.id] = b.batch_number
    }

    return data.map(k => ({
      id:             k.id,
      movement_type:  k.movement_type,
      quantity:       k.quantity,
      balance_after:  k.balance_after,
      reference_type: k.reference_type ?? null,
      notes:          k.notes ?? null,
      batch_number:   k.batch_id ? (batchMap[k.batch_id] ?? null) : null,
      created_at:     k.created_at,
    })) as KardexRow[]
  },

  async addKardexEntry(dto: AddKardexDTO): Promise<void> {
    const { error } = await supabase
      .from('corivacore_inventory_kardex')
      .insert({
        org_id:         dto.orgId,
        product_id:     dto.productId,
        batch_id:       dto.batchId ?? null,
        movement_type:  dto.movementType,
        quantity:       dto.quantity,
        balance_after:  dto.balanceAfter,
        reference_type: dto.referenceType ?? null,
        reference_id:   dto.referenceId ?? null,
        notes:          dto.notes ?? null,
        created_by:     dto.createdBy ?? null,
      })
    if (error) throw new Error(error.message)
  },

  // ── Productos con receta ───────────────────────────────────────────────────

  async getPrescriptionProducts(orgId: string): Promise<{ id: string; name: string; code: string }[]> {
    const { data, error } = await supabase
      .from('corivacore_products')
      .select('id, name, code')
      .eq('org_id', orgId)
      .eq('requires_prescription', true)
      .eq('is_active', true)
      .order('name')
    if (error) throw new Error(error.message)
    return (data ?? []) as { id: string; name: string; code: string }[]
  },

  async togglePrescription(productId: string, requires: boolean): Promise<void> {
    const { error } = await supabase
      .from('corivacore_products')
      .update({ requires_prescription: requires })
      .eq('id', productId)
    if (error) throw new Error(error.message)
  },
}
