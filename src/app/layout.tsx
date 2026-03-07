import type { Metadata } from 'next'
import './globals.css'
import Analytics from '@/components/Analytics'
import GoogleTagManager from '@/components/GoogleTagManager'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import MetaPixel from '@/components/MetaPixel'

export const metadata: Metadata = {
  title: 'Coriva Core - Sistema POS Multi-Tenant',
  description: 'Sistema POS adaptable para cualquier tipo de negocio',
  metadataBase: new URL('https://coriva-core.vercel.app'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body>
        <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID || 'GTM-XXXXXXX'} />
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA4_ID || 'G-M2PFVEQV3J'} />
        <MetaPixel pixelId={process.env.NEXT_PUBLIC_META_PIXEL_ID || ''} />
        <Analytics />
        {children}
      </body>
    </html>
  )
}