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
            Qué cambia cuando usas AI Business OS
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
                Deja el cuaderno y empieza a ganar más con AI Business OS
              </p>
              <a 
                href="https://wa.me/51913916967?text=Hola,%20tengo%20una%20bodega%20y%20quiero%20ordenar%20mi%20negocio%20con%20AI Business OS%20Core."
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
'use client'

const C = { ink: '#0C0E12', lime: '#C8F23A', orange: '#FF5A1F', wa: '#25D366', border2: '#D4D2CC' }
const WA = "https://wa.me/51913916967?text=Hola,%20tengo%20una%20bodega%20y%20quiero%20ordenar%20mi%20negocio%20con%20AI Business OS%20Core."

export default function CTAFinalBodega() {
  return (
    <section style={{ background: C.ink, padding: '100px clamp(20px,5vw,80px)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -200, right: -200, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,242,58,0.08), transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr auto', gap: 60, alignItems: 'center' }} className="cta-bodega-grid">
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: C.lime, display: 'block', marginBottom: 16 }}>Empieza hoy</span>
          <h2 style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 'clamp(36px,5vw,62px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: -2, color: '#fff', marginBottom: 16 }}>
            Ordena tu<br />bodega <em style={{ fontStyle: 'italic', fontWeight: 300, color: C.lime }}>ahora.</em>
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
            Implementación gratis. Soporte personalizado.<br />En 1 día estás vendiendo con sistema.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 280 }}>
          <a href={WA} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, padding: '14px 24px', borderRadius: 12, fontSize: 15, fontWeight: 700, background: C.wa, color: '#fff', textDecoration: 'none' }}>
            💬 Hablar con un asesor ahora →
          </a>
          <a href="/registro" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, padding: '14px 26px', borderRadius: 12, fontSize: 15, fontWeight: 600, background: 'transparent', border: `1.5px solid ${C.border2}`, color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
            Registrarme gratis
          </a>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
            {['Implementación gratis · S/79/mes','📞 +51 913 916 967','📧 soporte@AI Business OSpe.com'].map(p => (
              <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.lime, flexShrink: 0 }} />{p}
              </div>
            ))}
          </div>
        </div>
      </div>
      <footer style={{ maxWidth: 1200, margin: '60px auto 0', paddingTop: 36, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.3)' }}>AI Business OS</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>soporte@AI Business OSpe.com · +51 913 916 967</div>
        <div style={{ display: 'flex', gap: 20 }}>
          {[['Inicio','/'],['Términos','#'],['WhatsApp',WA]].map(([label,href]) => (
            <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', textDecoration: 'none' }}>{label}</a>
          ))}
        </div>
      </footer>
      <style>{`@media (max-width: 900px) { .cta-bodega-grid { grid-template-columns: 1fr !important; gap: 40px !important; } }`}</style>
    </section>
  )
}
'use client'

import { useState } from 'react'

const C = { ink: '#0C0E12', muted: '#6B7280', bg2: '#F3F2EF', card: '#FFFFFF', border: '#E5E3DE', lime: '#C8F23A', wa: '#25D366' }
const WA = "https://wa.me/51913916967?text=Hola,%20tengo%20una%20bodega%20y%20quiero%20ordenar%20mi%20negocio%20con%20AI Business OS%20Core."

const faqs = [
  { q: '¿Necesito computadora?', a: 'No. Funciona en celular, tablet y computadora. Puedes vender desde tu celular sin problema.' },
  { q: '¿Me ayudan a instalarlo?', a: 'Sí, totalmente gratis. Un asesor te ayuda a cargar tus productos y configurar todo. En 1 día estás vendiendo.' },
  { q: '¿Puedo importar desde Excel?', a: 'Sí. Si tienes tu lista de productos en Excel, te la cargamos nosotros sin costo adicional.' },
  { q: '¿Cuánto demora estar listo?', a: 'En 1 día estás vendiendo. La configuración inicial toma entre 2 y 4 horas con nuestro equipo.' },
  { q: '¿Puedo cancelar cuando quiera?', a: 'Sí. Sin contratos ni penalidades. Cancela con un mensaje por WhatsApp, cuando quieras.' },
]

export default function FAQBodega() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <section style={{ padding: '100px clamp(20px,5vw,80px)', background: C.bg2 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: C.muted, display: 'block', marginBottom: 16 }}>FAQ</span>
          <h2 style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 'clamp(32px,4.5vw,54px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: -2, color: C.ink }}>
            Resolvemos<br />tus dudas
          </h2>
        </div>
        <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {faqs.map((f, i) => (
            <div key={i} onClick={() => setOpen(open === i ? null : i)}
              style={{ background: C.card, border: `1px solid ${open === i ? C.ink : C.border}`, borderRadius: 14, overflow: 'hidden', cursor: 'pointer', transition: '.2s' }}>
              <div style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, fontSize: 15, fontWeight: 600, color: C.ink }}>
                {f.q}
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: open === i ? C.ink : '#F3F2EF', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: open === i ? C.lime : C.muted, flexShrink: 0, transition: '.2s', transform: open === i ? 'rotate(45deg)' : 'none' }}>+</div>
              </div>
              {open === i && <div style={{ padding: '0 22px 18px', fontSize: 14, color: C.muted, lineHeight: 1.7 }}>{f.a}</div>}
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <a href={WA} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '15px 28px', borderRadius: 12, fontSize: 16, fontWeight: 700, background: C.wa, color: '#fff', textDecoration: 'none' }}>
            💬 ¿Más preguntas? Escríbenos →
          </a>
        </div>
      </div>
    </section>
  )
}
'use client'

const C = {
  ink: '#0C0E12', ink2: '#2D3142', muted: '#6B7280', pale: '#9CA3AF',
  bg: '#FAFAF8', bg2: '#F3F2EF', card: '#FFFFFF', border: '#E5E3DE', border2: '#D4D2CC',
  lime: '#C8F23A', orange: '#FF5A1F', green: '#0D9C6E', greenLight: '#E8F8F3',
  amber: '#E8970A', amberLight: '#FEF6E4', wa: '#25D366',
}
const WA = "https://wa.me/51913916967?text=Hola,%20tengo%20una%20bodega%20y%20quiero%20ordenar%20mi%20negocio%20con%20AI Business OS%20Core."

export default function HeroBodega() {
  return (
    <section style={{ minHeight: '100vh', padding: '100px clamp(20px,5vw,80px) 80px', background: `linear-gradient(180deg, #FFF8F0 0%, ${C.bg} 60%)`, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }} className="bodega-hero-grid">

        {/* LEFT */}
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: `1.5px solid rgba(232,151,10,0.3)`, borderRadius: 99, padding: '5px 14px 5px 8px', fontSize: 12, fontWeight: 600, color: C.ink2, marginBottom: 24, background: C.amberLight }}>
            <span style={{ width: 24, height: 24, background: C.amber, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>🛒</span>
            Sistema especializado para bodegas en Perú
          </div>

          <h1 style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 'clamp(44px,6vw,76px)', fontWeight: 900, lineHeight: 0.96, letterSpacing: -3, marginBottom: 24, color: C.ink }}>
            Para bodegas<br />que quieren<br />
            <em style={{ fontStyle: 'italic', color: C.orange, fontWeight: 300, display: 'block' }}>ganar</em>
            <span style={{ position: 'relative', whiteSpace: 'nowrap' }}>
              más.
              <span style={{ position: 'absolute', left: 0, bottom: -4, width: '100%', height: 6, background: C.lime, borderRadius: 3, zIndex: -1, transform: 'rotate(-1deg)', display: 'block' }} />
            </span>
          </h1>

          <p style={{ fontSize: 18, lineHeight: 1.7, color: C.muted, marginBottom: 28, maxWidth: 480 }}>
            Vende rápido, controla tu mercadería y tu plata desde <strong style={{ color: C.ink }}>S/ 79 al mes</strong>. Ordena tu negocio en 1 día.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 32 }}>
            {[['1 min','Cierre de caja'],['+40%','Más ventas'],['S/ 0','Dinero perdido']].map(([v,l]) => (
              <div key={l} style={{ textAlign: 'center', padding: 14, background: C.amberLight, border: '1px solid rgba(232,151,10,0.2)', borderRadius: 14 }}>
                <div style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 24, fontWeight: 900, color: C.amber }}>{v}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{l}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a href={WA} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '15px 28px', borderRadius: 12, fontSize: 16, fontWeight: 700, background: C.wa, color: '#fff', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              💬 Quiero que me lo instalen →
            </a>
            <a href="/registro" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '15px 26px', borderRadius: 12, fontSize: 16, fontWeight: 600, background: 'transparent', border: `1.5px solid ${C.border2}`, color: C.ink2, textDecoration: 'none' }}>
              Registrarme gratis
            </a>
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 24, boxShadow: '0 8px 28px rgba(12,14,18,0.08)' }}>
            <div style={{ color: C.amber, fontSize: 14, marginBottom: 10 }}>★★★★★</div>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: C.ink2, fontStyle: 'italic', marginBottom: 16 }}>
              "Antes no sabía cuánto ganaba. Cerraba caja en 1 hora y <strong style={{ fontStyle: 'normal', color: C.ink }}>siempre faltaba plata</strong>. Ahora en 1 minuto y veo todo en mi celular."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: C.amber, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>JP</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>Juan Pérez</div>
                <div style={{ fontSize: 11, color: C.muted }}>Bodega Don Juan · San Juan de Miraflores</div>
              </div>
            </div>
          </div>

          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 24, overflow: 'hidden', boxShadow: '0 16px 48px rgba(12,14,18,0.1)' }}>
            <div style={{ background: C.ink, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {['#FF5F57','#FEBC2E','#28C840'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginLeft: 8 }}>🛒 Bodega El Ahorro · Lima</span>
              <span style={{ marginLeft: 'auto', background: C.lime, color: C.ink, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>En vivo</span>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 16px' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.6px', color: C.muted, marginBottom: 6 }}>Ventas hoy</div>
                  <div style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 26, fontWeight: 700, color: C.green }}>S/ 850</div>
                  <div style={{ fontSize: 11, color: C.pale, marginTop: 4 }}>245 productos</div>
                </div>
                <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 16px' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.6px', color: C.muted, marginBottom: 6 }}>Caja</div>
                  <div style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 26, fontWeight: 700, color: C.ink }}>✅ OK</div>
                  <div style={{ fontSize: 11, color: C.pale, marginTop: 4 }}>Todo cuadra</div>
                </div>
              </div>
              <div style={{ background: C.amberLight, border: '1px solid rgba(232,151,10,0.2)', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.amber, marginBottom: 2 }}>Coca Cola 1L — Quedan 5 unidades</div>
                  <div style={{ fontSize: 11, color: C.muted }}>IA recomienda reponer hoy · Agotamiento en ~2 días</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 900px) { .bodega-hero-grid { grid-template-columns: 1fr !important; gap: 48px !important; } }`}</style>
    </section>
  )
}
'use client'

const C = { ink: '#0C0E12', muted: '#6B7280', bg: '#FAFAF8', bg2: '#F3F2EF', card: '#FFFFFF', border: '#E5E3DE', lime: '#C8F23A', green: '#0D9C6E', greenLight: '#E8F8F3', orange: '#FF5A1F', wa: '#25D366', pale: '#9CA3AF' }
const WA = "https://wa.me/51913916967?text=Hola,%20tengo%20una%20bodega%20y%20quiero%20ordenar%20mi%20negocio%20con%20AI Business OS%20Core."

const plans = [
  {
    name: 'Starter', badge: '🔥 Más popular', price: 'S/ 79', old: 'Antes S/ 129 / mes',
    ai: '🤖 IA Básica', aiDesc: 'Alertas de stock automáticas',
    feats: ['Control de ventas','Control de mercadería','Control de caja','Alertas cuando se acaba','Reportes de ventas','Control de deudas','Soporte en Perú','Te enseñamos a usarlo'],
    cta: '💬 Empezar con Starter →', highlight: true,
  },
  {
    name: 'PRO', badge: '⚡ IA Avanzada', price: 'S/ 149', old: 'Antes S/ 249 / mes',
    ai: '🧠 IA Avanzada', aiDesc: 'Predicción, campañas y segmentación',
    feats: ['Todo lo del Starter','IA predicción de ventas','Campañas WhatsApp IA','Segmentación de clientes','Tienda virtual','Catálogo digital','Reportes avanzados','Soporte prioritario'],
    cta: '💬 Empezar con PRO →', highlight: false,
  },
]

export default function OfertaBodega() {
  return (
    <section style={{ padding: '100px clamp(20px,5vw,80px)', background: C.bg }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: C.orange, display: 'block', marginBottom: 16 }}>🔥 Oferta limitada · Solo 50 cupos</span>
          <h2 style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 'clamp(32px,4.5vw,54px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: -2, color: C.ink }}>
            Elige tu plan<br />para <em style={{ fontStyle: 'italic', fontWeight: 300, color: C.orange }}>bodegas</em>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 900, margin: '0 auto' }} className="plans-bodega-grid">
          {plans.map(p => (
            <div key={p.name} style={{ background: C.card, border: `2px solid ${p.highlight ? C.ink : C.border}`, borderRadius: 28, overflow: 'hidden', boxShadow: p.highlight ? '0 24px 80px rgba(12,14,18,0.14)' : '0 8px 32px rgba(12,14,18,0.06)' }}>
              <div style={{ background: p.highlight ? C.ink : C.bg2, padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 22, fontWeight: 900, color: p.highlight ? C.lime : C.ink }}>{p.name}</span>
                <span style={{ background: p.highlight ? C.orange : C.greenLight, color: p.highlight ? '#fff' : C.green, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 99 }}>{p.badge}</span>
              </div>
              <div style={{ padding: 32 }}>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <div style={{ fontSize: 14, color: C.pale, textDecoration: 'line-through', marginBottom: 4 }}>{p.old}</div>
                  <div style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 64, fontWeight: 900, color: C.ink, letterSpacing: -3, lineHeight: 1 }}>{p.price}</div>
                  <div style={{ fontSize: 14, color: C.muted, marginTop: 6 }}>por mes, todo incluido</div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10, background: p.highlight ? C.bg2 : C.greenLight, borderRadius: 99, padding: '5px 12px', fontSize: 12, fontWeight: 700, color: p.highlight ? C.muted : C.green }}>
                    {p.ai} · {p.aiDesc}
                  </div>
                </div>
                <div style={{ height: 1, background: C.border, margin: '20px 0' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                  {p.feats.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.ink }}>
                      <span style={{ color: C.green, fontSize: 14, flexShrink: 0 }}>✓</span>{f}
                    </div>
                  ))}
                </div>
                <a href={WA} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, width: '100%', padding: '14px', borderRadius: 14, fontSize: 15, fontWeight: 700, background: p.highlight ? C.wa : C.ink, color: '#fff', textDecoration: 'none' }}>
                  {p.cta}
                </a>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: C.orange, marginTop: 20 }}>
          ⏰ Solo para las primeras 50 bodegas · Implementación gratis incluida
        </div>
      </div>
      <style>{`@media (max-width: 640px) { .plans-bodega-grid { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  )
}
'use client'

const C = { ink: '#0C0E12', muted: '#6B7280', bg2: '#F3F2EF', card: '#FFFFFF', border: '#E5E3DE', border2: '#D4D2CC', orange: '#FF5A1F', amber: '#E8970A', wa: '#25D366' }
const WA = "https://wa.me/51913916967?text=Hola,%20tengo%20una%20bodega%20y%20quiero%20ordenar%20mi%20negocio%20con%20AI Business OS%20Core."

const probs = [
  { n:'01', ico:'❓', title:'No sabes cuánto ganas al día', desc:'Vendes todo el día pero no sabes si ganas o pierdes.', tag:'Sin datos', red: false },
  { n:'02', ico:'⏰', title:'Pierdes tiempo cerrando caja', desc:'1 hora contando billetes y revisando el cuaderno.', tag:'Tiempo', red: false },
  { n:'03', ico:'📦', title:'No sabes qué se acaba', desc:'Los clientes piden y no tienes. Ventas perdidas todos los días.', tag:'Pérdida', red: true },
  { n:'04', ico:'💰', title:'Fiados que no se cobran', desc:'No te acuerdas quién debe ni cuánto. Plata perdida.', tag:'Pérdida', red: true },
  { n:'05', ico:'📓', title:'El cuaderno es un lío', desc:'Números borrados, hojas perdidas. Caos total.', tag:'Sin control', red: true },
  { n:'06', ico:'😰', title:'¿Me están robando?', desc:'La caja no cuadra y no sabes si es error o robo.', tag:'Riesgo', red: true },
]

export default function ProblemasBodega() {
  return (
    <section style={{ padding: '100px clamp(20px,5vw,80px)', background: C.bg2 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }} className="prob-bodega-grid">
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: C.orange, display: 'block', marginBottom: 16 }}>¿Te pasa esto?</span>
          <h2 style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 'clamp(32px,4.5vw,54px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: -2, color: C.ink, marginBottom: 16 }}>
            Los problemas<br />de tu bodega<br /><em style={{ fontStyle: 'italic', fontWeight: 300, color: C.orange }}>terminan hoy</em>
          </h2>
          <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.7, marginBottom: 32 }}>Estos son los problemas más comunes de los bodegueros. AI Business OS los resuelve desde el primer día.</p>
          <a href={WA} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '15px 28px', borderRadius: 12, fontSize: 16, fontWeight: 700, background: C.wa, color: '#fff', textDecoration: 'none' }}>
            💬 Ordenar mi bodega ahora →
          </a>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {probs.map(p => (
            <div key={p.n} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px', borderRadius: 12, border: `1px solid ${C.border}`, background: C.card, transition: '.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(12,14,18,0.06)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '' }}>
              <span style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 13, fontWeight: 700, color: C.border2, width: 28, flexShrink: 0 }}>{p.n}</span>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{p.ico}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.ink, marginBottom: 2 }}>{p.title}</div>
                <div style={{ fontSize: 13, color: C.muted }}>{p.desc}</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, flexShrink: 0, whiteSpace: 'nowrap', background: p.red ? 'rgba(220,38,38,0.08)' : '#FEF6E4', color: p.red ? '#DC2626' : C.amber }}>{p.tag}</span>
            </div>
          ))}
        </div>
      </div>
      <style>{`@media (max-width: 900px) { .prob-bodega-grid { grid-template-columns: 1fr !important; gap: 48px !important; } }`}</style>
    </section>
  )
}
'use client'

const C = { ink: '#0C0E12', muted: '#6B7280', bg: '#FAFAF8', card: '#FFFFFF', border: '#E5E3DE', lime: '#C8F23A', green: '#0D9C6E', amber: '#E8970A' }

const steps = [
  { n: '1', title: 'Busca el producto', desc: 'Escribe el nombre o código. Aparece al instante con precio y stock.' },
  { n: '2', title: 'Cobra la venta', desc: 'Efectivo, Yape o Plin. El sistema registra todo automáticamente.' },
  { n: '3', title: '¡Listo! A seguir vendiendo', desc: 'Stock actualizado. Caja registrada. Todo sin hacer nada extra.' },
]

export default function StorysellingBodega() {
  return (
    <section style={{ padding: '100px clamp(20px,5vw,80px)', background: C.bg }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }} className="story-bodega-grid">
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: C.muted, display: 'block', marginBottom: 16 }}>Así de fácil</span>
          <h2 style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 'clamp(32px,4.5vw,54px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: -2, color: C.ink, marginBottom: 16 }}>
            Deja el cuaderno.<br />Empieza en <em style={{ fontStyle: 'italic', fontWeight: 300, color: '#FF5A1F' }}>3 pasos.</em>
          </h2>
          <p style={{ fontSize: 17, color: C.muted, lineHeight: 1.7, marginBottom: 36 }}>No necesitas saber nada de tecnología. En 1 día estás vendiendo con sistema.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 20, padding: '24px 0', borderBottom: i < steps.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: C.lime, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Fraunces',Georgia,serif", fontSize: 16, fontWeight: 900, color: C.ink, flexShrink: 0 }}>{s.n}</div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: C.ink, marginBottom: 6 }}>{s.title}</div>
                  <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.6 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 24, overflow: 'hidden', boxShadow: '0 24px 60px rgba(12,14,18,0.1)' }}>
          <div style={{ background: C.ink, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>🛒 Nueva Venta</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: C.lime }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.lime, display: 'inline-block' }} />En vivo
            </span>
          </div>
          <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[['Coca Cola 1L','BOD-001 · ×2','S/ 9.00','⚠️ 5 en stock'],['Arroz Extra 1kg','BOD-002 · ×1','S/ 4.20','40 en stock']].map(([name,sku,price,stock]) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#F3F2EF', borderRadius: 12, border: `1px solid ${C.border}` }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, marginBottom: 2 }}>{name}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF' }}>{sku}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 18, fontWeight: 700, color: C.ink }}>{price}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{stock}</div>
                </div>
              </div>
            ))}
            <div style={{ background: C.ink, borderRadius: 14, padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>Total a cobrar</span>
              <span style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 28, fontWeight: 900, color: C.lime }}>S/ 13.20</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {[['💵 Efectivo', true],['📱 Yape', false],['📱 Plin', false]].map(([label, active]) => (
                <div key={String(label)} style={{ padding: 10, borderRadius: 10, fontSize: 12, fontWeight: 700, textAlign: 'center', border: `1.5px solid ${active ? C.ink : C.border}`, color: active ? C.ink : C.muted, background: active ? '#F3F2EF' : 'transparent', cursor: 'pointer' }}>{label}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 900px) { .story-bodega-grid { grid-template-columns: 1fr !important; gap: 48px !important; } }`}</style>
    </section>
  )
}
'use client'

const C = { ink: '#0C0E12', ink2: '#2D3142', muted: '#6B7280', bg: '#FAFAF8', card: '#FFFFFF', border: '#E5E3DE', amber: '#E8970A' }

const testimonios = [
  { quote: <>Antes no sabía cuánto ganaba. Ahora veo mis ventas en tiempo real desde mi celular. <strong>Es como tener un contador gratis.</strong></>, name: 'Juan Pérez', biz: 'Bodega Don Juan · San Juan de Miraflores', bg: '#E8970A', initials: 'JP' },
  { quote: <>Ya no pierdo tiempo cerrando caja. Antes me demoraba 1 hora. Ahora 1 minuto. <strong>Ese tiempo lo uso para atender más clientes.</strong></>, name: 'María Quispe', biz: 'Bodega La Esquina · Villa María del Triunfo', bg: '#4F46E5', initials: 'MQ' },
  { quote: <>Dejé el cuaderno. Sé exactamente quién me debe y cuánto. <strong>Recuperé S/ 500 en deudas</strong> que no me acordaba.</>, name: 'Carlos Rojas', biz: 'Bodega El Vecino · Ate Vitarte', bg: '#0D9C6E', initials: 'CR' },
]

export default function TestimoniosBodega() {
  return (
    <section style={{ padding: '100px clamp(20px,5vw,80px)', background: C.bg }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: C.muted, display: 'block', marginBottom: 16 }}>Lo dicen ellos</span>
          <h2 style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 'clamp(32px,4.5vw,54px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: -2, color: C.ink }}>
            Bodegas que ya<br />usan AI Business OS
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }} className="testi-bodega-grid">
          {testimonios.map(t => (
            <div key={t.name} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 20, transition: '.2s' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = '0 8px 32px rgba(12,14,18,0.08)'; el.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = ''; el.style.transform = '' }}>
              <div style={{ color: C.amber, fontSize: 14, letterSpacing: 1 }}>★★★★★</div>
              <div style={{ fontSize: 15, lineHeight: 1.7, color: C.ink2, flex: 1, fontStyle: 'italic' }}>{t.quote}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{t.initials}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 2 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{t.biz}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`@media (max-width: 768px) { .testi-bodega-grid { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  )
}
