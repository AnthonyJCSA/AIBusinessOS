import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getStoreData } from '@/lib/supabase/store'
import { StoreClient } from '@/components/store/StoreClient'

// ─── Generar metadatos dinámicos ──────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const data = await getStoreData(params.slug)
  if (!data) return { title: 'Tienda no encontrada' }

  return {
    title: `${data.store.name} — Catálogo Digital`,
    description: data.store.tagline ?? `Tienda virtual de ${data.store.name}`,
    openGraph: {
      title: `${data.store.name} — Catálogo Digital`,
      description: data.store.banner_desc,
      type: 'website',
    },
  }
}

// ─── Page component (Server Component) ────────────────────────
export default async function TiendaPage({
  params,
}: {
  params: { slug: string }
}) {
  const data = await getStoreData(params.slug)

  if (!data) {
    notFound()
  }

  const { store, categories, products } = data

  return (
    <main className="min-h-svh bg-[#F7F6F3]">
      <StoreClient
        store={store}
        categories={categories}
        products={products}
      />
    </main>
  )
}

// ─── Revalidar cada 60 segundos (ISR) ─────────────────────────
export const revalidate = 60
