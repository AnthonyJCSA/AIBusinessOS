interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon = '📭', title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="text-4xl opacity-30">{icon}</div>
      <div className="text-sm font-bold" style={{ color: 'var(--text)' }}>{title}</div>
      {description && (
        <div className="text-xs text-center max-w-xs" style={{ color: 'var(--muted)' }}>
          {description}
        </div>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
