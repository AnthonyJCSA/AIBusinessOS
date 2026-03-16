import { notFound } from 'next/navigation'
import { organizationService } from '@/lib/services/organization.service'
import { productService } from '@/lib/services/product.service'
import StorePage from './StorePage'

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const org = await organizationService.getBySlug(params.slug)
  if (!org) return { title: 'Tienda no encontrada' }
  return {
    title: `${org.name} — Catálogo`,
    description: `Compra en línea en ${org.name}. Haz tu pedido por WhatsApp.`,
  }
}

export default async function TiendaPage({ params }: { params: { slug: string } }) {
  const org = await organizationService.getBySlug(params.slug)
  if (!org) notFound()

  const products = await productService.getAll(org.id)

  return <StorePage org={org} products={products} />
}
