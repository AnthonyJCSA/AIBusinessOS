'use client'

const C = {
  ink: '#0C0E12', ink2: '#2D3142', muted: '#6B7280', pale: '#9CA3AF',
  bg: '#FAFAF8', bg2: '#F3F2EF', card: '#FFFFFF', border: '#E5E3DE', border2: '#D4D2CC',
  lime: '#C8F23A', orange: '#FF5A1F', green: '#0D9C6E', greenLight: '#E8F8F3',
  amber: '#E8970A', amberLight: '#FEF6E4', wa: '#25D366',
}

const WA = "https://wa.me/51913916967?text=Hola,%20tengo%20una%20botica%20y%20quiero%20digitalizar%20mi%20negocio%20con%20Coriva%20Core."

export default function HeroBotica() {
  return (
    <section style={{ minHeight: '100vh', padding: '100px clamp(20px,5vw,80px) 80px', background: `linear-gradient(180deg, #F0FAF6 0%, ${C.bg} 60%)`, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }} className="botica-hero-grid">

        {/* LEFT */}
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: `1.5px solid rgba(13,156,110,0.3)`, borderRadius: 99, padding: '5px 14px 5px 8px', fontSize: 12, fontWeight: 600, color: C.ink2, marginBottom: 24, background: C.greenLight }}>
            <span style={{ width: 24, height: 24, background: C.green, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>💊</span>
            Sistema especializado para boticas en Perú
          </div>

          <h1 style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 'clamp(44px,6vw,76px)', fontWeight: 900, lineHeight: 0.96, letterSpacing: -3, marginBottom: 24, color: C.ink }}>
            Para boticas<br />que quieren<br />
            <em style={{ fontStyle: 'italic', color: C.orange, fontWeight: 300, display: 'block' }}>vender</em>
            <span style={{ position: 'relative', whiteSpace: 'nowrap' }}>
              más.
              <span style={{ position: 'absolute', left: 0, bottom: -4, width: '100%', height: 6, background: C.lime, borderRadius: 3, zIndex: -1, transform: 'rotate(-1deg)', display: 'block' }} />
            </span>
          </h1>

          <p style={{ fontSize: 18, lineHeight: 1.7, color: C.muted, marginBottom: 28, maxWidth: 480 }}>
            Controla ventas, stock de medicamentos y caja sin cuaderno ni Excel. Desde <strong style={{ color: C.ink }}>S/ 79 al mes</strong> con implementación gratis.
          </p>

          {/* mini stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 32 }}>
            {[['1 min','Cierre de caja'],['+35%','Más ventas'],['S/ 0','Dinero perdido']].map(([v,l]) => (
              <div key={l} style={{ textAlign: 'center', padding: 14, background: C.greenLight, border: '1px solid rgba(13,156,110,0.2)', borderRadius: 14 }}>
                <div style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 24, fontWeight: 900, color: C.green }}>{v}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{l}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a href={WA} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '15px 28px', borderRadius: 12, fontSize: 16, fontWeight: 700, background: C.wa, color: '#fff', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              💬 Quiero que me lo instalen →
            </a>
            <a href="/demo" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '15px 26px', borderRadius: 12, fontSize: 16, fontWeight: 600, background: 'transparent', border: `1.5px solid ${C.border2}`, color: C.ink2, textDecoration: 'none' }}>
              Ver demo
            </a>
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* testimonial */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 24, boxShadow: '0 8px 28px rgba(12,14,18,0.08)' }}>
            <div style={{ color: C.amber, fontSize: 14, marginBottom: 10 }}>★★★★★</div>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: C.ink2, fontStyle: 'italic', marginBottom: 16 }}>
              "Antes cerraba caja en 1 hora y <strong style={{ fontStyle: 'normal', color: C.ink }}>siempre faltaba dinero</strong>. Ahora en 1 minuto y sé exactamente cuánto gané."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>RM</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>Rosa Mendoza</div>
                <div style={{ fontSize: 11, color: C.muted }}>Botica Santa Rosa · San Juan de Lurigancho</div>
              </div>
            </div>
          </div>

          {/* app card */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 24, overflow: 'hidden', boxShadow: '0 16px 48px rgba(12,14,18,0.1)' }}>
            <div style={{ background: C.ink, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {['#FF5F57','#FEBC2E','#28C840'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginLeft: 8 }}>💊 Botica San Juan · Lima</span>
              <span style={{ marginLeft: 'auto', background: C.lime, color: C.ink, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>En vivo</span>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 16px' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.6px', color: C.muted, marginBottom: 6 }}>Ventas hoy</div>
                  <div style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 26, fontWeight: 700, color: C.green }}>S/ 2,450</div>
                  <div style={{ fontSize: 11, color: C.pale, marginTop: 4 }}>324 medicamentos</div>
                </div>
                <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 16px' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.6px', color: C.muted, marginBottom: 6 }}>Caja</div>
                  <div style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 26, fontWeight: 700, color: C.ink }}>✅ OK</div>
                  <div style={{ fontSize: 11, color: C.pale, marginTop: 4 }}>Cierre en 52 seg</div>
                </div>
              </div>
              <div style={{ background: C.amberLight, border: '1px solid rgba(232,151,10,0.2)', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.amber, marginBottom: 2 }}>Paracetamol 500mg — 8 unidades</div>
                  <div style={{ fontSize: 11, color: C.muted }}>IA recomienda pedir hoy · Agotamiento en ~3 días</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 900px) { .botica-hero-grid { grid-template-columns: 1fr !important; gap: 48px !important; } }`}</style>
    </section>
  )
}
