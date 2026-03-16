'use client'

const C = {
  ink: '#0C0E12', muted: '#6B7280',
  bg2: '#F3F2EF', card: '#FFFFFF', border: '#E5E3DE',
  lime: '#C8F23A', orange: '#FF5A1F', green: '#0D9C6E', amber: '#E8970A', wa: '#25D366',
}

const stats = [
  { val: '1 min', label: 'Tiempo cerrando caja' },
  { val: '+35%', label: 'Aumento en ventas' },
  { val: 'S/ 0', label: 'Dinero perdido por errores' },
  { val: '1 día', label: 'Tiempo para estar listo' },
]

export default function BrandStory() {
  const wa = "https://wa.me/51913916967?text=Hola,%20quiero%20conocer%20Coriva%20Core."
  const statColors = [C.green, C.ink, C.green, C.amber]

  return (
    <section style={{ padding: '100px clamp(20px,5vw,80px)', background: C.bg2 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }} className="story-grid">
        {/* left */}
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: C.orange, display: 'block', marginBottom: 16 }}>Nuestra historia</span>
          <h2 style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 'clamp(32px,4.5vw,54px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: -2, marginBottom: 24, color: C.ink }}>
            ¿Por qué<br />creamos <em style={{ fontStyle: 'italic', fontWeight: 300, color: C.orange }}>esto?</em>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              <>Coriva nació porque <strong style={{ color: C.ink }}>miles de negocios en Perú</strong> siguen perdiendo plata por usar cuaderno y Excel.</>,
              <>Vimos cómo dueños de bodegas y boticas trabajan 12 horas al día pero <strong style={{ color: C.ink }}>no saben cuánto ganan</strong>. Cierran caja en 1 hora y siempre falta dinero.</>,
              <>Hoy ayudamos a <strong style={{ color: C.ink }}>ordenar su negocio en minutos</strong>. Sin cuaderno, sin Excel, sin complicaciones.</>,
            ].map((text, i) => (
              <p key={i} style={{ fontSize: 16, color: C.muted, lineHeight: 1.8 }}>{text}</p>
            ))}
          </div>
          <div style={{ marginTop: 32 }}>
            <a href={wa} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '15px 28px', borderRadius: 12, fontSize: 16, fontWeight: 700, background: C.wa, color: '#fff', textDecoration: 'none' }}>
              💬 Hablar por WhatsApp →
            </a>
          </div>
        </div>

        {/* right — impact card */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 24, overflow: 'hidden', boxShadow: '0 16px 48px rgba(12,14,18,0.08)' }}>
          <div style={{ background: C.ink, padding: '18px 24px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Impacto real</div>
            <div style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 22, fontWeight: 900, color: C.lime }}>Resultados en el primer mes</div>
          </div>
          <div style={{ padding: '0 24px' }}>
            {stats.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0', borderBottom: i < stats.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                <span style={{ fontSize: 14, color: C.muted }}>{s.label}</span>
                <span style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 22, fontWeight: 700, color: statColors[i] }}>{s.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 900px) { .story-grid { grid-template-columns: 1fr !important; gap: 48px !important; } }`}</style>
    </section>
  )
}
