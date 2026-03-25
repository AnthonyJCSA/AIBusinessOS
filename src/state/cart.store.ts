import { create } from 'zustand'
import type { Product } from '@/types'

export interface CartItem extends Product {
  quantity: number
  itemDiscount: number // porcentaje 0-100
}

interface CartState {
  items: CartItem[]
  globalDiscount: number // porcentaje 0-100
  paymentMethod: 'EFECTIVO' | 'TARJETA' | 'YAPE' | 'PLIN' | 'TRANSFERENCIA'
  amountPaid: number
  receiptType: 'BOLETA' | 'FACTURA' | 'TICKET'
  customerName: string

  // Computed
  subtotal: () => number
  totalDiscount: () => number
  tax: () => number
  total: () => number
  change: () => number

  // Actions
  addItem: (product: Product) => void
  removeItem: (id: string) => void
  updateQty: (id: string, qty: number) => void
  setItemDiscount: (id: string, pct: number) => void
  setGlobalDiscount: (pct: number) => void
  setPaymentMethod: (m: CartState['paymentMethod']) => void
  setAmountPaid: (n: number) => void
  setReceiptType: (t: CartState['receiptType']) => void
  setCustomerName: (name: string) => void
  clear: () => void
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  globalDiscount: 0,
  paymentMethod: 'EFECTIVO',
  amountPaid: 0,
  receiptType: 'BOLETA',
  customerName: '',

  subtotal: () => get().items.reduce((s, i) => {
    const lineTotal = i.price * i.quantity
    const lineDiscount = lineTotal * (i.itemDiscount / 100)
    return s + lineTotal - lineDiscount
  }, 0),

  totalDiscount: () => {
    const s = get().subtotal()
    return s * (get().globalDiscount / 100)
  },

  tax: () => {
    const afterDiscount = get().subtotal() - get().totalDiscount()
    return afterDiscount * 0.18 / 1.18
  },

  total: () => get().subtotal() - get().totalDiscount(),

  change: () => Math.max(0, get().amountPaid - get().total()),

  addItem: (product) => set((s) => {
    const existing = s.items.find(i => i.id === product.id)
    if (existing) {
      if (existing.quantity >= product.stock) return s
      return { items: s.items.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i) }
    }
    return { items: [...s.items, { ...product, quantity: 1, itemDiscount: 0 }] }
  }),

  removeItem: (id) => set((s) => ({ items: s.items.filter(i => i.id !== id) })),

  updateQty: (id, qty) => set((s) => {
    if (qty <= 0) return { items: s.items.filter(i => i.id !== id) }
    return { items: s.items.map(i => i.id === id ? { ...i, quantity: qty } : i) }
  }),

  setItemDiscount: (id, pct) => set((s) => ({
    items: s.items.map(i => i.id === id ? { ...i, itemDiscount: Math.min(100, Math.max(0, pct)) } : i),
  })),

  setGlobalDiscount: (pct) => set({ globalDiscount: Math.min(100, Math.max(0, pct)) }),
  setPaymentMethod: (m) => set({ paymentMethod: m }),
  setAmountPaid: (n) => set({ amountPaid: n }),
  setReceiptType: (t) => set({ receiptType: t }),
  setCustomerName: (name) => set({ customerName: name }),
  clear: () => set({ items: [], globalDiscount: 0, amountPaid: 0, customerName: '' }),
}))
