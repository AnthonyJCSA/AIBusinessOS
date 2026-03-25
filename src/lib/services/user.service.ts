import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { User } from '@/types'

export const userService = {
  async getAll(orgId: string): Promise<User[]> {
    if (!isSupabaseConfigured()) return []
    const { data, error } = await supabase
      .from('corivacore_users')
      .select('id, org_id, username, email, full_name, role, is_active, created_at')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data || []).map((u: any) => ({ ...u, organization_id: u.org_id })) as User[]
  },

  async create(orgId: string, payload: {
    username: string; password: string; full_name: string; email: string; role: User['role']
  }): Promise<User> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from('corivacore_users')
      .insert({ org_id: orgId, username: payload.username, password_hash: payload.password, full_name: payload.full_name, email: payload.email, role: payload.role, is_active: true })
      .select('id, org_id, username, email, full_name, role, is_active, created_at')
      .single()
    if (error) throw error
    return { ...data, organization_id: data.org_id } as User
  },

  async update(userId: string, payload: Partial<Pick<User, 'full_name' | 'email' | 'role' | 'is_active'>>): Promise<void> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured')
    const { error } = await supabase.from('corivacore_users').update(payload).eq('id', userId)
    if (error) throw error
  },

  async toggleActive(userId: string, isActive: boolean): Promise<void> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured')
    const { error } = await supabase.from('corivacore_users').update({ is_active: isActive }).eq('id', userId)
    if (error) throw error
  },

  async resetPassword(userId: string, newPassword: string): Promise<void> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured')
    const { error } = await supabase.from('corivacore_users').update({ password_hash: newPassword }).eq('id', userId)
    if (error) throw error
  },
}
