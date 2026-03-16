'use client'

import { create } from 'zustand'

export interface CartItem {
  id: string
  name: string
  price: number
  emoji: string
  qty: number
}

type Cart = Record<string, CartItem>

interface CartStore {
  cart: Cart
  addItem: (product: Omit<CartItem, 'qty'>, qty?: number) => void
  changeQty: (id: string, delta: number) => void
  getSummary: () => { items: CartItem[]; totalItems: number; totalPrice: number }
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

  getSummary: () => {
    const items = Object.values(get().cart)
    return {
      items,
      totalItems: items.reduce((s, it) => s + it.qty, 0),
      totalPrice: items.reduce((s, it) => s + it.price * it.qty, 0),
    }
  },
}))
