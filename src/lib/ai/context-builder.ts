import { createClient } from '@supabase/supabase-js'

export interface BusinessContext {
  businessName:       string
  businessType:       string
  currency:           string
  plan:               string
  // Inventario
  productsCount:      number
  lowStockCount:      number
  outOfStockCount:    number
  // Ventas
  todaySales:         number
  todayRevenue:       number
  weekRevenue:        number
  // Facturación
  pendingInvoices:    number
  rejectedInvoices:   number
  // Pharma (solo si aplica)
  expiringBatches:    number
  expiredBatches:     number
  prescriptionSales:  number
  // CRM
  activeLeads:        number
  pendingPurchases:   number
}

export async function buildBusinessContext(orgId: string): Promise<BusinessContext> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const today   = new Date().toISOString().split('T')[0]
  const weekAgo = new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0]
  const in30d   = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]

  const [
    orgRes, todaySalesRes, weekSalesRes, productsRes,
    invoicesRes, batchesRes, leadsRes, purchasesRes,
  ] = await Promise.allSettled([
    supabase
      .from('corivacore_organizations')
      .select('name, business_type, settings')
      .eq('id', orgId)
      .single(),
    supabase
      .from('corivacore_sales')
      .select('total')
      .eq('org_id', orgId)
      .gte('created_at', `${today}T00:00:00`)
      .neq('status', 'CANCELLED'),
    supabase
      .from('corivacore_sales')
      .select('total')
      .eq('org_id', orgId)
      .gte('created_at', `${weekAgo}T00:00:00`)
      .neq('status', 'CANCELLED'),
    supabase
      .from('corivacore_products')
      .select('stock, min_stock')
      .eq('org_id', orgId)
      .eq('is_active', true),
    supabase
      .from('corivacore_invoices')
      .select('sunat_status')
      .eq('org_id', orgId)
      .in('sunat_status', ['PENDIENTE', 'RECHAZADA']),
    supabase
      .from('corivacore_product_batches')
      .select('expiry_date, quantity')
      .eq('org_id', orgId)
      .gt('quantity', 0)
      .lte('expiry_date', in30d),
    supabase
      .from('corivacore_leads')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .in('status', ['new', 'contacted', 'qualified', 'proposal']),
    supabase
      .from('corivacore_purchases')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('status', 'pending'),
  ])

  const org          = orgRes.status === 'fulfilled'          ? orgRes.value.data          : null
  const todaySales   = todaySalesRes.status === 'fulfilled'   ? (todaySalesRes.value.data ?? [])   : []
  const weekSales    = weekSalesRes.status === 'fulfilled'    ? (weekSalesRes.value.data ?? [])    : []
  const products     = productsRes.status === 'fulfilled'     ? (productsRes.value.data ?? [])     : []
  const invoices     = invoicesRes.status === 'fulfilled'     ? (invoicesRes.value.data ?? [])     : []
  const batches      = batchesRes.status === 'fulfilled'      ? (batchesRes.value.data ?? [])      : []

  const today_ = new Date().toISOString().split('T')[0]

  return {
    businessName:    org?.name ?? 'Mi Negocio',
    businessType:    org?.business_type ?? 'retail',
    currency:        org?.settings?.currency ?? 'S/',
    plan:            org?.settings?.plan ?? 'pro',
    // Inventario
    productsCount:   products.length,
    lowStockCount:   products.filter((p: any) => p.stock > 0 && p.stock <= (p.min_stock || 5)).length,
    outOfStockCount: products.filter((p: any) => p.stock === 0).length,
    // Ventas
    todaySales:      todaySales.length,
    todayRevenue:    todaySales.reduce((s: number, r: any) => s + (r.total || 0), 0),
    weekRevenue:     weekSales.reduce((s: number, r: any) => s + (r.total || 0), 0),
    // Facturación
    pendingInvoices:  invoices.filter((i: any) => i.sunat_status === 'PENDIENTE').length,
    rejectedInvoices: invoices.filter((i: any) => i.sunat_status === 'RECHAZADA').length,
    // Pharma
    expiringBatches: batches.filter((b: any) => b.expiry_date > today_).length,
    expiredBatches:  batches.filter((b: any) => b.expiry_date <= today_).length,
    prescriptionSales: 0, // extensible
    // CRM
    activeLeads:      leadsRes.status === 'fulfilled'    ? (leadsRes.value.count ?? 0)    : 0,
    pendingPurchases: purchasesRes.status === 'fulfilled' ? (purchasesRes.value.count ?? 0) : 0,
  }
}
