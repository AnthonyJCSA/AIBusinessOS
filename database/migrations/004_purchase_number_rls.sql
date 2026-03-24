-- ============================================================
-- MIGRACIÓN 004: RPC generate_purchase_number + permisos leads
-- Ejecutar en Supabase SQL Editor DESPUÉS de 002 y 003
-- ============================================================

-- ── 1. RPC: generate_purchase_number ────────────────────────
CREATE OR REPLACE FUNCTION generate_purchase_number(p_org_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_count INTEGER;
  v_year  TEXT;
BEGIN
  v_year := TO_CHAR(NOW(), 'YY');
  SELECT COUNT(*) + 1 INTO v_count
  FROM corivacore_purchases
  WHERE org_id = p_org_id
    AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  RETURN 'OC-' || v_year || '-' || LPAD(v_count::TEXT, 4, '0');
END;
$$;

-- ── 2. RLS para suppliers y purchases (si no existe) ─────────
ALTER TABLE corivacore_suppliers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org_suppliers" ON corivacore_suppliers;
CREATE POLICY "org_suppliers" ON corivacore_suppliers
  FOR ALL USING (org_id = get_user_org_id());

ALTER TABLE corivacore_purchases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org_purchases" ON corivacore_purchases;
CREATE POLICY "org_purchases" ON corivacore_purchases
  FOR ALL USING (org_id = get_user_org_id());

ALTER TABLE corivacore_purchase_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org_purchase_items" ON corivacore_purchase_items;
CREATE POLICY "org_purchase_items" ON corivacore_purchase_items
  FOR ALL USING (
    purchase_id IN (
      SELECT id FROM corivacore_purchases WHERE org_id = get_user_org_id()
    )
  );

-- ── 3. Índices de rendimiento ────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_purchases_org_status
  ON corivacore_purchases(org_id, status);

CREATE INDEX IF NOT EXISTS idx_suppliers_org
  ON corivacore_suppliers(org_id);

-- ── 4. Columna updated_at en leads (trigger) ─────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS leads_updated_at ON corivacore_leads;
CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON corivacore_leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS deals_updated_at ON corivacore_pipeline_deals;
CREATE TRIGGER deals_updated_at
  BEFORE UPDATE ON corivacore_pipeline_deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
