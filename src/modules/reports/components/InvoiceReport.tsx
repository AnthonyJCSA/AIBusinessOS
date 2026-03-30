'use client'
import { useState, useEffect } from 'react'
import { useReportData, InvoiceReportRow, ReportFilters } from '../hooks/useReportData'

interface Props {
  orgId: string
}

const TYPE_STYLE: Record<string, { color: string; bg: string }> = {
  BOLETA:       { color: 'var(--blue)',  bg: 'rgba(59,130,246,.1)'  },
  FACTURA:      { color: 'var(--accent)',bg: 'rgba(99,102,241,.1)'  },
  NOTA_CREDITO: { color: 'var(--amber)', bg: 'rgba(245,158,11,.1)'  },
  NOTA_DEBITO:  { color: 'var(--red)',   bg: 'rgba(239,68,68,.1)'   },
}
const SUNAT_STYLE: Record<string, { color: string }> = {
  ACEPTADA:  { color: 'var(--green)' },
  PENDIENTE: { color: 'var(--amber)' },
  RECHAZADA: { color: 'var(--red)'   },
}

function today() { return new Date().toISOString().slice(0, 10) }
function monthStart() {
  const d = new Date(); d.setDate(1)
  return d.toISOString().slice(0, 10)
}

export function InvoiceReport({ orgId }: Props) {
  const [filters, setFilters] = useState<ReportFilters>({ startDate: monthStart(), endDate: today() })
  const [rows, setRows]       = useState<InvoiceReportRow[]>([])
  const [typeFilter, setTypeFilter] = useState<string>('ALL')
  const { loading, fetchInvoices }  = useReportData(orgId)

  useEffect(() => {
    fetchInvoices(filters).then(setRows)
  }, [filters]) // eslint-disable-line

  const filtered = typeFilter === 'ALL' ? rows : rows.filter(r => r.type === typeFilter)

  const totalBoletas  = rows.filter(r => r.type === 'BOLETA').length
  const totalFacturas = rows.filter(r => r.type === 'FACTURA').length
  const totalAmount   = rows.reduce((s, r) => s + Number(r.total), 0)
  const withRuc       = rows.filter(r => r.client_doc_type === 'RUC').length

  return (
    <div className="flex flex-col gap-[12px]">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[8px]">
        {[
          { label: 'Total emitido',  value: `S/ ${totalAmount.toFixed(2)}`, color: 'var(--green)' },
          { label: 'Boletas',        value: String(totalBoletas),            color: 'var(--blue)'  },
          { label: 'Facturas',       value: String(totalFacturas),           color: 'var(--accent)'},
          { label: 'Con RUC',        value: String(withRuc),                 color: 'var(--amber)' },
        ].map(m => (
          <div key={m.label} className="px-[14px] py-[12px] rounded-[11px]"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="text-[10px] font-bold uppercase tracking-[.5px]" style={{ color: 'var(--muted)' }}>{m.label}</div>
            <div className="text-[22px] font-extrabold" style={{ color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-end gap-[8px] px-[12px] py-[10px] rounded-[9px]"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex flex-col gap-[4px]">
          <label className="text-[10px] font-bold uppercase tracking-[.5px]" style={{ color: 'var(--muted)' }}>Desde</label>
          <input type="date" className="fi-dark" value={filters.startDate}
            onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))} />
        </div>
        <div className="flex flex-col gap-[4px]">
          <label className="text-[10px] font-bold uppercase tracking-[.5px]" style={{ color: 'var(--muted)' }}>Hasta</label>
          <input type="date" className="fi-dark" value={filters.endDate}
            onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))} />
        </div>
        <div className="flex gap-[5px]">
          {['ALL', 'BOLETA', 'FACTURA'].map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className="px-[10px] py-[6px] rounded-[7px] text-[11px] font-bold transition-all"
              style={{
                background: typeFilter === t ? 'rgba(99,102,241,.15)' : 'transparent',
                border:     `1px solid ${typeFilter === t ? 'rgba(99,102,241,.4)' : 'var(--border)'}`,
                color:      typeFilter === t ? 'var(--accent)' : 'var(--muted)',
              }}>
              {t === 'ALL' ? 'Todos' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-[11px] overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]" style={{ minWidth: '600px' }}>
            <thead>
              <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                {['Comprobante', 'Tipo', 'Cliente', 'Doc', 'Total', 'SUNAT', 'Fecha'].map(h => (
                  <th key={h} className="px-[12px] py-[8px] text-left font-bold uppercase tracking-[.5px]"
                    style={{ color: 'var(--sub)', fontSize: '10px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-[12px] py-[20px] text-center text-[11px]" style={{ color: 'var(--sub)' }}>
                  Cargando...
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-[12px] py-[20px] text-center text-[11px]" style={{ color: 'var(--sub)' }}>
                  Sin comprobantes en el período
                </td></tr>
              ) : filtered.map(r => {
                const ts = TYPE_STYLE[r.type]  ?? { color: 'var(--muted)', bg: 'var(--surface)' }
                const ss = SUNAT_STYLE[r.sunat_status] ?? { color: 'var(--muted)' }
                const date = new Date(r.created_at).toLocaleDateString('es-PE')
                return (
                  <tr key={r.id} style={{ borderBottom: '1px solid rgba(30,45,69,.4)' }}>
                    <td className="px-[12px] py-[9px] font-mono font-bold" style={{ color: 'var(--text)' }}>
                      {r.invoice_number}
                    </td>
                    <td className="px-[12px] py-[9px]">
                      <span className="px-[7px] py-[2px] rounded-full text-[10px] font-bold"
                        style={{ background: ts.bg, color: ts.color }}>{r.type}</span>
                    </td>
                    <td className="px-[12px] py-[9px] max-w-[140px] truncate" style={{ color: 'var(--text)' }}>
                      {r.client_name}
                    </td>
                    <td className="px-[12px] py-[9px] font-mono text-[10px]" style={{ color: 'var(--muted)' }}>
                      {r.client_doc_type ? `${r.client_doc_type}: ${r.client_doc}` : '—'}
                    </td>
                    <td className="px-[12px] py-[9px] font-bold" style={{ color: 'var(--green)' }}>
                      S/ {Number(r.total).toFixed(2)}
                    </td>
                    <td className="px-[12px] py-[9px] font-bold" style={{ color: ss.color }}>
                      {r.sunat_status}
                    </td>
                    <td className="px-[12px] py-[9px]" style={{ color: 'var(--muted)' }}>{date}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
