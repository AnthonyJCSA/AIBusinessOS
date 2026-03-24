'use client'

import { create } from 'zustand'
import type { Cart, CartItem, CartSummary, Product } from '@/types/store'

// npm i zustand

interface CartStore {
  cart: Cart
  addItem: (product: Product, qty?: number) => void
  removeItem: (id: string) => void
  changeQty: (id: string, delta: number) => void
  clearCart: () => void
  getSummary: () => CartSummary
}

export const useCart = create<CartStore>((set, get) => ({
  cart: {},

  addItem: (product, qty = 1) => {
    set(state => {
      const existing = state.cart[product.id]
      return {
        cart: {
          ...state.cart,
          [product.id]: existing
            ? { ...existing, qty: existing.qty + qty }
            : { ...product, qty },
        },
      }
    })
  },

  removeItem: (id) => {
    set(state => {
      const next = { ...state.cart }
      delete next[id]
      return { cart: next }
    })
  },

  changeQty: (id, delta) => {
    set(state => {
      const item = state.cart[id]
      if (!item) return state
      const newQty = item.qty + delta
      if (newQty <= 0) {
        const next = { ...state.cart }
        delete next[id]
        return { cart: next }
      }
      return { cart: { ...state.cart, [id]: { ...item, qty: newQty } } }
    })
  },

  clearCart: () => set({ cart: {} }),

  getSummary: (): CartSummary => {
    const items = Object.values(get().cart) as CartItem[]
    return {
      items,
      totalItems: items.reduce((s, it) => s + it.qty, 0),
      totalPrice: items.reduce((s, it) => s + it.price * it.qty, 0),
    }
  },
}))
