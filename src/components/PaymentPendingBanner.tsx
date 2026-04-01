'use client'

import { useRouter } from 'next/navigation'

interface PaymentPendingBannerProps {
  show: boolean
}

export default function PaymentPendingBanner({ show }: PaymentPendingBannerProps) {
  const router = useRouter()

  if (!show) return null

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-[300] py-3 px-4"
      style={{ 
        background: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
        boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
      }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            ⚠️
          </div>
          <div>
            <p className="text-white font-bold text-sm">
              Pago Pendiente
            </p>
            <p className="text-white/90 text-xs">
              Completa tu pago para activar todas las funcionalidades de AI Business OS
            </p>
          </div>
        </div>
        
        <button
          onClick={() => router.push('/registro?step=payment')}
          className="px-6 py-2 rounded-lg font-bold text-sm transition-all flex-shrink-0"
          style={{ 
            background: 'white',
            color: '#DC2626',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = ''
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)'
          }}
        >
          Completar Pago →
        </button>
      </div>
    </div>
  )
}
