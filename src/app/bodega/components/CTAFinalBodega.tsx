'use client'

const C = { ink: '#0C0E12', lime: '#C8F23A', orange: '#FF5A1F', wa: '#25D366', border2: '#D4D2CC' }
const WA = "https://wa.me/51913916967?text=Hola,%20tengo%20una%20bodega%20y%20quiero%20ordenar%20mi%20negocio%20con%20Coriva%20Core."

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
            {['Implementación gratis · S/99/mes','📞 +51 913 916 967','📧 soporte@corivape.com'].map(p => (
              <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.lime, flexShrink: 0 }} />{p}
              </div>
            ))}
          </div>
        </div>
      </div>
      <footer style={{ maxWidth: 1200, margin: '60px auto 0', paddingTop: 36, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.3)' }}>AI Business OS</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>soporte@corivape.com · +51 913 916 967</div>
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
