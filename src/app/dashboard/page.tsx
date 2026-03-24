'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSessionStore } from '@/state/session.store'
import { productService, saleService, cashService } from '@/lib/services'
import { loadThemeFromOrg } from '@/lib/theme'

import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'

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
import PurchasesModule from '@/app/PurchasesModule'
import AutomationsModule from '@/app/AutomationsModule'
import LeadsModule from '@/app/LeadsModule'

import type { Product, Sale } from '@/types'
import { useAutomationEngine } from '@/modules/ai/useAutomationEngine'

export default function DashboardPage() {
  const router = useRouter()
  const { user: currentUser, org: currentOrg, isAuthenticated, setSession, updateOrg, clearSession } = useSessionStore()

  const [activeModule, setActiveModule] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [cajaOpen, setCajaOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [customers] = useState<any[]>([])
  const [showCatalogModal, setShowCatalogModal] = useState(false)

  // ── Auth check: migrar desde sessionStorage si existe ──────
  useEffect(() => {
    // Compatibilidad: si hay sesión en sessionStorage (legacy), migrar a Zustand
    if (!isAuthenticated) {
      const savedUser = sessionStorage.getItem('coriva_user')
      const savedOrg = sessionStorage.getItem('coriva_org')
      if (savedUser && savedOrg) {
        const user = JSON.parse(savedUser)
        const org = JSON.parse(savedOrg)
        setSession(user, org)
        loadThemeFromOrg(org)
        // Limpiar sessionStorage legacy
        sessionStorage.removeItem('coriva_user')
        sessionStorage.removeItem('coriva_org')
      } else {
        router.push('/login')
        return
      }
    } else if (currentOrg) {
      loadThemeFromOrg(currentOrg)
    }
    setLoading(false)
  }, [isAuthenticated, currentOrg, setSession, router])

  // ── Load data ──────────────────────────────────────────────
  const loadProducts = useCallback(async () => {
    if (!currentOrg) return
    try { setProducts(await productService.getAll(currentOrg.id)) }
    catch (e) { console.error(e) }
  }, [currentOrg])

  const loadSales = useCallback(async () => {
    if (!currentOrg) return
    try { setSales(await saleService.getAll(currentOrg.id)) }
    catch (e) { console.error(e) }
  }, [currentOrg])

  const loadCajaStatus = useCallback(async () => {
    if (!currentOrg) return
    try {
      const mvs = await cashService.getTodayMovements(currentOrg.id)
      setCajaOpen((mvs || []).some((m: any) => m.type === 'opening'))
    } catch { setCajaOpen(false) }
  }, [currentOrg])

  useEffect(() => {
    if (isAuthenticated && currentOrg) {
      loadProducts()
      loadSales()
      loadCajaStatus()
    }
  }, [isAuthenticated, currentOrg, loadProducts, loadSales, loadCajaStatus])

  const handleLogout = () => {
    clearSession()
    router.push('/login')
  }

  // ── Automation engine ─────────────────────────────────────
  useAutomationEngine({
    orgId:    currentOrg?.id ?? '',
    orgName:  currentOrg?.name ?? '',
    products: products,
    sales:    sales,
    currency: currentOrg?.settings?.currency ?? 'S/',
  })

  const updateOrganization = (org: any) => updateOrg(org)

  const storeUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/tienda/${currentOrg?.slug || 'mi-negocio'}`
    : `/tienda/${currentOrg?.slug || 'mi-negocio'}`

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
          />
          <div className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>Cargando Coriva OS…</div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !currentUser || !currentOrg) return null

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardModule sales={sales} products={products} currentOrg={currentOrg} onNavigate={setActiveModule} />
      case 'asistente':
        return <AIAssistantModule products={products} sales={sales} currentOrg={currentOrg} />
      case 'pos':
        return (
          <POSModule
            products={products} sales={sales} currentOrg={currentOrg} currentUser={currentUser}
            onSaleComplete={async () => { await loadProducts(); await loadSales() }}
          />
        )
      case 'cash':
        return <CashRegisterModule currentUser={currentUser} />
      case 'inventory':
        return (
          <InventoryModule
            products={products}
            onUpdateProduct={async (p) => { await productService.update(p.id, p); await loadProducts() }}
            onAddProduct={async (p) => { await productService.create(currentOrg.id, p); await loadProducts() }}
            onDeleteProduct={async () => { await loadProducts() }}
            currentUser={currentUser}
          />
        )
      case 'store':
        return <VirtualStoreModule products={products} currentOrg={currentOrg} onShareCatalog={() => setShowCatalogModal(true)} />
      case 'catalog':
        return <CatalogModule products={products} currentOrg={currentOrg} />
      case 'communications':
        return <CommunicationsModule currentOrg={currentOrg} customers={customers} />
      case 'customers':
        return <CustomersModule currentUser={currentUser} />
      case 'purchases':
        return <PurchasesModule currentUser={currentUser} orgId={currentOrg.id} />
      case 'automations':
        return <AutomationsModule currentUser={currentUser} orgId={currentOrg.id} />
      case 'leads':
        return <LeadsModule currentUser={currentUser} orgId={currentOrg.id} />
      case 'reports':
        return <ReportsModule sales={sales} currentUser={currentUser} />
      case 'users':
        return <UsersModule currentUser={currentUser} organizationId={currentOrg.id} />
      case 'billing':
        return <BillingModule currentOrg={currentOrg} />
      case 'settings':
        return <SettingsModule currentOrg={currentOrg} onUpdate={updateOrganization} />
      default:
        return <DashboardModule sales={sales} products={products} currentOrg={currentOrg} onNavigate={setActiveModule} />
    }
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)', fontFamily: "'Outfit', sans-serif" }}>
      <Sidebar
        currentUser={currentUser}
        currentOrg={currentOrg}
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Topbar
          activeModule={activeModule}
          cajaOpen={cajaOpen}
          onHamburger={() => setSidebarOpen(true)}
          onAIClick={() => setActiveModule('asistente')}
          onCatalogClick={() => setShowCatalogModal(true)}
        />
        <div className="flex-1 overflow-y-auto touch-scroll" style={{ background: 'var(--bg)' }}>
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
            <p className="text-xs mb-4 text-center" style={{ color: 'var(--muted)' }}>Comparte este enlace con tus clientes</p>
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
              <button onClick={() => { window.open(`https://wa.me/?text=${encodeURIComponent(`¡Hola! Te comparto el catálogo de ${currentOrg?.name} 🛍️\n${storeUrl}`)}`, '_blank'); setShowCatalogModal(false) }}
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

      <a href="https://wa.me/51913916967?text=Hola,%20necesito%20ayuda%20con%20Coriva%20Core"
        target="_blank" rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all hover:scale-110 z-50"
        style={{ background: '#25D366', boxShadow: '0 4px 20px rgba(37,211,102,.4)' }}>
        💬
      </a>
    </div>
  )
}
