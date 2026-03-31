'use client'

import { useState, useEffect } from 'react'

interface OPPFStats {
  totalProducts: number
  productsWithDigemidCode: number
  productsInStock: number
  productsReportable: number
}

export function OPPFReport({ orgId }: { orgId: string }) {
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<OPPFStats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())

  useEffect(() => {
    loadStats()
  }, [orgId]) // eslint-disable-line

  async function loadStats() {
    try {
      const res = await fetch('/api/reports/oppf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId })
      })
      const data = await res.json()
      
      if (!data.valid) {
        setError(data.message || 'Configuración incompleta')
        return
      }
      
      setStats(data.stats)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Error al cargar estadísticas')
    }
  }

  async function downloadReport() {
    setLoading(true)
    try {
      const url = `/api/reports/oppf?orgId=${orgId}&month=${month}&year=${year}`
      const res = await fetch(url)
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al generar reporte')
      }

      const blob = await res.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = `OPPF_${year}_${String(month).padStart(2, '0')}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(downloadUrl)
    } catch (err: any) {
      alert(err.message || 'Error al descargar reporte')
    } finally {
      setLoading(false)
    }
  }

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  return (
    <div className="flex flex-col gap-[14px]">
      {/* Banner */}
      <div className="flex items-center gap-[14px] px-[18px] py-[14px] rounded-xl"
        style={{ background: 'linear-gradient(135deg,rgba(139,92,246,.12),rgba(99,102,241,.08))', border: '1px solid rgba(139,92,246,.25)' }}>
        <div className="w-9 h-9 rounded-[9px] flex items-center justify-center text-base flex-shrink-0"
          style={{ background: 'var(--gradient)' }}>📋</div>
        <div className="flex-1">
          <strong className="text-sm font-bold block" style={{ color: 'var(--text)' }}>
            Reporte OPPF/SNIPPF — DIGEMID
          </strong>
          <span className="text-xs" style={{ color: 'var(--muted)' }}>
            Sistema Nacional de Información de Precios de Productos Farmacéuticos · D.S. N° 014-2011-SA
          </span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-[13px] px-[18px] py-[14px]"
          style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)' }}>
          <div className="flex items-center gap-[10px]">
            <span className="text-lg">⚠️</span>
            <div>
              <strong className="text-sm font-bold block" style={{ color: 'var(--text)' }}>
                Configuración requerida
              </strong>
              <span className="text-xs" style={{ color: 'var(--muted)' }}>{error}</span>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-[10px]">
          {[
            { label: 'Total Productos', value: stats.totalProducts, icon: '📦', color: 'var(--blue)' },
            { label: 'Con Código DIGEMID', value: stats.productsWithDigemidCode, icon: '🏷️', color: 'var(--accent)' },
            { label: 'En Stock', value: stats.productsInStock, icon: '✅', color: 'var(--green)' },
            { label: 'Reportables', value: stats.productsReportable, icon: '📋', color: 'var(--amber)' },
          ].map(m => (
            <div key={m.label} className="rounded-[13px] px-[18px] py-4 relative overflow-hidden"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="absolute right-[-10px] top-[-10px] w-[70px] h-[70px] rounded-full"
                style={{ background: m.color, opacity: 0.06 }} />
              <div className="absolute right-[14px] top-[14px] text-[22px] opacity-35">{m.icon}</div>
              <div className="text-[10px] font-bold uppercase tracking-[.6px]" style={{ color: 'var(--muted)' }}>
                {m.label}
              </div>
              <div className="text-[26px] font-extrabold leading-[1.1] my-[3px]" style={{ color: m.color }}>
                {m.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Generador */}
      <div className="rounded-[13px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>📥 Generar Reporte</span>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
            <div className="flex flex-col gap-[5px]">
              <label className="text-[10px] font-bold uppercase tracking-[.5px]" style={{ color: 'var(--muted)' }}>
                Mes
              </label>
              <select value={month} onChange={e => setMonth(parseInt(e.target.value))}
                className="px-[13px] py-[9px] rounded-[9px] outline-none text-sm"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                {months.map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-[5px]">
              <label className="text-[10px] font-bold uppercase tracking-[.5px]" style={{ color: 'var(--muted)' }}>
                Año
              </label>
              <select value={year} onChange={e => setYear(parseInt(e.target.value))}
                className="px-[13px] py-[9px] rounded-[9px] outline-none text-sm"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                {[2024, 2025, 2026].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <button onClick={downloadReport} disabled={loading || !!error}
              className="self-end px-[18px] py-[9px] rounded-[9px] text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: 'var(--gradient)' }}>
              {loading ? '⏳ Generando...' : '📥 Descargar Excel'}
            </button>
          </div>

          {/* Info */}
          <div className="rounded-[9px] px-[14px] py-[10px]"
            style={{ background: 'rgba(59,130,246,.08)', border: '1px solid rgba(59,130,246,.2)' }}>
            <div className="flex items-start gap-[10px]">
              <span className="text-base flex-shrink-0">ℹ️</span>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>
                <strong style={{ color: 'var(--text)' }}>Formato del archivo:</strong> Excel con 4 columnas (CodEstab, CodProd, Precio1, Precio2).
                Solo se incluyen productos con código DIGEMID y stock disponible.
                <br /><br />
                <strong style={{ color: 'var(--text)' }}>Portal de carga:</strong> opm-digemid.minsa.gob.pe (Login con RUC del establecimiento)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instrucciones */}
      <div className="rounded-[13px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>📖 Instrucciones</span>
        </div>
        <div className="p-4 space-y-3 text-xs" style={{ color: 'var(--muted)' }}>
          <div className="flex gap-[10px]">
            <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{ background: 'var(--accent)', color: 'white' }}>1</span>
            <div>
              <strong style={{ color: 'var(--text)' }}>Configurar código de establecimiento:</strong> Ir a Configuración → Datos del Negocio → Código DIGEMID
            </div>
          </div>
          <div className="flex gap-[10px]">
            <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{ background: 'var(--accent)', color: 'white' }}>2</span>
            <div>
              <strong style={{ color: 'var(--text)' }}>Asignar códigos DIGEMID a productos:</strong> Ir a Inventario → Editar producto → Campo "Código DIGEMID"
            </div>
          </div>
          <div className="flex gap-[10px]">
            <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{ background: 'var(--accent)', color: 'white' }}>3</span>
            <div>
              <strong style={{ color: 'var(--text)' }}>Generar reporte mensual:</strong> Seleccionar mes/año y descargar Excel
            </div>
          </div>
          <div className="flex gap-[10px]">
            <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{ background: 'var(--accent)', color: 'white' }}>4</span>
            <div>
              <strong style={{ color: 'var(--text)' }}>Subir a DIGEMID:</strong> Ingresar a opm-digemid.minsa.gob.pe con RUC y cargar archivo
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
