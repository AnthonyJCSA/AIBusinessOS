'use client'

import { useState } from 'react'
import { useNotificationsStore } from '@/state/notifications.store'

const ICONS: Record<string, string> = {
  stock_alert: '📦',
  insight:     '🤖',
  task:        '✅',
  sale:        '💰',
  system:      'ℹ️',
}

const SEVERITY_STYLE: Record<string, string> = {
  critical: 'bg-red-500/10 border-red-500/20 text-red-400',
  warning:  'bg-amber-500/10 border-amber-500/20 text-amber-400',
  info:     'bg-blue-500/10 border-blue-500/20 text-blue-400',
}

export default function NotificationsPanel() {
  const { notifications, unreadCount, markRead, markAllRead, remove } = useNotificationsStore()
  const [open, setOpen] = useState(false)
  const count = unreadCount()

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all"
        style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--muted)' }}
        title="Notificaciones"
      >
        🔔
        {count > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
            style={{ background: 'var(--red)' }}>
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden"
            style={{ background: 'var(--card)', border: '1px solid var(--border2)', maxHeight: '480px' }}>

            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <div>
                <div className="text-sm font-bold" style={{ color: 'var(--text)' }}>Notificaciones</div>
                <div className="text-[10px]" style={{ color: 'var(--muted)' }}>{count} sin leer</div>
              </div>
              {count > 0 && (
                <button onClick={markAllRead} className="text-[10px] font-semibold" style={{ color: 'var(--accent)' }}>
                  Marcar todas
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="text-3xl mb-2">📭</div>
                  <div className="text-xs" style={{ color: 'var(--muted)' }}>Sin notificaciones</div>
                </div>
              ) : notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-white/5"
                  style={{
                    borderBottom: '1px solid var(--border)',
                    background: n.isRead ? 'transparent' : 'rgba(99,102,241,.04)',
                  }}
                >
                  <span className="text-lg flex-shrink-0 mt-0.5">{ICONS[n.type] || 'ℹ️'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{n.title}</div>
                      <button
                        onClick={e => { e.stopPropagation(); remove(n.id) }}
                        className="text-[10px] flex-shrink-0 opacity-40 hover:opacity-100"
                        style={{ color: 'var(--muted)' }}
                      >✕</button>
                    </div>
                    <div className="text-[10px] mt-0.5 leading-relaxed" style={{ color: 'var(--muted)' }}>{n.body}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${SEVERITY_STYLE[n.severity]}`}>
                        {n.severity}
                      </span>
                      <span className="text-[9px]" style={{ color: 'var(--sub)' }}>
                        {new Date(n.createdAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
