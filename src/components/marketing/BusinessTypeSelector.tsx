'use client'

import Link from 'next/link'

const C = {
  ink: '#0C0E12', muted: '#6B7280', pale: '#9CA3AF',
  bg: '#FAFAF8', card: '#FFFFFF', border: '#E5E3DE', border2: '#D4D2CC',
  lime: '#C8F23A',
}

const types = [
  { emoji: '💊', name: 'Boticas y Farmacias', desc: 'Control de medicamentos, stock automático y caja en 1 minuto.', href: '/botica', featured: true },
  { emoji: '🛒', name: 'Bodegas y Tiendas', desc: 'Sabe cuánto ganas hoy. Controla mercadería y deudas en tiempo real.', href: '/bodega', featured: true },
  { emoji: '🍔', name: 'Restaurantes', desc: 'Pedidos, cocina y caja integrados.', soon: true },
  { emoji: '✂️', name: 'Salones de Belleza', desc: 'Citas, ventas y productos en un lugar.', soon: true },
]

export default function BusinessTypeSelector() {
  return (
    <section style={{ padding: '100px clamp(20px,5vw,80px)', background: C.bg }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: C.muted, display: 'block', marginBottom: 16 }}>Elige tu solución</span>
          <h2 style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 'clamp(32px,4.5vw,54px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: -2, marginBottom: 16, color: C.ink }}>
            Especializado para<br />tu tipo de negocio
          </h2>
          <p style={{ fontSize: 17, color: C.muted, lineHeight: 1.7, maxWidth: 540, margin: '0 auto' }}>
            No somos un sistema genérico. Cada módulo fue diseñado pensando en cómo trabajas tú.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }} className="type-grid-resp">
          {types.map((t) => (
            t.soon ? (
              <div key={t.name} style={{ background: C.card, border: `2px solid ${C.border}`, borderRadius: 20, padding: '28px 24px', opacity: .45, position: 'relative', overflow: 'hidden' }}>
                <span style={{ fontSize: 36, marginBottom: 14, display: 'block' }}>{t.emoji}</span>
                <div style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 20, fontWeight: 700, marginBottom: 6, letterSpacing: -0.5, color: C.ink }}>{t.name}</div>
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5, marginBottom: 14 }}>{t.desc}</div>
                <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 700, background: '#ECEAE5', color: C.pale, padding: '3px 10px', borderRadius: 99 }}>Próximamente</span>
              </div>
            ) : (
              <Link key={t.name} href={t.href!} style={{ background: C.card, border: `2px solid ${C.ink}`, borderRadius: 20, padding: '28px 24px', textDecoration: 'none', display: 'block', position: 'relative', overflow: 'hidden', transition: 'all .25s' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = '0 12px 40px rgba(12,14,18,0.12)' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.boxShadow = '' }}>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: C.lime }} />
                <span style={{ fontSize: 36, marginBottom: 14, display: 'block' }}>{t.emoji}</span>
                <div style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 20, fontWeight: 700, marginBottom: 6, letterSpacing: -0.5, color: C.ink }}>{t.name}</div>
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5, marginBottom: 14 }}>{t.desc}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, display: 'flex', alignItems: 'center', gap: 5 }}>Ver solución <span>→</span></div>
              </Link>
            )
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) { .type-grid-resp { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 480px) { .type-grid-resp { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  )
}
