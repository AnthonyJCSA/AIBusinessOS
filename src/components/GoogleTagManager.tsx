import { config } from '@/lib/config'

// GTM implementado directamente en src/app/layout.tsx
// con strategy="beforeInteractive" para detección correcta por Tag Assistant.
export default function GoogleTagManager() { 
  // ID desde configuración centralizada: {config.analytics.gtmId}
  return null 
}
