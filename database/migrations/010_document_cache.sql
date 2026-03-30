-- ============================================================
-- MIGRACIÓN 010: Caché DNI/RUC + auditoría de consultas
-- ============================================================

-- ── 1. Caché de documentos ───────────────────────────────────
CREATE TABLE IF NOT EXISTS corivacore_document_cache (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_type    VARCHAR(5)   NOT NULL CHECK (doc_type IN ('DNI','RUC')),
  doc_number  VARCHAR(15)  NOT NULL,
  result      JSONB        NOT NULL,
  queried_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  expires_at  TIMESTAMPTZ  NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  UNIQUE(doc_type, doc_number)
);

CREATE INDEX IF NOT EXISTS idx_doc_cache_lookup
  ON corivacore_document_cache(doc_type, doc_number, expires_at);

-- Sin RLS — tabla de caché global con datos de registros públicos

-- ── 2. Auditoría de consultas ────────────────────────────────
CREATE TABLE IF NOT EXISTS corivacore_document_queries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID,
  doc_type    VARCHAR(5)  NOT NULL,
  doc_number  VARCHAR(15) NOT NULL,
  cache_hit   BOOLEAN     NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doc_queries_org
  ON corivacore_document_queries(org_id, created_at DESC);

ALTER TABLE corivacore_document_queries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org_doc_queries" ON corivacore_document_queries;
CREATE POLICY "org_doc_queries" ON corivacore_document_queries
  FOR ALL USING (true);

-- ── 3. Función de limpieza de caché expirada ─────────────────
CREATE OR REPLACE FUNCTION cleanup_document_cache()
RETURNS void LANGUAGE sql AS $$
  DELETE FROM corivacore_document_cache WHERE expires_at < NOW();
$$;
