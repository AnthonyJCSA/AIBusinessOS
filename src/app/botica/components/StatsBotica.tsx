'use client'

const C = { ink: '#0C0E12', bg: '#FAFAF8', card: '#FFFFFF', purple: '#8B5CF6', green: '#0D9C6E', blue: '#3B82F6' }

const stats = [
  { num: '200+', label: 'Boticas activas', icon: '💊' },
  { num: '100%', label: 'DIGEMID compliant', icon: '✅' },
  { num: '45%', label: 'Menos errores', icon: '📊' },
  { num: 'S/ 99', label: 'Por mes', icon: '💰' },
]

export default function StatsBotica() {
  return (
    <section style={{ padding: '80px clamp(20px,5vw,80px)', background: C.bg }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: C.purple, display: 'block', marginBottom: 12 }}>
            Resultados reales
          </span>
          <h2 style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 'clamp(28px,4vw,42px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: -1.5, color: C.ink }}>
            Boticas que ya digitalizaron su negocio
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
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(139,92,246,0.15)'
                e.currentTarget.style.borderColor = C.purple
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
                background: `${C.purple}15`,
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
          background: `linear-gradient(135deg, ${C.purple}20, ${C.blue}10)`,
          borderRadius: 16,
          border: `2px solid ${C.purple}40`
        }}>
          <p style={{ fontSize: 16, color: C.ink, fontWeight: 600, marginBottom: 8 }}>
            ✅ Reportes OPPF/SNIPPF automáticos · ✅ Control de lotes · ✅ Soporte especializado
          </p>
          <p style={{ fontSize: 14, color: '#6B7280' }}>
            Únete a cientos de boticas que ya cumplen con DIGEMID sin complicaciones
          </p>
        </div>
      </div>
    </section>
  )
}
