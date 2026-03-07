'use client'

import { useState } from 'react'
import { canAccessModule } from '@/lib/permissions'

interface MobileNavProps {
  currentUser: any
  activeModule: string
  setActiveModule: (module: string) => void
}

export default function MobileNav({ currentUser, activeModule, setActiveModule }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)

  const modules = [
    { id: 'pos', icon: '💰', label: 'Punto de Venta' },
    { id: 'cash', icon: '💵', label: 'Caja' },
    { id: 'inventory', icon: '📦', label: 'Inventario' },
    { id: 'reports', icon: '📈', label: 'Reportes' },
    { id: 'customers', icon: '👥', label: 'Clientes' },
    { id: 'users', icon: '👤', label: 'Usuarios' },
    { id: 'settings', icon: '⚙️', label: 'Configuración' }
  ]

  const handleModuleClick = (moduleId: string) => {
    setActiveModule(moduleId)
    setIsOpen(false)
  }

  return (
    <>
      {/* Desktop Navigation - Hidden on mobile */}
      <div className="hidden md:flex space-x-2 overflow-x-auto pb-2">
        {modules.map(module => (
          canAccessModule(currentUser?.role, module.id) && (
            <button
              key={module.id}
              onClick={() => setActiveModule(module.id)}
              className={`px-4 py-2 rounded text-sm font-medium transition-all whitespace-nowrap ${
                activeModule === module.id 
                  ? 'bg-white text-blue-600' 
                  : 'bg-white bg-opacity-20 hover:bg-opacity-30'
              }`}
            >
              {module.icon} {module.label}
            </button>
          )
        ))}
      </div>

      {/* Mobile Navigation - Hamburger Menu */}
      <div className="md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span className="text-sm font-medium">Menú</span>
        </button>

        {/* Mobile Menu Overlay */}
        {isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setIsOpen(false)}>
            <div 
              className="absolute top-0 left-0 w-64 h-full bg-gradient-to-br from-blue-600 to-purple-600 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-white font-bold text-lg">Menú</h3>
                  <button onClick={() => setIsOpen(false)} className="text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-2">
                  {modules.map(module => (
                    canAccessModule(currentUser?.role, module.id) && (
                      <button
                        key={module.id}
                        onClick={() => handleModuleClick(module.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                          activeModule === module.id
                            ? 'bg-white text-blue-600 font-semibold'
                            : 'text-white hover:bg-white hover:bg-opacity-20'
                        }`}
                      >
                        <span className="mr-2">{module.icon}</span>
                        {module.label}
                      </button>
                    )
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
