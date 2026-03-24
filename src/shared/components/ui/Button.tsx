'use client'
import { type ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const variants = {
  primary:   'bg-[var(--gradient)] text-white shadow-[0_0_20px_rgba(99,102,241,.3)]',
  secondary: 'bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)]',
  danger:    'bg-transparent border border-[var(--border)] text-[var(--red)]',
  ghost:     'bg-transparent text-[var(--muted)] hover:text-[var(--text)]',
  success:   'bg-[rgba(16,185,129,.9)] text-white',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      style={variant === 'primary' ? { background: 'var(--gradient)' } : undefined}
      {...props}
    >
      {loading ? '⏳ Cargando...' : children}
    </button>
  )
}
