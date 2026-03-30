'use client'

import { useState, useEffect } from 'react'
import { ExpiryAlerts }    from '@/modules/pharma/components/ExpiryAlerts'
import { BatchManager }    from '@/modules/pharma/components/BatchManager'
import { KardexView }      from '@/modules/pharma/components/KardexView'
import { useFeatureFlag }  from '@/shared/hooks/useFeatureFlag'
import { supabase }        from '@/lib/supabase'

interface Props {
  orgId: string
  currentUser: any
}

type Tab = 'alertas' | 'lotes' | 'kardex' | 'recetas'

interface SimpleProduct {
  id: string
  name: string
  code: string
  requires_prescription?: boolean
  is_controlled?: boolean
}

export default function PharmaModule({ orgId, currentUser }: Props) {
  const hasPharma = useFeatureFlag('pharma')
  const [tab, setTab]                       = useState<Tab>('alertas')
  const [products, setProducts]             = useState<SimpleProduct[]>([])
  const [selectedLote, setSelectedLote]     = useState<SimpleProduct | null>(null)
  const [selectedKardex, setSelectedKardex] = useState<SimpleProduct | null>(null)
  const [loadingP, setLoadingP]             = useState(false)

  useEffect(() => {
    if (!orgId || !hasPharma) return
    setLoadingP(true)
    supabase
      .from('corivacore_products')
      .select('id, name, code, requires_prescription, is_controlled')
      .eq('org_id', orgId)
      .eq('is_active', true)
      .order('name')
      .then(({ data }) => {
        setProducts((data ?? []) as SimpleProduct[])
        setLoadingP(false)
      })
  }, [orgId, hasPharma])

  if (!hasPharma) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 p-8">
        <div className="text-5xl">💊</div>
        <div className="text-base font-bold" style={{ color: 'var(--text)' }}>
          Módulo Farmacia requiere plan Pro o Premium
        </div>
        <a href="/precios" className="px-5 py-[10px] rounded-[9px] text-sm font-bold text-white"
          style={{ background: 'var(--gradient)' }}>
          Ver planes →
        </a>
      </div>
    )
  }

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: 'alertas', label: 'Vencimientos', icon: '⏰' },
    { key: 'lotes',   label: 'Lotes',        icon: '📦' },
    { key: 'kardex',  label: 'Kardex',       icon: '📋' },
    { key: 'recetas', label: 'Recetas',      icon: '💊' },
  ]

  const rxProducts = products.filter(p => p.requires_prescription || p.is_controlled)

  return (
    <div className="p-5 animate-fade-up flex flex-col gap-[14px]">

      {/* Header */}
      <div className="flex items-center gap-[10px]">
        <div className="w-9 h-9 rounded-[9px] flex items-center justify-center text-lg flex-shrink-0"
          style={{ background: 'var(--gradient)' }}>💊</div>
        <div>
          <div className="text-base font-extrabold" style={{ color: 'var(--text)' }}>Módulo Farmacia</div>
          <div className="text-[11px]" style={{ color: 'var(--muted)' }}>
            Lotes · Vencimientos · Kardex · Recetas
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-[5px] p-[4px] rounded-[10px]"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
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

      {/* ── Vencimientos ─────────────────────────────────────────────────────── */}
      {tab === 'alertas' && (
        <ExpiryAlerts orgId={orgId} days={365} />
      )}

      {/* ── Lotes ────────────────────────────────────────────────────────────── */}
      {tab === 'lotes' && (
        <div className="flex flex-col gap-[10px]">
          <div className="flex flex-col gap-[5px]">
            <label className="text-[10px] font-bold uppercase tracking-[.5px]"
              style={{ color: 'var(--muted)' }}>
              Seleccionar producto
            </label>
            {loadingP ? (
              <div className="text-[11px]" style={{ color: 'var(--sub)' }}>Cargando productos...</div>
            ) : (
              <select
                className="fi-dark"
                value={selectedLote?.id ?? ''}
                onChange={e => setSelectedLote(products.find(p => p.id === e.target.value) ?? null)}
              >
                <option value="">— Seleccione un producto —</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                ))}
              </select>
            )}
          </div>

          {selectedLote ? (
            <BatchManager
              orgId={orgId}
              productId={selectedLote.id}
              productName={selectedLote.name}
            />
          ) : (
            <div className="text-center py-[24px] text-[12px]" style={{ color: 'var(--sub)' }}>
              Selecciona un producto para ver y gestionar sus lotes
            </div>
          )}
        </div>
      )}

      {/* ── Kardex ───────────────────────────────────────────────────────────── */}
      {tab === 'kardex' && (
        <div className="flex flex-col gap-[10px]">
          <div className="flex flex-col gap-[5px]">
            <label className="text-[10px] font-bold uppercase tracking-[.5px]"
              style={{ color: 'var(--muted)' }}>
              Seleccionar producto
            </label>
            {loadingP ? (
              <div className="text-[11px]" style={{ color: 'var(--sub)' }}>Cargando productos...</div>
            ) : (
              <select
                className="fi-dark"
                value={selectedKardex?.id ?? ''}
                onChange={e => setSelectedKardex(products.find(p => p.id === e.target.value) ?? null)}
              >
                <option value="">— Seleccione un producto —</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                ))}
              </select>
            )}
          </div>

          {selectedKardex ? (
            <KardexView
              orgId={orgId}
              productId={selectedKardex.id}
              productName={selectedKardex.name}
            />
          ) : (
            <div className="text-center py-[24px] text-[12px]" style={{ color: 'var(--sub)' }}>
              Selecciona un producto para ver su kardex de movimientos
            </div>
          )}
        </div>
      )}

      {/* ── Recetas ──────────────────────────────────────────────────────────── */}
      {tab === 'recetas' && (
        <div className="flex flex-col gap-[8px]">
          <div className="text-[11px]" style={{ color: 'var(--muted)' }}>
            {rxProducts.length} producto{rxProducts.length !== 1 ? 's' : ''} con restricción
          </div>

          {rxProducts.length === 0 ? (
            <div className="text-center py-[24px] text-[12px]" style={{ color: 'var(--sub)' }}>
              Sin productos con receta o controlados registrados
            </div>
          ) : (
            <div className="flex flex-col gap-[5px]">
              {rxProducts.map(p => (
                <div key={p.id} className="flex items-center gap-[10px] px-[12px] py-[10px] rounded-[9px]"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-bold" style={{ color: 'var(--text)' }}>{p.name}</div>
                    <div className="text-[10px] font-mono" style={{ color: 'var(--muted)' }}>{p.code}</div>
                  </div>
                  <div className="flex gap-[5px]">
                    {p.is_controlled && (
                      <span className="px-[7px] py-[2px] rounded-full text-[10px] font-bold"
                        style={{ background: 'rgba(239,68,68,.1)', color: 'var(--red)', border: '1px solid rgba(239,68,68,.2)' }}>
                        🔴 Controlado
                      </span>
                    )}
                    {p.requires_prescription && !p.is_controlled && (
                      <span className="px-[7px] py-[2px] rounded-full text-[10px] font-bold"
                        style={{ background: 'rgba(245,158,11,.1)', color: 'var(--amber)', border: '1px solid rgba(245,158,11,.2)' }}>
                        📋 Receta
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
