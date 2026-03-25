-- ============================================================
-- MIGRACIÓN 006: Automatizaciones IA
-- Ejecutar en Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS corivacore_automations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL,
  name          VARCHAR(255) NOT NULL,
  trigger_type  VARCHAR(50) NOT NULL,
  action_type   VARCHAR(50) NOT NULL,
  config        JSONB DEFAULT '{}',
  is_active     BOOLEAN DEFAULT true,
  run_count     INTEGER DEFAULT 0,
  last_run_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_automations_org_active
  ON corivacore_automations(org_id, is_active);

ALTER TABLE corivacore_automations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "org_automations" ON corivacore_automations;
CREATE POLICY "org_automations" ON corivacore_automations
  FOR ALL USING (org_id = get_user_org_id());

DROP TRIGGER IF EXISTS automations_updated_at ON corivacore_automations;
CREATE TRIGGER automations_updated_at
  BEFORE UPDATE ON corivacore_automations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
