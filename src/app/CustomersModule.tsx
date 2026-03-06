'use client'

import { useState, useEffect } from 'react'
import { customerService } from '@/lib/services'
import { exportCustomersToCSV } from '../lib/export'

interface Customer {
  id: string
  org_id: string
  name: string
  document_type?: string
  document_number?: string
  phone?: string
  email?: string
  address?: string
  is_active: boolean
  created_at: string
}

interface CustomersModuleProps {
  currentUser: any
}

export default function CustomersModule({ currentUser }: CustomersModuleProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  const [newCustomer, setNewCustomer] = useState({
    document_type: 'DNI',
    document_number: '',
    name: '',
    phone: '',
    email: '',
    address: ''
  })

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    if (!currentUser?.organization_id) return
    try {
      setLoading(true)
      const data = await customerService.getAll(currentUser.organization_id)
      setCustomers(data)
    } catch (error) {
      console.error('Error loading customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser?.organization_id) return
    
    try {
      await customerService.create(currentUser.organization_id, newCustomer)
      await loadCustomers()
      setNewCustomer({
        document_type: 'DNI',
        document_number: '',
        name: '',
        phone: '',
        email: '',
        address: ''
      })
      setShowAddForm(false)
      alert('✅ Cliente agregado')
    } catch (error) {
      console.error('Error adding customer:', error)
      alert('❌ Error al agregar cliente')
    }
  }

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCustomer) return

    try {
      await customerService.update(editingCustomer.id, {
        name: editingCustomer.name,
        document_type: editingCustomer.document_type,
        document_number: editingCustomer.document_number,
        phone: editingCustomer.phone,
        email: editingCustomer.email,
        address: editingCustomer.address
      })
      await loadCustomers()
      setShowEditForm(false)
      setEditingCustomer(null)
      alert('✅ Cliente actualizado')
    } catch (error) {
      console.error('Error updating customer:', error)
      alert('❌ Error al actualizar cliente')
    }
  }

  const handleDeleteCustomer = async (customer: Customer) => {
    if (!confirm(`¿Eliminar a ${customer.name}?`)) return
    try {
      await customerService.update(customer.id, { is_active: false })
      await loadCustomers()
    } catch (error) {
      console.error('Error deleting customer:', error)
      alert('❌ Error al eliminar cliente')
    }
  }

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.document_number && c.document_number.includes(searchTerm))
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">👥 Gestión de Clientes</h1>
          <p className="text-gray-600 mt-1">Base de datos de clientes y contactos</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => exportCustomersToCSV(customers)}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 font-medium transition-all shadow-md hover:shadow-lg"
          >
            📄 Exportar
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl hover:from-indigo-700 hover:to-purple-700 font-semibold transition-all shadow-md hover:shadow-lg"
          >
            + Agregar Cliente
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-2">👥 Total Clientes</h3>
          <p className="text-3xl font-bold text-gray-900">{customers.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500 hover:shadow-lg transition-shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-2">✅ Clientes Activos</h3>
          <p className="text-3xl font-bold text-green-600">{customers.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-2">🆕 Nuevos (Este Mes)</h3>
          <p className="text-3xl font-bold text-purple-600">
            {customers.filter(c => {
              const created = new Date(c.created_at)
              const now = new Date()
              return created.getMonth() === now.getMonth()
            }).length}
          </p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
          placeholder="🔍 Buscar por nombre o documento..."
        />
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Documento</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Contacto</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm">
                    <div>
                      <span className="font-semibold text-gray-900">{customer.document_type}</span>
                      <p className="text-gray-600 mt-1">{customer.document_number}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    {customer.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="space-y-1">
                      {customer.phone && <p>📱 {customer.phone}</p>}
                      {customer.email && <p className="text-xs">✉️ {customer.email}</p>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                      {customer.is_active ? '✅' : '❌'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setEditingCustomer(customer)
                          setShowEditForm(true)
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(customer)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">➕ Agregar Cliente</h2>
            <form onSubmit={handleAddCustomer} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo Doc *</label>
                  <select
                    value={newCustomer.document_type}
                    onChange={(e) => setNewCustomer({...newCustomer, document_type: e.target.value as any})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="DNI">DNI</option>
                    <option value="RUC">RUC</option>
                    <option value="CE">CE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Número *</label>
                  <input
                    type="text"
                    value={newCustomer.document_number}
                    onChange={(e) => setNewCustomer({...newCustomer, document_number: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre Completo *</label>
                  <input
                    type="text"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono</label>
                  <input
                    type="text"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Dirección</label>
                  <input
                    type="text"
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-2.5 text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 font-medium transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-semibold shadow-lg transition-all"
                >
                  Agregar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditForm && editingCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">✏️ Editar Cliente</h2>
            <form onSubmit={handleUpdateCustomer} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo Doc</label>
                  <select
                    value={editingCustomer.document_type}
                    onChange={(e) => setEditingCustomer({...editingCustomer, document_type: e.target.value as any})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="DNI">DNI</option>
                    <option value="RUC">RUC</option>
                    <option value="CE">CE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Número</label>
                  <input
                    type="text"
                    value={editingCustomer.document_number}
                    onChange={(e) => setEditingCustomer({...editingCustomer, document_number: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre Completo</label>
                  <input
                    type="text"
                    value={editingCustomer.name}
                    onChange={(e) => setEditingCustomer({...editingCustomer, name: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono</label>
                  <input
                    type="text"
                    value={editingCustomer.phone || ''}
                    onChange={(e) => setEditingCustomer({...editingCustomer, phone: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={editingCustomer.email || ''}
                    onChange={(e) => setEditingCustomer({...editingCustomer, email: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false)
                    setEditingCustomer(null)
                  }}
                  className="px-6 py-2.5 text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 font-medium transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold shadow-lg transition-all"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
