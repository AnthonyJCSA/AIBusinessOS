'use client'

import { canAccessModule } from '@/lib/permissions'

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
        <div className="px-4 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl font-bold text-white"
              style={{ background: 'var(--accent)' }}
            >
              C
            </div>
            <div>
              <div className="text-base font-semibold" style={{ color: 'var(--text)' }}>
                Coriva Core
              </div>
              <div className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
                Business OS
              </div>
            </div>
          </div>
        </div>

        {/* User card */}
        <div className="mx-3 my-3 p-3 rounded-lg" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold text-white"
              style={{ background: 'var(--accent)' }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{currentUser?.full_name || 'Usuario'}</div>
              <div className="text-xs truncate" style={{ color: 'var(--muted)' }}>{currentUser?.role}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-2 overflow-y-auto touch-scroll">
          {navSections.map(section => (
            <div key={section.label} className="mb-4">
              <div
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--muted)' }}
              >
                {section.label}
              </div>
              {section.items.map(item => {
                if (!canAccessModule(currentUser?.role, item.id)) return null
                const isActive = activeModule === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => handleClick(item.id)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all text-left"
                    style={{
                      background:   isActive ? 'var(--accent)' : 'transparent',
                      color:        isActive ? '#FFFFFF' : 'var(--muted)',
                    }}
                  >
                    <span className="w-5 h-5 flex-shrink-0">
                      {item.icon}
                    </span>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="text-xs px-2 py-0.5 rounded-md font-medium" style={{
                        background: isActive ? 'rgba(255,255,255,0.2)' : 'var(--surface)',
                        color: isActive ? '#FFFFFF' : 'var(--muted)'
                      }}>
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
        <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
              Plan {plan}
            </span>
            <span className="text-xs px-2 py-1 rounded-md font-medium" style={{ background: 'rgba(16,185,129,.1)', color: 'var(--green)' }}>
              Activo
            </span>
          </div>
          <button
            className="w-full py-2.5 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90"
            style={{ background: 'var(--accent)' }}
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
