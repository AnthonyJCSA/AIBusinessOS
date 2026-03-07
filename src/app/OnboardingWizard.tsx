'use client'

import { useState } from 'react'
import { Organization } from '../types'
import { supabase } from '../lib/supabase'

interface OnboardingWizardProps {
  onComplete: (org: Organization, products: any[]) => void
  businessType?: string
}

export default function OnboardingWizard({ onComplete, businessType }: OnboardingWizardProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [businessData, setBusinessData] = useState({
    name: '',
    business_type: (businessType || 'retail') as any,
    ruc: '',
    address: '',
    phone: '',
    email: ''
  })

  const [products, setProducts] = useState<any[]>([])
  const [manualProduct, setManualProduct] = useState({
    code: '',
    name: '',
    price: 0,
    stock: 0
  })

  const [userData, setUserData] = useState({
    full_name: '',
    email: '',
    username: '',
    password: ''
  })

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const rows = text.split('\n').slice(1)
      
      const parsedProducts = rows
        .filter(row => row.trim())
        .map((row, index) => {
          const [code, name, price, stock] = row.split(',').map(s => s.trim())
          return {
            id: `prod_${Date.now()}_${index}`,
            code: code || `PROD${index + 1}`,
            name: name || `Producto ${index + 1}`,
            price: parseFloat(price) || 0,
            stock: parseInt(stock) || 0,
            min_stock: 5,
            category: 'General',
            unit: 'unit'
          }
        })
      
      setProducts(parsedProducts)
      alert(`✅ ${parsedProducts.length} productos importados`)
    }
    reader.readAsText(file)
  }

  const addManualProduct = () => {
    if (!manualProduct.name || !manualProduct.code) {
      alert('Complete código y nombre')
      return
    }

    setProducts([...products, {
      id: `prod_${Date.now()}`,
      ...manualProduct,
      min_stock: 5,
      category: 'General',
      unit: 'unit'
    }])

    setManualProduct({ code: '', name: '', price: 0, stock: 0 })
  }

  const handleComplete = async () => {
    if (step === 1) {
      if (!businessData.name || !businessData.business_type) {
        alert('Complete los campos obligatorios')
        return
      }
      setStep(2)
    } else if (step === 2) {
      if (products.length === 0) {
        alert('Agregue al menos 1 producto')
        return
      }
      setStep(3)
    } else if (step === 3) {
      if (!userData.username || !userData.password || !userData.full_name) {
        alert('Complete todos los campos')
        return
      }

      setLoading(true)

      const newOrg: Organization = {
        id: `org_${Date.now()}`,
        slug: businessData.name.toLowerCase().replace(/\s+/g, '-'),
        ...businessData,
        settings: { currency: 'S/', tax_rate: 0.18 },
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      setLoading(false)
      onComplete(newOrg, products)
    }
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left side */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full -ml-48 -mb-48"></div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-12">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white">Coriva Core</span>
          </div>
          
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
                Configura tu negocio
                <br />
                <span className="text-white/80">en 3 simples pasos</span>
              </h1>
              <p className="text-lg text-white/70">
                Estarás listo para vender en menos de 5 minutos
              </p>
            </div>

            <div className="space-y-4">
              <div className={`flex items-center space-x-4 ${step >= 1 ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                  step > 1 ? 'bg-white text-indigo-600' : step === 1 ? 'bg-white/20 text-white border-2 border-white' : 'bg-white/10 text-white/60'
                }`}>
                  {step > 1 ? '✓' : '1'}
                </div>
                <div>
                  <h3 className="text-white font-semibold">Datos del Negocio</h3>
                  <p className="text-white/60 text-sm">Información básica</p>
                </div>
              </div>
              
              <div className={`flex items-center space-x-4 ${step >= 2 ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                  step > 2 ? 'bg-white text-indigo-600' : step === 2 ? 'bg-white/20 text-white border-2 border-white' : 'bg-white/10 text-white/60'
                }`}>
                  {step > 2 ? '✓' : '2'}
                </div>
                <div>
                  <h3 className="text-white font-semibold">Productos Iniciales</h3>
                  <p className="text-white/60 text-sm">Importa o agrega manualmente</p>
                </div>
              </div>
              
              <div className={`flex items-center space-x-4 ${step >= 3 ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                  step === 3 ? 'bg-white/20 text-white border-2 border-white' : 'bg-white/10 text-white/60'
                }`}>
                  3
                </div>
                <div>
                  <h3 className="text-white font-semibold">Usuario Administrador</h3>
                  <p className="text-white/60 text-sm">Crea tu cuenta</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-white/60 text-sm">
          © 2026 Coriva Core. Todos los derechos reservados.
        </div>
      </div>

      {/* Right side */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-2xl">
          {/* Mobile header */}
          <div className="lg:hidden mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">Coriva Core</span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">Paso {step} de 3</span>
              <span className="text-sm font-medium text-indigo-600">{Math.round((step / 3) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Datos de tu Negocio</h2>
                <p className="text-gray-600">Cuéntanos sobre tu empresa para personalizar tu experiencia</p>
                <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
                  <p className="text-sm text-green-800">
                    <span className="font-bold">💡 Desde hoy:</span> Ahorrarás horas, controlarás tu efectivo y dejarás de perder ventas
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label htmlFor="business-name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Negocio <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="business-name"
                    type="text"
                    value={businessData.name}
                    onChange={(e) => setBusinessData({...businessData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="Ej: Bodega San Juan"
                  />
                </div>

                <div>
                  <label htmlFor="business-type" className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Negocio <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="business-type"
                    value={businessData.business_type}
                    onChange={(e) => setBusinessData({...businessData, business_type: e.target.value as any})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="retail">🛒 Tienda / Bodega</option>
                    <option value="pharmacy">💊 Farmacia / Botica</option>
                    <option value="hardware">🔧 Ferretería</option>
                    <option value="clothing">👕 Ropa / Textil</option>
                    <option value="barbershop">✂️ Barbería / Peluquería</option>
                    <option value="restaurant">🍔 Restaurante / Cafetería</option>
                    <option value="other">📦 Otro</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="ruc" className="block text-sm font-medium text-gray-700 mb-2">RUC</label>
                    <input
                      id="ruc"
                      type="text"
                      value={businessData.ruc}
                      onChange={(e) => setBusinessData({...businessData, ruc: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="20123456789"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                    <input
                      id="phone"
                      type="text"
                      value={businessData.phone}
                      onChange={(e) => setBusinessData({...businessData, phone: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="999 888 777"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                  <input
                    id="address"
                    type="text"
                    value={businessData.address}
                    onChange={(e) => setBusinessData({...businessData, address: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="Av. Principal 123, Lima"
                  />
                </div>

                <div>
                  <label htmlFor="business-email" className="block text-sm font-medium text-gray-700 mb-2">Email del Negocio</label>
                  <input
                    id="business-email"
                    type="email"
                    value={businessData.email}
                    onChange={(e) => setBusinessData({...businessData, email: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="contacto@minegocio.com"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Productos Iniciales</h2>
                <p className="text-gray-600">Importa desde Excel/CSV o agrega manualmente</p>
                <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-800">
                    <span className="font-bold">🚀 Estás a un paso:</span> Agrega tus productos y estarás listo para tu primera venta
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-400 transition-colors">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm font-medium text-gray-700 mb-2">Importar desde Excel/CSV</p>
                  <p className="text-xs text-gray-500 mb-4">Formato: codigo,nombre,precio,stock</p>
                  <input
                    type="file"
                    accept=".csv,.xlsx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-block bg-indigo-600 text-white px-6 py-2.5 rounded-xl cursor-pointer hover:bg-indigo-700 transition-colors font-medium"
                  >
                    Seleccionar Archivo
                  </label>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">o agrega manualmente</span>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                  <p className="text-sm font-medium text-gray-700 mb-4">Agregar Producto</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <input
                      type="text"
                      placeholder="Código"
                      value={manualProduct.code}
                      onChange={(e) => setManualProduct({...manualProduct, code: e.target.value})}
                      className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      type="text"
                      placeholder="Nombre"
                      value={manualProduct.name}
                      onChange={(e) => setManualProduct({...manualProduct, name: e.target.value})}
                      className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      type="number"
                      placeholder="Precio"
                      value={manualProduct.price || ''}
                      onChange={(e) => setManualProduct({...manualProduct, price: parseFloat(e.target.value) || 0})}
                      className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      type="number"
                      placeholder="Stock"
                      value={manualProduct.stock || ''}
                      onChange={(e) => setManualProduct({...manualProduct, stock: parseInt(e.target.value) || 0})}
                      className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <button
                    onClick={addManualProduct}
                    className="w-full bg-green-600 text-white py-2.5 rounded-xl hover:bg-green-700 transition-colors font-medium"
                  >
                    Agregar Producto
                  </button>
                </div>

                {products.length > 0 && (
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
                    <p className="text-sm font-semibold text-indigo-900 mb-3">
                      ✅ {products.length} productos agregados
                    </p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {products.slice(0, 5).map((p, i) => (
                        <div key={i} className="text-sm text-indigo-700 flex justify-between bg-white px-3 py-2 rounded-lg">
                          <span className="font-medium">{p.code} - {p.name}</span>
                          <span className="text-indigo-600">S/ {p.price} | Stock: {p.stock}</span>
                        </div>
                      ))}
                      {products.length > 5 && (
                        <p className="text-sm text-indigo-600 text-center pt-2">... y {products.length - 5} más</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Crea tu Usuario</h2>
                <p className="text-gray-600">Serás el administrador principal del sistema</p>
                <div className="mt-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4">
                  <p className="text-sm text-purple-800">
                    <span className="font-bold">🎉 Último paso:</span> Crea tu cuenta y empieza a vender en 60 segundos
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label htmlFor="full-name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="full-name"
                    type="text"
                    value={userData.full_name}
                    onChange={(e) => setUserData({...userData, full_name: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="Juan Pérez"
                  />
                </div>

                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    Usuario <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={userData.username}
                    onChange={(e) => setUserData({...userData, username: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="juanperez"
                    autoComplete="username"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={userData.email}
                    onChange={(e) => setUserData({...userData, email: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="juan@negocio.com"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={userData.password}
                    onChange={(e) => setUserData({...userData, password: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="Mínimo 6 caracteres"
                    autoComplete="new-password"
                  />
                </div>

                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-green-800">
                      ¡Casi listo! Al finalizar tendrás acceso completo al sistema.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
              >
                ← Atrás
              </button>
            )}
            
            <button
              onClick={handleComplete}
              disabled={loading}
              className={`px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all disabled:opacity-50 ${
                step === 1 ? 'ml-auto' : ''
              }`}
            >
              {loading ? 'Procesando...' : step === 3 ? '🚀 Finalizar' : 'Siguiente →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
