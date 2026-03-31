import ScrollReveal from '@/components/ScrollReveal'

export default function BeneficiosBotica() {
  const beneficios = [
    {
      icon: "✅",
      titulo: "Cierra tu caja en 1 minuto",
      descripcion: "El sistema cuenta todo automático. Sabes al instante si cuadra o no"
    },
    {
      icon: "📊",
      titulo: "Sabe cuánto ganas hoy",
      descripcion: "Ves en tiempo real cuánto vendiste, cuánto ganaste y qué te falta cobrar"
    },
    {
      icon: "🔔",
      titulo: "No te quedes sin stock",
      descripcion: "Te avisa cuando un medicamento se está acabando. Compras a tiempo"
    },
    {
      icon: "💳",
      titulo: "Controla las deudas",
      descripcion: "Registra quién debe, cuánto debe y cuándo debe pagar. No pierdes plata"
    },
    {
      icon: "⚡",
      titulo: "Vende más rápido",
      descripcion: "Busca el medicamento, cobra y listo. Sin papeles, sin demoras"
    },
    {
      icon: "📱",
      titulo: "Desde tu celular",
      descripcion: "Revisa tus ventas desde donde estés. No necesitas estar en la botica"
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal>
          <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-4">
            Qué ganas con Coriva Core
          </h2>
          <p className="text-center text-gray-600 mb-16 text-lg">
            Beneficios reales que ves desde el primer día
          </p>
        </ScrollReveal>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {beneficios.map((beneficio, i) => (
            <ScrollReveal key={i} delay={i * 100}>
              <div className="bg-white p-8 rounded-2xl border border-green-200 hover:shadow-xl hover:border-green-400 transition-all">
                <div className="text-5xl mb-4">{beneficio.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{beneficio.titulo}</h3>
                <p className="text-gray-600 leading-relaxed">{beneficio.descripcion}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
