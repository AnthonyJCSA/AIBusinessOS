import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export type TriggerType =
  | 'stock_below_min'
  | 'stock_zero'
  | 'customer_inactive'
  | 'sale_completed'
  | 'daily_summary'
  | 'lead_no_contact'

export type ActionType =
  | 'notify_whatsapp'
  | 'notify_internal'
  | 'send_whatsapp_template'
  | 'create_task'

export type AutomationStatus = 'active' | 'paused' | 'draft'

export interface AutomationConfig {
  // Trigger config
  threshold?: number        // stock_below_min: unidades mínimas
  inactive_days?: number    // customer_inactive: días sin compra
  no_contact_days?: number  // lead_no_contact: días sin actividad
  // Action config
  phone?: string            // número destino
  message_template?: string // plantilla del mensaje
  task_title?: string       // título de la tarea
}

export interface Automation {
  id: string
  org_id: string
  name: string
  description?: string
  trigger: TriggerType
  action: ActionType
  config: AutomationConfig
  status: AutomationStatus
  run_count: number
  last_run_at?: string
  created_at: string
}

export interface AutomationLog {
  id: string
  automation_id: string
  org_id: string
  trigger_data: Record<string, any>
  action_result: string
  success: boolean
  created_at: string
}

const TABLE     = 'corivacore_automations'
const LOG_TABLE = 'corivacore_automation_logs'

export const automationService = {
  async getAll(orgId: string): Promise<Automation[]> {
    if (!isSupabaseConfigured()) return []
    const { data, error } = await supabase
      .from(TABLE).select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data || []) as Automation[]
  },

  async create(orgId: string, payload: Omit<Automation, 'id' | 'org_id' | 'run_count' | 'last_run_at' | 'created_at'>): Promise<Automation> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from(TABLE)
      .insert({ ...payload, org_id: orgId, run_count: 0, status: payload.status ?? 'active' })
      .select().single()
    if (error) throw error
    return data as Automation
  },

  async update(id: string, payload: Partial<Pick<Automation, 'name' | 'description' | 'config' | 'status'>>): Promise<void> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured')
    const { error } = await supabase.from(TABLE).update(payload).eq('id', id)
    if (error) throw error
  },

  async toggleStatus(id: string, current: AutomationStatus): Promise<void> {
    const next: AutomationStatus = current === 'active' ? 'paused' : 'active'
    await automationService.update(id, { status: next })
  },

  async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured')
    const { error } = await supabase.from(TABLE).delete().eq('id', id)
    if (error) throw error
  },

  async log(orgId: string, automationId: string, triggerData: Record<string, any>, result: string, success: boolean): Promise<void> {
    if (!isSupabaseConfigured()) return
    await supabase.from(LOG_TABLE).insert({
      automation_id: automationId,
      org_id: orgId,
      trigger_data: triggerData,
      action_result: result,
      success,
    })
    // Actualizar run_count y last_run_at
    await supabase.from(TABLE)
      .update({ last_run_at: new Date().toISOString() })
      .eq('id', automationId)
    await supabase.rpc('increment_automation_run_count', { p_id: automationId })
  },

  async getLogs(orgId: string, limit = 20): Promise<AutomationLog[]> {
    if (!isSupabaseConfigured()) return []
    const { data, error } = await supabase
      .from(LOG_TABLE).select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return (data || []) as AutomationLog[]
  },
}

// ── Plantillas de automatizaciones predefinidas ──────────────
export const AUTOMATION_TEMPLATES: Omit<Automation, 'id' | 'org_id' | 'run_count' | 'last_run_at' | 'created_at'>[] = [
  {
    name: 'Alerta stock crítico',
    description: 'Notificación interna cuando un producto baja del mínimo',
    trigger: 'stock_below_min',
    action: 'notify_internal',
    config: { threshold: 5 },
    status: 'active',
  },
  {
    name: 'Reactivar clientes inactivos',
    description: 'WhatsApp automático a clientes sin compras en 30 días',
    trigger: 'customer_inactive',
    action: 'send_whatsapp_template',
    config: {
      inactive_days: 30,
      message_template: '¡Hola {nombre}! 👋 Hace tiempo no te vemos en {negocio}. Te tenemos una oferta especial. ¿Cuándo nos visitas?',
    },
    status: 'active',
  },
  {
    name: 'Seguimiento de leads sin contacto',
    description: 'Recordatorio interno cuando un lead lleva 3 días sin actividad',
    trigger: 'lead_no_contact',
    action: 'notify_internal',
    config: { no_contact_days: 3 },
    status: 'active',
  },
  {
    name: 'Resumen diario IA',
    description: 'Notificación con el resumen del día al cierre',
    trigger: 'daily_summary',
    action: 'notify_internal',
    config: {},
    status: 'active',
  },
]
