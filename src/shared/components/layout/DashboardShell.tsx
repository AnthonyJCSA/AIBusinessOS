'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import { useSessionStore } from '@/state/session.store'
import { useRouter } from 'next/navigation'

interface DashboardShellProps {
  children: React.ReactNode
  activeModule?: string
  onNavigate?: (module: string) => void
  cajaOpen?: boolean
  onCatalogClick?: () => void
}

export function DashboardShell({
  children,
  activeModule = 'dashboard',
  onNavigate,
  cajaOpen = false,
  onCatalogClick,
}: DashboardShellProps) {
  const router = useRouter()
  const { user, org, clearSession } = useSessionStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    clearSession()
    router.push('/login')
  }

  const handleNavigate = (module: string) => {
    if (onNavigate) {
      onNavigate(module)
    } else {
      router.push(`/${module === 'dashboard' ? 'dashboard' : module}`)
    }
  }

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: 'var(--bg)', fontFamily: "'Outfit', sans-serif" }}
    >
      <Sidebar
        currentUser={user}
        currentOrg={org}
        activeModule={activeModule}
        setActiveModule={handleNavigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Topbar
          activeModule={activeModule}
          cajaOpen={cajaOpen}
          onHamburger={() => setSidebarOpen(true)}
          onAIClick={() => handleNavigate('asistente')}
          onCatalogClick={onCatalogClick ?? (() => {})}
        />
        <div
          className="flex-1 overflow-y-auto touch-scroll"
          style={{ background: 'var(--bg)' }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
