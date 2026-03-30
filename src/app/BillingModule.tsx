'use client'

import { useState } from 'react'
import { InvoiceHistory }  from '@/modules/billing/components/InvoiceHistory'
import { InvoiceReport }   from '@/modules/reports/components/InvoiceReport'
import { useFeatureFlag }  from '@/shared/hooks/useFeatureFlag'

type Tab = 'historial' | 'reporte' | 'series'

export default function BillingModule({ currentOrg }: { currentOrg: any }) {
  const [tab, setTab] = useState<Tab>('historial')
  const hasBilling    = useFeatureFlag('billing')

  if (!hasBilling) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 p-8">
        <div className="text-5xl">🔒</div>
        <div className="text-base font-bold" style={{ color: 'var(--text)' }}>
          Facturación electrónica requiere plan Premium
        </div>
        <div className="text-sm text-center" style={{ color: 'var(--muted)', maxWidth: '320px' }}>
          Emite boletas y facturas electrónicas conectadas a SUNAT vía Nubefact.
        </div>
        <a href="/precios"
          className="px-5 py-[10px] rounded-[9px] text-sm font-bold text-white"
          style={{ background: 'var(--gradient)' }}>
          Ver planes →
        </a>
      </div>
    )
  }

  const orgId = currentOrg?.id

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: 'historial', label: 'Comprobantes',  icon: '🧾' },
    { key: 'reporte',   label: 'Reporte',        icon: '📊' },
    { key: 'series',    label: 'Series',          icon: '⚙️' },
  ]

  return (
    <div className="p-5 animate-fade-up flex flex-col gap-[14px]">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-base font-extrabold" style={{ color: 'var(--text)' }}>
            Facturación Electrónica
          </div>
          <div className="text-[11px]" style={{ color: 'var(--muted)' }}>
            Vía Nubefact · SUNAT
          </div>
        </div>
        <span className="px-[8px] py-[3px] rounded-full text-[10px] font-bold"
          style={{ background: 'rgba(16,185,129,.1)', color: 'var(--green)', border: '1px solid rgba(16,185,129,.2)' }}>
          ● Conectado
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-[5px] p-[4px] rounded-[10px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="flex-1 py-[7px] rounded-[7px] text-[11px] font-bold transition-all"
            style={{
              background: tab === t.key ? 'var(--card)' : 'transparent',
              color:      tab === t.key ? 'var(--text)' : 'var(--muted)',
              boxShadow:  tab === t.key ? '0 1px 4px rgba(0,0,0,.15)' : 'none',
            }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      {tab === 'historial' && orgId && (
        <InvoiceHistory orgId={orgId} />
      )}

      {tab === 'reporte' && orgId && (
        <InvoiceReport orgId={orgId} />
      )}

      {tab === 'series' && (
        <SeriesConfig orgId={orgId} />
      )}
    </div>
  )
}

// ── Series config — informativo hasta tener UI de CRUD ───────────────────────
function SeriesConfig({ orgId }: { orgId: string }) {
  return (
    <div className="flex flex-col gap-[10px]">
      <div className="px-[14px] py-[12px] rounded-[11px]"
        style={{ background: 'rgba(99,102,241,.06)', border: '1px solid rgba(99,102,241,.2)' }}>
        <div className="text-[12px] font-bold mb-[4px]" style={{ color: 'var(--text)' }}>
          Configuración de series
        </div>
        <div className="text-[11px]" style={{ color: 'var(--muted)' }}>
          Las series se configuran en Supabase directamente en la tabla{' '}
          <code className="font-mono px-[4px] py-[1px] rounded-[4px]"
            style={{ background: 'var(--surface)', color: 'var(--accent)' }}>
            corivacore_invoice_series
          </code>.
          Agrega una fila con tu <code className="font-mono" style={{ color: 'var(--accent)' }}>org_id</code>,
          tipo (BOLETA / FACTURA) y serie (B001 / F001).
        </div>
      </div>

      <div className="flex flex-col gap-[6px]">
        {[
          { type: 'BOLETA',  series: 'B001', example: 'B001-00000001' },
          { type: 'FACTURA', series: 'F001', example: 'F001-00000001' },
        ].map(s => (
          <div key={s.type} className="flex items-center gap-[12px] px-[14px] py-[10px] rounded-[9px]"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="flex-1">
              <div className="text-[12px] font-bold" style={{ color: 'var(--text)' }}>{s.type}</div>
              <div className="text-[10px] font-mono" style={{ color: 'var(--muted)' }}>{s.example}</div>
            </div>
            <span className="text-[11px] font-bold font-mono px-[8px] py-[3px] rounded-[6px]"
              style={{ background: 'rgba(99,102,241,.1)', color: 'var(--accent)' }}>
              {s.series}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
