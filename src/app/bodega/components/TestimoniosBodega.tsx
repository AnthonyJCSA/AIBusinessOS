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
            Bodegas que ya<br />usan Coriva
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
