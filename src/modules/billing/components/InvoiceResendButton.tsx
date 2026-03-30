'use client'
import { useState } from 'react'

interface Props {
  invoiceId: string
  onSuccess?: () => void
}

export function InvoiceResendButton({ invoiceId, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function handleResend() {
    setLoading(true)
    setError(null)
    try {
      const res  = await fetch(`/api/invoices/${invoiceId}/resend`, { method: 'POST' })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Error al reenviar')
        return
      }
      setSent(true)
      onSuccess?.()
      setTimeout(() => setSent(false), 3000)
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <span className="px-[8px] py-[4px] rounded-[6px] text-[10px] font-semibold"
        style={{ background: 'rgba(16,185,129,.1)', color: 'var(--green)' }}>
        ✓ Enviado
      </span>
    )
  }

  return (
    <div className="flex flex-col items-end gap-[2px]">
      <button
        onClick={handleResend}
        disabled={loading}
        title="Reenviar por email"
        className="px-[8px] py-[4px] rounded-[6px] text-[10px] font-semibold transition-all disabled:opacity-50"
        style={{ background: 'rgba(99,102,241,.1)', color: 'var(--accent)', border: '1px solid rgba(99,102,241,.2)' }}>
        {loading ? '...' : '✉ Reenviar'}
      </button>
      {error && (
        <span className="text-[9px]" style={{ color: 'var(--red)' }}>{error}</span>
      )}
    </div>
  )
}
