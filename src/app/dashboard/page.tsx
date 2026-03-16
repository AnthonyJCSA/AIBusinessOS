'use client'

import { useState, useEffect, useCallback } from 'react'
import { Organization, User, Product, CartItem, Sale } from '@/types'
import {
  productService,
  saleService,
  cashService,
  authService,
} from '@/lib/services'

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

const tabs = [
  'dashboard', 'asistente', 'pos', 'cash', 'inventory',
  'store', 'catalog', 'communications', 'customers', 'reports', 'users', 'settings',
]

const tabLabels: Record<string, string> = {
  dashboard: 'Dashboard', asistente: 'IA Asistente', pos: 'POS', cash: 'Caja',
  inventory: 'Inventario', store: 'Tienda', catalog: 'Catálogo',
  communications: 'Comunicaciones', customers: 'Clientes',
  reports: 'Reportes', users: 'Usuarios', settings: 'Config',
}

export default function DashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null)
  const [activeModule, setActiveModule] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [cajaOpen, setCajaOpen] = useState(false)

  // Login state
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  // Data
  const [products, setProducts] = useState<Product[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [customers, setCustomers] = useState<any[]>([])

  // ── Session check ──────────────────────────────────────────
  useEffect(() => {
    const saved = sessionStorage.getItem('coriva_user')
    const savedOrg = sessionStorage.getItem('coriva_org')
    if (saved && savedOrg) {
      const org = JSON.parse(savedOrg)
      setCurrentUser(JSON.parse(saved))
      setCurrentOrg(org)
      setIsAuthenticated(true)
      const themeColor = org?.settings?.theme_color
      if (themeColor) {
        const root = document.documentElement
        root.style.setProperty('--accent', themeColor)
        root.style.setProperty('--accent3', themeColor)
        root.style.setProperty('--gradient', `linear-gradient(135deg, ${themeColor}, ${themeColor}CC)`)
      }
    } else {
      window.location.href = '/'
    }
    setLoading(false)
  }, [])

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

  // ── Login ──────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)
    try {
      const result = await authService.login(username, password)
      if (result) {
        setCurrentUser(result.user)
        setCurrentOrg(result.org)
        setIsAuthenticated(true)
        sessionStorage.setItem('coriva_user', JSON.stringify(result.user))
        sessionStorage.setItem('coriva_org', JSON.stringify(result.org))
      } else {
        setLoginError('Usuario o contraseña incorrectos')
      }
    } catch {
      setLoginError('Error al iniciar sesión')
    } finally {
      setLoginLoading(false)
    }
  }

  // ── Product handlers ───────────────────────────────────────
  const updateProduct = async (p: Product) => {
    await productService.update(p.id, p)
    await loadProducts()
  }
  const addProduct = async (p: Omit<Product, 'id'>) => {
    if (!currentOrg) return
    await productService.create(currentOrg.id, p)
    await loadProducts()
  }
  const deleteProduct = async (id: string) => {
    await loadProducts()
  }

  const updateOrganization = (org: Organization) => {
    setCurrentOrg(org)
    sessionStorage.setItem('coriva_org', JSON.stringify(org))
  }

  const lowStockCount = products.filter(p => p.stock <= (p.min_stock || 5)).length

  // ── Catalog modal ──────────────────────────────────────────
  const [showCatalogModal, setShowCatalogModal] = useState(false)
  const storeUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/tienda/${currentOrg?.slug || 'mi-negocio'}`
    : `/tienda/${currentOrg?.slug || 'mi-negocio'}`

  // ── Loading screen ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin-slow"
            style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
          />
          <div className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>Cargando Coriva Core…</div>
        </div>
      </div>
    )
  }

  // ── Login screen ───────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
        {/* Left branding */}
        <div
          className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0D1117 0%, #161D2E 100%)', borderRight: '1px solid var(--border)' }}
        >
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full -mr-48 -mt-48" style={{ background: 'var(--accent)', opacity: 0.05 }} />
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full -ml-48 -mb-48" style={{ background: 'var(--accent3)', opacity: 0.05 }} />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: 'var(--gradient)' }}>🚀</div>
              <span className="text-2xl font-extrabold" style={{ background: 'var(--gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Coriva Core
              </span>
            </div>
            <h1 className="text-5xl font-extrabold leading-tight mb-4" style={{ color: 'var(--text)' }}>
              Gestiona tu negocio<br />
              <span style={{ color: 'var(--muted)' }}>con IA integrada</span>
            </h1>
            <p className="text-lg" style={{ color: 'var(--muted)' }}>
              Sistema POS + IA para cualquier tipo de negocio. Ventas, inventario, tienda virtual y asistente inteligente.
            </p>
          </div>

          <div className="relative z-10 space-y-4">
            {[
              { icon: '🤖', title: 'Asistente IA', desc: 'GPT-4 analiza tu negocio en tiempo real' },
              { icon: '🛍️', title: 'Tienda Virtual', desc: 'Recibe pedidos por WhatsApp y web' },
              { icon: '📊', title: 'Reportes IA', desc: 'Predicciones y alertas automáticas' },
            ].map(f => (
              <div key={f.title} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0 mt-0.5"
                  style={{ background: 'rgba(99,102,241,.15)', border: '1px solid rgba(99,102,241,.2)' }}>
                  {f.icon}
                </div>
                <div>
                  <div className="text-sm font-bold" style={{ color: 'var(--text)' }}>{f.title}</div>
                  <div className="text-xs" style={{ color: 'var(--muted)' }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right login */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: 'var(--gradient)' }}>🚀</div>
              <span className="text-xl font-extrabold" style={{ background: 'var(--gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Coriva Core
              </span>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-extrabold mb-2" style={{ color: 'var(--text)' }}>Bienvenido de nuevo</h2>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>Ingresa tus credenciales para continuar</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="flex flex-col gap-[5px]">
                <label className="text-[10px] font-bold uppercase tracking-[.5px]" style={{ color: 'var(--muted)' }}>Usuario</label>
                <input
                  type="text" value={username} onChange={e => setUsername(e.target.value)}
                  className="px-4 py-3 rounded-xl outline-none text-sm transition-all"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  placeholder="Ingresa tu usuario" required autoComplete="username"
                />
              </div>
              <div className="flex flex-col gap-[5px]">
                <label className="text-[10px] font-bold uppercase tracking-[.5px]" style={{ color: 'var(--muted)' }}>Contraseña</label>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  className="px-4 py-3 rounded-xl outline-none text-sm transition-all"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  placeholder="Ingresa tu contraseña" required autoComplete="current-password"
                />
              </div>

              {loginError && (
                <div className="px-4 py-3 rounded-xl text-sm font-medium"
                  style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', color: 'var(--red)' }}>
                  ⚠️ {loginError}
                </div>
              )}

              <button type="submit" disabled={loginLoading}
                className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60"
                style={{ background: 'var(--gradient)', boxShadow: '0 0 20px rgba(99,102,241,.3)' }}>
                {loginLoading ? '⏳ Iniciando...' : 'Iniciar Sesión'}
              </button>
            </form>

            <div className="mt-5 px-4 py-3 rounded-xl"
              style={{ background: 'rgba(99,102,241,.06)', border: '1px solid rgba(99,102,241,.15)' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--accent)' }}>ℹ️ Acceso</p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                Usa las credenciales de tu organización creada en Supabase
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Render module ──────────────────────────────────────────
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
            products={products} onUpdateProduct={updateProduct}
            onAddProduct={addProduct} onDeleteProduct={deleteProduct}
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
      case 'reports':
        return <ReportsModule sales={sales} currentUser={currentUser} />
      case 'users':
        return <UsersModule currentUser={currentUser!} organizationId={currentOrg!.id} />
      case 'settings':
        return <SettingsModule currentOrg={currentOrg!} onUpdate={updateOrganization} />
      default:
        return <DashboardModule sales={sales} products={products} currentOrg={currentOrg} onNavigate={setActiveModule} />
    }
  }

  // ── Main shell ─────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)', fontFamily: "'Outfit', sans-serif" }}>

      {/* Sidebar */}
      <Sidebar
        currentUser={currentUser}
        currentOrg={currentOrg}
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Topbar */}
        <Topbar
          activeModule={activeModule}
          cajaOpen={cajaOpen}
          onHamburger={() => setSidebarOpen(true)}
          onAIClick={() => setActiveModule('asistente')}
          onCatalogClick={() => setShowCatalogModal(true)}
          lowStockCount={lowStockCount}
        />

        {/* Tabs — ocultos en móvil */}
        <div
          className="hidden sm:flex gap-[1px] px-5 overflow-x-auto flex-shrink-0"
          style={{ background: 'var(--sidebar)', borderBottom: '1px solid var(--border)' }}
        >
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveModule(tab)}
              className="px-[14px] py-[9px] text-[11px] font-semibold whitespace-nowrap border-b-2 transition-all"
              style={{
                color: activeModule === tab ? 'var(--accent)' : 'var(--sub)',
                borderBottomColor: activeModule === tab ? 'var(--accent)' : 'transparent',
                background: 'transparent',
              }}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>

        {/* Content */}
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
            <div className="px-[14px] py-[10px] rounded-[9px] mb-4 text-center"
              style={{ background: 'var(--surface)', border: '1px solid var(--border2)', fontFamily: "'DM Mono', monospace", fontSize: '12px', color: 'var(--accent2)', wordBreak: 'break-all' }}>
              {storeUrl}
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => { navigator.clipboard.writeText(storeUrl).catch(() => {}); setShowCatalogModal(false) }}
                className="w-full py-[10px] rounded-[9px] text-xs font-semibold transition-all"
                style={{ background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.25)', color: 'var(--green)' }}>
                📋 Copiar Enlace
              </button>
              <button
                onClick={() => { window.open(`https://wa.me/?text=${encodeURIComponent(`¡Hola! Te comparto el catálogo de ${currentOrg?.name} 🛍️\n${storeUrl}`)}`, '_blank'); setShowCatalogModal(false) }}
                className="w-full py-[10px] rounded-[9px] text-xs font-semibold transition-all"
                style={{ background: 'rgba(37,211,102,.1)', color: '#25D366', border: '1px solid rgba(37,211,102,.3)' }}>
                📱 Compartir por WhatsApp
              </button>
              <button onClick={() => setShowCatalogModal(false)}
                className="w-full py-[10px] rounded-[9px] text-xs font-semibold transition-all"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp flotante */}
      <a
        href="https://wa.me/51913916967?text=Hola,%20necesito%20ayuda%20con%20Coriva%20Core"
        target="_blank" rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all hover:scale-110 z-50"
        style={{ background: '#25D366', boxShadow: '0 4px 20px rgba(37,211,102,.4)' }}
        title="Soporte por WhatsApp"
      >
        💬
      </a>
    </div>
  )
}
