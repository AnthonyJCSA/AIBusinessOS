-- ============================================================
-- MIGRACIÓN 005: Sesiones de caja formales
-- ============================================================

CREATE TABLE IF NOT EXISTS corivacore_cash_sessions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id           UUID NOT NULL,
  opened_by        UUID NOT NULL,
  closed_by        UUID,
  opening_amount   DECIMAL(10,2) NOT NULL DEFAULT 0,
  closing_amount   DECIMAL(10,2),
  expected_amount  DECIMAL(10,2),
  difference       DECIMAL(10,2),
  status           VARCHAR(10) NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'closed')),
  notes            TEXT,
  opened_at        TIMESTAMPTZ DEFAULT NOW(),
  closed_at        TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_cash_sessions_org_status
  ON corivacore_cash_sessions(org_id, status);

ALTER TABLE corivacore_cash_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "org_cash_sessions" ON corivacore_cash_sessions;
CREATE POLICY "org_cash_sessions" ON corivacore_cash_sessions
  FOR ALL USING (true);
