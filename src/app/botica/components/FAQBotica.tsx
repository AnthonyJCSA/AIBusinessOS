'use client'

import { useState } from 'react'

const C = { ink: '#0C0E12', muted: '#6B7280', bg: '#FAFAF8', card: '#FFFFFF', border: '#E5E3DE', lime: '#C8F23A', wa: '#25D366' }
const WA = "https://wa.me/51913916967?text=Hola,%20tengo%20una%20botica%20y%20quiero%20digitalizar%20mi%20negocio%20con%20Coriva%20Core."

const faqs = [
  { q: '¿Necesito computadora?', a: 'No. Funciona en celular, tablet y computadora. Puedes vender desde tu celular sin problema.' },
  { q: '¿Me ayudan a instalarlo?', a: 'Sí, gratis. Un asesor nuestro te ayuda a cargar tus medicamentos y configurar todo. En 1 día estás vendiendo.' },
  { q: '¿Puedo importar desde Excel?', a: 'Sí. Si tienes tu lista de medicamentos en Excel, te la cargamos nosotros sin costo adicional.' },
  { q: '¿Cuánto demora estar listo?', a: 'En 1 día estás vendiendo. La configuración inicial toma entre 2 y 4 horas con nuestro equipo.' },
  { q: '¿Puedo cancelar cuando quiera?', a: 'Sí. Sin contratos ni penalidades. Cancela con un mensaje por WhatsApp.' },
]

export default function FAQBotica() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <section style={{ padding: '100px clamp(20px,5vw,80px)', background: C.bg }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: C.muted, display: 'block', marginBottom: 16 }}>FAQ</span>
          <h2 style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 'clamp(32px,4.5vw,54px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: -2, color: C.ink }}>
            Resolvemos<br />tus dudas
          </h2>
        </div>
        <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {faqs.map((f, i) => (
            <div key={i} onClick={() => setOpen(open === i ? null : i)}
              style={{ background: C.card, border: `1px solid ${open === i ? C.ink : C.border}`, borderRadius: 14, overflow: 'hidden', cursor: 'pointer', transition: '.2s' }}>
              <div style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, fontSize: 15, fontWeight: 600, color: C.ink }}>
                {f.q}
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: open === i ? C.ink : '#F3F2EF', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: open === i ? C.lime : C.muted, flexShrink: 0, transition: '.2s', transform: open === i ? 'rotate(45deg)' : 'none' }}>+</div>
              </div>
              {open === i && <div style={{ padding: '0 22px 18px', fontSize: 14, color: C.muted, lineHeight: 1.7 }}>{f.a}</div>}
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <a href={WA} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '15px 28px', borderRadius: 12, fontSize: 16, fontWeight: 700, background: C.wa, color: '#fff', textDecoration: 'none' }}>
            💬 ¿Más preguntas? Escríbenos →
          </a>
        </div>
      </div>
    </section>
  )
}
