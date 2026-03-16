'use client'

import { useState } from 'react'

const C = {
  ink: '#0C0E12', muted: '#6B7280',
  bg: '#FAFAF8', card: '#FFFFFF', border: '#E5E3DE', border2: '#D4D2CC',
  lime: '#C8F23A',
}

const faqs = [
  { q: '¿Cuánto cuesta Coriva?', a: 'El plan Starter cuesta S/ 79 al mes con IA básica (alertas de stock automáticas). El plan PRO cuesta S/ 149 al mes e incluye IA avanzada: predicción de ventas, campañas WhatsApp y segmentación de clientes. Implementación gratis en ambos planes.' },
  { q: '¿Necesito saber de computadoras?', a: 'Para nada. Si sabes usar WhatsApp, sabes usar Coriva. Lo diseñamos para personas que nunca han usado un sistema. Un asesor nuestro te guía en el primer día.' },
  { q: '¿Qué pasa si ya uso Treinta?', a: 'Coriva tiene funciones que Treinta no tiene: alertas de stock con IA, control de caja avanzado, reportes detallados y soporte personalizado en Perú. Puedes migrar tu data fácilmente.' },
  { q: '¿Funciona sin internet?', a: 'Funciona con conexión a internet (WiFi o datos móviles). Con una señal básica de celular es suficiente para registrar ventas sin interrupciones.' },
  { q: '¿Puedo cancelar cuando quiera?', a: 'Sí. Sin contratos, sin penalidades. Cancela en cualquier momento con un mensaje por WhatsApp.' },
  { q: '¿Cómo funciona la IA?', a: 'La IA analiza tu historial de ventas y te avisa automáticamente cuando un producto está por agotarse, predice cuándo necesitas reponer stock y sugiere qué productos comprar.' },
]

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq-s" style={{ padding: '100px clamp(20px,5vw,80px)', background: C.bg }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: C.muted, display: 'block', marginBottom: 16 }}>FAQ</span>
          <h2 style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 'clamp(32px,4.5vw,54px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: -2, color: C.ink }}>
            Todo lo que<br />necesitas saber
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
              {open === i && (
                <div style={{ padding: '0 22px 18px', fontSize: 14, color: C.muted, lineHeight: 1.7 }}>{f.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
