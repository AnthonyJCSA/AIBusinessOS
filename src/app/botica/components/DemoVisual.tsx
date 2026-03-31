import ScrollReveal from '@/components/ScrollReveal'

export default function DemoVisual() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal>
          <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-4">
            Así de fácil es usar Coriva Core
          </h2>
          <p className="text-center text-gray-600 mb-16 text-lg">
            No necesitas ser experto en computadoras
          </p>
        </ScrollReveal>
        
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <ScrollReveal delay={100}>
            <div className="text-center">
              <div className="bg-gradient-to-br from-green-100 to-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                1️⃣
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Busca el medicamento</h3>
              <p className="text-gray-600">Escribe el nombre y aparece al instante</p>
            </div>
          </ScrollReveal>
          
          <ScrollReveal delay={200}>
            <div className="text-center">
              <div className="bg-gradient-to-br from-green-100 to-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                2️⃣
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Cobra la venta</h3>
              <p className="text-gray-600">Efectivo, tarjeta o yape. Tú eliges</p>
            </div>
          </ScrollReveal>
          
          <ScrollReveal delay={300}>
            <div className="text-center">
              <div className="bg-gradient-to-br from-green-100 to-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                3️⃣
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Listo</h3>
              <p className="text-gray-600">El stock se actualiza solo</p>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={400}>
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl p-8 border border-gray-200 max-w-4xl mx-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b">
                <h3 className="text-2xl font-bold text-gray-900">💊 Nueva Venta</h3>
                <div className="text-sm text-gray-500">Hoy, 3:45 PM</div>
              </div>
              
              <div className="bg-white rounded-xl p-4 border-2 border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-gray-900">Paracetamol 500mg</div>
                  <div className="text-green-600 font-bold">S/ 2.50</div>
                </div>
                <div className="text-sm text-gray-500">Stock disponible: 45 unidades</div>
              </div>

              <div className="bg-white rounded-xl p-4 border-2 border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-gray-900">Ibuprofeno 400mg</div>
                  <div className="text-green-600 font-bold">S/ 3.80</div>
                </div>
                <div className="text-sm text-gray-500">Stock disponible: 28 unidades</div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-gray-700 font-semibold">Total a cobrar:</div>
                  <div className="text-4xl font-bold text-green-600">S/ 6.30</div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <button className="bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-all">
                    Efectivo
                  </button>
                  <button className="bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all">
                    Tarjeta
                  </button>
                  <button className="bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition-all">
                    Yape
                  </button>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={500}>
          <div className="mt-12 text-center">
            <a 
              href="/demo"
              className="inline-block border-2 border-green-600 text-green-600 px-8 py-4 rounded-xl font-bold hover:bg-green-600 hover:text-white transition-all"
            >
              Ver demo completa →
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
