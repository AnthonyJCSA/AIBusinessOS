'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePermissions } from '@/lib/permissions/hooks'

interface ProtectedRouteProps {
  children: React.ReactNode
  module: string
  fallback?: React.ReactNode
}

export function ProtectedRoute({ children, module, fallback }: ProtectedRouteProps) {
  const router = useRouter()
  const { canAccessModule } = usePermissions()
  
  useEffect(() => {
    if (!canAccessModule(module)) {
      router.push('/dashboard')
    }
  }, [canAccessModule, module, router])
  
  if (!canAccessModule(module)) {
    return fallback || null
  }
  
  return <>{children}</>
}
