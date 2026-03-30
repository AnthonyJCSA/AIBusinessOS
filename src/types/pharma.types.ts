// ─── Pharma types ─────────────────────────────────────────────────────────────

export interface DBProductBatch {
  id: string
  org_id: string
  product_id: string
  batch_number: string
  expiry_date: string        // ISO date
  quantity: number
  cost_price?: number
  received_at?: string
  supplier_id?: string
  created_by?: string
  created_at?: string
}

export interface DBInventoryKardex {
  id: string
  org_id: string
  product_id: string
  batch_id?: string
  movement_type: 'ENTRADA' | 'SALIDA' | 'AJUSTE' | 'VENCIMIENTO' | 'DEVOLUCION'
  quantity: number
  balance_after: number
  reference_type?: string
  reference_id?: string
  notes?: string
  created_by?: string
  created_at?: string
}

// RPC return types
export interface ExpiringBatchRow {
  batch_id: string
  product_id: string
  product_name: string
  batch_number: string
  expiry_date: string
  quantity: number
  days_left: number
}

export interface KardexRow {
  id: string
  movement_type: string
  quantity: number
  balance_after: number
  reference_type: string | null
  notes: string | null
  batch_number: string | null
  created_at: string
}
