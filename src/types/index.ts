// 🚀 Coriva Core - TypeScript Types

export interface Organization {
  id: string
  name: string
  slug: string
  business_type: 'pharmacy' | 'hardware' | 'clothing' | 'barbershop' | 'restaurant' | 'retail' | 'other'
  ruc?: string
  address?: string
  phone?: string
  email?: string
  logo_url?: string | null
  settings: OrganizationSettings
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface OrganizationSettings {
  currency?: string
  tax_rate?: number
  receipt_footer?: string
  theme_color?: string
  enable_inventory?: boolean
  enable_customers?: boolean
  plan?: 'starter' | 'pro' | 'premium'
  language?: 'es' | 'en'
  timezone?: string
  tax_name?: string
  tax_included?: boolean
  [key: string]: any
}

export interface User {
  id: string
  organization_id: string
  username: string
  email: string
  full_name: string
  role: 'OWNER' | 'ADMIN' | 'MANAGER' | 'VENDEDOR' | 'VIEWER'
  is_active: boolean
  last_login?: string
  created_at: string
}

export interface Product {
  id: string
  organization_id?: string
  code: string
  name: string
  description?: string
  category?: string
  price: number
  cost?: number
  stock: number
  min_stock: number
  unit?: string
  metadata?: ProductMetadata
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface ProductMetadata {
  // Pharmacy specific
  active_ingredient?: string
  brand?: string
  is_generic?: boolean
  laboratory?: string
  expiry_date?: string
  
  // Hardware specific
  material?: string
  dimensions?: string
  weight?: string
  
  // Clothing specific
  size?: string
  color?: string
  season?: string
  
  // Generic
  [key: string]: any
}

export interface Customer {
  id: string
  organization_id: string
  document_type: string
  document_number?: string
  full_name: string
  phone?: string
  email?: string
  address?: string
  is_active: boolean
  created_at: string
}

export interface Sale {
  id: string
  organization_id: string
  sale_number: string
  customer_id?: string
  customer_name?: string
  user_id: string
  receipt_type: 'BOLETA' | 'FACTURA' | 'TICKET'
  subtotal: number
  tax: number
  discount: number
  total: number
  payment_method: 'EFECTIVO' | 'TARJETA' | 'YAPE' | 'PLIN' | 'TRANSFERENCIA'
  status: 'COMPLETED' | 'CANCELLED' | 'PENDING'
  created_at: string
  items?: SaleItem[]
}

export interface SaleItem {
  id: string
  sale_id: string
  product_id: string
  quantity: number
  unit_price: number
  subtotal: number
  created_at: string
}

export interface InventoryMovement {
  id: string
  organization_id: string
  product_id: string
  movement_type: 'IN' | 'OUT' | 'ADJUSTMENT'
  quantity: number
  reference_type?: string
  reference_id?: string
  user_id: string
  notes?: string
  created_at: string
}

export interface CartItem extends Product {
  quantity: number
  itemDiscount?: number // descuento por ítem en porcentaje (0-100)
}
