// DESACTIVADO — GA4 se gestiona únicamente desde Google Tag Manager (GTM-M3B3KGCQ)
// No usar este componente. Ver src/app/layout.tsx para la implementación de GTM.
export default function Analytics() { return null }

// Los eventos de tracking siguen funcionando via window.dataLayer → GTM los captura
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({ event: action, event_category: category, event_label: label, value })
  }
}
