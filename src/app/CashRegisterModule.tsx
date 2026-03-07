'use client'

import { useState, useEffect } from 'react'
import { cashService } from '@/lib/services'

interface CashRegisterProps {
  currentUser: any
}

export default function CashRegisterModule({ currentUser }: CashRegisterProps) {
  const [todayMovements, setTodayMovements] = useState<any[]>([])
  const [balance, setBalance] = useState(0)
  const [openingAmount, setOpeningAmount] = useState('')
  const [showOpenModal, setShowOpenModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [hasOpenedToday, setHasOpenedToday] = useState(false)

  const [closingAmount, setClosingAmount] = useState('')
  const [showCloseModal, setShowCloseModal] = useState(false)

  useEffect(() => {
    loadCashData()
  }, [])

  const loadCashData = async () => {
    if (!currentUser?.organization_id) return
    try {
      setLoading(true)
      const movements = await cashService.getTodayMovements(currentUser.organization_id)
      setTodayMovements(movements)
      
      const currentBalance = await cashService.getBalance(currentUser.organization_id)
      setBalance(currentBalance)
      
      const hasOpening = movements.some(m => m.type === 'opening')
      setHasOpenedToday(hasOpening)
    } catch (error) {
      console.error('Error loading cash data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCloseCash = async () => {
    if (!closingAmount || Number(closingAmount) < 0) {
      alert('Ingrese un monto válido')
      return
    }

    if (!currentUser?.organization_id) return

    try {
      setLoading(true)
      await cashService.closeCash(
        currentUser.organization_id,
        Number(closingAmount),
        currentUser.username
      )
      await loadCashData()
      setClosingAmount('')
      setShowCloseModal(false)
      alert('✅ Caja cerrada exitosamente')
    } catch (error) {
      console.error('Error closing cash:', error)
      alert('❌ Error al cerrar caja')
    } finally {
      setLoading(false)
    }
  }
    if (!openingAmount || Number(openingAmount) < 0) {
      alert('Ingrese un monto válido')
      return
    }

    if (!currentUser?.organization_id) return

    try {
      setLoading(true)
      await cashService.openCash(
        currentUser.organization_id,
        Number(openingAmount),
        currentUser.username
      )
      await loadCashData()
      setOpeningAmount('')
      setShowOpenModal(false)
      alert('✅ Caja aperturada exitosamente')
    } catch (error) {
      console.error('Error opening cash:', error)
      alert('❌ Error al aperturar caja')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">💵 Gestión de Caja</h1>
          <p className="text-gray-600 mt-1">Control de apertura y cierre de caja</p>
        </div>
      </div>

      {!hasOpenedToday ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
          <div className="mb-8">
            <div className="w-32 h-32 bg-gradient-to-br from-red-100 to-pink-100 rounded-full mx-auto flex items-center justify-center mb-6 shadow-lg">
              <span className="text-6xl">🔒</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Caja Cerrada</h2>
            <p className="text-gray-600 text-lg">Debe aperturar la caja para comenzar a vender</p>
          </div>
          <button
            onClick={() => setShowOpenModal(true)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-10 py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            🔓 Aperturar Caja
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-green-800 flex items-center">
                <span className="mr-2">✅</span> Caja Abierta
              </h2>
              <div className="flex space-x-3">
                <button
                  onClick={loadCashData}
                  disabled={loading}
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 disabled:bg-gray-400 font-medium transition-all shadow-md hover:shadow-lg"
                >
                  {loading ? '🔄 Cargando...' : '🔄 Actualizar'}
                </button>
                <button
                  onClick={() => setShowCloseModal(true)}
                  className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-5 py-2.5 rounded-xl hover:from-red-700 hover:to-pink-700 font-medium transition-all shadow-md hover:shadow-lg"
                >
                  🔒 Cerrar Caja
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-green-100">
                <p className="text-sm text-gray-600 mb-1">👤 Usuario</p>
                <p className="text-lg font-bold text-gray-900">{currentUser?.full_name}</p>
              </div>
              <div className="bg-white p-5 rounded-xl shadow-sm border border-green-100">
                <p className="text-sm text-gray-600 mb-1">💰 Balance Actual</p>
                <p className="text-xl font-bold text-green-600">S/ {balance.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Apertura */}
      {showOpenModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">🔓 Aperturar Caja</h2>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">💰 Monto Inicial</label>
              <input
                type="number"
                step="0.01"
                value={openingAmount}
                onChange={(e) => setOpeningAmount(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-lg font-semibold"
                placeholder="0.00"
                autoFocus
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowOpenModal(false)}
                className="px-6 py-2.5 text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 font-medium transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleOpenCash}
                className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-semibold shadow-lg transition-all"
              >
                Aperturar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cierre */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">🔒 Cerrar Caja</h2>
            <div className="mb-6 p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <p className="text-sm text-gray-600">Balance Actual:</p>
                  <p className="text-2xl font-bold text-gray-900">S/ {balance.toFixed(2)}</p>
                </div>
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">💵 Monto Real en Caja</label>
              <input
                type="number"
                step="0.01"
                value={closingAmount}
                onChange={(e) => setClosingAmount(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-lg font-semibold"
                placeholder="0.00"
                autoFocus
              />
            </div>
            {closingAmount && (
              <div className={`mb-6 p-4 rounded-xl border-2 ${
                Number(closingAmount) - balance >= 0
                  ? 'bg-green-50 border-green-300'
                  : 'bg-red-50 border-red-300'
              }`}>
                <p className="text-sm font-medium text-gray-700 mb-1">📊 Diferencia</p>
                <p className={`text-2xl font-bold ${
                  Number(closingAmount) - balance >= 0
                    ? 'text-green-700'
                    : 'text-red-700'
                }`}>
                  S/ {(Number(closingAmount) - balance).toFixed(2)}
                </p>
              </div>
            )}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCloseModal(false)}
                className="px-6 py-2.5 text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 font-medium transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleCloseCash}
                className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 font-semibold shadow-lg transition-all"
              >
                Cerrar Caja
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
