'use client'

import { useState, useEffect } from 'react'
import { cashService } from '@/lib/services'

export default function CashRegisterModule({ currentUser }: { currentUser: any }) {
  const [movements, setMovements] = useState<any[]>([])
  const [balance, setBalance] = useState(0)
  const [openingAmount, setOpeningAmount] = useState('')
  const [closingAmount, setClosingAmount] = useState('')
  const [showOpenModal, setShowOpenModal] = useState(false)
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [hasOpened, setHasOpened] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    if (!currentUser?.organization_id) return
    try {
      setLoading(true)
      const mvs = await cashService.getTodayMovements(currentUser.organization_id)
      setMovements(mvs || [])
      const bal = await cashService.getBalance(currentUser.organization_id)
      setBalance(bal || 0)
      setHasOpened((mvs || []).some((m: any) => m.type === 'opening') && !(mvs || []).some((m: any) => m.type === 'closing'))
    } catch { setMovements([]); setBalance(0) }
    finally { setLoading(false) }
  }

  const handleOpen = async () => {
    if (!openingAmount || Number(openingAmount) < 0) return alert('Ingrese un monto válido')
    if (!currentUser?.organization_id) return
    setLoading(true)
    try {
      await cashService.openCash(currentUser.organization_id, Number(openingAmount), currentUser.username)
      await loadData(); setOpeningAmount(''); setShowOpenModal(false)
      alert('✅ Caja aperturada')
    } catch { alert('❌ Error al aperturar') } finally { setLoading(false) }
  }

  const handleClose = async () => {
    if (!closingAmount || Number(closingAmount) < 0) return alert('Ingrese un monto válido')
    if (!currentUser?.organization_id) return
    setLoading(true)
    try {
      await cashService.closeCash(currentUser.organization_id, Number(closingAmount), currentUser.username)
      await loadData(); setClosingAmount(''); setShowCloseModal(false)
      alert('✅ Caja cerrada')
    } catch { alert('❌ Error al cerrar') } finally { setLoading(false) }
  }

  const salesTotal = movements.filter(m => m.type === 'sale').reduce((s: number, m: any) => s + (m.amount || 0), 0)
  const openingTotal = movements.filter(m => m.type === 'opening').reduce((s: number, m: any) => s + (m.amount || 0), 0)

  return (
    <div className="p-5 animate-fade-up">
      {/* Métricas */}
      <div className="grid grid-cols-3 gap-[10px] mb-4" style={{ maxWidth: '680px' }}>
        {[
          { color: 'var(--green)', label: 'Saldo Inicial', value: `S/ ${openingTotal.toFixed(2)}` },
          { color: 'var(--blue)', label: 'Ventas del Día', value: `S/ ${salesTotal.toFixed(2)}` },
          { color: 'var(--amber)', label: 'Total en Caja', value: `S/ ${balance.toFixed(2)}` },
        ].map(m => (
          <div key={m.label} className="rounded-[13px] px-[18px] py-4 relative overflow-hidden"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="absolute right-[-10px] top-[-10px] w-[70px] h-[70px] rounded-full" style={{ background: m.color, opacity: 0.06 }} />
            <div className="text-[10px] font-bold uppercase tracking-[.6px]" style={{ color: 'var(--muted)' }}>{m.label}</div>
            <div className="text-[26px] font-extrabold leading-[1.1] my-[3px]" style={{ color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Estado caja */}
      <div className="rounded-2xl p-8 text-center mb-4" style={{ background: 'var(--card)', border: '1px solid var(--border)', maxWidth: '420px', margin: '0 auto 16px' }}>
        <div
          className="w-[76px] h-[76px] rounded-full mx-auto mb-3 flex items-center justify-center text-3xl"
          style={hasOpened
            ? { background: 'rgba(16,185,129,.1)', border: '2px solid rgba(16,185,129,.25)' }
            : { background: 'rgba(239,68,68,.1)', border: '2px solid rgba(239,68,68,.25)' }}
        >
          {hasOpened ? '🔓' : '🔒'}
        </div>
        <div className="text-xl font-extrabold mb-1" style={{ color: hasOpened ? 'var(--green)' : 'var(--red)' }}>
          {hasOpened ? 'Caja Abierta' : 'Caja Cerrada'}
        </div>
        <div className="text-xs mb-1" style={{ color: 'var(--muted)' }}>
          {hasOpened ? `Balance actual: S/ ${balance.toFixed(2)}` : 'Debe aperturar la caja para vender'}
        </div>
        <div className="text-[11px] mb-5" style={{ color: 'var(--sub)' }}>Usuario: {currentUser?.full_name}</div>
        <div className="flex gap-3 justify-center flex-wrap">
          <button onClick={loadData} disabled={loading}
            className="px-5 py-3 rounded-xl text-xs font-semibold transition-all"
            style={{ background: 'rgba(59,130,246,.1)', border: '1px solid rgba(59,130,246,.2)', color: 'var(--blue)' }}>
            {loading ? '⏳' : '🔄 Actualizar'}
          </button>
          {!hasOpened ? (
            <button onClick={() => setShowOpenModal(true)}
              className="px-5 py-3 rounded-xl text-xs font-semibold text-white transition-all"
              style={{ background: 'var(--gradient)' }}>
              🔓 Aperturar Caja
            </button>
          ) : (
            <button onClick={() => setShowCloseModal(true)}
              className="px-5 py-3 rounded-xl text-xs font-semibold transition-all"
              style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)', color: 'var(--red)' }}>
              🔒 Cerrar Caja
            </button>
          )}
        </div>
      </div>

      {/* Movimientos */}
      <div className="rounded-[13px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
          <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>Movimientos del Día</span>
          <button className="px-3 py-[7px] rounded-[9px] text-xs font-semibold transition-all"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}>📥 Exportar</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ minWidth: '400px' }}>
            <thead>
              <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                {['Hora', 'Tipo', 'Descripción', 'Monto', 'Usuario'].map(h => (
                  <th key={h} className="px-[14px] py-[9px] text-left font-bold uppercase tracking-[.6px]"
                    style={{ color: 'var(--sub)', fontSize: '10px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {movements.length === 0 ? (
                <tr><td colSpan={5} className="px-[14px] py-8 text-center text-xs" style={{ color: 'var(--sub)' }}>Sin movimientos hoy</td></tr>
              ) : movements.map((m: any, i: number) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(30,45,69,.5)' }}>
                  <td className="px-[14px] py-[10px]" style={{ color: 'var(--muted)' }}>
                    {new Date(m.created_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-[14px] py-[10px]">
                    <span className="px-2 py-[2px] rounded-full text-[10px] font-semibold" style={
                      m.type === 'opening' ? { background: 'rgba(16,185,129,.1)', color: 'var(--green)' } :
                      m.type === 'sale' ? { background: 'rgba(59,130,246,.1)', color: 'var(--blue)' } :
                      { background: 'rgba(239,68,68,.1)', color: 'var(--red)' }
                    }>{m.type}</span>
                  </td>
                  <td className="px-[14px] py-[10px]" style={{ color: 'var(--text)' }}>{m.description || '—'}</td>
                  <td className="px-[14px] py-[10px] font-bold" style={{ color: m.amount >= 0 ? 'var(--green)' : 'var(--red)' }}>
                    {m.amount >= 0 ? '+' : ''}S/ {Math.abs(m.amount || 0).toFixed(2)}
                  </td>
                  <td className="px-[14px] py-[10px]" style={{ color: 'var(--muted)' }}>{m.user || currentUser?.username}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Apertura */}
      {showOpenModal && (
        <CashModal title="🔓 Aperturar Caja" onClose={() => setShowOpenModal(false)}>
          <div className="mb-5">
            <label className="text-[10px] font-bold uppercase tracking-[.5px] block mb-2" style={{ color: 'var(--muted)' }}>💰 Monto Inicial</label>
            <input type="number" step="0.01" value={openingAmount} onChange={e => setOpeningAmount(e.target.value)}
              className="w-full px-[13px] py-3 rounded-[9px] text-lg font-bold outline-none"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
              placeholder="0.00" autoFocus />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowOpenModal(false)} className="px-5 py-[9px] rounded-[9px] text-xs font-semibold transition-all"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}>Cancelar</button>
            <button onClick={handleOpen} disabled={loading} className="px-5 py-[9px] rounded-[9px] text-xs font-semibold text-white transition-all disabled:opacity-60"
              style={{ background: 'var(--gradient)' }}>Aperturar</button>
          </div>
        </CashModal>
      )}

      {/* Modal Cierre */}
      {showCloseModal && (
        <CashModal title="🔒 Cerrar Caja" onClose={() => setShowCloseModal(false)}>
          <div className="mb-4 p-4 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--muted)' }}>Balance Actual:</span>
              <span className="text-2xl font-extrabold" style={{ color: 'var(--text)' }}>S/ {balance.toFixed(2)}</span>
            </div>
          </div>
          <div className="mb-4">
            <label className="text-[10px] font-bold uppercase tracking-[.5px] block mb-2" style={{ color: 'var(--muted)' }}>💵 Monto Real en Caja</label>
            <input type="number" step="0.01" value={closingAmount} onChange={e => setClosingAmount(e.target.value)}
              className="w-full px-[13px] py-3 rounded-[9px] text-lg font-bold outline-none"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
              placeholder="0.00" autoFocus />
          </div>
          {closingAmount && (
            <div className="mb-4 p-3 rounded-xl" style={{
              background: Number(closingAmount) - balance >= 0 ? 'rgba(16,185,129,.08)' : 'rgba(239,68,68,.08)',
              border: `1px solid ${Number(closingAmount) - balance >= 0 ? 'rgba(16,185,129,.3)' : 'rgba(239,68,68,.3)'}`,
            }}>
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--muted)' }}>Diferencia</div>
              <div className="text-2xl font-extrabold" style={{ color: Number(closingAmount) - balance >= 0 ? 'var(--green)' : 'var(--red)' }}>
                S/ {(Number(closingAmount) - balance).toFixed(2)}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowCloseModal(false)} className="px-5 py-[9px] rounded-[9px] text-xs font-semibold transition-all"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}>Cancelar</button>
            <button onClick={handleClose} disabled={loading} className="px-5 py-[9px] rounded-[9px] text-xs font-semibold transition-all disabled:opacity-60"
              style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)', color: 'var(--red)' }}>Cerrar Caja</button>
          </div>
        </CashModal>
      )}
    </div>
  )
}

function CashModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border2)' }}>
        <div className="flex items-center justify-between mb-5">
          <span className="text-base font-extrabold" style={{ color: 'var(--text)' }}>{title}</span>
          <button onClick={onClose} className="w-[30px] h-[30px] rounded-[7px] flex items-center justify-center text-sm"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}
