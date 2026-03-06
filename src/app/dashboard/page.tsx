'use client'

import { useState, useEffect } from 'react'
import { Organization, User, Product, CartItem, Sale } from '@/types'
import { productService as supabaseProductService, saleService as supabaseSaleService, cashService as supabaseCashService, authService } from '@/lib/services'
import CashRegisterModule from '@/app/CashRegisterModule'
import InventoryModule from '@/app/InventoryModule'
import ReportsModule from '@/app/ReportsModule'
import CustomersModule from '@/app/CustomersModule'
import SettingsModule from '@/app/SettingsModule'
import OnboardingWizard from '@/app/OnboardingWizard'
import UsersModule from '@/app/UsersModule'
import NotificationsPanel from '@/app/NotificationsPanel'
import { canAccessModule } from '@/lib/permissions'

// Demo data
export default function CorivaPOS() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [activeModule, setActiveModule] = useState('pos')
  const [loading, setLoading] = useState(true)
  
  const [products, setProducts] = useState<Product[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchCode, setSearchCode] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'EFECTIVO' | 'TARJETA' | 'YAPE' | 'PLIN' | 'TRANSFERENCIA'>('EFECTIVO')
  const [receiptType, setReceiptType] = useState<'BOLETA' | 'FACTURA' | 'TICKET'>('BOLETA')
  const [amountPaid, setAmountPaid] = useState('')

  // Check session
  useEffect(() => {
    const checkSession = async () => {
      const savedUser = sessionStorage.getItem('coriva_user')
      const savedOrg = sessionStorage.getItem('coriva_org')
      
      if (savedUser && savedOrg) {
        setCurrentUser(JSON.parse(savedUser))
        setCurrentOrg(JSON.parse(savedOrg))
        setIsAuthenticated(true)
      } else {
        window.location.href = '/'
      }
      setLoading(false)
    }
    checkSession()
  }, [])

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated && currentOrg) {
      loadProducts()
      loadSales()
    }
  }, [isAuthenticated, currentOrg])

  const loadProducts = async () => {
    if (!currentOrg) return
    try {
      const data = await supabaseProductService.getAll(currentOrg.id)
      setProducts(data)
    } catch (error) {
      console.error('Error loading products:', error)
    }
  }

  const loadSales = async () => {
    if (!currentOrg) return
    try {
      const data = await supabaseSaleService.getAll(currentOrg.id)
      setSales(data)
    } catch (error) {
      console.error('Error loading sales:', error)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setLoading(true)
    
    try {
      const result = await authService.login(username, password)
      
      if (result) {
        setCurrentUser(result.user)
        setCurrentOrg(result.org)
        setIsAuthenticated(true)
        
        // Guardar en sessionStorage
        sessionStorage.setItem('coriva_user', JSON.stringify(result.user))
        sessionStorage.setItem('coriva_org', JSON.stringify(result.org))
      } else {
        setLoginError('Usuario o contraseña incorrectos')
      }
    } catch (error) {
      console.error('Error login:', error)
      setLoginError('Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchCode.trim() && currentOrg) {
      const allProducts = await supabaseProductService.getAll(currentOrg.id)
      const results = allProducts.filter(p => 
        p.code.toLowerCase().includes(searchCode.toLowerCase()) ||
        p.name.toLowerCase().includes(searchCode.toLowerCase())
      )
      setSearchResults(results)
      
      if (results.length === 1) {
        addToCart(results[0])
        setSearchCode('')
        setSearchResults([])
      }
    }
  }

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.id === product.id)
    const currentQty = existing ? existing.quantity : 0
    
    if (currentQty < product.stock) {
      if (existing) {
        setCart(cart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ))
      } else {
        setCart([...cart, { ...product, quantity: 1 }])
      }
    } else {
      alert(`Stock insuficiente. Disponible: ${product.stock}`)
    }
  }

  const updateQuantity = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      setCart(cart.filter(item => item.id !== productId))
      return
    }
    
    const product = products.find(p => p.id === productId)
    if (product && newQty <= product.stock) {
      setCart(cart.map(item =>
        item.id === productId ? { ...item, quantity: newQty } : item
      ))
    } else {
      alert(`Stock insuficiente. Disponible: ${product?.stock}`)
    }
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const opGravadas = subtotal / 1.18
  const tax = subtotal - opGravadas
  const total = subtotal
  const change = amountPaid ? Number(amountPaid) - total : 0

  const printReceipt = (sale: any) => {
    const receiptContent = `
================================
${currentOrg?.name.toUpperCase()}
================================
${currentOrg?.address || ''}
${currentOrg?.ruc ? `RUC: ${currentOrg.ruc}` : ''}
${currentOrg?.phone ? `Tel: ${currentOrg.phone}` : ''}
================================
${receiptType}: ${sale.sale_number}
Fecha: ${new Date().toLocaleString('es-PE')}
${customerName ? `Cliente: ${customerName}` : ''}

================================
CANT  DESCRIPCIÓN      PRECIO
================================
${cart.map(item => {
  const qty = item.quantity.toString().padEnd(4)
  const name = item.name.substring(0, 20).padEnd(20)
  const price = `${currentOrg?.settings.currency} ${(item.price * item.quantity).toFixed(2)}`.padStart(10)
  return `${qty} ${name} ${price}`
}).join('\n')}
================================
OP. GRAVADAS:       ${currentOrg?.settings.currency} ${opGravadas.toFixed(2)}
IGV (18%):          ${currentOrg?.settings.currency} ${tax.toFixed(2)}
TOTAL:              ${currentOrg?.settings.currency} ${total.toFixed(2)}
Pago: ${paymentMethod}${amountPaid ? `\nRecibido:           ${currentOrg?.settings.currency} ${Number(amountPaid).toFixed(2)}` : ''}${change > 0 ? `\nVuelto:             ${currentOrg?.settings.currency} ${change.toFixed(2)}` : ''}

================================
    ¡Gracias por su compra!
${currentOrg?.settings.receipt_footer || ''}
================================`

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Comprobante</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body {
                font-family: 'Courier New', monospace;
                font-size: 12px;
                padding: 10mm;
              }
              pre { white-space: pre-wrap; }
              @media print {
                @page { size: 80mm auto; margin: 0; }
              }
            </style>
          </head>
          <body>
            <pre>${receiptContent}</pre>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 1000);
              }
            </script>
          </body>
        </html>
      `)
      printWindow.document.close()
    }
  }

  const processSale = async () => {
    if (cart.length === 0) {
      alert('Carrito vacío')
      return
    }

    if (paymentMethod === 'EFECTIVO' && (!amountPaid || Number(amountPaid) < total)) {
      alert('El monto recibido debe ser mayor o igual al total')
      return
    }

    if (!currentOrg) return

    try {
      const sale = await supabaseSaleService.create(currentOrg.id, {
        customerName: customerName || 'Cliente General',
        receiptType: receiptType,
        paymentMethod: paymentMethod,
        subtotal: opGravadas,
        tax: tax,
        total: total,
        amountPaid: amountPaid ? Number(amountPaid) : undefined,
        changeAmount: change > 0 ? change : undefined,
        items: cart,
        createdBy: currentUser?.username
      })

      await supabaseCashService.registerSale(currentOrg.id, sale.id, total)
      await loadProducts()
      await loadSales()
      
      printReceipt(sale)
      
      alert(`✅ Venta exitosa!\n${sale.sale_number}\nTotal: ${currentOrg?.settings.currency} ${total.toFixed(2)}${change > 0 ? `\nVuelto: ${currentOrg?.settings.currency} ${change.toFixed(2)}` : ''}`)
      
      setCart([])
      setCustomerName('')
      setSearchResults([])
      setAmountPaid('')
    } catch (error) {
      console.error('❌ Error procesando venta:', error)
      alert('❌ Error al procesar la venta')
    }
  }

  const updateProduct = async (updatedProduct: Product) => {
    await supabaseProductService.update(updatedProduct.id, updatedProduct)
    await loadProducts()
  }

  const deleteProduct = async (id: string) => {
    // Implementar delete en product.service
    await loadProducts()
  }

  const addProduct = async (newProduct: Omit<Product, 'id'>) => {
    if (!currentOrg) return
    await supabaseProductService.create(currentOrg.id, newProduct)
    await loadProducts()
  }

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (activeModule === 'pos') {
        if (e.key === 'F1') {
          e.preventDefault()
          setCart([])
          setCustomerName('')
          setSearchResults([])
        }
        
        if (e.key === 'F2') {
          e.preventDefault()
          processSale()
        }
        
        if (e.key === 'Escape') {
          setSearchCode('')
          setSearchResults([])
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [cart, activeModule])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (showOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Onboarding deshabilitado</h2>
          <p className="text-gray-600 mb-4">Por favor, contacta al administrador para crear tu cuenta</p>
          <button
            onClick={() => setShowOnboarding(false)}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Volver al login
          </button>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex">
        {/* Left side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-12 flex-col justify-between relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full -ml-48 -mb-48"></div>
          
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-white">Coriva Core</span>
            </div>
            
            <div className="space-y-6 text-white">
              <h1 className="text-5xl font-bold leading-tight">
                Gestiona tu negocio
                <br />
                <span className="text-white/80">de forma inteligente</span>
              </h1>
              <p className="text-xl text-white/80 max-w-md">
                Sistema POS completo para cualquier tipo de negocio. Simple, rápido y profesional.
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">Multi-Tenant</h3>
                <p className="text-white/70 text-sm">Múltiples negocios en una plataforma</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">Tiempo Real</h3>
                <p className="text-white/70 text-sm">Inventario y ventas sincronizados</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">Fácil de Usar</h3>
                <p className="text-white/70 text-sm">Interfaz intuitiva y moderna</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">Coriva Core</span>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Bienvenido de nuevo</h2>
              <p className="text-gray-600">Ingresa tus credenciales para continuar</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Usuario
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                  placeholder="Ingresa tu usuario"
                  required
                  autoComplete="username"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                  placeholder="Ingresa tu contraseña"
                  required
                  autoComplete="current-password"
                />
              </div>

              {loginError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-red-800">{loginError}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-200 disabled:opacity-50"
              >
                {loading ? 'Iniciando...' : 'Iniciar Sesión'}
              </button>
            </form>

            {/* Demo info */}
            <div className="mt-6 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-indigo-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-indigo-900 mb-1">Usuarios de Prueba</p>
                  <p className="text-sm text-indigo-700">
                    Usa las credenciales de tu organización creada en Supabase
                  </p>
                </div>
              </div>
            </div>

            {/* Register link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                ¿No tienes cuenta?{' '}
                <button
                  onClick={() => setShowOnboarding(true)}
                  className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Registra tu negocio
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const updateOrganization = (org: Organization) => {
    setCurrentOrg(org)
    sessionStorage.setItem('coriva_org', JSON.stringify(org))
  }

  // Render active module
  const renderActiveModule = () => {
    switch (activeModule) {
      case 'cash':
        return <CashRegisterModule currentUser={currentUser} />
      case 'inventory':
        return (
          <InventoryModule 
            products={products}
            onUpdateProduct={updateProduct}
            onAddProduct={addProduct}
            onDeleteProduct={deleteProduct}
            currentUser={currentUser}
          />
        )
      case 'reports':
        return <ReportsModule sales={sales} currentUser={currentUser} />
      case 'customers':
        return <CustomersModule currentUser={currentUser} />
      case 'users':
        return <UsersModule currentUser={currentUser!} organizationId={currentOrg!.id} />
      case 'settings':
        return <SettingsModule currentOrg={currentOrg!} onUpdate={updateOrganization} />
      default:
        return renderPOSModule()
    }
  }

  const renderPOSModule = () => (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              🔍 Búsqueda de Productos
            </label>
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              onKeyDown={handleSearch}
              className="w-full px-4 py-3 text-lg bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="Escribe código o nombre del producto..."
              autoComplete="off"
            />
          </div>

          {searchResults.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold mb-4 text-gray-900 flex items-center">
                <span className="text-lg">✨</span>
                <span className="ml-2">Resultados de Búsqueda</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {searchResults.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => {
                      addToCart(product)
                      setSearchResults([])
                      setSearchCode('')
                    }}
                    className="p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-indigo-500 hover:shadow-md bg-gradient-to-br from-white to-gray-50 transition-all"
                  >
                    <p className="font-semibold text-sm text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500 mb-2">[{product.code}]</p>
                    <div className="flex justify-between items-center">
                      <p className="text-indigo-600 font-bold text-lg">{currentOrg?.settings.currency} {product.price.toFixed(2)}</p>
                      <p className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">Stock: {product.stock}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold mb-4 text-gray-900 flex items-center">
              <span className="text-lg">📦</span>
              <span className="ml-2">Catálogo de Productos</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className={`p-4 border rounded-xl cursor-pointer transition-all ${
                    product.stock === 0 
                      ? 'bg-red-50 border-red-200 opacity-60 cursor-not-allowed' 
                      : 'border-gray-200 hover:border-indigo-500 hover:shadow-md bg-gradient-to-br from-white to-gray-50'
                  }`}
                >
                  <p className="font-semibold text-sm text-gray-900">{product.name}</p>
                  <p className="text-xs text-gray-500 mb-2">[{product.code}]</p>
                  <div className="flex justify-between items-center">
                    <p className="text-indigo-600 font-bold">{currentOrg?.settings.currency} {product.price.toFixed(2)}</p>
                    <p className={`text-xs font-medium px-2 py-1 rounded-full ${
                      product.stock > 10 ? 'bg-green-100 text-green-700' : 
                      product.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-red-100 text-red-700'
                    }`}>
                      {product.stock} unid.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-5">
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">👤 Cliente</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="Nombre del cliente"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">🧾 Comprobante</label>
            <select
              value={receiptType}
              onChange={(e) => setReceiptType(e.target.value as any)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              <option value="BOLETA">BOLETA</option>
              <option value="FACTURA">FACTURA</option>
              <option value="TICKET">TICKET</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">🛒 Carrito ({cart.length} items)</label>
            <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
              {cart.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <p className="text-gray-400 text-sm">Carrito vacío</p>
                  <p className="text-xs text-gray-400 mt-1">Agrega productos para comenzar</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="font-medium text-sm text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">{currentOrg?.settings.currency} {item.price.toFixed(2)} c/u</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors flex items-center justify-center"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {cart.length > 0 && (
            <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-700">
                  <span>Subtotal:</span>
                  <span className="font-medium">{currentOrg?.settings.currency} {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>OP. Gravadas:</span>
                  <span>{currentOrg?.settings.currency} {opGravadas.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>IGV (18%):</span>
                  <span>{currentOrg?.settings.currency} {tax.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex justify-between font-bold text-xl border-t border-indigo-300 pt-3 mt-3 text-indigo-700">
                <span>TOTAL:</span>
                <span>{currentOrg?.settings.currency} {total.toFixed(2)}</span>
              </div>
              
              {paymentMethod === 'EFECTIVO' && (
                <div className="mt-3 pt-3 border-t border-indigo-300">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">💵 Monto Recibido:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg font-semibold"
                    placeholder="0.00"
                  />
                  {amountPaid && Number(amountPaid) >= total && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                      <div className="flex justify-between font-bold text-green-700">
                        <span>💰 VUELTO:</span>
                        <span className="text-lg">{currentOrg?.settings.currency} {change.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                  {amountPaid && Number(amountPaid) < total && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                      <div className="text-red-700 text-sm font-medium">
                        ⚠️ Falta: {currentOrg?.settings.currency} {(total - Number(amountPaid)).toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">💳 Método de Pago</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              <option value="EFECTIVO">💵 EFECTIVO</option>
              <option value="TARJETA">💳 TARJETA</option>
              <option value="YAPE">📱 YAPE</option>
              <option value="PLIN">📱 PLIN</option>
              <option value="TRANSFERENCIA">🏦 TRANSFERENCIA</option>
            </select>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={processSale}
              disabled={cart.length === 0 || (paymentMethod === 'EFECTIVO' && (!amountPaid || Number(amountPaid) < total))}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3.5 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              🖨️ PROCESAR VENTA (F2)
            </button>
            
            <button
              onClick={() => {
                setCart([])
                setCustomerName('')
                setSearchResults([])
                setAmountPaid('')
              }}
              className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-2.5 rounded-xl font-medium hover:from-red-600 hover:to-pink-600 transition-all"
            >
              🗑️ LIMPIAR (F1)
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto">
        
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold">🚀 {currentOrg?.name} - Coriva Core</h1>
              <p className="text-sm opacity-90">
                {activeModule === 'pos' ? 'F1: Nueva Venta | F2: Procesar | ESC: Limpiar' : 'Sistema Multi-Tenant SaaS'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm">{currentUser?.full_name}</p>
              <p className="text-xs opacity-75">{currentUser?.role}</p>
              <button
                onClick={() => {
                  sessionStorage.clear()
                  window.location.href = '/'
                }}
                className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded mt-1 hover:bg-opacity-30"
              >
                Cerrar Sesión
              </button>
            </div>
            <NotificationsPanel products={products} sales={sales} />
          </div>

          <div className="flex space-x-2">
            {canAccessModule(currentUser!.role, 'pos') && (
              <button
                onClick={() => setActiveModule('pos')}
                className={`px-4 py-2 rounded text-sm font-medium transition-all ${
                  activeModule === 'pos' 
                    ? 'bg-white text-blue-600' 
                    : 'bg-white bg-opacity-20 hover:bg-opacity-30'
                }`}
              >
                💰 Punto de Venta
              </button>
            )}
            
            {canAccessModule(currentUser!.role, 'cash') && (
              <button
                onClick={() => setActiveModule('cash')}
                className={`px-4 py-2 rounded text-sm font-medium transition-all ${
                  activeModule === 'cash' 
                    ? 'bg-white text-blue-600' 
                    : 'bg-white bg-opacity-20 hover:bg-opacity-30'
                }`}
              >
                💵 Caja
              </button>
            )}
            
            {canAccessModule(currentUser!.role, 'inventory') && (
              <button
                onClick={() => setActiveModule('inventory')}
                className={`px-4 py-2 rounded text-sm font-medium transition-all ${
                  activeModule === 'inventory' 
                    ? 'bg-white text-blue-600' 
                    : 'bg-white bg-opacity-20 hover:bg-opacity-30'
                }`}
              >
                📦 Inventario
              </button>
            )}
            
            {canAccessModule(currentUser!.role, 'reports') && (
              <button
                onClick={() => setActiveModule('reports')}
                className={`px-4 py-2 rounded text-sm font-medium transition-all ${
                  activeModule === 'reports' 
                    ? 'bg-white text-blue-600' 
                    : 'bg-white bg-opacity-20 hover:bg-opacity-30'
                }`}
              >
                📈 Reportes
              </button>
            )}
            
            {canAccessModule(currentUser!.role, 'customers') && (
              <button
                onClick={() => setActiveModule('customers')}
                className={`px-4 py-2 rounded text-sm font-medium transition-all ${
                  activeModule === 'customers' 
                    ? 'bg-white text-blue-600' 
                    : 'bg-white bg-opacity-20 hover:bg-opacity-30'
                }`}
              >
                👥 Clientes
              </button>
            )}
            
            {canAccessModule(currentUser!.role, 'users') && (
              <button
                onClick={() => setActiveModule('users')}
                className={`px-4 py-2 rounded text-sm font-medium transition-all ${
                  activeModule === 'users' 
                    ? 'bg-white text-blue-600' 
                    : 'bg-white bg-opacity-20 hover:bg-opacity-30'
                }`}
              >
                👤 Usuarios
              </button>
            )}
            
            {canAccessModule(currentUser!.role, 'settings') && (
              <button
                onClick={() => setActiveModule('settings')}
                className={`px-4 py-2 rounded text-sm font-medium transition-all ${
                  activeModule === 'settings' 
                    ? 'bg-white text-blue-600' 
                    : 'bg-white bg-opacity-20 hover:bg-opacity-30'
                }`}
              >
                ⚙️ Configuración
              </button>
            )}
          </div>
        </div>

        <div className="bg-white shadow-lg">
          {renderActiveModule()}
        </div>
      </div>

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/51913916967?text=Hola,%20necesito%20ayuda%20con%20Coriva%20Core"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl transition-all hover:scale-110 z-50"
        title="Soporte por WhatsApp"
      >
        💬
      </a>
    </div>
  )
}
