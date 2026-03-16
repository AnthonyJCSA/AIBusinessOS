'use client'

const C = { ink: '#0C0E12', muted: '#6B7280', bg: '#FAFAF8', card: '#FFFFFF', border: '#E5E3DE', lime: '#C8F23A', green: '#0D9C6E', orange: '#FF5A1F', wa: '#25D366', pale: '#9CA3AF' }
const WA = "https://wa.me/51913916967?text=Hola,%20tengo%20una%20bodega%20y%20quiero%20ordenar%20mi%20negocio%20con%20Coriva%20Core."

const feats = ['Control de ventas','Control de mercadería','Control de caja','Alertas cuando se acaba','Reportes de ventas','Control de deudas','Soporte en Perú','Te enseñamos a usarlo']

export default function OfertaBodega() {
  return (
    <section style={{ padding: '100px clamp(20px,5vw,80px)', background: C.bg }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: C.orange, display: 'block', marginBottom: 16 }}>🔥 Oferta limitada · Solo 50 cupos</span>
          <h2 style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 'clamp(32px,4.5vw,54px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: -2, color: C.ink }}>
            Oferta especial<br />para <em style={{ fontStyle: 'italic', fontWeight: 300, color: C.orange }}>bodegas</em>
          </h2>
        </div>
        <div style={{ maxWidth: 520, margin: '0 auto', background: C.card, border: `2px solid ${C.ink}`, borderRadius: 28, overflow: 'hidden', boxShadow: '0 24px 80px rgba(12,14,18,0.14)' }}>
          <div style={{ background: C.ink, padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 22, fontWeight: 900, color: C.lime }}>Plan Bodega</span>
            <span style={{ background: C.orange, color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 99 }}>🔥 Primeras 50</span>
          </div>
          <div style={{ padding: 32 }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: 16, color: C.pale, textDecoration: 'line-through', marginBottom: 6 }}>Antes S/ 99 / mes</div>
              <div style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 72, fontWeight: 900, color: C.ink, letterSpacing: -3, lineHeight: 1 }}>S/ 49</div>
              <div style={{ fontSize: 16, color: C.muted, marginTop: 6 }}>por mes, todo incluido</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.green, marginTop: 8, display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'center' }}>✅ Implementación gratis (Valor S/ 300)</div>
            </div>
            <div style={{ height: 1, background: C.border, margin: '24px 0' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px', marginBottom: 28 }}>
              {feats.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.ink }}>
                  <span style={{ color: C.green, fontSize: 14, flexShrink: 0 }}>✓</span>{f}
                </div>
              ))}
            </div>
            <a href={WA} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, width: '100%', padding: '16px', borderRadius: 14, fontSize: 16, fontWeight: 700, background: C.wa, color: '#fff', textDecoration: 'none' }}>
              💬 Quiero esta oferta para mi bodega →
            </a>
            <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: C.orange, marginTop: 14 }}>
              ⏰ Solo para las primeras 50 bodegas · Cupos limitados por semana
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
