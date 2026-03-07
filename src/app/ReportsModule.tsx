'use client'

import { useState, useEffect } from 'react'
import { exportSalesToCSV } from '../lib/export'

interface Sale {
  id: string
  sale_number: string
  total: number
  created_at: string
  customer_name?: string
  payment_method: string
  status?: string
}

interface ReportsProps {
  sales: Sale[]
  currentUser: any
}

export default function ReportsModule({ sales, currentUser }: ReportsProps) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setStartDate(today)
    setEndDate(today)
  }, [])

  const getFilteredSales = () => {
    if (!startDate || !endDate) return sales
    
    return sales.filter(sale => {
      const saleDate = new Date(sale.created_at).toISOString().split('T')[0]
      return saleDate >= startDate && saleDate <= endDate
    })
  }

  const filteredSales = getFilteredSales()
  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0)
  const averageSale = filteredSales.length > 0 ? totalSales / filteredSales.length : 0
  const totalTransactions = filteredSales.length

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">📈 Reportes y Analytics</h1>
        <p className="text-gray-600 mt-1">Dashboard de ventas y estadísticas</p>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-5 text-gray-900">🔍 Filtros de Reporte</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">📅 Fecha Inicio</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">📅 Fecha Fin</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">&nbsp;</label>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 font-medium transition-all shadow-md"
            >
              🔄 Refrescar
            </button>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">&nbsp;</label>
            <button
              onClick={() => exportSalesToCSV(filteredSales)}
              className="w-full bg-green-600 text-white px-4 py-2.5 rounded-xl hover:bg-green-700 font-medium transition-all shadow-md"
            >
              📄 Exportar Excel
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500 hover:shadow-lg transition-shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-2">💰 Ventas Totales</h3>
          <p className="text-3xl font-bold text-green-600">S/ {totalSales.toFixed(2)}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-2">🧾 Transacciones</h3>
          <p className="text-3xl font-bold text-blue-600">{totalTransactions}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-2">📊 Ticket Promedio</h3>
          <p className="text-3xl font-bold text-purple-600">S/ {averageSale.toFixed(2)}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500 hover:shadow-lg transition-shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-2">📋 Ventas Hoy</h3>
          <p className="text-3xl font-bold text-yellow-600">{filteredSales.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">📋 Ventas del Período</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Número</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Fecha/Hora</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Pago</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSales.slice(0, 20).map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{sale.sale_number}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(sale.created_at).toLocaleString('es-PE', { 
                      day: '2-digit', 
                      month: '2-digit', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {sale.customer_name || 'Cliente General'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                      {sale.payment_method}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-green-600">
                    S/ {sale.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      ✅ COMPLETADA
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
