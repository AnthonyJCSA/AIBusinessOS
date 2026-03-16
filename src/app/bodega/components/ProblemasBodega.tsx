'use client'

const C = { ink: '#0C0E12', muted: '#6B7280', bg2: '#F3F2EF', card: '#FFFFFF', border: '#E5E3DE', border2: '#D4D2CC', orange: '#FF5A1F', amber: '#E8970A', wa: '#25D366' }
const WA = "https://wa.me/51913916967?text=Hola,%20tengo%20una%20bodega%20y%20quiero%20ordenar%20mi%20negocio%20con%20Coriva%20Core."

const probs = [
  { n:'01', ico:'❓', title:'No sabes cuánto ganas al día', desc:'Vendes todo el día pero no sabes si ganas o pierdes.', tag:'Sin datos', red: false },
  { n:'02', ico:'⏰', title:'Pierdes tiempo cerrando caja', desc:'1 hora contando billetes y revisando el cuaderno.', tag:'Tiempo', red: false },
  { n:'03', ico:'📦', title:'No sabes qué se acaba', desc:'Los clientes piden y no tienes. Ventas perdidas todos los días.', tag:'Pérdida', red: true },
  { n:'04', ico:'💰', title:'Fiados que no se cobran', desc:'No te acuerdas quién debe ni cuánto. Plata perdida.', tag:'Pérdida', red: true },
  { n:'05', ico:'📓', title:'El cuaderno es un lío', desc:'Números borrados, hojas perdidas. Caos total.', tag:'Sin control', red: true },
  { n:'06', ico:'😰', title:'¿Me están robando?', desc:'La caja no cuadra y no sabes si es error o robo.', tag:'Riesgo', red: true },
]

export default function ProblemasBodega() {
  return (
    <section style={{ padding: '100px clamp(20px,5vw,80px)', background: C.bg2 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }} className="prob-bodega-grid">
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: C.orange, display: 'block', marginBottom: 16 }}>¿Te pasa esto?</span>
          <h2 style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 'clamp(32px,4.5vw,54px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: -2, color: C.ink, marginBottom: 16 }}>
            Los problemas<br />de tu bodega<br /><em style={{ fontStyle: 'italic', fontWeight: 300, color: C.orange }}>terminan hoy</em>
          </h2>
          <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.7, marginBottom: 32 }}>Estos son los problemas más comunes de los bodegueros. Coriva los resuelve desde el primer día.</p>
          <a href={WA} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '15px 28px', borderRadius: 12, fontSize: 16, fontWeight: 700, background: C.wa, color: '#fff', textDecoration: 'none' }}>
            💬 Ordenar mi bodega ahora →
          </a>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {probs.map(p => (
            <div key={p.n} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px', borderRadius: 12, border: `1px solid ${C.border}`, background: C.card, transition: '.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(12,14,18,0.06)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '' }}>
              <span style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 13, fontWeight: 700, color: C.border2, width: 28, flexShrink: 0 }}>{p.n}</span>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{p.ico}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.ink, marginBottom: 2 }}>{p.title}</div>
                <div style={{ fontSize: 13, color: C.muted }}>{p.desc}</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, flexShrink: 0, whiteSpace: 'nowrap', background: p.red ? 'rgba(220,38,38,0.08)' : '#FEF6E4', color: p.red ? '#DC2626' : C.amber }}>{p.tag}</span>
            </div>
          ))}
        </div>
      </div>
      <style>{`@media (max-width: 900px) { .prob-bodega-grid { grid-template-columns: 1fr !important; gap: 48px !important; } }`}</style>
    </section>
  )
}
