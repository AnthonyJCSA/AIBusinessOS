'use client'

import { useState, useEffect, useCallback } from 'react'
import { cashService, cashSessionService } from '@/lib/services'
import { useOrganization } from '@/shared/hooks/useOrganization'
import { Modal } from '@/shared/components/ui/Modal'
import type { CashSession } from '@/lib/services/cashSession.service'

export default function CashRegisterModule({ currentUser }: { currentUser: any }) {
  const org = useOrganization()
  const orgId = org?.id ?? currentUser?.organization_id
  const currency = org?.settings?.currency ?? 'S/'

  const [session, setSession]     = useState<CashSession | null>(null)
  const [movements, setMovements] = useState<any[]>([])
  const [balance, setBalance]     = useState(0)
  const [history, setHistory]     = useState<CashSession[]>([])
  const [loading, setLoading]     = useState(true)

  // Modal states
  const [showOpen, setShowOpen]   = useState(false)
  const [showClose, setShowClose] = useState(false)
  const [showExpense, setShowExpense] = useState(false)

  // Form states
  const [openingAmount, setOpeningAmount]   = useState('')
  const [countedAmount, setCountedAmount]   = useState('')
  const [closeNotes, setCloseNotes]         = useState('')
  const [expenseAmount, setExpenseAmount]   = useState('')
  const [expenseDesc, setExpenseDesc]       = useState('')
  const [expenseCat, setExpenseCat]         = useState('Gastos operativos')
  const [submitting, setSubmitting]         = useState(false)

  const load = useCallback(async () => {
    if (!orgId) return
    setLoading(true)
    try {
      const [activeSession, mvs, bal, hist] = await Promise.all([
        cashSessionService.getActive(orgId),
        cashService.getTodayMovements(orgId),
        cashService.getBalance(orgId),
        cashSessionService.getHistory(orgId, 5),
      ])
      setSession(activeSession)
      setMovements(mvs ?? [])
      setBalance(bal ?? 0)
      setHistory(hist)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [orgId])

  useEffect(() => { load() }, [load])

  const handleOpen = async () => {
    if (!openingAmount || Number(openingAmount) < 0) return
    if (session) { alert('Ya hay una caja abierta'); return }
    setSubmitting(true)
    try {
      await cashSessionService.open(orgId, Number(openingAmount), currentUser?.username)
      await cashService.openCash(orgId, Number(openingAmount), currentUser?.username)
      setOpeningAmount('')
      setShowOpen(false)
      await load()
    } catch { alert('❌ Error al aperturar caja') }
    finally { setSubmitting(false) }
  }

  const handleClose = async () => {
    if (!session || !countedAmount || Number(countedAmount) < 0) return
    setSubmitting(true)
    try {
      await cashSessionService.close(
        session.id, orgId,
        Number(countedAmount),
        currentUser?.username,
        closeNotes || undefined
      )
      await cashService.closeCash(orgId, Number(countedAmount), currentUser?.username)
      setCountedAmount('')
      setCloseNotes('')
      setShowClose(false)
      await load()
    } catch { alert('❌ Error al cerrar caja') }
    finally { setSubmitting(false) }
  }

  const handleExpense = async () => {
    if (!expenseAmount || Number(expenseAmount) <= 0 || !expenseDesc) return
    setSubmitting(true)
    try {
      await cashService.registerExpense(
        orgId, Number(expenseAmount),
        expenseDesc, expenseCat,
        currentUser?.username
      )
      setExpenseAmount('')
      setExpenseDesc('')
      setShowExpense(false)
      await load()
    } catch { alert('❌ Error al registrar gasto') }
    finally { setSubmitting(false) }
  }

  const salesTotal    = movements.filter(m => m.type === 'sale').reduce((s: number, m: any) => s + (m.amount ?? 0), 0)
  const expensesTotal = movements.filter(m => m.type === 'expense').reduce((s: number, m: any) => s + (m.amount ?? 0), 0)
  const openingTotal  = movements.filter(m => m.type === 'opening').reduce((s: number, m: any) => s + (m.amount ?? 0), 0)

  const typeStyles: Record<string, { bg: string; color: string; label: string }> = {
    opening:    { bg: 'rgba(16,185,129,.1)',  color: 'var(--green)',  label: 'Apertura' },
    sale:       { bg: 'rgba(59,130,246,.1)',  color: 'var(--blue)',   label: 'Venta' },
    expense:    { bg: 'rgba(239,68,68,.1)',   color: 'var(--red)',    label: 'Gasto' },
    closing:    { bg: 'rgba(245,158,11,.1)',  color: 'var(--amber)',  label: 'Cierre' },
    adjustment: { bg: 'rgba(139,92,246,.1)', color: '#a78bfa',       label: 'Ajuste' },
    refund:     { bg: 'rgba(239,68,68,.1)',   color: 'var(--red)',    label: 'Devolución' },
  }

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
        style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
    </div>
  )

  return (
    <div className="p-5 animate-fade-up space-y-4">

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[10px]">
        {[
          { color: 'var(--green)',  icon: '🔓', label: 'Saldo Inicial',   value: `${currency} ${openingTotal.toFixed(2)}` },
          { color: 'var(--blue)',   icon: '💰', label: 'Ventas del Día',  value: `${currency} ${salesTotal.toFixed(2)}` },
          { color: 'var(--red)',    icon: '📤', label: 'Gastos del Día',  value: `${currency} ${expensesTotal.toFixed(2)}` },
          { color: 'var(--amber)',  icon: '🏦', label: 'Total en Caja',   value: `${currency} ${balance.toFixed(2)}` },
        ].map(m => (
          <div key={m.label} className="rounded-[13px] px-[18px] py-4 relative overflow-hidden"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="absolute right-[-10px] top-[-10px] w-[70px] h-[70px] rounded-full"
              style={{ background: m.color, opacity: 0.06 }} />
            <div className="absolute right-[14px] top-[14px] text-[22px] opacity-35">{m.icon}</div>
            <div className="text-[10px] font-bold uppercase tracking-[.6px]" style={{ color: 'var(--muted)' }}>{m.label}</div>
            <div className="text-[22px] font-extrabold leading-[1.1] my-[3px]" style={{ color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Estado + Acciones */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[14px]">
        <div className="rounded-2xl p-6 text-center"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="w-[72px] h-[72px] rounded-full mx-auto mb-3 flex items-center justify-center text-3xl"
            style={session
              ? { background: 'rgba(16,185,129,.1)', border: '2px solid rgba(16,185,129,.25)' }
              : { background: 'rgba(239,68,68,.1)',  border: '2px solid rgba(239,68,68,.25)' }}>
            {session ? '🔓' : '🔒'}
          </div>
          <div className="text-xl font-extrabold mb-1"
            style={{ color: session ? 'var(--green)' : 'var(--red)' }}>
            {session ? 'Caja Abierta' : 'Caja Cerrada'}
          </div>
          {session && (
            <div className="text-xs mb-1" style={{ color: 'var(--muted)' }}>
              Aperturada: {new Date(session.opened_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
          <div className="text-[11px] mb-5" style={{ color: 'var(--sub)' }}>
            {currentUser?.full_name}
          </div>
          <div className="flex flex-col gap-2">
            {!session ? (
              <button onClick={() => setShowOpen(true)}
                className="w-full py-3 rounded-xl text-xs font-bold text-white"
                style={{ background: 'var(--gradient)' }}>
                🔓 Aperturar Caja
              </button>
            ) : (
              <>
                <button onClick={() => setShowExpense(true)}
                  className="w-full py-2 rounded-xl text-xs font-semibold"
                  style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)', color: 'var(--red)' }}>
                  📤 Registrar Gasto
                </button>
                <button onClick={() => setShowClose(true)}
                  className="w-full py-2 rounded-xl text-xs font-semibold"
                  style={{ background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.2)', color: 'var(--amber)' }}>
                  🔒 Cerrar Caja
                </button>
              </>
            )}
            <button onClick={load}
              className="w-full py-2 rounded-xl text-xs font-semibold"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
              🔄 Actualizar
            </button>
          </div>
        </div>

        {/* Historial de sesiones */}
        <div className="lg:col-span-2 rounded-[13px] overflow-hidden"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>📋 Últimas Sesiones</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs" style={{ minWidth: '500px' }}>
              <thead>
                <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                  {['Apertura', 'Cierre', 'Inicial', 'Contado', 'Diferencia', 'Estado'].map(h => (
                    <th key={h} className="px-[14px] py-[9px] text-left font-bold uppercase tracking-[.6px]"
                      style={{ color: 'var(--sub)', fontSize: '10px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr><td colSpan={6} className="px-[14px] py-8 text-center" style={{ color: 'var(--sub)' }}>Sin sesiones registradas</td></tr>
                ) : history.map(s => {
                  const diff = (s.counted_amount ?? 0) - (s.expected_amount ?? 0)
                  return (
                    <tr key={s.id} style={{ borderBottom: '1px solid rgba(30,45,69,.5)' }}>
                      <td className="px-[14px] py-[10px]" style={{ color: 'var(--muted)' }}>
                        {new Date(s.opened_at).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-[14px] py-[10px]" style={{ color: 'var(--muted)' }}>
                        {s.closed_at ? new Date(s.closed_at).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td className="px-[14px] py-[10px] font-bold" style={{ color: 'var(--text)' }}>
                        {currency} {s.opening_amount.toFixed(2)}
                      </td>
                      <td className="px-[14px] py-[10px]" style={{ color: 'var(--muted)' }}>
                        {s.counted_amount != null ? `${currency} ${s.counted_amount.toFixed(2)}` : '—'}
                      </td>
                      <td className="px-[14px] py-[10px] font-bold"
                        style={{ color: diff >= 0 ? 'var(--green)' : 'var(--red)' }}>
                        {s.counted_amount != null ? `${diff >= 0 ? '+' : ''}${currency} ${diff.toFixed(2)}` : '—'}
                      </td>
                      <td className="px-[14px] py-[10px]">
                        <span className="px-2 py-[2px] rounded-full text-[10px] font-semibold"
                          style={s.status === 'open'
                            ? { background: 'rgba(16,185,129,.1)', color: 'var(--green)' }
                            : { background: 'rgba(100,116,139,.1)', color: 'var(--muted)' }}>
                          {s.status === 'open' ? '🔓 Abierta' : '🔒 Cerrada'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Movimientos del día */}
      <div className="rounded-[13px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
          <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>Movimientos del Día ({movements.length})</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ minWidth: '500px' }}>
            <thead>
              <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                {['Hora', 'Tipo', 'Descripción', 'Monto', 'Balance', 'Usuario'].map(h => (
                  <th key={h} className="px-[14px] py-[9px] text-left font-bold uppercase tracking-[.6px]"
                    style={{ color: 'var(--sub)', fontSize: '10px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {movements.length === 0 ? (
                <tr><td colSpan={6} className="px-[14px] py-8 text-center" style={{ color: 'var(--sub)' }}>Sin movimientos hoy</td></tr>
              ) : movements.map((m: any, i: number) => {
                const ts = typeStyles[m.type] ?? typeStyles.adjustment
                return (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(30,45,69,.5)' }}>
                    <td className="px-[14px] py-[10px]" style={{ color: 'var(--muted)' }}>
                      {new Date(m.created_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-[14px] py-[10px]">
                      <span className="px-2 py-[2px] rounded-full text-[10px] font-semibold"
                        style={{ background: ts.bg, color: ts.color }}>{ts.label}</span>
                    </td>
                    <td className="px-[14px] py-[10px]" style={{ color: 'var(--text)' }}>{m.description || '—'}</td>
                    <td className="px-[14px] py-[10px] font-bold"
                      style={{ color: ['sale', 'opening'].includes(m.type) ? 'var(--green)' : 'var(--red)' }}>
                      {['sale', 'opening'].includes(m.type) ? '+' : '-'}{currency} {Math.abs(m.amount ?? 0).toFixed(2)}
                    </td>
                    <td className="px-[14px] py-[10px]" style={{ color: 'var(--muted)' }}>
                      {m.balance != null ? `${currency} ${m.balance.toFixed(2)}` : '—'}
                    </td>
                    <td className="px-[14px] py-[10px]" style={{ color: 'var(--muted)' }}>
                      {m.created_by ?? currentUser?.username ?? '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Apertura */}
      <Modal open={showOpen} title="🔓 Aperturar Caja" onClose={() => setShowOpen(false)} size="sm">
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-[.5px]" style={{ color: 'var(--muted)' }}>
              Monto inicial en caja *
            </label>
            <input type="number" step="0.01" min="0" autoFocus
              value={openingAmount} onChange={e => setOpeningAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-3 rounded-lg text-2xl font-bold text-center outline-none"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowOpen(false)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
              Cancelar
            </button>
            <button onClick={handleOpen} disabled={submitting || !openingAmount}
              className="flex-1 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-40"
              style={{ background: 'var(--gradient)' }}>
              {submitting ? 'Abriendo...' : '🔓 Aperturar'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Cierre */}
      <Modal open={showClose} title="🔒 Cerrar Caja" onClose={() => setShowClose(false)} size="sm">
        <div className="space-y-4">
          <div className="p-3 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="flex justify-between text-xs mb-1">
              <span style={{ color: 'var(--muted)' }}>Balance del sistema</span>
              <span className="font-bold" style={{ color: 'var(--text)' }}>{currency} {balance.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color: 'var(--muted)' }}>Ventas del día</span>
              <span className="font-bold" style={{ color: 'var(--green)' }}>{currency} {salesTotal.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-[.5px]" style={{ color: 'var(--muted)' }}>
              Monto contado en caja *
            </label>
            <input type="number" step="0.01" min="0" autoFocus
              value={countedAmount} onChange={e => setCountedAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-3 rounded-lg text-2xl font-bold text-center outline-none"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
          </div>
          {countedAmount && (
            <div className="p-3 rounded-xl text-center"
              style={{
                background: Number(countedAmount) >= balance ? 'rgba(16,185,129,.08)' : 'rgba(239,68,68,.08)',
                border: `1px solid ${Number(countedAmount) >= balance ? 'rgba(16,185,129,.3)' : 'rgba(239,68,68,.3)'}`,
              }}>
              <div className="text-[10px] font-bold uppercase mb-1" style={{ color: 'var(--muted)' }}>Diferencia</div>
              <div className="text-2xl font-extrabold"
                style={{ color: Number(countedAmount) >= balance ? 'var(--green)' : 'var(--red)' }}>
                {Number(countedAmount) >= balance ? '+' : ''}{currency} {(Number(countedAmount) - balance).toFixed(2)}
              </div>
              <div className="text-[10px] mt-1" style={{ color: 'var(--muted)' }}>
                {Number(countedAmount) >= balance ? '✅ Sobrante' : '⚠️ Faltante'}
              </div>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-[.5px]" style={{ color: 'var(--muted)' }}>
              Notas (opcional)
            </label>
            <input value={closeNotes} onChange={e => setCloseNotes(e.target.value)}
              placeholder="Observaciones del cierre..."
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowClose(false)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
              Cancelar
            </button>
            <button onClick={handleClose} disabled={submitting || !countedAmount}
              className="flex-1 py-2 rounded-xl text-xs font-bold disabled:opacity-40"
              style={{ background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.3)', color: 'var(--amber)' }}>
              {submitting ? 'Cerrando...' : '🔒 Cerrar Caja'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Gasto */}
      <Modal open={showExpense} title="📤 Registrar Gasto" onClose={() => setShowExpense(false)} size="sm">
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-[.5px]" style={{ color: 'var(--muted)' }}>Monto *</label>
            <input type="number" step="0.01" min="0" autoFocus
              value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-3 rounded-lg text-2xl font-bold text-center outline-none"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-[.5px]" style={{ color: 'var(--muted)' }}>Categoría</label>
            <select value={expenseCat} onChange={e => setExpenseCat(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}>
              {['Gastos operativos', 'Compra de mercadería', 'Servicios', 'Transporte', 'Limpieza', 'Otro'].map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-[.5px]" style={{ color: 'var(--muted)' }}>Descripción *</label>
            <input value={expenseDesc} onChange={e => setExpenseDesc(e.target.value)}
              placeholder="Ej: Pago de luz, compra de bolsas..."
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowExpense(false)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
              Cancelar
            </button>
            <button onClick={handleExpense} disabled={submitting || !expenseAmount || !expenseDesc}
              className="flex-1 py-2 rounded-xl text-xs font-bold disabled:opacity-40"
              style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', color: 'var(--red)' }}>
              {submitting ? 'Registrando...' : '📤 Registrar'}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  )
}
