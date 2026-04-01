'use client'

const C = {
  ink: '#0C0E12', ink2: '#2D3142', muted: '#6B7280', pale: '#9CA3AF',
  bg2: '#F3F2EF', card: '#FFFFFF', border: '#E5E3DE',
  lime: '#C8F23A', amber: '#E8970A',
}

const testimonials = [
  { stars: 5, quote: <>Antes perdía 2 horas diarias cerrando caja. Ahora Coriva lo hace en 30 segundos y <strong>siempre cuadra</strong>. No sé cómo trabajé sin esto.</>, name: 'María González', biz: 'Bodega El Ahorro · Lima', bg: '#4F46E5', initials: 'MG' },
  { stars: 5, quote: <>La IA me avisó que se acababa mi producto estrella. Reabastecí a tiempo y <strong>vendí el doble ese fin de semana</strong>.</>, name: 'Carlos Ruiz', biz: 'Fashion Store · Arequipa', bg: '#0D9C6E', initials: 'CR' },
  { stars: 5, quote: <>Dejé el cuaderno para siempre. Ahora sé exactamente quién me debe y cuánto. <strong>Recuperé S/ 500</strong> en deudas que no me acordaba.</>, name: 'Ana Torres', biz: 'Bodega La Esquina · Cusco', bg: '#DC2626', initials: 'AT' },
]

const stats = [
  { n: '500+', l: 'Negocios activos' },
  { n: '1 día', l: 'Para estar listo' },
  { n: 'S/ 99', l: 'Plan Pro / mes' },
  { n: '4.9★', l: 'Satisfacción clientes' },
]

export default function SocialProof() {
  return (
    <>
      {/* Stats strip */}
      <div style={{ background: C.ink, padding: '28px clamp(20px,5vw,80px)', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderLeft: '1px solid rgba(255,255,255,0.08)' }} className="stats-strip-resp">
          {stats.map((s) => (
            <div key={s.n} style={{ padding: '16px 32px', borderRight: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 36, fontWeight: 900, color: C.lime, letterSpacing: -1, marginBottom: 4, lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <section style={{ padding: '100px clamp(20px,5vw,80px)', background: C.bg2 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: C.muted, display: 'block', marginBottom: 16 }}>Testimonios reales</span>
            <h2 style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 'clamp(32px,4.5vw,54px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: -2, color: C.ink }}>
              Negocios como el tuyo<br />ya están <em style={{ fontStyle: 'italic', fontWeight: 300, color: '#FF5A1F' }}>creciendo</em>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }} className="testi-grid-resp">
            {testimonials.map((t) => (
              <div key={t.name} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 20, transition: '.2s' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = '0 8px 32px rgba(12,14,18,0.08)'; el.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = ''; el.style.transform = '' }}>
                <div style={{ color: C.amber, fontSize: 14, letterSpacing: 1 }}>{'★'.repeat(t.stars)}</div>
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
        <style>{`
          @media (max-width: 768px) { .testi-grid-resp { grid-template-columns: 1fr !important; } .stats-strip-resp { grid-template-columns: 1fr 1fr !important; } }
        `}</style>
      </section>
    </>
  )
}
