export { DocumentSearchInput }    from './components/DocumentSearchInput'
export { SmartDocumentSearch }    from './components/SmartDocumentSearch'
export { CustomerForm }           from './components/CustomerForm'
export { CompanyForm }            from './components/CompanyForm'
export { InvoicePanel }           from './components/InvoicePanel'
export { InvoiceModal }           from './components/InvoiceModal'
export { InvoiceHistory }         from './components/InvoiceHistory'
export { InvoiceResendButton }    from './components/InvoiceResendButton'

export { useInvoiceEmit }         from './hooks/useInvoiceEmit'
export { useDniSearch, useRucSearch } from './hooks/useDocumentSearch'
export { useInvoiceHistory }      from './hooks/useInvoiceHistory'

export {
  getDefaultReceiptType,
  detectDocumentType,
  validateReceiptDocCoherence,
  validateEmitReadiness,
} from './rules/billing.rules'

export type { CustomerFormData }    from './components/CustomerForm'
export type { CompanyFormData }     from './components/CompanyForm'
export type { SmartDocResult }      from './components/SmartDocumentSearch'
export type { InvoiceEmitResult, InvoiceEmitPayload } from './hooks/useInvoiceEmit'
export type { BillingValidation }   from './rules/billing.rules'
