'use client'
import { useFeatureFlag, usePlan } from '@/shared/hooks/useFeatureFlag'

interface FeatureGateProps {
  flag: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

function DefaultUpgradePrompt({ flag }: { flag: string }) {
  const plan = usePlan()
  const planLabels: Record<string, string> = {
    starter: 'Pro',
    pro: 'Premium',
  }
  const requiredPlan = planLabels[plan] ?? 'Pro'

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8">
      <div className="text-5xl">🔒</div>
      <div className="text-center">
        <div className="text-lg font-extrabold mb-2" style={{ color: 'var(--text)' }}>
          Módulo disponible en Plan {requiredPlan}
        </div>
        <div className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
          Actualiza tu plan para desbloquear esta funcionalidad y hacer crecer tu negocio.
        </div>
        <button
          className="px-6 py-3 rounded-xl text-sm font-bold text-white transition-all"
          style={{ background: 'var(--gradient)' }}
          onClick={() => window.location.href = '/configuracion?tab=billing'}
        >
          Ver planes y precios →
        </button>
      </div>
    </div>
  )
}

export function FeatureGate({ flag, children, fallback }: FeatureGateProps) {
  const isEnabled = useFeatureFlag(flag)
  if (isEnabled) return <>{children}</>
  return <>{fallback ?? <DefaultUpgradePrompt flag={flag} />}</>
}
