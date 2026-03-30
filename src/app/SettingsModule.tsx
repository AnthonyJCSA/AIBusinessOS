'use client'

import { useState } from 'react'
import { Organization } from '../types'
import { applyTheme, type ThemeMode } from '@/lib/theme'

const accentColors = ['#6366F1', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899']

export default function SettingsModule({ currentOrg, onUpdate }: { currentOrg: Organization; onUpdate: (o: Organization) => void }) {
  const [s, setS] = useState({
    name: currentOrg.name,
    business_type: currentOrg.business_type || 'retail',
    ruc: currentOrg.ruc || '',
    address: currentOrg.address || '',
    phone: currentOrg.phone || '',
    email: currentOrg.email || '',
    web: '',
    currency: currentOrg.settings?.currency || 'S/',
    tax_rate: ((currentOrg.settings?.tax_rate || 0.18) * 100),
    receipt_footer: currentOrg.settings?.receipt_footer || 'Gracias por su compra · Coriva POS',
    accent: currentOrg.settings?.theme_color || '#6366F1',
    theme_mode: (currentOrg.settings?.theme_mode as ThemeMode) || 'dark',
    ai_stock: true, ai_predict: true, ai_messages: true, ai_segment: true,
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    onUpdate({
      ...currentOrg,
      name: s.name, business_type: s.business_type as any,
      ruc: s.ruc, address: s.address, phone: s.phone, email: s.email,
      settings: { ...currentOrg.settings, currency: s.currency, tax_rate: s.tax_rate / 100, receipt_footer: s.receipt_footer, theme_color: s.accent, theme_mode: s.theme_mode },
      updated_at: new Date().toISOString(),
    })
    setSaving(false)
    alert('✅ Configuración guardada')
  }

  const fi = (label: string, key: keyof typeof s, type = 'text', full = false) => (
    <div className={`flex flex-col gap-[5px] ${full ? 'col-span-2' : ''}`}>
      <label className="text-[10px] font-bold uppercase tracking-[.5px]" style={{ color: 'var(--muted)' }}>{label}</label>
      <input type={type} value={String(s[key])} onChange={e => setS(p => ({ ...p, [key]: e.target.value }))}
        className="px-[13px] py-[9px] rounded-[9px] text-sm outline-none transition-all"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
    </div>
  )

  const toggle = (label: string, desc: string, key: 'ai_stock' | 'ai_predict' | 'ai_messages' | 'ai_segment') => (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{label}</div>
        <div className="text-[11px]" style={{ color: 'var(--muted)' }}>{desc}</div>
      </div>
      <button onClick={() => setS(p => ({ ...p, [key]: !p[key] }))}
        className="relative flex-shrink-0 transition-all"
        style={{ width: '38px', height: '22px', borderRadius: '99px', background: s[key] ? 'var(--green)' : 'var(--border2)' }}>
        <div className="absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white transition-all"
          style={{ left: s[key] ? 'calc(100% - 20px)' : '2px' }} />
      </button>
    </div>
  )

  return (
    <div className="p-5 animate-fade-up">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[14px]">
        {/* Main */}
        <div className="lg:col-span-2 flex flex-col gap-[14px]">

          {/* Negocio */}
          <div className="rounded-[13px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>🏪 Información del Negocio</span>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              {fi('Nombre', 'name')}
              <div className="flex flex-col gap-[5px]">
                <label className="text-[10px] font-bold uppercase tracking-[.5px]" style={{ color: 'var(--muted)' }}>Tipo de Negocio</label>
                <select value={s.business_type} onChange={e => setS(p => ({ ...p, business_type: e.target.value as typeof p.business_type }))}
                  className="px-[13px] py-[9px] rounded-[9px] text-sm outline-none"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                  <option value="retail">🛒 Tienda / Bodega</option>
                  <option value="pharmacy">💊 Farmacia</option>
                  <option value="hardware">🔧 Ferretería</option>
                  <option value="clothing">👕 Ropa</option>
                  <option value="barbershop">✂️ Barbería</option>
                  <option value="restaurant">🍔 Restaurante</option>
                  <option value="other">📦 Otro</option>
                </select>
              </div>
              {fi('RUC', 'ruc')}
              {fi('Teléfono / WhatsApp', 'phone')}
              {fi('Dirección', 'address', 'text', true)}
              {fi('Email', 'email', 'email')}
              {fi('Web / Instagram', 'web')}
            </div>
          </div>

          {/* Sistema */}
          <div className="rounded-[13px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>⚙️ Sistema</span>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-[5px]">
                <label className="text-[10px] font-bold uppercase tracking-[.5px]" style={{ color: 'var(--muted)' }}>Moneda</label>
                <select value={s.currency} onChange={e => setS(p => ({ ...p, currency: e.target.value }))}
                  className="px-[13px] py-[9px] rounded-[9px] text-sm outline-none"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                  <option value="S/">S/ Soles (PEN)</option>
                  <option value="$">$ Dólares (USD)</option>
                  <option value="€">€ Euros (EUR)</option>
                  <option value="COP">COP Colombia</option>
                  <option value="MXN">MXN México</option>
                </select>
              </div>
              {fi('IGV (%)', 'tax_rate', 'number')}
              <div className="col-span-2 flex flex-col gap-[5px]">
                <label className="text-[10px] font-bold uppercase tracking-[.5px]" style={{ color: 'var(--muted)' }}>Pie de Comprobante</label>
                <input value={s.receipt_footer} onChange={e => setS(p => ({ ...p, receipt_footer: e.target.value }))}
                  className="px-[13px] py-[9px] rounded-[9px] text-sm outline-none"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              </div>
              <div className="col-span-2 flex flex-col gap-[5px]">
                <label className="text-[10px] font-bold uppercase tracking-[.5px]" style={{ color: 'var(--muted)' }}>Tema de la Interfaz</label>
                <div className="flex gap-2 mt-1">
                  {(['dark', 'light'] as ThemeMode[]).map(mode => (
                    <button
                      key={mode}
                      onClick={() => { setS(p => ({ ...p, theme_mode: mode })); applyTheme(mode, s.accent) }}
                      className="flex-1 flex items-center justify-center gap-2 py-[9px] rounded-[9px] text-xs font-semibold transition-all border"
                      style={{
                        background: s.theme_mode === mode ? 'var(--accent)' : 'var(--surface)',
                        borderColor: s.theme_mode === mode ? 'var(--accent)' : 'var(--border)',
                        color: s.theme_mode === mode ? '#fff' : 'var(--muted)',
                      }}
                    >
                      {mode === 'dark' ? '🌙 Oscuro' : '☀️ Claro'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="col-span-2 flex flex-col gap-[5px]">
                <label className="text-[10px] font-bold uppercase tracking-[.5px]" style={{ color: 'var(--muted)' }}>Color del Sistema</label>
                <div className="flex gap-2 flex-wrap mt-1">
                  {accentColors.map(c => (
                    <button key={c} onClick={() => {
                      setS(p => ({ ...p, accent: c }))
                      const root = document.documentElement
                      root.style.setProperty('--accent', c)
                      root.style.setProperty('--accent3', c)
                      root.style.setProperty('--gradient', `linear-gradient(135deg, ${c}, ${c}CC)`)
                    }}
                      className="w-7 h-7 rounded-[7px] transition-all"
                      style={{ background: c, border: s.accent === c ? '2px solid #fff' : '2px solid transparent', outline: s.accent === c ? `2px solid ${c}` : 'none' }} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* IA Config */}
          <div className="rounded-[13px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>🤖 Configuración IA</span>
            </div>
            <div className="p-4 flex flex-col gap-4">
              {toggle('Alertas automáticas de stock', 'IA te avisa cuando un producto está por agotarse', 'ai_stock')}
              {toggle('Predicción de ventas', 'Proyecciones para los próximos 7 días', 'ai_predict')}
              {toggle('Sugerencias de mensajes IA', 'Genera textos para WhatsApp y email', 'ai_messages')}
              {toggle('Segmentación automática de clientes', 'VIP, Regular, Inactivo, Corporativo', 'ai_segment')}
            </div>
          </div>

          <button onClick={handleSave} disabled={saving}
            className="w-full py-3 rounded-[9px] text-sm font-bold text-white transition-all disabled:opacity-60"
            style={{ background: 'var(--gradient)' }}>
            {saving ? '⏳ Guardando...' : '💾 Guardar todo'}
          </button>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-[14px]">
          {/* Plan */}
          <div className="rounded-[13px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>📊 Tu Plan</span>
            </div>
            <div className="p-4 text-center">
              <div className="text-3xl font-extrabold mb-1" style={{ background: 'var(--gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {(currentOrg.settings?.plan ?? 'PRO').toUpperCase()}
              </div>
              <div className="text-xs mb-4" style={{ color: 'var(--muted)' }}>Plan activo</div>
              <div className="flex flex-col gap-[5px] text-left mb-4">
                {[
                  ['POS + Inventario', '✅'],
                  ['Facturación SUNAT', currentOrg.settings?.plan === 'premium' ? '✅' : '🔒 Premium'],
                  ['Módulo Farmacia',   currentOrg.settings?.plan === 'premium' ? '✅' : '🔒 Premium'],
                  ['Asistente IA',      ['pro','premium'].includes(currentOrg.settings?.plan) ? '✅' : '🔒 Pro'],
                  ['Tienda Virtual',    currentOrg.settings?.plan === 'premium' ? '✅' : '🔒 Premium'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs">
                    <span style={{ color: 'var(--muted)' }}>{k}</span>
                    <span style={{ color: String(v).startsWith('✅') ? 'var(--green)' : 'var(--sub)' }}>{v}</span>
                  </div>
                ))}
              </div>
              <a href="/precios"
                className="block w-full py-[9px] rounded-[9px] text-xs font-bold text-white text-center transition-all"
                style={{ background: 'var(--gradient)' }}>⚡ Ver planes →</a>
            </div>
          </div>

          {/* Soporte */}
          <div className="rounded-[13px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>💬 Soporte</span>
            </div>
            <div className="p-4 flex flex-col gap-3">
              <a href="https://wa.me/51913916967?text=Hola,%20necesito%20ayuda%20con%20Coriva%20Core"
                target="_blank" rel="noopener noreferrer"
                className="block w-full py-[10px] rounded-[9px] text-xs font-semibold text-center transition-all"
                style={{ background: 'rgba(37,211,102,.1)', color: '#25D366', border: '1px solid rgba(37,211,102,.3)' }}>
                📱 WhatsApp directo
              </a>
              <div className="text-[11px] leading-[1.9]" style={{ color: 'var(--muted)' }}>
                ✅ Respuesta &lt;1 hora<br />✅ Soporte técnico incluido<br />✅ Lun–Sáb 8am–8pm
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
