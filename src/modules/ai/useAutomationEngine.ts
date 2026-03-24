'use client'
import { useEffect, useRef } from 'react'
import { automationService, type Automation } from '@/lib/services/automation.service'
import { useNotificationsStore, type AppNotification } from '@/state/notifications.store'
import type { Product, Sale } from '@/types'

type AddNotification = (n: Omit<AppNotification, 'id' | 'isRead' | 'createdAt'>) => void

interface EngineContext {
  orgId: string
  orgName: string
  products: Product[]
  sales: Sale[]
  currency: string
}

// Genera URL de WhatsApp con mensaje
function waUrl(phone: string, msg: string) {
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`
}

// Interpola variables en plantilla
function interpolate(template: string, vars: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`)
}

async function evaluateAndRun(automation: Automation, ctx: EngineContext, addNotification: AddNotification) {
  const { trigger, action, config, org_id } = automation
  const today = new Date().toISOString().split('T')[0]
  const todaySales = ctx.sales.filter(s => s.created_at?.startsWith(today))

  let fired = false
  let triggerData: Record<string, any> = {}
  let actionResult = ''

  // ── Evaluar trigger ──────────────────────────────────────
  if (trigger === 'stock_below_min') {
    const threshold = config.threshold ?? 5
    const critical = ctx.products.filter(p => p.stock > 0 && p.stock <= threshold)
    if (critical.length > 0) {
      fired = true
      triggerData = { products: critical.map(p => ({ name: p.name, stock: p.stock })) }
    }
  }

  if (trigger === 'stock_zero') {
    const empty = ctx.products.filter(p => p.stock === 0)
    if (empty.length > 0) {
      fired = true
      triggerData = { products: empty.map(p => p.name) }
    }
  }

  if (trigger === 'daily_summary') {
    const hour = new Date().getHours()
    // Solo dispara entre 17:00 y 20:00
    if (hour >= 17 && hour < 20) {
      fired = true
      const total = todaySales.reduce((s, v) => s + v.total, 0)
      triggerData = { sales_count: todaySales.length, total_revenue: total }
    }
  }

  if (trigger === 'sale_completed' && todaySales.length > 0) {
    fired = true
    triggerData = { count: todaySales.length }
  }

  if (!fired) return

  // ── Ejecutar acción ──────────────────────────────────────
  if (action === 'notify_internal') {
    let title = automation.name
    let body = ''

    if (trigger === 'stock_below_min') {
      const names = (triggerData.products as any[]).map((p: any) => `${p.name} (${p.stock}u)`).join(', ')
      body = `Stock bajo: ${names}`
    } else if (trigger === 'stock_zero') {
      body = `Sin stock: ${(triggerData.products as string[]).slice(0, 3).join(', ')}`
    } else if (trigger === 'daily_summary') {
      body = `${triggerData.sales_count} ventas · ${ctx.currency} ${Number(triggerData.total_revenue).toFixed(2)} hoy`
    } else if (trigger === 'lead_no_contact') {
      body = `${triggerData.count ?? 1} lead(s) sin contacto en ${config.no_contact_days ?? 3} días`
    } else {
      body = JSON.stringify(triggerData)
    }

    addNotification({
      type: trigger === 'stock_below_min' || trigger === 'stock_zero' ? 'stock_alert' : 'insight',
      title,
      body,
      severity: trigger === 'stock_zero' ? 'critical' : trigger === 'stock_below_min' ? 'warning' : 'info',
      metadata: { automation_id: automation.id, trigger_data: triggerData },
    })
    actionResult = `Notificación interna: ${body}`
  }

  if (action === 'send_whatsapp_template' && config.message_template) {
    // Genera URLs de WhatsApp para clientes inactivos (se abre manualmente)
    const template = config.message_template
    const msg = interpolate(template, { nombre: 'Cliente', negocio: ctx.orgName })
    actionResult = `WhatsApp template listo: ${msg.slice(0, 60)}…`

    addNotification({
      type: 'insight',
      title: automation.name,
      body: `Mensaje listo para enviar. Abre Comunicaciones para ejecutar.`,
      severity: 'info',
      metadata: { automation_id: automation.id, wa_template: msg },
    })
  }

  if (action === 'notify_whatsapp' && config.phone) {
    const msg = interpolate(config.message_template ?? automation.name, {
      negocio: ctx.orgName,
    })
    const url = waUrl(config.phone, msg)
    actionResult = `WhatsApp URL generada: ${url}`
    addNotification({
      type: 'insight',
      title: automation.name,
      body: `Mensaje WhatsApp listo para ${config.phone}`,
      severity: 'info',
      metadata: { automation_id: automation.id, wa_url: url },
    })
  }

  // Log en BD (sin bloquear)
  automationService.log(org_id, automation.id, triggerData, actionResult, true).catch(() => {})
}

export function useAutomationEngine(ctx: EngineContext) {
  const add = useNotificationsStore(s => s.add)
  const notifications = useNotificationsStore(s => s.notifications)
  const ranRef = useRef(false)

  useEffect(() => {
    if (ranRef.current || !ctx.orgId || ctx.products.length === 0) return
    // Guard adicional: esperar a que orgId sea un UUID válido
    if (ctx.orgId.length < 10) return
    ranRef.current = true

    automationService.getAll(ctx.orgId).then(automations => {
      const active = automations.filter(a => a.status === 'active')
      active.forEach(automation => {
        // Evitar re-disparar la misma automatización en la misma sesión
        const alreadyFired = notifications.some(
          n => n.metadata?.automation_id === automation.id
        )
        if (alreadyFired) return
        evaluateAndRun(automation, ctx, add).catch(console.error)
      })
    }).catch(console.error)
  }, [ctx.orgId, ctx.products.length]) // eslint-disable-line react-hooks/exhaustive-deps
}
