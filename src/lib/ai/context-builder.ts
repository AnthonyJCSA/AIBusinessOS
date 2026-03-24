import { createClient } from '@/lib/supabase/server'

export async function buildBusinessContext(orgId: string) {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  const [
    { data: org },
    { data: todaySales },
    { data: lowStock },
    { data: cashMovements },
    { data: recentCustomers },
  ] = await Promise.all([
    supabase
      .from('corivacore_organizations')
      .select('name, business_type, settings')
      .eq('id', orgId)
      .single(),
    supabase
      .from('corivacore_sales')
      .select('total, status')
      .eq('org_id', orgId)
      .eq('status', 'completed')
      .gte('created_at', `${today}T00:00:00`),
    supabase
      .from('corivacore_products')
      .select('name, stock, min_stock')
      .eq('org_id', orgId)
      .eq('is_active', true)
      .lte('stock', 5)
      .limit(10),
    supabase
      .from('corivacore_cash_movements')
      .select('type, amount')
      .eq('org_id', orgId)
      .gte('created_at', `${today}T00:00:00`),
    supabase
      .from('corivacore_customers')
      .select('id')
      .eq('org_id', orgId)
      .eq('is_active', true),
  ])

  const todayTotal = (todaySales ?? []).reduce((s, sale) => s + (sale.total ?? 0), 0)
  const todayCount = (todaySales ?? []).length
  const cashIn = (cashMovements ?? [])
    .filter(m => m.type === 'sale')
    .reduce((s, m) => s + (m.amount ?? 0), 0)

  return {
    business: {
      name: org?.name ?? 'Negocio',
      type: org?.business_type ?? 'retail',
      currency: org?.settings?.currency ?? 'S/',
    },
    today: {
      sales_count: todayCount,
      total_revenue: todayTotal,
      avg_ticket: todayCount > 0 ? todayTotal / todayCount : 0,
      cash_in_register: cashIn,
    },
    low_stock: {
      count: (lowStock ?? []).length,
      products: (lowStock ?? []).slice(0, 5).map(p => ({
        name: p.name,
        stock: p.stock,
        min_stock: p.min_stock,
      })),
    },
    total_customers: (recentCustomers ?? []).length,
    generated_at: new Date().toISOString(),
  }
}
