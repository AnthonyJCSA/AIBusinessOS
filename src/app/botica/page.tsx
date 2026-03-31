'use client'

import { useEffect } from 'react'
import { usePageTracking } from '@/hooks/usePageTracking'
import { trackPageView } from '@/lib/tracking'
import HeroBotica from './components/HeroBotica'
import StorysellingBotica from './components/StorysellingBotica'
import ProblemasBotica from './components/ProblemasBotica'
import BeneficiosBotica from './components/BeneficiosBotica'
import DemoVisual from './components/DemoVisual'
import TestimoniosBotica from './components/TestimoniosBotica'
import ComparacionBotica from './components/ComparacionBotica'
import FAQBotica from './components/FAQBotica'
import OfertaUrgencia from './components/OfertaUrgencia'
import CTAFinalBotica from './components/CTAFinalBotica'
import StickyWhatsApp from '@/components/StickyWhatsApp'

export default function BoticaLanding() {
  usePageTracking('botica')
  
  useEffect(() => {
    trackPageView('/botica', 'botica')
  }, [])
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Coriva Core - Sistema para Boticas",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "49",
              "priceCurrency": "PEN"
            },
            "description": "Sistema para boticas que controla ventas, stock y caja"
          })
        }}
      />
      <main className="min-h-screen">
        <HeroBotica />
        <StorysellingBotica />
        <ProblemasBotica />
        <BeneficiosBotica />
        <DemoVisual />
        <TestimoniosBotica />
        <ComparacionBotica />
        <FAQBotica />
        <OfertaUrgencia />
        <CTAFinalBotica />
      </main>
      <StickyWhatsApp 
        phoneNumber="51913916967"
        message="Hola,%20tengo%20una%20botica%20y%20quiero%20digitalizar%20mi%20negocio%20con%20Coriva%20Core."
        text="WhatsApp: Implementación gratis"
        source="botica"
      />
    </>
  )
}
