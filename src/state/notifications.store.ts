import { create } from 'zustand'

export interface AppNotification {
  id: string
  type: 'stock_alert' | 'insight' | 'task' | 'sale' | 'system'
  title: string
  body: string
  severity: 'info' | 'warning' | 'critical'
  isRead: boolean
  createdAt: string
  metadata?: Record<string, any>
}

interface NotificationsState {
  notifications: AppNotification[]
  unreadCount: () => number
  add: (n: Omit<AppNotification, 'id' | 'isRead' | 'createdAt'>) => void
  markRead: (id: string) => void
  markAllRead: () => void
  remove: (id: string) => void
  clear: () => void
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: () => get().notifications.filter((n) => !n.isRead).length,
  add: (n) =>
    set((s) => ({
      notifications: [
        { ...n, id: `notif_${Date.now()}_${Math.random().toString(36).slice(2)}`, isRead: false, createdAt: new Date().toISOString() },
        ...s.notifications,
      ].slice(0, 50),
    })),
  markRead: (id) => set((s) => ({ notifications: s.notifications.map((n) => n.id === id ? { ...n, isRead: true } : n) })),
  markAllRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, isRead: true })) })),
  remove: (id) => set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),
  clear: () => set({ notifications: [] }),
}))
