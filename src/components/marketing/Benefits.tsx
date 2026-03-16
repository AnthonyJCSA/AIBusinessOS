'use client'

const C = {
  ink: '#0C0E12', muted: '#6B7280',
  bg: '#FAFAF8', card: '#FFFFFF', border: '#E5E3DE',
  green: '#0D9C6E', greenLight: '#E8F8F3',
}

const bens = [
  { ico: '🕐', title: '10 horas menos por semana', desc: 'Ya no pierdas tiempo contando inventario ni cerrando caja a mano. Coriva lo hace en segundos.', tag: '✓ Desde el día 1' },
  { ico: '💰', title: 'Control total de tu plata', desc: 'Sabe exactamente cuánto debes, cuánto te deben y cuánto tienes en caja. Sin sorpresas a fin de mes.', tag: '✓ Tiempo real' },
  { ico: '📦', title: 'Nunca más sin stock', desc: 'La IA te avisa 3 días antes de que se acabe un producto. Tus clientes siempre encuentran lo que buscan.', tag: '✓ IA automática' },
  { ico: '📊', title: 'Decisiones con datos reales', desc: 'Reportes claros que te dicen qué vender más, qué eliminar y cuándo comprar. Sin Excel.', tag: '✓ Reportes diarios' },
  { ico: '📱', title: 'Gestiona desde tu celular', desc: 'Revisa tus ventas desde donde estés. No necesitas estar físicamente en tu negocio.', tag: '✓ iOS y Android' },
  { ico: '🤖', title: 'IA que trabaja por ti', desc: 'Alertas automáticas, predicción de ventas y sugerencias de compra. Tu asistente 24/7.', tag: '✓ IA incluida' },
]

export default function Benefits() {
  return (
    <section style={{ padding: '100px clamp(20px,5vw,80px)', background: C.bg }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: C.muted, display: 'block', marginBottom: 16 }}>Beneficios</span>
          <h2 style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 'clamp(32px,4.5vw,54px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: -2, color: C.ink }}>
            Problemas que<br />resuelves <em style={{ fontStyle: 'italic', fontWeight: 300, color: '#FF5A1F' }}>desde hoy</em>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 2 }} className="bens-grid-resp">
          {bens.map((b) => (
            <div key={b.title} style={{ padding: '32px 28px', background: C.card, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 12, transition: '.2s', cursor: 'default' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F3F2EF'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = C.card}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{b.ico}</div>
              <div style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 19, fontWeight: 700, letterSpacing: -0.4, color: C.ink }}>{b.title}</div>
              <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.65 }}>{b.desc}</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 99, background: C.greenLight, color: C.green, width: 'fit-content' }}>{b.tag}</div>
            </div>
          ))}
        </div>
      </div>
      <style>{`@media (max-width: 768px) { .bens-grid-resp { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  )
}
