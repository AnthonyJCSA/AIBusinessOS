import HeroHome from '@/components/marketing/HeroHome'
import BusinessTypeSelector from '@/components/marketing/BusinessTypeSelector'
import BrandStory from '@/components/marketing/BrandStory'
import Benefits from '@/components/marketing/Benefits'
import SocialProof from '@/components/marketing/SocialProof'
import FAQ from '@/components/marketing/FAQ'
import FinalCTA from '@/components/marketing/FinalCTA'
import StickyWhatsApp from '@/components/StickyWhatsApp'
import ExitIntentPopup from '@/components/ExitIntentPopup'

export const metadata = {
  title: 'Sistema para negocios pequeños en Perú | AI Business OS',
  description: 'Sistema para bodegas, boticas y tiendas en Perú. Controla ventas, stock y caja desde S/99 al mes. Implementación incluida.',
  keywords: 'pos peru, punto de venta, inventario, caja, ventas, ia, whatsapp, sistema pos, pos para negocios, treinta alternativa',
  authors: [{ name: 'AI Business OS' }],
  creator: 'AI Business OS',
  publisher: 'AI Business OS',
  robots: 'index, follow',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'AI Business OS - Tu negocio en piloto automático',
    description: 'Vende más, pierde menos con IA y WhatsApp automático. Sistema POS completo para cualquier negocio.',
    type: 'website',
    locale: 'es_PE',
    url: 'https://coriva-core.vercel.app',
    siteName: 'AI Business OS',
    images: [{
      url: 'https://coriva-core.vercel.app/og-image.png',
      width: 1200,
      height: 630,
      alt: 'AI Business OS - Sistema POS'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Business OS - Tu negocio en piloto automático',
    description: 'Sistema POS con IA y WhatsApp automático',
    images: ['https://coriva-core.vercel.app/og-image.png']
  },
  alternates: {
    canonical: 'https://coriva-core.vercel.app'
  },
  verification: {
    google: 'google-site-verification-code',
  }
}

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "AI Business OS",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "PEN",
              "priceValidUntil": "2025-12-31"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "ratingCount": "127"
            },
            "description": "Sistema POS con IA para control de inventario, caja y ventas"
          })
        }}
      />
      <main className="min-h-screen">
        <HeroHome />
        <BusinessTypeSelector />
        <BrandStory />
        <Benefits />
        <SocialProof />
        <FAQ />
        <FinalCTA />
      </main>
      <StickyWhatsApp 
        phoneNumber="51913916967"
        message="Hola,%20quiero%20conocer%20AI%20Business%20OS%20para%20mi%20negocio."
        text="WhatsApp: Implementación gratis"
        source="home"
      />
      <ExitIntentPopup />
    </>
  )
}
