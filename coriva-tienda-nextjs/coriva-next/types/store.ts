// ============================================================
// CORIVA CORE — TypeScript Types
// ============================================================

export type BadgeType = 'new' | 'hot' | 'promo' | null;

export interface Store {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  whatsapp: string;
  currency: string;
  logo_emoji: string;
  banner_title: string;
  banner_subtitle: string;
  banner_desc: string;
  delivery_info: string;
  payment_methods: string;
  hours: string;
  active: boolean;
}

export interface StoreCategory {
  id: string;
  store_id: string;
  name: string;
  emoji: string;
  sort_order: number;
}

export interface Product {
  id: string;
  store_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  price_old: number | null;
  emoji: string;
  badge: BadgeType;
  active: boolean;
  sort_order: number;
  // Join from store_categories
  category?: StoreCategory;
}

// Cart types
export interface CartItem extends Product {
  qty: number;
}

export type Cart = Record<string, CartItem>;

export interface CartSummary {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

// Filter / sort state
export type SortOption = '' | 'pa' | 'pd' | 'az';

export interface FilterState {
  search: string;
  category: string; // category name or 'Todos'
  sort: SortOption;
}

// WhatsApp message builder
export interface WAMessageParams {
  storeName: string;
  currency: string;
  waNumber: string;
  product?: Product;
  qty?: number;
  cart?: CartItem[];
}
