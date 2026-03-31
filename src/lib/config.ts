/**
 * Configuración Centralizada de la Aplicación
 * Todas las constantes y configuraciones en un solo lugar
 */

import { env } from './env/client'

export const config = {
  // App
  app: {
    name: 'Coriva Core',
    description: 'Sistema POS Multi-Tenant SaaS',
    url: env.appUrl,
    version: '1.0.0',
  },

  // Supabase
  supabase: {
    url: env.supabaseUrl!,
    anonKey: env.supabaseAnonKey!,
  },

  // Analytics
  analytics: {
    gtmId: env.gtmId,
    ga4Id: env.ga4Id,
    metaPixelId: env.metaPixelId,
    enabled: env.isProduction,
  },

  // Contacto
  contact: {
    whatsapp: env.whatsappNumber,
    whatsappUrl: `https://wa.me/${env.whatsappNumber}`,
    email: 'soporte@corivape.com',
    supportUrl: `https://wa.me/${env.whatsappNumber}?text=Hola,%20necesito%20ayuda%20con%20Coriva%20Core`,
  },

  // Roles
  roles: {
    OWNER: 'OWNER',
    ADMIN: 'ADMIN',
    MANAGER: 'MANAGER',
    VENDEDOR: 'VENDEDOR',
    VIEWER: 'VIEWER',
  } as const,

  // Planes
  plans: {
    STARTER: 'starter',
    PRO: 'pro',
    PREMIUM: 'premium',
  } as const,

  // Tipos de negocio
  businessTypes: {
    PHARMACY: 'pharmacy',
    HARDWARE: 'hardware',
    CLOTHING: 'clothing',
    BARBERSHOP: 'barbershop',
    RESTAURANT: 'restaurant',
    RETAIL: 'retail',
    OTHER: 'other',
  } as const,

  // Límites
  limits: {
    maxProducts: 10000,
    maxUsers: 50,
    maxSalesPerDay: 1000,
    sessionTimeout: 3600, // 1 hora en segundos
    maxFileSize: 5 * 1024 * 1024, // 5MB
  },

  // URLs
  urls: {
    home: '/',
    login: '/login',
    register: '/registro',
    dashboard: '/dashboard',
    pricing: '/precios',
    demo: '/demo',
  },

  // Feature flags
  features: {
    aiAssistant: true,
    billing: true,
    pharma: true,
    virtualStore: true,
    automations: true,
    communications: true,
  },
} as const

export type Config = typeof config
export type Role = keyof typeof config.roles
export type Plan = typeof config.plans[keyof typeof config.plans]
export type BusinessType = typeof config.businessTypes[keyof typeof config.businessTypes]
