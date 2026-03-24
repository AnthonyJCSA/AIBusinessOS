interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md'
}

const paddings = { none: '', sm: 'p-3', md: 'p-4' }

export function Card({ children, className = '', padding = 'md' }: CardProps) {
  return (
    <div
      className={`rounded-[13px] overflow-hidden ${paddings[padding]} ${className}`}
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`px-4 py-3 flex items-center justify-between ${className}`}
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      {children}
    </div>
  )
}
