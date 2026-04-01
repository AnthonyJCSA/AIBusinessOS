import ScrollReveal from '@/components/ScrollReveal'

export default function ComparacionBotica() {
  const comparaciones = [
    {
      sinSistema: "Cierras caja en 1-2 horas",
      conCoriva: "Cierras caja en 1 minuto",
      icon: "⏰"
    },
    {
      sinSistema: "No sabes cuánto vendiste",
      conCoriva: "Ves tus ventas en tiempo real",
      icon: "📊"
    },
    {
      sinSistema: "Te quedas sin stock",
      conCoriva: "Te avisa antes que se acabe",
      icon: "📦"
    },
    {
      sinSistema: "Pierdes control de deudas",
      conCoriva: "Sabes quién debe y cuánto",
      icon: "💰"
    },
    {
      sinSistema: "Cuaderno y Excel",
      conCoriva: "Todo automático",
      icon: "📱"
    },
    {
      sinSistema: "No sabes qué comprar",
      conCoriva: "Reportes claros de qué pedir",
      icon: "📈"
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal>
          <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-4">
            Antes vs Después de AI Business OS
          </h2>
          <p className="text-center text-gray-600 mb-16 text-lg">
            La diferencia es clara
          </p>
        </ScrollReveal>
        
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-4 mb-6 text-center font-bold">
            <div></div>
            <div className="text-red-600 text-lg">❌ Sin sistema</div>
            <div className="text-green-600 text-lg">✅ Con AI Business OS</div>
          </div>
          
          {comparaciones.map((comp, i) => (
            <ScrollReveal key={i} delay={i * 100}>
              <div className="grid md:grid-cols-3 gap-4 mb-4 items-center">
                <div className="text-4xl text-center md:text-left">{comp.icon}</div>
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-center">
                  <p className="text-gray-700">{comp.sinSistema}</p>
                </div>
                <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 text-center font-semibold">
                  <p className="text-gray-900">{comp.conCoriva}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={600}>
          <div className="mt-12 text-center">
            <p className="text-2xl font-bold text-gray-900 mb-6">
              ¿Listo para el cambio?
            </p>
            <a 
              href="https://wa.me/51913916967?text=Hola,%20tengo%20una%20botica%20y%20quiero%20digitalizar%20mi%20negocio%20con%20Coriva%20Core."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all"
            >
              💬 Sí, quiero digitalizar mi botica →
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
