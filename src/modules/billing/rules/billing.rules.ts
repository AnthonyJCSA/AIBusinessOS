import type { DocumentType, InvoiceType } from '@/lib/integrations/nubefact/nubefact.types'

export interface BillingValidation {
  valid: boolean
  warning?: string
  error?: string
}

/** Tipo de comprobante por defecto según el documento del cliente */
export function getDefaultReceiptType(docType: DocumentType | ''): 'BOLETA' | 'FACTURA' {
  return docType === 'RUC' ? 'FACTURA' : 'BOLETA'
}

/** Detecta si un string es DNI (8 dígitos) o RUC (11 dígitos) */
export function detectDocumentType(value: string): 'DNI' | 'RUC' | null {
  const clean = value.replace(/\D/g, '')
  if (clean.length === 8)  return 'DNI'
  if (clean.length === 11) return 'RUC'
  return null
}

/** Valida coherencia entre tipo de comprobante y documento del cliente */
export function validateReceiptDocCoherence(
  receiptType: InvoiceType,
  docType: DocumentType | '',
  docNumber: string,
): BillingValidation {
  if (receiptType === 'FACTURA') {
    if (docType !== 'RUC') {
      return { valid: false, error: 'Para emitir FACTURA se requiere RUC del cliente' }
    }
    if (!/^\d{11}$/.test(docNumber)) {
      return { valid: false, error: 'RUC inválido — debe tener 11 dígitos' }
    }
  }

  if (receiptType === 'BOLETA' && docType === 'RUC') {
    return {
      valid: true,
      warning: 'El cliente tiene RUC. ¿Desea emitir FACTURA en su lugar?',
    }
  }

  return { valid: true }
}

/** Valida que los campos mínimos estén presentes antes de emitir */
export function validateEmitReadiness(
  receiptType: InvoiceType,
  docType: DocumentType | '',
  docNumber: string,
  clientName: string,
): BillingValidation {
  const coherence = validateReceiptDocCoherence(receiptType, docType, docNumber)
  if (!coherence.valid) return coherence

  if (receiptType === 'FACTURA' && !clientName.trim()) {
    return { valid: false, error: 'Razón social requerida para FACTURA' }
  }

  return { valid: true, warning: coherence.warning }
}
