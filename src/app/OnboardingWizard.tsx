'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Organization } from '../types'

interface Props {
  onComplete: (org: Organization, products: any[], userData: { full_name: string; username: string; password: string; email: string }) => void
  businessType?: string
}

export default function OnboardingWizard({ onComplete, businessType }: Props) {
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({
    // Negocio
    name:          '',
    business_type: (businessType || 'retail') as any,
    ruc:           '',
    phone:         '',
    email:         '',
    // Usuario admin
    full_name:     '',
    username:      '',
    password:      '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  function set(k: string, v: string) {
    setForm(p => ({ ...p, [k]: v }))
    setErrors(p => ({ ...p, [k]: '' }))
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim())      e.name      = 'Requerido'
    if (!form.full_name.trim()) e.full_name = 'Requerido'
    if (!form.username.trim())  e.username  = 'Requerido'
    if (form.password.length < 6) e.password = 'Mínimo 6 caracteres'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    const org: Organization = {
      id:            '',   // Supabase genera el UUID real
      slug:          `${form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Date.now()}`,
      name:          form.name,
      business_type: form.business_type,
      ruc:           form.ruc   || undefined,
      phone:         form.phone || undefined,
      email:         form.email || undefined,
      settings:      { currency: 'S/', tax_rate: 0.18, plan: 'pro' },
      is_active:     true,
      created_at:    new Date().toISOString(),
      updated_at:    new Date().toISOString(),
    }
    setLoading(false)
    onComplete(org, [], {
      full_name: form.full_name,
      username:  form.username,
      password:  form.password,
      email:     form.email,
    })
  }

  const fi = (label: string, key: string, opts?: { type?: string; placeholder?: string; required?: boolean }) => (
    <div className="flex flex-col gap-[5px]">
      <label className="text-[11px] font-bold uppercase tracking-[.5px]" style={{ color: '#6B7280' }}>
        {label}{opts?.required && <span style={{ color: '#EF4444' }}> *</span>}
      </label>
      <input
        type={opts?.type || 'text'}
        value={(form as any)[key]}
        placeholder={opts?.placeholder}
        onChange={e => set(key, e.target.value)}
        className="w-full px-[13px] py-[10px] rounded-[9px] text-sm outline-none transition-all"
        style={{
          background: '#F3F2EF',
          border: `1.5px solid ${errors[key] ? '#EF4444' : '#D4D2CC'}`,
          color: '#0C0E12',
        }}
      />
      {errors[key] && <span className="text-[11px]" style={{ color: '#EF4444' }}>{errors[key]}</span>}
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#FAFAF8' }}>
      <div className="w-full max-w-[480px]">

        {/* Logo */}
        <div className="flex items-center gap-[10px] mb-[28px]">
          <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-lg font-black"
            style={{ background: '#0C0E12', color: '#C8F23A', fontFamily: 'Georgia,serif' }}>C</div>
          <span className="text-[18px] font-bold" style={{ color: '#0C0E12', fontFamily: 'Georgia,serif' }}>AI Business OS</span>
        </div>

        {/* Header */}
        <div className="mb-[24px]">
          <h1 className="text-[28px] font-black leading-tight mb-[6px]" style={{ color: '#0C0E12', fontFamily: 'Georgia,serif', letterSpacing: -1 }}>
            Crea tu cuenta
          </h1>
          <p className="text-[14px]" style={{ color: '#6B7280' }}>
            Listo para vender en menos de 2 minutos
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-[14px]">

          {/* Sección negocio */}
          <div className="text-[10px] font-bold uppercase tracking-[1px] mt-[2px]" style={{ color: '#9CA3AF' }}>
            Tu negocio
          </div>

          {fi('Nombre del negocio', 'name', { placeholder: 'Ej: Botica San Juan', required: true })}

          <div className="grid grid-cols-2 gap-[10px]">
            <div className="flex flex-col gap-[5px]">
              <label className="text-[11px] font-bold uppercase tracking-[.5px]" style={{ color: '#6B7280' }}>
                Tipo <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <select value={form.business_type} onChange={e => set('business_type', e.target.value)}
                className="px-[13px] py-[10px] rounded-[9px] text-sm outline-none"
                style={{ background: '#F3F2EF', border: '1.5px solid #D4D2CC', color: '#0C0E12' }}>
                <option value="retail">🛒 Tienda / Bodega</option>
                <option value="pharmacy">💊 Farmacia / Botica</option>
                <option value="hardware">🔧 Ferretería</option>
                <option value="clothing">👕 Ropa</option>
                <option value="barbershop">✂️ Barbería</option>
                <option value="restaurant">🍔 Restaurante</option>
                <option value="other">📦 Otro</option>
              </select>
            </div>
            {fi('RUC', 'ruc', { placeholder: '20123456789' })}
          </div>

          <div className="grid grid-cols-2 gap-[10px]">
            {fi('Teléfono', 'phone', { placeholder: '999 888 777' })}
            {fi('Email', 'email', { type: 'email', placeholder: 'contacto@negocio.com' })}
          </div>

          {/* Separador */}
          <div className="flex items-center gap-[10px] mt-[4px]">
            <div className="flex-1 h-px" style={{ background: '#E5E3DE' }} />
            <span className="text-[10px] font-bold uppercase tracking-[1px]" style={{ color: '#9CA3AF' }}>Tu usuario admin</span>
            <div className="flex-1 h-px" style={{ background: '#E5E3DE' }} />
          </div>

          {fi('Nombre completo', 'full_name', { placeholder: 'Juan Pérez', required: true })}

          <div className="grid grid-cols-2 gap-[10px]">
            {fi('Usuario', 'username', { placeholder: 'juanperez', required: true })}
            <div className="flex flex-col gap-[5px]">
              <label className="text-[11px] font-bold uppercase tracking-[.5px]" style={{ color: '#6B7280' }}>
                Contraseña <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  placeholder="Mín. 6 caracteres"
                  onChange={e => set('password', e.target.value)}
                  className="w-full px-[13px] py-[10px] pr-[36px] rounded-[9px] text-sm outline-none"
                  style={{
                    background: '#F3F2EF',
                    border: `1.5px solid ${errors.password ? '#EF4444' : '#D4D2CC'}`,
                    color: '#0C0E12',
                  }}
                />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute right-[10px] top-1/2 -translate-y-1/2 text-[13px]"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <span className="text-[11px]" style={{ color: '#EF4444' }}>{errors.password}</span>}
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="w-full py-[13px] rounded-[10px] text-[15px] font-bold text-white mt-[6px] transition-all disabled:opacity-60"
            style={{ background: loading ? '#6B7280' : '#0C0E12' }}>
            {loading ? '⏳ Creando tu cuenta...' : '🚀 Crear cuenta y entrar'}
          </button>

          <p className="text-center text-[13px]" style={{ color: '#6B7280' }}>
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="font-bold" style={{ color: '#0C0E12' }}>Inicia sesión →</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
