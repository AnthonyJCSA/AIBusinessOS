import { create } from 'zustand'
import type { Product, CartItem } from '@/types'

interface CartState {
  items: CartItem[]
  customerName: string
  paymentMethod: 'EFECTIVO' | 'TARJETA' | 'YAPE' | 'PLIN' | 'TRANSFERENCIA'
  receiptType: 'BOLETA' | 'FACTURA' | 'TICKET'
  amountPaid: string
  discount: number // descuento global en porcentaje (0-100)

  // Acciones
  addItem: (product: Product) => void
  updateQty: (id: string, delta: number) => void
  removeItem: (id: string) => void
  setItemDiscount: (id: string, discount: number) => void
  setCustomerName: (name: string) => void
  setPaymentMethod: (method: CartState['paymentMethod']) => void
  setReceiptType: (type: CartState['receiptType']) => void
  setAmountPaid: (amount: string) => void
  setDiscount: (discount: number) => void
  clear: () => void

  // Computed
  subtotal: () => number
  totalDiscount: () => number
  tax: () => number
  total: () => number
  change: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  customerName: '',
  paymentMethod: 'EFECTIVO',
  receiptType: 'BOLETA',
  amountPaid: '',
  discount: 0,

  addItem: (product) =>
    set((s) => {
      const existing = s.items.find((i) => i.id === product.id)
      if (existing) {
        if (existing.quantity >= product.stock) return s
        return {
          items: s.items.map((i) =>
            i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        }
      }
      return { items: [...s.items, { ...product, quantity: 1, itemDiscount: 0 }] }
    }),

  updateQty: (id, delta) =>
    set((s) => ({
      items: s.items.flatMap((i) => {
        if (i.id !== id) return [i]
        const qty = i.quantity + delta
        return qty <= 0 ? [] : [{ ...i, quantity: qty }]
      }),
    })),

  removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),

  setItemDiscount: (id, discount) =>
    set((s) => ({
      items: s.items.map((i) =>
        i.id === id ? { ...i, itemDiscount: Math.min(100, Math.max(0, discount)) } : i
      ),
    })),

  setCustomerName: (name) => set({ customerName: name }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  setReceiptType: (type) => set({ receiptType: type }),
  setAmountPaid: (amount) => set({ amountPaid: amount }),
  setDiscount: (discount) => set({ discount: Math.min(100, Math.max(0, discount)) }),

  clear: () =>
    set({
      items: [],
      customerName: '',
      amountPaid: '',
      discount: 0,
      paymentMethod: 'EFECTIVO',
      receiptType: 'BOLETA',
    }),

  subtotal: () => {
    const { items } = get()
    return items.reduce((sum, i) => {
      const itemDiscount = (i as any).itemDiscount ?? 0
      const lineTotal = i.price * i.quantity
      return sum + lineTotal * (1 - itemDiscount / 100)
    }, 0)
  },

  totalDiscount: () => {
    const { discount } = get()
    return get().subtotal() * (discount / 100)
  },

  tax: () => {
    const base = get().subtotal() - get().totalDiscount()
    return base * 0.18 / 1.18
  },

  total: () => {
    return get().subtotal() - get().totalDiscount()
  },

  change: () => {
    const { amountPaid } = get()
    const paid = parseFloat(amountPaid) || 0
    return Math.max(0, paid - get().total())
  },
}))
