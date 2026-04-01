'use client'

'use client'

import Link from 'next/link'

const C = {
  ink: '#0C0E12', ink2: '#2D3142', muted: '#6B7280', pale: '#9CA3AF',
  bg: '#FAFAF8', bg2: '#F3F2EF', card: '#FFFFFF', border: '#E5E3DE', border2: '#D4D2CC',
  lime: '#C8F23A', orange: '#FF5A1F', green: '#0D9C6E', greenLight: '#E8F8F3',
  amber: '#E8970A', amberLight: '#FEF6E4', wa: '#25D366',
}

export default function HeroHome() {
  const wa = "https://wa.me/51913916967?text=Hola,%20quiero%20conocer%20Coriva%20Core%20para%20mi%20negocio."

  return (
    <section style={{ minHeight: '100vh', padding: '100px clamp(20px,5vw,80px) 80px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: C.bg }}>
      {/* bg texture */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(ellipse 900px 600px at 75% 40%, rgba(200,242,58,0.12), transparent), radial-gradient(ellipse 600px 400px at 10% 80%, rgba(255,90,31,0.06), transparent)`, pointerEvents: 'none' }} />

      <div style={{ display: 'grid', gridTemplateColumns: 'clamp(300px,50%,600px) 1fr', gap: '80px', alignItems: 'center', position: 'relative', zIndex: 2, maxWidth: 1200, margin: '0 auto', width: '100%' }} className="hero-inner-grid">
        {/* LEFT */}
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: `1.5px solid ${C.border2}`, borderRadius: 99, padding: '5px 14px 5px 8px', fontSize: 12, fontWeight: 600, color: C.ink2, marginBottom: 24, background: C.card, boxShadow: '0 2px 8px rgba(12,14,18,0.06)' }}>
            <span style={{ width: 24, height: 24, background: C.lime, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>🚀</span>
            Sistema POS con IA · Perú &amp; América Latina
          </div>

          <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 'clamp(44px,6vw,76px)', fontWeight: 900, lineHeight: 0.96, letterSpacing: -3, marginBottom: 24, color: C.ink }}>
            Deja el<br />
            <em style={{ fontStyle: 'italic', color: C.orange, fontWeight: 300, display: 'block' }}>cuaderno.</em>
            <span style={{ position: 'relative', whiteSpace: 'nowrap' }}>
              Ordena
              <span style={{ position: 'absolute', left: 0, bottom: -4, width: '100%', height: 6, background: C.lime, borderRadius: 3, zIndex: -1, transform: 'rotate(-1deg)', display: 'block' }} />
            </span>{' '}tu<br />negocio.
          </h1>

          <p style={{ fontSize: 18, lineHeight: 1.7, color: C.muted, marginBottom: 36, maxWidth: 480 }}>
            Sistema para bodegas, boticas y tiendas. Controla ventas, stock y caja desde <strong style={{ color: C.ink, fontWeight: 600 }}>S/ 79 al mes</strong>. La IA trabaja por ti.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link href="/botica" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '15px 28px', borderRadius: 12, fontSize: 16, fontWeight: 700, background: C.ink, color: '#fff', textDecoration: 'none', whiteSpace: 'nowrap', transition: 'all .2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(12,14,18,0.25)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '' }}>
                💊 Soy botica
              </Link>
              <Link href="/bodega" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '15px 28px', borderRadius: 12, fontSize: 16, fontWeight: 700, background: C.orange, color: '#fff', textDecoration: 'none', whiteSpace: 'nowrap', transition: 'all .2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = '' }}>
                🛒 Soy bodega
              </Link>
              <a href={wa} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '15px 26px', borderRadius: 12, fontSize: 16, fontWeight: 600, background: 'transparent', border: `1.5px solid ${C.border2}`, color: C.ink2, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                💬 WhatsApp
              </a>
            </div>

            {/* trust */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: C.pale }}>
              <div style={{ display: 'flex' }}>
                {[['#4F46E5','MG'],['#0D9C6E','CR'],['#E8970A','AT'],['#DC2626','JP']].map(([bg, initials]) => (
                  <div key={initials} style={{ width: 28, height: 28, borderRadius: '50%', border: `2px solid ${C.bg}`, marginRight: -8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', background: bg, flexShrink: 0 }}>{initials}</div>
                ))}
              </div>
              <div>
                <div style={{ color: C.amber, fontSize: 12 }}>★★★★★</div>
                <div><strong style={{ color: C.ink2, fontWeight: 600 }}>500+ negocios</strong> ya usan Coriva</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — app card */}
        <div style={{ position: 'relative' }}>
          {/* float top */}
          <div style={{ position: 'absolute', top: -16, right: 40, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '10px 14px', boxShadow: '0 8px 28px rgba(12,14,18,0.1)', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', zIndex: 3, color: C.green }}>
            <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: C.green, marginRight: 5 }} />+18% ventas esta semana
          </div>

          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 24, overflow: 'hidden', boxShadow: '0 32px 80px rgba(12,14,18,0.12), 0 8px 24px rgba(12,14,18,0.06)', position: 'relative', zIndex: 2 }}>
            {/* bar */}
            <div style={{ background: C.ink, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {['#FF5F57','#FEBC2E','#28C840'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginLeft: 8 }}>AI Business OS — Dashboard</span>
              <span style={{ marginLeft: 'auto', background: C.lime, color: C.ink, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>IA activa</span>
            </div>
            {/* body */}
            <div style={{ padding: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 16px' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.6px', color: C.muted, marginBottom: 6 }}>Ventas hoy</div>
                  <div style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 26, fontWeight: 700, lineHeight: 1, color: C.green }}>S/ 2,450</div>
                  <div style={{ fontSize: 11, color: C.pale, marginTop: 4 }}>↑ 18% vs ayer</div>
                </div>
                <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 16px' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.6px', color: C.muted, marginBottom: 6 }}>Productos</div>
                  <div style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 26, fontWeight: 700, lineHeight: 1, color: C.ink }}>245</div>
                  <div style={{ fontSize: 11, color: C.pale, marginTop: 4 }}>2 con stock bajo</div>
                </div>
              </div>
              <div style={{ background: C.amberLight, border: '1px solid rgba(232,151,10,0.2)', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>⚠️</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.amber, marginBottom: 2 }}>Stock bajo · Coca Cola 1L</div>
                  <div style={{ fontSize: 11, color: C.muted }}>Quedan 5 unidades · IA recomienda pedir hoy</div>
                </div>
              </div>
              <div style={{ background: C.greenLight, border: '1px solid rgba(13,156,110,0.2)', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>✅</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.green, marginBottom: 2 }}>Caja cerrada · Todo cuadra</div>
                  <div style={{ fontSize: 11, color: C.muted }}>S/ 2,450 registrados · Cierre en 47 segundos</div>
                </div>
              </div>
            </div>
          </div>

          {/* float bottom */}
          <div style={{ position: 'absolute', bottom: 24, left: -24, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '10px 14px', boxShadow: '0 8px 28px rgba(12,14,18,0.1)', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', zIndex: 3, color: C.ink2 }}>
            <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: C.amber, marginRight: 5 }} />⏱ Caja cerrada en 1 min
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .hero-inner-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
        }
      `}</style>
    </section>
  )
}
