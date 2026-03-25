'use client'

import { useState, useEffect, useCallback } from 'react'
import { userService } from '@/lib/services/user.service'
import type { User } from '@/types'

interface Props {
  currentUser: User
  organizationId: string
}

type Role = User['role']

const ROLES: { value: Role; label: string; color: string }[] = [
  { value: 'OWNER',    label: '👑 Owner',    color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { value: 'ADMIN',    label: '🛡 Admin',    color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  { value: 'MANAGER',  label: '👔 Manager',  color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { value: 'VENDEDOR', label: '🛒 Vendedor', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { value: 'VIEWER',   label: '👁 Viewer',   color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
]

const roleStyle = (role: Role) => ROLES.find(r => r.value === role)?.color ?? ''
const roleLabel = (role: Role) => ROLES.find(r => r.value === role)?.label ?? role

const EMPTY_FORM = { username: '', email: '', full_name: '', password: '', role: 'VENDEDOR' as Role }

export default function UsersModule({ currentUser, organizationId }: Props) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [showPwdModal, setShowPwdModal] = useState<User | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [newPwd, setNewPwd] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try { setUsers(await userService.getAll(organizationId)) }
    catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }, [organizationId])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setForm(EMPTY_FORM); setEditUser(null); setError(''); setShowModal(true) }
  const openEdit = (u: User) => {
    setForm({ username: u.username, email: u.email, full_name: u.full_name, password: '', role: u.role })
    setEditUser(u); setError(''); setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.full_name.trim() || !form.username.trim()) return
    if (!editUser && !form.password.trim()) { setError('La contraseña es requerida'); return }
    setSaving(true); setError('')
    try {
      if (editUser) {
        await userService.update(editUser.id, { full_name: form.full_name, email: form.email, role: form.role })
      } else {
        await userService.create(organizationId, form)
      }
      setShowModal(false)
      await load()
    } catch (e: any) { setError(e.message) }
    finally { setSaving(false) }
  }

  const handleToggle = async (u: User) => {
    if (u.id === currentUser.id) return
    try { await userService.toggleActive(u.id, !u.is_active); await load() }
    catch (e: any) { setError(e.message) }
  }

  const handleResetPwd = async () => {
    if (!showPwdModal || !newPwd.trim()) return
    setSaving(true)
    try { await userService.resetPassword(showPwdModal.id, newPwd); setShowPwdModal(null); setNewPwd('') }
    catch (e: any) { setError(e.message) }
    finally { setSaving(false) }
  }

  const activeCount = users.filter(u => u.is_active).length
  const adminCount  = users.filter(u => u.role === 'ADMIN' || u.role === 'OWNER').length

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-extrabold" style={{ color: 'var(--text)' }}>Usuarios & Accesos</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
            {users.length} usuarios · {activeCount} activos · {adminCount} admins
          </p>
        </div>
        <button onClick={openCreate} className="px-4 py-2 rounded-lg text-xs font-bold text-white" style={{ background: 'var(--gradient)' }}>
          + Nuevo Usuario
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg text-xs" style={{ background: 'rgba(239,68,68,.1)', color: 'var(--red)', border: '1px solid rgba(239,68,68,.2)' }}>
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total',   value: users.length,  color: 'var(--accent)' },
          { label: 'Activos', value: activeCount,    color: 'var(--green)'  },
          { label: 'Admins',  value: adminCount,     color: 'var(--amber)'  },
        ].map(s => (
          <div key={s.label} className="rounded-xl px-4 py-3 text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[10px] mt-0.5" style={{ color: 'var(--muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                {['Usuario', 'Nombre', 'Rol', 'Estado', 'Acciones'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center" style={{ color: 'var(--muted)' }}>Cargando…</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center" style={{ color: 'var(--muted)' }}>
                  <div className="text-3xl mb-2">👤</div>
                  <div>No hay usuarios registrados</div>
                </td></tr>
              ) : users.map(u => (
                <tr key={u.id} className="transition-colors hover:bg-white/5" style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="px-4 py-3">
                    <div className="font-bold" style={{ color: 'var(--text)' }}>{u.username}</div>
                    <div style={{ color: 'var(--muted)' }}>{u.email}</div>
                  </td>
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--text)' }}>{u.full_name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-semibold border ${roleStyle(u.role)}`}>
                      {roleLabel(u.role)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggle(u)}
                      disabled={u.id === currentUser.id}
                      className="px-2 py-1 rounded-full text-[10px] font-semibold border transition-all disabled:opacity-40"
                      style={u.is_active
                        ? { background: 'rgba(16,185,129,.1)', color: 'var(--green)', borderColor: 'rgba(16,185,129,.2)' }
                        : { background: 'rgba(239,68,68,.1)',  color: 'var(--red)',   borderColor: 'rgba(239,68,68,.2)'  }
                      }
                    >
                      {u.is_active ? '● Activo' : '● Inactivo'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(u)}
                        className="px-2 py-1 rounded text-[10px] font-semibold"
                        style={{ background: 'rgba(99,102,241,.1)', color: 'var(--accent)', border: '1px solid rgba(99,102,241,.2)' }}
                      >
                        Editar
                      </button>
                      {u.id !== currentUser.id && (
                        <button
                          onClick={() => { setShowPwdModal(u); setNewPwd('') }}
                          className="px-2 py-1 rounded text-[10px] font-semibold"
                          style={{ background: 'var(--surface)', color: 'var(--muted)', border: '1px solid var(--border)' }}
                        >
                          🔑
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Create / Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border2)' }}>
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
              <span className="font-extrabold" style={{ color: 'var(--text)' }}>{editUser ? 'Editar Usuario' : 'Nuevo Usuario'}</span>
              <button onClick={() => setShowModal(false)} className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: 'var(--surface)', color: 'var(--muted)' }}>✕</button>
            </div>
            <div className="p-5 space-y-3">
              {([
                { key: 'full_name', label: 'Nombre completo *', type: 'text',     disabled: false },
                { key: 'username',  label: 'Usuario *',         type: 'text',     disabled: !!editUser },
                { key: 'email',     label: 'Email',             type: 'email',    disabled: false },
                ...(!editUser ? [{ key: 'password', label: 'Contraseña *', type: 'password', disabled: false }] : []),
              ] as { key: string; label: string; type: string; disabled: boolean }[]).map(({ key, label, type, disabled }) => (
                <div key={key}>
                  <label className="text-[10px] font-semibold mb-1 block" style={{ color: 'var(--muted)' }}>{label}</label>
                  <input
                    type={type}
                    value={(form as any)[key] ?? ''}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    disabled={disabled}
                    className="w-full px-3 py-2 rounded-lg text-xs outline-none disabled:opacity-50"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  />
                </div>
              ))}
              <div>
                <label className="text-[10px] font-semibold mb-1 block" style={{ color: 'var(--muted)' }}>Rol</label>
                <select
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value as Role }))}
                  className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
                >
                  {ROLES.filter(r => r.value !== 'OWNER').map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              {error && <div className="text-xs" style={{ color: 'var(--red)' }}>{error}</div>}
            </div>
            <div className="p-5 pt-0 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-lg text-xs font-semibold" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.full_name.trim() || !form.username.trim()}
                className="flex-1 py-2 rounded-lg text-xs font-bold text-white disabled:opacity-50"
                style={{ background: 'var(--gradient)' }}
              >
                {saving ? 'Guardando…' : editUser ? 'Guardar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reset Password Modal ── */}
      {showPwdModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="w-full max-w-xs rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border2)' }}>
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
              <span className="font-extrabold" style={{ color: 'var(--text)' }}>🔑 Cambiar Contraseña</span>
              <button onClick={() => setShowPwdModal(null)} className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: 'var(--surface)', color: 'var(--muted)' }}>✕</button>
            </div>
            <div className="p-5 space-y-3">
              <div className="text-xs" style={{ color: 'var(--muted)' }}>
                Usuario: <span style={{ color: 'var(--text)' }}>{showPwdModal.username}</span>
              </div>
              <input
                type="password"
                placeholder="Nueva contraseña"
                value={newPwd}
                onChange={e => setNewPwd(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
              />
            </div>
            <div className="p-5 pt-0 flex gap-3">
              <button onClick={() => setShowPwdModal(null)} className="flex-1 py-2 rounded-lg text-xs font-semibold" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
                Cancelar
              </button>
              <button
                onClick={handleResetPwd}
                disabled={saving || !newPwd.trim()}
                className="flex-1 py-2 rounded-lg text-xs font-bold text-white disabled:opacity-50"
                style={{ background: 'var(--gradient)' }}
              >
                {saving ? 'Guardando…' : 'Cambiar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
