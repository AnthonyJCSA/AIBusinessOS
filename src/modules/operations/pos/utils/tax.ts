import type { Organization } from '@/types'

export interface TaxResult {
  base: number
  tax: number
  total: number
  taxRate: number
  taxName: string
}

export function calculateTax(subtotal: number, org: Organization | null): TaxResult {
  const taxRate = org?.settings?.tax_rate ?? 18
  const taxName = org?.settings?.tax_name ?? 'IGV'
  const taxIncluded = org?.settings?.tax_included !== false

  const rate = taxRate / 100

  if (taxIncluded) {
    const tax = subtotal * rate / (1 + rate)
    return { base: subtotal - tax, tax, total: subtotal, taxRate, taxName }
  }

  const tax = subtotal * rate
  return { base: subtotal, tax, total: subtotal + tax, taxRate, taxName }
}

export function formatCurrency(amount: number, org: Organization | null): string {
  const currency = org?.settings?.currency ?? 'S/'
  return `${currency} ${amount.toFixed(2)}`
}
