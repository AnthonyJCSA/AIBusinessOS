'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/auth'

const C = {
  ink: '#0C0E12', ink2: '#2D3142', muted: '#6B7280',
  bg: '#FAFAF8', bg2: '#F3F2EF', card: '#FFFFFF', border: '#E5E3DE', border2: '#D4D2CC',
  lime: '#C8F23A', green: '#0D9C6E', orange: '#FF5A1F', wa: '#25D366',
}

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.password) { 
      setError('Completa todos los campos')
      return 
    }
    
    setLoading(true)
    setError('')
    
    try {
      const supabase = createBrowserClient()
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })

      if (authError) {
        setError('Email o contraseña incorrectos')
        setLoading(false)
        return
      }

      if (data.user) {
        // Redirigir al dashboard - el middleware manejará la sesión
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      console.error('Error en login:', err)
      setError('Error al conectar. Intenta de nuevo.')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: C.bg }}>
      {/* LEFT panel */}
      <div style={{ display: 'none', width: '42%', background: C.ink, padding: '60px 56px', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }} className="login-left">
        <div style={{ position: 'absolute', top: -200, right: -200, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,242,58,0.07), transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -150, left: -150, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,90,31,0.05), transparent 70%)', pointerEvents: 'none' }} />

        {/* logo */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 64 }}>
            <div style={{ width: 40, height: 40, background: C.lime, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Fraunces',Georgia,serif", fontSize: 20, fontWeight: 900, color: C.ink, letterSpacing: -1 }}>C</div>
            <span style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 20, fontWeight: 700, color: '#fff' }}>Coriva</span>
          </Link>

          <h2 style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 'clamp(32px,3vw,48px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: -2, color: '#fff', marginBottom: 16 }}>
            Tu negocio en<br /><em style={{ fontStyle: 'italic', fontWeight: 300, color: C.lime }}>piloto automático.</em>
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
            Controla ventas, stock y caja desde cualquier dispositivo.
          </p>

          {/* stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 48 }}>
            {[['500+','Negocios activos'],['1 min','Cierre de caja'],['S/ 79','Plan Starter / mes']].map(([n, l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 28, fontWeight: 900, color: C.lime, minWidth: 80 }}>{n}</div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 2, fontSize: 13, color: 'rgba(255,255,255,0.2)' }}>
          © 2025 Coriva Core · soporte@corivape.com
        </div>
      </div>

      {/* RIGHT — form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(32px,5vw,80px)' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          {/* mobile logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 40 }} className="login-mobile-logo">
            <div style={{ width: 36, height: 36, background: C.ink, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Fraunces',Georgia,serif", fontSize: 18, fontWeight: 900, color: C.lime, letterSpacing: -1 }}>C</div>
            <span style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 18, fontWeight: 700, color: C.ink }}>Coriva</span>
          </Link>

          <div style={{ marginBottom: 36 }}>
            <h1 style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 32, fontWeight: 900, letterSpacing: -1.5, color: C.ink, marginBottom: 8 }}>Bienvenido de vuelta</h1>
            <p style={{ fontSize: 15, color: C.muted }}>Ingresa a tu cuenta para continuar</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.6px', color: C.muted }}>Email</label>
              <input
                type="email" value={form.email} autoComplete="email"
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="tu@email.com"
                style={{ padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${C.border2}`, background: C.bg2, fontSize: 15, color: C.ink, outline: 'none', transition: 'border .15s' }}
                onFocus={e => (e.target.style.borderColor = C.ink)}
                onBlur={e => (e.target.style.borderColor = C.border2)}
              />
            </div>

            {/* password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.6px', color: C.muted }}>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'} value={form.password} autoComplete="current-password"
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '12px 44px 12px 14px', borderRadius: 10, border: `1.5px solid ${C.border2}`, background: C.bg2, fontSize: 15, color: C.ink, outline: 'none', transition: 'border .15s', boxSizing: 'border-box' }}
                  onFocus={e => (e.target.style.borderColor = C.ink)}
                  onBlur={e => (e.target.style.borderColor = C.border2)}
                />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: C.muted }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: 'rgba(220,38,38,0.07)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#DC2626', fontWeight: 500 }}>
                ⚠️ {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ marginTop: 4, padding: '14px', borderRadius: 12, fontSize: 16, fontWeight: 700, background: C.ink, color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .6 : 1, transition: 'all .2s' }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = '' }}>
              {loading ? '⏳ Ingresando...' : 'Ingresar →'}
            </button>
          </form>

          <div style={{ height: 1, background: C.border, margin: '28px 0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ fontSize: 14, color: C.muted, textAlign: 'center' }}>
              ¿No tienes cuenta?{' '}
              <Link href="/registro" style={{ color: C.ink, fontWeight: 700, textDecoration: 'none' }}>Regístrate gratis →</Link>
            </p>
            <a href="https://wa.me/51913916967?text=Hola,%20necesito%20ayuda%20para%20ingresar%20a%20Coriva%20Core."
              target="_blank" rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px', borderRadius: 10, fontSize: 14, fontWeight: 600, background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.25)', color: C.green, textDecoration: 'none' }}>
              💬 ¿Olvidaste tu contraseña? Escríbenos
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) {
          .login-left { display: flex !important; }
          .login-mobile-logo { display: none !important; }
        }
      `}</style>
    </div>
  )
}
