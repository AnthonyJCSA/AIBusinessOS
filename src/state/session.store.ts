import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Organization } from '@/types'

interface SessionState {
  user: User | null
  org: Organization | null
  isAuthenticated: boolean
  setSession: (user: User, org: Organization) => void
  updateOrg: (org: Organization) => void
  clearSession: () => void
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      org: null,
      isAuthenticated: false,
      setSession: (user, org) => set({ user, org, isAuthenticated: true }),
      updateOrg: (org) => set({ org }),
      clearSession: () => set({ user: null, org: null, isAuthenticated: false }),
    }),
    {
      name: 'coriva-session',
      // Solo persistir en localStorage, no en sessionStorage
      // Así la sesión sobrevive al cerrar y reabrir la pestaña
    }
  )
)
