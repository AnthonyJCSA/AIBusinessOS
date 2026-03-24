'use client'

import { useState, useCallback } from 'react'
import { useCartStore } from '@/state/cart.store'
import { saleService, cashService } from '@/lib/services'
import { usePOSKeyboard } from '@/modules/operations/pos/hooks/usePOSKeyboard'
import { ProductGrid } from '@/modules/operations/pos/components/ProductGrid'
import { CartPanel } from '@/modules/operations/pos/components/CartPanel'
import type { Product, Organization, User } from '@/types'

interface POSProps {
  products: Product[]
  sales: any[]
  currentOrg: Organization | null
  currentUser: User | null
  onSaleComplete: () => Promise<void>
}

export default function POSModule({ products, currentOrg, currentUser, onSaleComplete }: POSProps) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [processing, setProcessing] = useState(false)
  const [showSuccess, setShowSuccess] = useState<{ number: string; total: number } | null>(null)

  const currency = currentOrg?.settings?.currency ?? 'S/'
  const { items, customerName, paymentMethod, receiptType, amountPaid, addItem, clear, subtotal, totalDiscount, tax, total } = useCartStore()

  const printReceipt = useCallback((saleNumber: string) => {
    const tot = total()
    const igv = tax()
    const base = subtotal() - totalDiscount() - igv
    const lines = items.map(i => {
      const disc = (i.itemDiscount ?? 0)
      const lineTotal = i.price * i.quantity * (1 - disc / 100)
      return `${i.quantity}x ${i.name.padEnd(20)} ${currency} ${lineTotal.toFixed(2)}`
    }).join('\n')

    const content = [
      '================================',
      currentOrg?.name?.toUpperCase() ?? 'NEGOCIO',
      currentOrg?.ruc ? `RUC: ${currentOrg.ruc}` : '',
      '================================',
      `${receiptType}: ${saleNumber}`,
      `Fecha: ${new Date().toLocaleString('es-PE')}`,
      customerName ? `Cliente: ${customerName}` : '',
      '================================',
      lines,
      '================================',
      `OP. GRAVADAS: ${currency} ${base.toFixed(2)}`,
      `IGV (18%):    ${currency} ${igv.toFixed(2)}`,
      `TOTAL:        ${currency} ${tot.toFixed(2)}`,
      `Pago: ${paymentMethod}`,
      amountPaid && Number(amountPaid) > tot ? `Vuelto: ${currency} ${(Number(amountPaid) - tot).toFixed(2)}` : '',
      '================================',
      '¡Gracias por su compra!',
      currentOrg?.settings?.receipt_footer ?? '',
      '================================',
    ].filter(Boolean).join('\n')

    const w = window.open('', '_blank')
    if (w) {
      w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><style>*{margin:0;padding:0}body{font-family:'Courier New',monospace;font-size:12px;padding:10mm}pre{white-space:pre-wrap}@media print{@page{size:80mm auto;margin:0}}</style></head><body><pre>${content}</pre><script>window.onload=function(){window.print();setTimeout(function(){window.close()},1000)}<\/script></body></html>`)
      w.document.close()
    }
  }, [items, currentOrg, customerName, paymentMethod, receiptType, amountPaid, currency, total, tax, subtotal, totalDiscount])

  const processSale = useCallback(async () => {
    if (items.length === 0 || !currentOrg) return
    const tot = total()
    if (paymentMethod === 'EFECTIVO' && (!amountPaid || Number(amountPaid) < tot)) {
      alert('El monto recibido debe ser mayor o igual al total')
      return
    }
    // Validar stock en tiempo real antes de procesar
    const stockErrors = items.filter(i => i.quantity > i.stock)
    if (stockErrors.length > 0) {
      alert(`Stock insuficiente:\n${stockErrors.map(i => `• ${i.name}: disponible ${i.stock}, solicitado ${i.quantity}`).join('\n')}`)
      return
    }
    setProcessing(true)
    try {
      const igv = tax()
      const base = subtotal() - totalDiscount() - igv
      const sale = await saleService.create(currentOrg.id, {
        customerName: customerName || 'Cliente General',
        receiptType,
        paymentMethod,
        subtotal: base,
        tax: igv,
        discount: totalDiscount(),
        total: tot,
        amountPaid: amountPaid ? Number(amountPaid) : undefined,
        changeAmount: amountPaid && Number(amountPaid) > tot ? Number(amountPaid) - tot : undefined,
        items,
        createdBy: currentUser?.username,
      })
      await cashService.registerSale(currentOrg.id, sale.id, tot)
      await onSaleComplete()
      printReceipt(sale.sale_number)
      setShowSuccess({ number: sale.sale_number, total: tot })
      clear()
    } catch (e) {
      console.error(e)
      alert('❌ Error al procesar la venta')
    } finally {
      setProcessing(false)
    }
  }, [items, currentOrg, currentUser, paymentMethod, receiptType, amountPaid, customerName,
      total, tax, subtotal, totalDiscount, clear, onSaleComplete, printReceipt])

  usePOSKeyboard({
    onProcess: processSale,
    onClear: clear,
    onClearSearch: () => setSearch(''),
  })

  return (
    <div className="animate-fade-up" style={{ height: 'calc(100vh - 100px)' }}>
      <div
        className="grid h-full"
        style={{ gridTemplateColumns: '1fr 340px', gap: '14px', padding: '20px' }}
      >
        <ProductGrid
          products={products}
          search={search}
          category={category}
          currency={currency}
          onSearch={setSearch}
          onCategory={setCategory}
          onAdd={addItem}
        />
        <CartPanel
          org={currentOrg}
          onProcess={processSale}
          processing={processing}
        />
      </div>

      {/* Modal éxito */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div
            className="w-full max-w-sm rounded-2xl p-6 text-center"
            style={{ background: 'var(--card)', border: '1px solid var(--border2)' }}
          >
            <div className="text-5xl mb-3">🎉</div>
            <div className="text-2xl font-extrabold mb-1" style={{ color: 'var(--green)' }}>
              {currency} {showSuccess.total.toFixed(2)}
            </div>
            <div className="text-xs mb-5" style={{ color: 'var(--muted)' }}>
              {showSuccess.number} — Venta registrada exitosamente
            </div>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setShowSuccess(null)}
                className="px-4 py-[9px] rounded-[9px] text-xs font-semibold transition-all"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}
              >
                Cerrar
              </button>
              <button
                onClick={() => setShowSuccess(null)}
                className="px-4 py-[9px] rounded-[9px] text-xs font-semibold text-white transition-all"
                style={{ background: 'var(--gradient)' }}
              >
                Nueva Venta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
