import type { Metadata, Viewport } from 'next'
import './globals.css'
import Script from 'next/script'
import MetaPixel from '@/components/MetaPixel'

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-M3B3KGCQ'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://coriva-core.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'Coriva — Sistema POS con IA para tu Negocio',
    template: '%s | Coriva',
  },
  description: 'Vende más, pierde menos. Sistema POS con IA para bodegas, farmacias, tiendas y más. Control de inventario, caja, clientes y automatizaciones en un solo lugar.',
  keywords: ['sistema pos', 'punto de venta', 'inventario', 'bodega', 'farmacia', 'tienda', 'peru', 'saas', 'ia'],
  authors: [{ name: 'Coriva', url: APP_URL }],
  creator: 'Coriva',
  publisher: 'Coriva',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  openGraph: {
    type: 'website',
    locale: 'es_PE',
    url: APP_URL,
    siteName: 'Coriva',
    title: 'Coriva — Sistema POS con IA para tu Negocio',
    description: 'Vende más, pierde menos. POS + IA + Automatizaciones para cualquier negocio.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Coriva POS' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Coriva — Sistema POS con IA',
    description: 'Vende más, pierde menos. POS + IA para tu negocio.',
    images: ['/og-image.png'],
  },
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  alternates: {
    canonical: APP_URL,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#6366F1',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        {/* Google Tag Manager */}
        {GTM_ID && (
          <Script
            id="gtm-head"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`,
            }}
          />
        )}
      </head>
      <body>
        {/* GTM noscript */}
        {GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0" width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}
        <MetaPixel pixelId={process.env.NEXT_PUBLIC_META_PIXEL_ID || ''} />
        {children}
      </body>
    </html>
  )
}
