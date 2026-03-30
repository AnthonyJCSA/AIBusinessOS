'use client'

interface Props {
  requires: boolean
  isControlled?: boolean
  size?: 'sm' | 'xs'
}

export function PrescriptionBadge({ requires, isControlled, size = 'sm' }: Props) {
  if (!requires && !isControlled) return null

  const px   = size === 'xs' ? 'px-[6px] py-[1px]' : 'px-[8px] py-[2px]'
  const text = size === 'xs' ? 'text-[9px]'         : 'text-[10px]'

  if (isControlled) {
    return (
      <span className={`${px} ${text} rounded-full font-bold flex-shrink-0`}
        style={{ background: 'rgba(239,68,68,.15)', color: 'var(--red)', border: '1px solid rgba(239,68,68,.3)' }}>
        🔴 Controlado
      </span>
    )
  }

  return (
    <span className={`${px} ${text} rounded-full font-bold flex-shrink-0`}
      style={{ background: 'rgba(245,158,11,.12)', color: 'var(--amber)', border: '1px solid rgba(245,158,11,.3)' }}>
      📋 Receta
    </span>
  )
}
