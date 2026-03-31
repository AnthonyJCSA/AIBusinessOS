import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Organization } from '@/types'

/**
 * Session Store - Solo para estado UI
 * La autenticación real está en Supabase Auth (cookies HTTP-only)
 * Este store solo cachea datos del usuario para evitar refetches
 */
interface SessionState {
  user: User | null
  org: Organization | null
  setSession: (user: User, org: Organization) => void
  updateOrg: (org: Organization) => void
  clearSession: () => void
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      org: null,
      setSession: (user, org) => set({ user, org }),
      updateOrg: (org) => set({ org }),
      clearSession: () => set({ user: null, org: null }),
    }),
    { 
      name: 'coriva-session',
      // Solo persistir datos no sensibles
      partialize: (state) => ({
        user: state.user ? {
          id: state.user.id,
          organization_id: state.user.organization_id,
          username: state.user.username,
          email: state.user.email,
          full_name: state.user.full_name,
          role: state.user.role,
        } : null,
        org: state.org,
      }),
    }
  )
)
