'use client'

const C = { ink: '#0C0E12', ink2: '#2D3142', muted: '#6B7280', bg2: '#F3F2EF', card: '#FFFFFF', border: '#E5E3DE', amber: '#E8970A', green: '#0D9C6E' }

const testimonios = [
  { quote: <>Antes perdía 2 horas cerrando caja. Ahora lo hago en 1 minuto y sin errores. <strong>Mi estrés bajó a cero.</strong></>, name: 'Rosa Mendoza', biz: 'Botica Santa Rosa · SJL', bg: '#0D9C6E', initials: 'RM' },
  { quote: <>Ya no pierdo ventas por falta de stock. El sistema me avisa y <strong>mis ventas subieron 35%</strong> en el primer mes.</>, name: 'Carlos Vega', biz: 'Farmacia El Pueblo · Villa El Salvador', bg: '#4F46E5', initials: 'CV' },
  { quote: <>Ahora sé exactamente cuánto gano cada día. <strong>Antes era un misterio total.</strong> Coriva me cambió la forma de manejar mi negocio.</>, name: 'María Flores', biz: 'Botica San Martín · Los Olivos', bg: '#E8970A', initials: 'MF' },
]

export default function TestimoniosBotica() {
  return (
    <section style={{ padding: '100px clamp(20px,5vw,80px)', background: C.bg2 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: C.muted, display: 'block', marginBottom: 16 }}>Lo dicen ellas</span>
          <h2 style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 'clamp(32px,4.5vw,54px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: -2, color: C.ink }}>
            Boticas que ya<br />usan Coriva
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }} className="testi-botica-grid">
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
      <style>{`@media (max-width: 768px) { .testi-botica-grid { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  )
}
