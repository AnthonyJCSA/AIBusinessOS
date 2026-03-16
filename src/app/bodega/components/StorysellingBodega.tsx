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
