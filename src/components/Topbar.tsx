'use client'

import NotificationsPanel from '@/app/NotificationsPanel'

interface TopbarProps {
  activeModule: string
  cajaOpen: boolean
  onHamburger: () => void
  onAIClick: () => void
  onCatalogClick: () => void
}

const screenTitles: Record<string, string> = {
  dashboard:      'Dashboard',
  asistente:      'Asistente IA',
  pos:            'Punto de Venta',
  cash:           'Gestión de Caja',
  inventory:      'Inventario',
  purchases:      'Compras',
  leads:          'Pipeline',
  automations:    'Automatizaciones',
  store:          'Tienda Virtual',
  catalog:        'Catálogo',
  communications: 'Comunicaciones',
  customers:      'Clientes',
  reports:        'Reportes',
  users:          'Usuarios',
  settings:       'Configuración',
  billing:        'Facturación',
}

export default function Topbar({ activeModule, cajaOpen, onHamburger, onAIClick, onCatalogClick }: TopbarProps) {
  const title = screenTitles[activeModule] || activeModule

  return (
    <div
      className="flex items-center justify-between gap-4 px-6 flex-shrink-0"
      style={{ height: '64px', background: 'var(--sidebar)', borderBottom: '1px solid var(--border)' }}
    >
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onHamburger}
          className="md:hidden w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:bg-gray-700"
          style={{ color: 'var(--text)' }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>{title}</h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <button
          onClick={onAIClick}
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
          style={{ background: 'var(--accent)', color: '#FFFFFF' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          Asistente IA
        </button>

        <div
          className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap"
          style={cajaOpen
            ? { background: 'rgba(16,185,129,.15)', color: 'var(--green)' }
            : { background: 'rgba(239,68,68,.15)',  color: 'var(--red)'   }
          }
        >
          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: cajaOpen ? 'var(--green)' : 'var(--red)' }} />
          {cajaOpen ? 'Caja Abierta' : 'Caja Cerrada'}
        </div>

        <NotificationsPanel />

        <button
          onClick={onCatalogClick}
          className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:bg-gray-700"
          style={{ color: 'var(--muted)' }}
          title="Catálogo digital"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </button>
      </div>
    </div>
  )
}
