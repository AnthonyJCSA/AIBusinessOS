// Database types for Supabase tables

export interface DBProduct {
  id: string
  org_id: string
  code: string
  name: string
  category?: string
  price: number
  cost?: number
  stock: number
  min_stock?: number
  unit?: string
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface DBCustomer {
  id: string
  org_id: string
  name: string
  document_type?: string
  document_number?: string
  phone?: string
  email?: string
  address?: string
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface DBSale {
  id: string
  org_id: string
  sale_number: string
  customer_id?: string
  customer_name?: string
  receipt_type: string
  payment_method: string
  subtotal: number
  tax: number
  total: number
  amount_paid?: number
  change_amount?: number
  status?: string
  notes?: string
  created_at?: string
  created_by?: string
}

export interface DBSaleItem {
  id: string
  sale_id: string
  product_id?: string
  product_code?: string
  product_name: string
  quantity: number
  unit_price: number
  subtotal: number
  created_at?: string
}

export interface DBCashMovement {
  id: string
  org_id: string
  type: string
  amount: number
  balance?: number
  description?: string
  reference_id?: string
  created_at?: string
  created_by?: string
}
