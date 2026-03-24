import type { WAMessageParams } from '@/types/store'

export function buildSingleProductMsg({
  storeName,
  currency,
  product,
  qty = 1,
}: Omit<WAMessageParams, 'waNumber' | 'cart'>): string {
  if (!product) return ''
  const total = (product.price * qty).toFixed(2)
  return `Hola! Quiero pedir desde ${storeName}:\n• ${product.name} ×${qty} — ${currency} ${total}\n\n¿Está disponible?`
}

export function buildCartMsg({
  storeName,
  currency,
  cart = [],
}: Omit<WAMessageParams, 'waNumber' | 'product' | 'qty'>): string {
  if (!cart.length) return ''
  const total = cart.reduce((s, it) => s + it.price * it.qty, 0)
  const lines = cart
    .map(it => `• ${it.name} ×${it.qty} — ${currency} ${(it.price * it.qty).toFixed(2)}`)
    .join('\n')
  return `Hola! Quiero hacer el siguiente pedido desde ${storeName}:\n\n${lines}\n\n💰 Total: ${currency} ${total.toFixed(2)}\n\n¿Está disponible para entrega?`
}

export function buildWAUrl(waNumber: string, msg: string): string {
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`
}
