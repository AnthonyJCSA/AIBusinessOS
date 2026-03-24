-- ============================================================
-- Sprint 7: Automation Layer
-- Tablas: corivacore_automations, corivacore_automation_logs
-- ============================================================

CREATE TABLE IF NOT EXISTS corivacore_automations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID NOT NULL,
  name         TEXT NOT NULL,
  description  TEXT,
  trigger      TEXT NOT NULL,
  action       TEXT NOT NULL,
  config       JSONB NOT NULL DEFAULT '{}',
  status       TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','draft')),
  run_count    INTEGER NOT NULL DEFAULT 0,
  last_run_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS corivacore_automation_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id  UUID NOT NULL REFERENCES corivacore_automations(id) ON DELETE CASCADE,
  org_id         UUID NOT NULL,
  trigger_data   JSONB NOT NULL DEFAULT '{}',
  action_result  TEXT NOT NULL,
  success        BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_automations_org_id ON corivacore_automations(org_id);
CREATE INDEX IF NOT EXISTS idx_automation_logs_org_id ON corivacore_automation_logs(org_id);
CREATE INDEX IF NOT EXISTS idx_automation_logs_automation_id ON corivacore_automation_logs(automation_id);

-- Función para incrementar run_count atómicamente
CREATE OR REPLACE FUNCTION increment_automation_run_count(p_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE corivacore_automations
  SET run_count = run_count + 1
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

-- RLS
ALTER TABLE corivacore_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE corivacore_automation_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "automations_open" ON corivacore_automations FOR ALL USING (true);
CREATE POLICY "automation_logs_open" ON corivacore_automation_logs FOR ALL USING (true);
