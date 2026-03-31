export const metadata = {
  title: 'Sistema para Bodegas en Perú | Coriva Core',
  description: 'Sistema para bodegas que controla ventas, stock y caja. Empieza hoy desde S/49 al mes.',
  keywords: 'sistema para bodega, programa para bodega, sistema de ventas para tienda, control de ventas negocio pequeño, pos bodega peru',
  robots: 'index, follow',
  openGraph: {
    title: 'Sistema para Bodegas en Perú | Coriva Core',
    description: 'Sistema para bodegas que controla ventas, stock y caja. Empieza hoy desde S/49 al mes.',
    type: 'website',
    locale: 'es_PE',
    url: 'https://coriva-core.vercel.app/bodega',
  },
  alternates: {
    canonical: 'https://coriva-core.vercel.app/bodega'
  }
}

export default function BodegaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
