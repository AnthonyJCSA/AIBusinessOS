'use client'

const C = { ink: '#0C0E12', bg: '#FAFAF8', card: '#FFFFFF', lime: '#C8F23A', green: '#0D9C6E', orange: '#FF5A1F' }

const stats = [
  { num: '500+', label: 'Bodegas activas', icon: '🏪' },
  { num: '1 min', label: 'Cierre de caja', icon: '⚡' },
  { num: '30%', label: 'Más ventas', icon: '📈' },
  { num: 'S/ 99', label: 'Por mes', icon: '💰' },
]

export default function StatsBodega() {
  return (
    <section style={{ padding: '80px clamp(20px,5vw,80px)', background: C.bg }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: C.green, display: 'block', marginBottom: 12 }}>
            Resultados reales
          </span>
          <h2 style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 'clamp(28px,4vw,42px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: -1.5, color: C.ink }}>
            Bodegas que ya ordenaron su negocio
          </h2>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
          {stats.map((stat, i) => (
            <div 
              key={i}
              style={{ 
                background: C.card, 
                border: '1px solid #E5E3DE', 
                borderRadius: 16, 
                padding: '32px 24px',
                textAlign: 'center',
                transition: 'all 0.3s',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(12,14,18,0.08)'
                e.currentTarget.style.borderColor = C.lime
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = ''
                e.currentTarget.style.boxShadow = ''
                e.currentTarget.style.borderColor = '#E5E3DE'
              }}
            >
              <div style={{ 
                position: 'absolute', 
                top: -30, 
                right: -30, 
                width: 120, 
                height: 120, 
                borderRadius: '50%',
                background: `${C.lime}15`,
                pointerEvents: 'none'
              }} />
              
              <div style={{ fontSize: 48, marginBottom: 12, position: 'relative', zIndex: 1 }}>
                {stat.icon}
              </div>
              
              <div style={{ 
                fontFamily: "'Fraunces',Georgia,serif", 
                fontSize: 'clamp(36px,5vw,48px)', 
                fontWeight: 900, 
                color: C.ink,
                marginBottom: 8,
                position: 'relative',
                zIndex: 1
              }}>
                {stat.num}
              </div>
              
              <div style={{ 
                fontSize: 14, 
                fontWeight: 600, 
                color: '#6B7280',
                position: 'relative',
                zIndex: 1
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div style={{ 
          marginTop: 48, 
          textAlign: 'center',
          padding: '24px 32px',
          background: `linear-gradient(135deg, ${C.lime}20, ${C.green}10)`,
          borderRadius: 16,
          border: `2px solid ${C.lime}40`
        }}>
          <p style={{ fontSize: 16, color: C.ink, fontWeight: 600, marginBottom: 8 }}>
            ✅ Sin contratos largos · ✅ Cancela cuando quieras · ✅ Soporte incluido
          </p>
          <p style={{ fontSize: 14, color: '#6B7280' }}>
            Únete a cientos de bodegueros que ya ordenaron su negocio
          </p>
        </div>
      </div>
    </section>
  )
}
