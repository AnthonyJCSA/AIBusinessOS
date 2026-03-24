// Re-exports para compatibilidad con imports existentes
// Los servicios que usan '@/lib/supabase' siguen funcionando
export { supabase, isSupabaseConfigured, createClient } from './client'
