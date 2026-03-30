import { supabase } from '@/lib/supabase'
import { createLogger } from '@/lib/logger'

const log = createLogger('DocumentCache')

type DocType = 'DNI' | 'RUC'

export const documentCache = {
  async get<T>(docType: DocType, docNumber: string): Promise<T | null> {
    try {
      const { data } = await supabase
        .from('corivacore_document_cache')
        .select('result, expires_at')
        .eq('doc_type', docType)
        .eq('doc_number', docNumber)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle()

      if (data) {
        log.info('Cache hit', { docType, docNumber: docNumber.slice(0, 4) + '****' })
        return data.result as T
      }
      return null
    } catch {
      // Caché no crítica — fallo silencioso
      return null
    }
  },

  async set<T extends object>(docType: DocType, docNumber: string, result: T): Promise<void> {
    try {
      await supabase
        .from('corivacore_document_cache')
        .upsert({
          doc_type:   docType,
          doc_number: docNumber,
          result,
          queried_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        }, { onConflict: 'doc_type,doc_number' })
    } catch {
      // Fallo silencioso — no bloquear la respuesta por error de caché
    }
  },

  async logQuery(docType: DocType, docNumber: string, cacheHit: boolean, orgId?: string): Promise<void> {
    try {
      await supabase
        .from('corivacore_document_queries')
        .insert({
          org_id:     orgId ?? null,
          doc_type:   docType,
          doc_number: docNumber,
          cache_hit:  cacheHit,
        })
    } catch {
      // Auditoría no crítica
    }
  },
}
