-- ============================================================
-- Sprint 6: Growth Layer
-- Tabla: corivacore_lead_notes
-- ============================================================

CREATE TABLE IF NOT EXISTS corivacore_lead_notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id     UUID NOT NULL REFERENCES corivacore_leads(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  created_by  TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_notes_lead_id ON corivacore_lead_notes(lead_id);

-- Agregar columna estimated_value a leads si no existe
ALTER TABLE corivacore_leads
  ADD COLUMN IF NOT EXISTS estimated_value NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- RLS
ALTER TABLE corivacore_lead_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lead_notes_open" ON corivacore_lead_notes FOR ALL USING (true);
