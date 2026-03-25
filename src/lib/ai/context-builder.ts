import { createClient } from '@supabase/supabase-js'

export async function buildBusinessContext(orgId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const today = new Date().toISOString().split('T')[0]

  const [orgRes, salesRes, productsRes] = await Promise.allSettled([
    supabase.from('corivacore_organizations').select('name, business_type, settings').eq('id', orgId).single(),
    supabase.from('corivacore_sales').select('total').eq('org_id', orgId).gte('created_at', `${today}T00:00:00`).neq('status', 'CANCELLED'),
    supabase.from('corivacore_products').select('stock, min_stock').eq('org_id', orgId).eq('is_active', true),
  ])

  const org = orgRes.status === 'fulfilled' ? orgRes.value.data : null
  const sales = salesRes.status === 'fulfilled' ? (salesRes.value.data ?? []) : []
  const products = productsRes.status === 'fulfilled' ? (productsRes.value.data ?? []) : []

  return {
    businessName: org?.name ?? 'Mi Negocio',
    businessType: org?.business_type ?? 'retail',
    currency: org?.settings?.currency ?? 'S/',
    productsCount: products.length,
    lowStockCount: products.filter((p: any) => p.stock <= (p.min_stock || 5)).length,
    todaySales: sales.length,
    todayRevenue: sales.reduce((s: number, r: any) => s + (r.total || 0), 0),
  }
}
