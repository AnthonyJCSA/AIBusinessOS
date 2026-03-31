import ScrollReveal from '@/components/ScrollReveal'

export default function BeneficiosBodega() {
  const beneficios = [
    {
      icon: "💰",
      titulo: "Sabe cuánto ganas hoy",
      descripcion: "Ves en tiempo real cuánto vendiste y cuánto ganaste. Sin esperar al fin de mes"
    },
    {
      icon: "⚡",
      titulo: "Cierra tu caja en 1 minuto",
      descripcion: "El sistema cuenta todo automático. Sabes al instante si cuadra o falta plata"
    },
    {
      icon: "🔔",
      titulo: "No pierdas ventas",
      descripcion: "Te avisa cuando un producto se está acabando. Compras a tiempo y siempre tienes"
    },
    {
      icon: "📊",
      titulo: "Sabe qué vender más",
      descripcion: "Ves qué productos se venden más y cuáles no. Compras solo lo que necesitas"
    },
    {
      icon: "💳",
      titulo: "Controla las deudas",
      descripcion: "Registra quién debe, cuánto debe y cuándo debe pagar. No pierdes plata fiando"
    },
    {
      icon: "📱",
      titulo: "Desde tu celular",
      descripcion: "Revisa tus ventas desde donde estés. No necesitas estar en la bodega"
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal>
          <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-4">
            Qué cambia cuando usas Coriva Core
          </h2>
          <p className="text-center text-gray-600 mb-16 text-lg">
            Beneficios reales que ves desde el primer día
          </p>
        </ScrollReveal>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {beneficios.map((beneficio, i) => (
            <ScrollReveal key={i} delay={i * 100}>
              <div className="bg-white p-8 rounded-2xl border border-blue-200 hover:shadow-xl hover:border-blue-400 transition-all">
                <div className="text-5xl mb-4">{beneficio.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{beneficio.titulo}</h3>
                <p className="text-gray-600 leading-relaxed">{beneficio.descripcion}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
        <ScrollReveal delay={600}>
          <div className="mt-12 text-center">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl mx-auto border-2 border-blue-300">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Más ventas + Menos pérdida + Menos estrés
              </h3>
              <p className="text-gray-600 mb-6">
                Deja el cuaderno y empieza a ganar más con Coriva Core
              </p>
              <a 
                href="https://wa.me/51913916967?text=Hola,%20tengo%20una%20bodega%20y%20quiero%20ordenar%20mi%20negocio%20con%20Coriva%20Core."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all"
              >
                💬 Quiero estos beneficios →
              </a>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
