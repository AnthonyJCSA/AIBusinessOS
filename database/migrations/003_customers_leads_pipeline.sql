-- ============================================================
-- MIGRACIÓN 003: Enriquecimiento de clientes + leads + pipeline
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- ── 1. Columnas adicionales en customers ────────────────────
ALTER TABLE corivacore_customers
  ADD COLUMN IF NOT EXISTS birth_date    DATE,
  ADD COLUMN IF NOT EXISTS notes         TEXT,
  ADD COLUMN IF NOT EXISTS tags          TEXT[],
  ADD COLUMN IF NOT EXISTS segment       VARCHAR(20) DEFAULT 'nuevo',
  ADD COLUMN IF NOT EXISTS total_purchases INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_spent   DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_purchase_at TIMESTAMPTZ;

-- ── 2. RPC: get_customer_stats ───────────────────────────────
CREATE OR REPLACE FUNCTION get_customer_stats(p_customer_id UUID, p_org_id UUID)
RETURNS TABLE (
  total_purchases BIGINT,
  total_spent     NUMERIC,
  avg_ticket      NUMERIC,
  last_purchase   TIMESTAMPTZ,
  first_purchase  TIMESTAMPTZ
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    COUNT(*)                    AS total_purchases,
    COALESCE(SUM(total), 0)     AS total_spent,
    COALESCE(AVG(total), 0)     AS avg_ticket,
    MAX(created_at)             AS last_purchase,
    MIN(created_at)             AS first_purchase
  FROM corivacore_sales
  WHERE customer_id = p_customer_id
    AND org_id = p_org_id
    AND status = 'completed';
$$;

-- ── 3. TABLA: leads ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS corivacore_leads (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID NOT NULL,
  name         VARCHAR(255) NOT NULL,
  phone        VARCHAR(50),
  email        VARCHAR(255),
  source       VARCHAR(50) DEFAULT 'otro',
  status       VARCHAR(20) DEFAULT 'new'
    CHECK (status IN ('new','contacted','qualified','proposal','won','lost')),
  assigned_to  UUID,
  notes        TEXT,
  converted_customer_id UUID,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_org_status ON corivacore_leads(org_id, status);
ALTER TABLE corivacore_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_leads" ON corivacore_leads FOR ALL USING (org_id = get_user_org_id());

-- ── 4. TABLA: pipeline_stages ───────────────────────────────
CREATE TABLE IF NOT EXISTS corivacore_pipeline_stages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL,
  name        VARCHAR(100) NOT NULL,
  color       VARCHAR(20) DEFAULT '#6366f1',
  order_index INTEGER NOT NULL DEFAULT 0,
  is_default  BOOLEAN DEFAULT false
);

ALTER TABLE corivacore_pipeline_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_pipeline_stages" ON corivacore_pipeline_stages FOR ALL USING (org_id = get_user_org_id());

-- ── 5. TABLA: pipeline_deals ────────────────────────────────
CREATE TABLE IF NOT EXISTS corivacore_pipeline_deals (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id         UUID NOT NULL,
  lead_id        UUID REFERENCES corivacore_leads(id),
  customer_id    UUID REFERENCES corivacore_customers(id),
  stage_id       UUID NOT NULL REFERENCES corivacore_pipeline_stages(id),
  title          VARCHAR(255) NOT NULL,
  value          DECIMAL(10,2) DEFAULT 0,
  probability    INTEGER DEFAULT 50,
  expected_close DATE,
  assigned_to    UUID,
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deals_org_stage ON corivacore_pipeline_deals(org_id, stage_id);
ALTER TABLE corivacore_pipeline_deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_deals" ON corivacore_pipeline_deals FOR ALL USING (org_id = get_user_org_id());
