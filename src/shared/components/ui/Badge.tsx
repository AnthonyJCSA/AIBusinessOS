interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'
  size?: 'sm' | 'md'
}

const variants = {
  default: { bg: 'rgba(99,102,241,.15)',  color: 'var(--accent)' },
  success: { bg: 'rgba(16,185,129,.1)',   color: 'var(--green)' },
  warning: { bg: 'rgba(245,158,11,.1)',   color: 'var(--amber)' },
  danger:  { bg: 'rgba(239,68,68,.1)',    color: 'var(--red)' },
  info:    { bg: 'rgba(6,182,212,.1)',    color: 'var(--accent2)' },
  purple:  { bg: 'rgba(139,92,246,.15)', color: '#a78bfa' },
}

const sizes = {
  sm: 'text-[9px] px-1.5 py-0.5',
  md: 'text-[10px] px-2 py-[3px]',
}

export function Badge({ children, variant = 'default', size = 'md' }: BadgeProps) {
  const v = variants[variant]
  return (
    <span
      className={`rounded-full font-bold inline-flex items-center ${sizes[size]}`}
      style={{ background: v.bg, color: v.color }}
    >
      {children}
    </span>
  )
}
