'use client'

import Link from 'next/link'

const C = {
  ink: '#0C0E12', lime: '#C8F23A', orange: '#FF5A1F', wa: '#25D366',
  border2: '#D4D2CC',
}

export default function FinalCTA() {
  const wa = "https://wa.me/51913916967?text=Hola,%20quiero%20conocer%20Coriva%20Core."

  return (
    <section style={{ background: C.ink, padding: '100px clamp(20px,5vw,80px)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -200, right: -200, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,242,58,0.08), transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr auto', gap: 60, alignItems: 'center' }} className="fci-grid">
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: C.lime, display: 'block', marginBottom: 16 }}>Empieza hoy</span>
          <h2 style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 'clamp(36px,5vw,62px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: -2, color: '#fff', marginBottom: 16 }}>
            ¿Listo para<br /><em style={{ fontStyle: 'italic', fontWeight: 300, color: C.lime }}>ordenar tu</em><br />negocio?
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
            Elige tu tipo de negocio y empieza hoy.<br />Implementación gratis, soporte en español.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 280 }}>
          <Link href="/botica" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, padding: '14px 24px', borderRadius: 12, fontSize: 15, fontWeight: 700, background: C.ink, color: '#fff', textDecoration: 'none', border: '1.5px solid rgba(255,255,255,0.15)' }}>
            💊 Soy botica →
          </Link>
          <Link href="/bodega" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, padding: '14px 24px', borderRadius: 12, fontSize: 15, fontWeight: 700, background: C.orange, color: '#fff', textDecoration: 'none' }}>
            🛒 Soy bodega →
          </Link>
          <a href={wa} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, padding: '14px 24px', borderRadius: 12, fontSize: 15, fontWeight: 700, background: C.wa, color: '#fff', textDecoration: 'none' }}>
            💬 Hablar por WhatsApp →
          </a>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
            {['Implementación gratis', 'Desde S/ 79 al mes', 'Soporte en Perú'].map(p => (
              <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.lime, flexShrink: 0 }} />{p}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* footer */}
      <footer style={{ maxWidth: 1200, margin: '60px auto 0', paddingTop: 36, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.3)' }}>AI Business OS</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>soporte@corivape.com · +51 913 916 967</div>
        <div style={{ display: 'flex', gap: 20 }}>
          {[['Términos','#'],['Privacidad','#'],['WhatsApp',wa]].map(([label, href]) => (
            <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', textDecoration: 'none', transition: '.15s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.25)'}>{label}</a>
          ))}
        </div>
      </footer>

      <style>{`@media (max-width: 900px) { .fci-grid { grid-template-columns: 1fr !important; gap: 40px !important; } }`}</style>
    </section>
  )
}
