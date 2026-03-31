'use client'

import { canAccessModule } from '@/lib/permissions'
import { useFeatureFlag } from '@/shared/hooks/useFeatureFlag'

interface SidebarProps {
  currentUser: any
  currentOrg: any
  activeModule: string
  setActiveModule: (m: string) => void
  isOpen: boolean
  onClose: () => void
  onLogout?: () => void
}

const navSections = [
  {
    label: 'Principal',
    items: [
      { id: 'dashboard', icon: <GridIcon />,    label: 'Dashboard IA',      badge: null,     badgeColor: 'accent' },
      { id: 'asistente', icon: <AIIcon />,      label: 'Asistente IA',      badge: 'IA',     badgeColor: 'green'  },
    ],
  },
  {
    label: 'Ventas',
    items: [
      { id: 'pos',     icon: <POSIcon />,     label: 'Punto de Venta',    badge: null,     badgeColor: null    },
      { id: 'cash',    icon: <CashIcon />,    label: 'Caja',              badge: null,     badgeColor: null    },
      { id: 'billing', icon: <BillingIcon />, label: 'Facturación SUNAT', badge: 'SUNAT',  badgeColor: 'amber' },
    ],
  },
  {
    label: 'Inventario & Farmacia',
    items: [
      { id: 'inventory', icon: <BoxIcon />,    label: 'Inventario', badge: null,     badgeColor: 'red'   },
      { id: 'pharma',    icon: <PharmaIcon />, label: 'Farmacia',   badge: 'PHARMA', badgeColor: 'green' },
    ],
  },
  {
    label: 'Tienda Virtual',
    items: [
      { id: 'store',   icon: <StoreIcon />,   label: 'Tienda Virtual',   badge: 'NUEVO', badgeColor: 'green' },
      { id: 'catalog', icon: <CatalogIcon />, label: 'Catálogo Digital', badge: null,    badgeColor: null    },
    ],
  },
  {
    label: 'Comunicaciones',
    items: [
      { id: 'communications', icon: <EmailIcon />, label: 'Email & WhatsApp', badge: 'IA', badgeColor: 'amber' },
    ],
  },
  {
    label: 'CRM',
    items: [
      { id: 'customers', icon: <UsersIcon />, label: 'Clientes',        badge: null, badgeColor: null },
      { id: 'leads',     icon: <LeadsIcon />, label: 'Leads & Pipeline', badge: null, badgeColor: null },
    ],
  },
  {
    label: 'Compras',
    items: [
      { id: 'purchases', icon: <PurchasesIcon />, label: 'Compras', badge: null, badgeColor: null },
    ],
  },
  {
    label: 'Automatizaciones',
    items: [
      { id: 'automations', icon: <AutoIcon />, label: 'Automatizaciones', badge: 'IA', badgeColor: 'green' },
    ],
  },
  {
    label: 'Análisis',
    items: [
      { id: 'reports', icon: <ChartIcon />, label: 'Reportes IA', badge: null, badgeColor: null },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { id: 'users',    icon: <UserIcon />,     label: 'Usuarios',       badge: null, badgeColor: null },
      { id: 'settings', icon: <SettingsIcon />, label: 'Configuración',  badge: null, badgeColor: null },
    ],
  },
]

const badgeStyles: Record<string, string> = {
  accent: 'bg-indigo-500/15 text-indigo-400',
  green:  'bg-emerald-500/15 text-emerald-400',
  red:    'bg-red-500/15 text-red-400',
  amber:  'bg-amber-500/15 text-amber-400',
}

export default function Sidebar({ currentUser, currentOrg, activeModule, setActiveModule, isOpen, onClose, onLogout }: SidebarProps) {
  const initials = currentUser?.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('') || 'U'

  const plan = (currentOrg?.settings?.plan ?? 'pro').toUpperCase()

  const handleClick = (id: string) => {
    setActiveModule(id)
    onClose()
  }

  // Helper para verificar acceso completo (rol + plan)
  const canAccess = (moduleId: string) => {
    // Verificar permisos de rol
    if (!canAccessModule(currentUser?.role, moduleId)) return false
    
    // OWNER siempre tiene acceso completo a todo
    if (currentUser?.role === 'OWNER') return true
    
    // Verificar plan (solo Pro y Premium)
    const currentPlan = (currentOrg?.settings?.plan ?? 'pro') as 'pro' | 'premium'
    const planFeatures: Record<string, string[]> = {
      pro: ['dashboard', 'pos', 'inventory', 'cash', 'customers', 'reports', 'leads', 'purchases', 'communications', 'billing', 'catalog', 'users', 'settings', 'pharma'],
      premium: ['dashboard', 'pos', 'inventory', 'cash', 'customers', 'reports', 'leads', 'purchases', 'communications', 'billing', 'catalog', 'users', 'settings', 'pharma', 'store', 'automations', 'asistente'],
    }
    
    return planFeatures[currentPlan]?.includes(moduleId) ?? false
  }

  return (
    <>
      {/* Overlay móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[150] md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-[200] flex flex-col
          w-[240px] flex-shrink-0
          transition-transform duration-250
          md:relative md:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ background: 'var(--sidebar)', borderRight: '1px solid var(--border)' }}
      >
        {/* Logo */}
        <div className="px-4 py-[18px] pb-[14px]" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-[10px]">
            <div
              className="w-9 h-9 rounded-[10px] flex items-center justify-center text-lg flex-shrink-0"
              style={{ background: 'var(--gradient)', boxShadow: '0 0 20px rgba(99,102,241,.3)' }}
            >
              🚀
            </div>
            <div>
              <div
                className="text-[17px] font-extrabold tracking-tight"
                style={{ background: 'var(--gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                Coriva Core
              </div>
              <div className="text-[9px] font-medium uppercase tracking-[.8px]" style={{ color: 'var(--sub)' }}>
                SaaS · IA para Negocios
              </div>
            </div>
          </div>
        </div>

        {/* User card */}
        <div className="mx-3 my-[10px] p-[10px] rounded-[11px] cursor-pointer transition-all" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-[9px]">
            <div
              className="w-8 h-8 rounded-[9px] flex items-center justify-center text-xs font-extrabold text-white flex-shrink-0"
              style={{ background: 'var(--gradient)' }}
            >
              {initials}
            </div>
            <div>
              <div className="text-xs font-bold" style={{ color: 'var(--text)' }}>{currentUser?.full_name || 'Usuario'}</div>
              <div className="text-[10px]" style={{ color: 'var(--muted)' }}>{currentUser?.role} · {currentOrg?.name}</div>
            </div>
          </div>
          <div
            className="mt-2 rounded-[7px] px-2 py-[5px] text-[10px] flex items-center gap-[5px]"
            style={{ background: 'rgba(99,102,241,.08)', border: '1px solid rgba(99,102,241,.2)', color: 'var(--accent)' }}
          >
            <span className="w-[6px] h-[6px] rounded-full animate-pulse-dot" style={{ background: 'var(--accent)' }} />
            IA activa — analizando tu negocio
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-[6px] overflow-y-auto touch-scroll">
          {navSections.map(section => (
            <div key={section.label}>
              <div
                className="px-[14px] pt-[10px] pb-[3px] text-[9px] font-bold uppercase tracking-[1px]"
                style={{ color: 'var(--sub)' }}
              >
                {section.label}
              </div>
              {section.items.map(item => {
                if (!canAccess(item.id)) return null
                const isActive = activeModule === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => handleClick(item.id)}
                    className="w-full flex items-center gap-[9px] px-3 py-2 mx-2 rounded-[9px] text-[13px] font-medium transition-all cursor-pointer text-left"
                    style={{
                      width:        'calc(100% - 16px)',
                      background:   isActive ? 'rgba(99,102,241,.15)' : 'transparent',
                      border:       isActive ? '1px solid rgba(99,102,241,.2)' : '1px solid transparent',
                      color:        isActive ? 'var(--accent)' : 'var(--muted)',
                      marginBottom: '1px',
                    }}
                  >
                    <span className="w-[15px] h-[15px] flex-shrink-0" style={{ opacity: isActive ? 1 : 0.8 }}>
                      {item.icon}
                    </span>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className={`text-[9px] px-[7px] py-[2px] rounded-full font-bold ${badgeStyles[item.badgeColor || 'accent']}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-[11px] font-bold"
              style={{ background: 'var(--gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              Plan {plan}
            </span>
            <span className="text-[10px] px-2 py-[2px] rounded-full font-semibold" style={{ background: 'rgba(16,185,129,.1)', color: 'var(--green)' }}>
              Activo
            </span>
          </div>
          <button
            className="w-full py-[9px] rounded-[9px] text-white text-xs font-bold transition-all"
            style={{ background: 'var(--gradient)', boxShadow: '0 0 15px rgba(99,102,241,.25)' }}
            onClick={() => {
              if (onLogout) { onLogout() } else { sessionStorage.clear(); window.location.href = '/' }
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  )
}

// ── Icons ──────────────────────────────────────────────────────────────────────
function BillingIcon()   { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full"><rect x="2" y="1" width="12" height="14" rx="1.5"/><path d="M5 5h6M5 8h6M5 11h3"/></svg> }
function GridIcon()      { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full"><rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg> }
function AIIcon()        { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full"><circle cx="8" cy="8" r="6"/><path d="M6 6c0-1.1.9-2 2-2s2 .9 2 2c0 1-1 1.5-2 2"/><circle cx="8" cy="12" r=".5" fill="currentColor"/></svg> }
function POSIcon()       { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full"><rect x="2" y="3" width="12" height="10" rx="1.5"/><path d="M5 7h6M5 10h3"/></svg> }
function CashIcon()      { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full"><rect x="1" y="5" width="14" height="9" rx="1.5"/><path d="M5 5V3.5a3 3 0 016 0V5"/><circle cx="8" cy="9.5" r="1.5"/></svg> }
function BoxIcon()       { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full"><path d="M2 4l6-2 6 2v8l-6 2-6-2V4z"/><path d="M8 2v12M2 4l6 2 6-2"/></svg> }
function PharmaIcon()    { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full"><rect x="5" y="1" width="6" height="3" rx="1"/><rect x="2" y="4" width="12" height="11" rx="1.5"/><path d="M8 7v4M6 9h4"/></svg> }
function StoreIcon()     { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full"><path d="M2 2h12l-1.5 6H3.5L2 2z"/><circle cx="6" cy="13" r="1.5"/><circle cx="11" cy="13" r="1.5"/></svg> }
function CatalogIcon()   { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full"><rect x="2" y="2" width="12" height="12" rx="1.5"/><path d="M5 6h6M5 9h4"/></svg> }
function EmailIcon()     { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full"><path d="M14 3H2a1 1 0 00-1 1v7a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1z"/><path d="M1 4l7 4 7-4"/></svg> }
function UsersIcon()     { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full"><circle cx="6" cy="5" r="2.5"/><path d="M1 13c0-2.76 2.24-5 5-5s5 2.24 5 5"/><circle cx="12" cy="5" r="2"/><path d="M15 13c0-1.66-1.34-3-3-3"/></svg> }
function ChartIcon()     { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full"><path d="M3 12V8M6 12V5M9 12V7M12 12V4"/><path d="M1 14h14"/></svg> }
function UserIcon()      { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full"><circle cx="8" cy="5" r="3"/><path d="M2 14c0-3.31 2.69-6 6-6s6 2.69 6 6"/></svg> }
function SettingsIcon()  { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full"><circle cx="8" cy="8" r="2.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2"/></svg> }
function LeadsIcon()     { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full"><path d="M3 12V5l5-3 5 3v7l-5 3-5-3z"/><path d="M8 2v13M3 5l5 3 5-3"/></svg> }
function PurchasesIcon() { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full"><path d="M2 2h2l2 7h6l2-5H6"/><circle cx="7" cy="13" r="1"/><circle cx="12" cy="13" r="1"/></svg> }
function AutoIcon()      { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full"><path d="M8 1v4M8 11v4M1 8h4M11 8h4"/><circle cx="8" cy="8" r="3"/></svg> }
