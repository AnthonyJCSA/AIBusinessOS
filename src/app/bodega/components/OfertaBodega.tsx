'use client'

const C = { ink: '#0C0E12', muted: '#6B7280', bg: '#FAFAF8', bg2: '#F3F2EF', card: '#FFFFFF', border: '#E5E3DE', lime: '#C8F23A', green: '#0D9C6E', greenLight: '#E8F8F3', orange: '#FF5A1F', wa: '#25D366', pale: '#9CA3AF' }
const WA = "https://wa.me/51913916967?text=Hola,%20tengo%20una%20bodega%20y%20quiero%20ordenar%20mi%20negocio%20con%20Coriva%20Core."

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
