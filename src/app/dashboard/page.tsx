'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSessionStore } from '@/state/session.store'
import { createBrowserClient } from '@/lib/auth'
import { productService, saleService, cashService } from '@/lib/services'
import { loadThemeFromOrg } from '@/lib/theme'

import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import PaymentPendingBanner from '@/components/PaymentPendingBanner'

import DashboardModule from '@/app/DashboardModule'
import AIAssistantModule from '@/app/AIAssistantModule'
import POSModule from '@/app/POSModule'
import CashRegisterModule from '@/app/CashRegisterModule'
import InventoryModule from '@/app/InventoryModule'
import VirtualStoreModule from '@/app/VirtualStoreModule'
import CatalogModule from '@/app/CatalogModule'
import CommunicationsModule from '@/app/CommunicationsModule'
import CustomersModule from '@/app/CustomersModule'
import ReportsModule from '@/app/ReportsModule'
import UsersModule from '@/app/UsersModule'
import SettingsModule from '@/app/SettingsModule'
import BillingModule from '@/app/BillingModule'
import LeadsModule from '@/app/LeadsModule'
import PurchasesModule from '@/app/PurchasesModule'
import AutomationsModule from '@/app/AutomationsModule'
import PharmaModule from '@/app/PharmaModule'

import type { Product, Sale } from '@/types'

export default function DashboardPage() {
  const router = useRouter()
  const { user, org, setSession, updateOrg, clearSession } = useSessionStore()

  const [activeModule, setActiveModule] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [cajaOpen, setCajaOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [showCatalogModal, setShowCatalogModal] = useState(false)
  const [showPaymentBanner, setShowPaymentBanner] = useState(false)

  // ── Auth: Cargar sesión desde Supabase Auth ────────────────
  useEffect(() => {
    const loadSession = async () => {
      const supabase = createBrowserClient()
      
      // Verificar si hay sesión activa
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session) {
        // Si viene de Stripe, esperar un momento y reintentar
        const urlParams = new URLSearchParams(window.location.search)
        if (urlParams.get('payment') === 'success') {
          setTimeout(() => window.location.reload(), 1000)
          return
        }
        router.push('/login')
        return
      }

      // Obtener datos del usuario desde API route
      try {
        const response = await fetch('/api/auth/session')
        
        if (!response.ok) {
          console.error('Error en /api/auth/session:', response.status)
          // Si viene de pago exitoso, recargar
          const urlParams = new URLSearchParams(window.location.search)
          if (urlParams.get('payment') === 'success') {
            setTimeout(() => window.location.reload(), 1000)
            return
          }
          router.push('/login')
          return
        }

        const { user: loadedUser, org: loadedOrg } = await response.json()

        // Mostrar banner si el pago está pendiente (pero permitir acceso)
        if (loadedOrg.payment_status === 'pending') {
          setShowPaymentBanner(true)
        }

        setSession(loadedUser, loadedOrg)
        loadThemeFromOrg(loadedOrg)
        setLoading(false)
      } catch (error) {
        console.error('Error cargando sesión:', error)
        router.push('/login')
      }
    }

    loadSession()
  }, [router, setSession])

  // ── Data loaders ───────────────────────────────────────────
  const loadProducts = useCallback(async () => {
    if (!org) return
    try { 
      setProducts(await productService.getAll(org.id)) 
    } catch (error) {
      console.error('Error cargando productos:', error)
    }
  }, [org])

  const loadSales = useCallback(async () => {
    if (!org) return
    try { 
      setSales(await saleService.getAll(org.id)) 
    } catch (error) {
      console.error('Error cargando ventas:', error)
    }
  }, [org])

  const loadCajaStatus = useCallback(async () => {
    if (!org) return
    try {
      const mvs = await cashService.getTodayMovements(org.id)
      setCajaOpen((mvs || []).some((m: any) => m.type === 'opening'))
    } catch { 
      setCajaOpen(false) 
    }
  }, [org])

  useEffect(() => {
    if (user && org) {
      loadProducts()
      loadSales()
      loadCajaStatus()
    }
  }, [user, org, loadProducts, loadSales, loadCajaStatus])

  const handleLogout = async () => {
    const supabase = createBrowserClient()
    await supabase.auth.signOut()
    clearSession()
    router.push('/login')
  }

  const storeUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/tienda/${org?.slug || 'mi-negocio'}`
    : `/tienda/${org?.slug || 'mi-negocio'}`

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
        <div className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>Cargando Coriva OS…</div>
      </div>
    </div>
  )

  if (!user || !org) return null

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardModule sales={sales} products={products} currentOrg={org} onNavigate={setActiveModule} />
      case 'asistente':
        return <AIAssistantModule products={products} sales={sales} currentOrg={org} onNavigate={setActiveModule} />
      case 'pos':
        return <POSModule products={products} sales={sales} currentOrg={org} currentUser={user}
          onSaleComplete={async () => { await loadProducts(); await loadSales() }} />
      case 'cash':
        return <CashRegisterModule currentUser={user} />
      case 'inventory':
        return <InventoryModule products={products}
          onUpdateProduct={async (p) => { await productService.update(p.id, p); await loadProducts() }}
          onAddProduct={async (p) => { await productService.create(org.id, p); await loadProducts() }}
          onDeleteProduct={async () => { await loadProducts() }}
          currentUser={user} />
      case 'store':
        return <VirtualStoreModule products={products} currentOrg={org} onShareCatalog={() => setShowCatalogModal(true)} />
      case 'catalog':
        return <CatalogModule products={products} currentOrg={org} />
      case 'communications':
        return <CommunicationsModule currentOrg={org} customers={[]} />
      case 'customers':
        return <CustomersModule currentUser={user} />
      case 'leads':
        return <LeadsModule orgId={org.id} />
      case 'purchases':
        return <PurchasesModule orgId={org.id} />
      case 'automations':
        return <AutomationsModule currentOrg={org} />
      case 'pharma':
        return <PharmaModule orgId={org.id} currentUser={user} />
      case 'reports':
        return <ReportsModule sales={sales} currentUser={user} />
      case 'users':
        return <UsersModule currentUser={user} organizationId={org.id} />
      case 'billing':
        return <BillingModule currentOrg={org} />
      case 'settings':
        return <SettingsModule currentOrg={org} onUpdate={updateOrg} />
      default:
        return <DashboardModule sales={sales} products={products} currentOrg={org} onNavigate={setActiveModule} />
    }
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)', fontFamily: "'Outfit', sans-serif" }}>
      <PaymentPendingBanner show={showPaymentBanner} />
      
      <Sidebar
        currentUser={user} currentOrg={org}
        activeModule={activeModule} setActiveModule={setActiveModule}
        isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <div className="flex flex-col overflow-hidden" style={{ flex: '1 1 0', minWidth: 0 }}>
        <Topbar
          activeModule={activeModule} cajaOpen={cajaOpen}
          onHamburger={() => setSidebarOpen(true)}
          onAIClick={() => setActiveModule('asistente')}
          onCatalogClick={() => setShowCatalogModal(true)}
        />
        <div className="flex-1 overflow-y-auto overflow-x-hidden touch-scroll" style={{ background: 'var(--bg)' }}>
          {renderModule()}
        </div>
      </div>

      {/* Catalog Modal */}
      {showCatalogModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border2)' }}>
            <div className="flex items-center justify-between mb-5">
              <span className="text-base font-extrabold" style={{ color: 'var(--text)' }}>📲 Catálogo Digital</span>
              <button onClick={() => setShowCatalogModal(false)}
                className="w-[30px] h-[30px] rounded-[7px] flex items-center justify-center text-sm"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}>✕</button>
            </div>
            <div className="px-[14px] py-[10px] rounded-[9px] mb-4 text-center break-all"
              style={{ background: 'var(--surface)', border: '1px solid var(--border2)', fontFamily: "'DM Mono', monospace", fontSize: '12px', color: 'var(--accent2)' }}>
              {storeUrl}
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={() => { navigator.clipboard.writeText(storeUrl).catch(() => {}); setShowCatalogModal(false) }}
                className="w-full py-[10px] rounded-[9px] text-xs font-semibold"
                style={{ background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.25)', color: 'var(--green)' }}>
                📋 Copiar Enlace
              </button>
              <button onClick={() => { window.open(`https://wa.me/?text=${encodeURIComponent(`¡Hola! Te comparto el catálogo de ${org?.name} 🛍️\n${storeUrl}`)}`, '_blank'); setShowCatalogModal(false) }}
                className="w-full py-[10px] rounded-[9px] text-xs font-semibold"
                style={{ background: 'rgba(37,211,102,.1)', color: '#25D366', border: '1px solid rgba(37,211,102,.3)' }}>
                📱 Compartir por WhatsApp
              </button>
              <button onClick={() => setShowCatalogModal(false)}
                className="w-full py-[10px] rounded-[9px] text-xs font-semibold"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <a href="https://wa.me/51913916967?text=Hola,%20necesito%20ayuda%20con%20Coriva"
        target="_blank" rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all hover:scale-110 z-50"
        style={{ background: '#25D366', boxShadow: '0 4px 20px rgba(37,211,102,.4)' }}>
        💬
      </a>
    </div>
  )
}
