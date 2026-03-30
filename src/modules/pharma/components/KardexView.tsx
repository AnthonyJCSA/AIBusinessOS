'use client'
import { useState, useEffect } from 'react'
import { pharmaService } from '../services/pharma.service'
import type { KardexRow } from '@/types/pharma.types'

interface Props {
  orgId:       string
  productId:   string
  productName: string
}

const MOVEMENT_STYLE: Record<string, { color: string; icon: string }> = {
  ENTRADA:    { color: 'var(--green)', icon: '↑' },
  SALIDA:     { color: 'var(--red)',   icon: '↓' },
  AJUSTE:     { color: 'var(--blue)',  icon: '⇄' },
  VENCIMIENTO:{ color: 'var(--amber)', icon: '⏰' },
  DEVOLUCION: { color: 'var(--accent)',icon: '↩' },
}

export function KardexView({ orgId, productId, productName }: Props) {
  const [rows, setRows]       = useState<KardexRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    if (!orgId || !productId) return
    setLoading(true)
    pharmaService.getKardex(orgId, productId)
      .then(setRows)
      .catch(e => setError((e as Error).message))
      .finally(() => setLoading(false))
  }, [orgId, productId])

  if (loading) {
    return (
      <div className="flex justify-center py-[20px]">
        <span className="w-[16px] h-[16px] rounded-full border-2 animate-spin"
          style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-[11px] px-[10px] py-[8px] rounded-[7px]"
        style={{ background: 'rgba(239,68,68,.08)', color: 'var(--red)' }}>
        {error}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-[8px]">
      <div className="text-[11px] font-bold uppercase tracking-[.5px]" style={{ color: 'var(--muted)' }}>
        Kardex — {productName}
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-[20px] text-[12px]" style={{ color: 'var(--sub)' }}>
          Sin movimientos registrados
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[9px]" style={{ border: '1px solid var(--border)' }}>
          <table className="w-full text-[11px]" style={{ minWidth: '480px' }}>
            <thead>
              <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                {['Fecha', 'Tipo', 'Lote', 'Cantidad', 'Saldo', 'Referencia'].map(h => (
                  <th key={h} className="px-[12px] py-[8px] text-left font-bold uppercase tracking-[.5px]"
                    style={{ color: 'var(--sub)', fontSize: '10px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(r => {
                const s    = MOVEMENT_STYLE[r.movement_type] ?? { color: 'var(--muted)', icon: '·' }
                const date = new Date(r.created_at).toLocaleString('es-PE', {
                  day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                })
                return (
                  <tr key={r.id} style={{ borderBottom: '1px solid rgba(30,45,69,.4)' }}>
                    <td className="px-[12px] py-[8px]" style={{ color: 'var(--muted)' }}>{date}</td>
                    <td className="px-[12px] py-[8px]">
                      <span className="font-bold" style={{ color: s.color }}>
                        {s.icon} {r.movement_type}
                      </span>
                    </td>
                    <td className="px-[12px] py-[8px] font-mono" style={{ color: 'var(--muted)' }}>
                      {r.batch_number ?? '—'}
                    </td>
                    <td className="px-[12px] py-[8px] font-bold" style={{ color: s.color }}>
                      {r.quantity > 0 ? `+${r.quantity}` : r.quantity}
                    </td>
                    <td className="px-[12px] py-[8px] font-bold" style={{ color: 'var(--text)' }}>
                      {r.balance_after}
                    </td>
                    <td className="px-[12px] py-[8px] text-[10px]" style={{ color: 'var(--sub)' }}>
                      {r.reference_type ?? r.notes ?? '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
