'use client'
import { useState, useEffect } from 'react'
import { useReportData, StockAlertRow } from '../hooks/useReportData'
import { useExpiryAlerts } from '@/modules/pharma/hooks/usePharma'
import { pharmaService } from '@/modules/pharma/services/pharma.service'

interface Props {
  orgId: string
}

export function StockReport({ orgId }: Props) {
  const [stockAlerts, setStockAlerts] = useState<StockAlertRow[]>([])
  const { loading: loadingStock, fetchStockAlerts } = useReportData(orgId)
  const { batches: expiringBatches, loading: loadingExpiry } = useExpiryAlerts(orgId, 30)

  useEffect(() => {
    fetchStockAlerts().then(setStockAlerts)
  }, [orgId]) // eslint-disable-line

  const loading = loadingStock || loadingExpiry

  return (
    <div className="flex flex-col gap-[14px]">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-[8px]">
        {[
          { label: 'Stock crítico',    value: stockAlerts.filter(p => p.stock === 0).length,  color: 'var(--red)'   },
          { label: 'Stock bajo',       value: stockAlerts.filter(p => p.stock > 0).length,    color: 'var(--amber)' },
          { label: 'Lotes por vencer', value: expiringBatches.length,                         color: 'var(--blue)'  },
        ].map(m => (
          <div key={m.label} className="px-[14px] py-[12px] rounded-[11px]"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="text-[10px] font-bold uppercase tracking-[.5px]" style={{ color: 'var(--muted)' }}>{m.label}</div>
            <div className="text-[24px] font-extrabold" style={{ color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Stock crítico */}
      <div className="rounded-[11px] overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <div className="px-[14px] py-[10px]" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
          <span className="text-[12px] font-bold" style={{ color: 'var(--text)' }}>🚨 Productos con stock bajo o agotado</span>
        </div>
        {loading ? (
          <div className="flex justify-center py-[20px]">
            <span className="w-[14px] h-[14px] rounded-full border-2 animate-spin"
              style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
          </div>
        ) : stockAlerts.length === 0 ? (
          <div className="text-center py-[20px] text-[12px]" style={{ color: 'var(--sub)' }}>
            Sin productos en stock crítico ✅
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]" style={{ minWidth: '400px' }}>
              <thead>
                <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                  {['Código', 'Producto', 'Categoría', 'Stock', 'Mínimo'].map(h => (
                    <th key={h} className="px-[12px] py-[8px] text-left font-bold uppercase tracking-[.5px]"
                      style={{ color: 'var(--sub)', fontSize: '10px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stockAlerts.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(30,45,69,.4)' }}>
                    <td className="px-[12px] py-[8px] font-mono text-[10px]" style={{ color: 'var(--muted)' }}>{p.code}</td>
                    <td className="px-[12px] py-[8px] font-bold" style={{ color: 'var(--text)' }}>{p.name}</td>
                    <td className="px-[12px] py-[8px]">
                      <span className="px-[6px] py-[2px] rounded-full text-[10px]"
                        style={{ background: 'rgba(6,182,212,.1)', color: 'var(--accent2)' }}>
                        {p.category ?? 'General'}
                      </span>
                    </td>
                    <td className="px-[12px] py-[8px] font-extrabold"
                      style={{ color: p.stock === 0 ? 'var(--red)' : 'var(--amber)' }}>
                      {p.stock}
                    </td>
                    <td className="px-[12px] py-[8px]" style={{ color: 'var(--muted)' }}>{p.min_stock ?? 5}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lotes por vencer */}
      <div className="rounded-[11px] overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <div className="px-[14px] py-[10px]" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
          <span className="text-[12px] font-bold" style={{ color: 'var(--text)' }}>⏰ Lotes próximos a vencer (30 días)</span>
        </div>
        {expiringBatches.length === 0 ? (
          <div className="text-center py-[20px] text-[12px]" style={{ color: 'var(--sub)' }}>
            Sin lotes próximos a vencer ✅
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]" style={{ minWidth: '480px' }}>
              <thead>
                <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                  {['Producto', 'Lote', 'Vencimiento', 'Cantidad', 'Estado'].map(h => (
                    <th key={h} className="px-[12px] py-[8px] text-left font-bold uppercase tracking-[.5px]"
                      style={{ color: 'var(--sub)', fontSize: '10px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {expiringBatches.map(b => {
                  const level = pharmaService.classifyExpiry(b.days_left)
                  const color = level === 'expired' || level === 'critical' ? 'var(--red)' : 'var(--amber)'
                  return (
                    <tr key={b.batch_id} style={{ borderBottom: '1px solid rgba(30,45,69,.4)' }}>
                      <td className="px-[12px] py-[8px] font-bold" style={{ color: 'var(--text)' }}>{b.product_name}</td>
                      <td className="px-[12px] py-[8px] font-mono text-[10px]" style={{ color: 'var(--muted)' }}>{b.batch_number}</td>
                      <td className="px-[12px] py-[8px]" style={{ color: 'var(--muted)' }}>
                        {new Date(b.expiry_date).toLocaleDateString('es-PE')}
                      </td>
                      <td className="px-[12px] py-[8px]" style={{ color: 'var(--text)' }}>{b.quantity}</td>
                      <td className="px-[12px] py-[8px] font-bold" style={{ color }}>
                        {b.days_left <= 0 ? 'Vencido' : `${b.days_left} días`}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
