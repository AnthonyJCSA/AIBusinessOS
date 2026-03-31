export const metadata = {
  title: 'Sistema para Boticas en Perú | Coriva Core',
  description: 'Sistema para boticas que controla ventas, stock y caja. Empieza hoy desde S/49 al mes. Soporte en Perú.',
  keywords: 'sistema para botica, software para boticas, control de stock farmacia, programa para botica en Perú, sistema pos farmacia, software farmacia peru',
  robots: 'index, follow',
  openGraph: {
    title: 'Sistema para Boticas en Perú | Coriva Core',
    description: 'Sistema para boticas que controla ventas, stock y caja. Empieza hoy desde S/49 al mes.',
    type: 'website',
    locale: 'es_PE',
    url: 'https://coriva-core.vercel.app/botica',
  },
  alternates: {
    canonical: 'https://coriva-core.vercel.app/botica'
  }
}

export default function BoticaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
