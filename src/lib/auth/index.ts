export { createClient as createBrowserClient } from './supabase-client'
export { updateSession } from './supabase-middleware'

// Server-only exports - no importar en client components
// export { createClient as createServerClient } from './supabase-server'
// export { getAuthUser, hasRole, isSupabaseConfigured } from './helpers'
