-- ============================================================
-- MIGRACIÓN 002: Proveedores y Compras
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- ── 1. TABLA: suppliers ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS corivacore_suppliers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID NOT NULL,
  name         VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255),
  phone        VARCHAR(50),
  email        VARCHAR(255),
  ruc          VARCHAR(20),
  address      TEXT,
  notes        TEXT,
  is_active    BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_suppliers_org ON corivacore_suppliers(org_id, is_active);
ALTER TABLE corivacore_suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_suppliers" ON corivacore_suppliers FOR ALL USING (org_id = get_user_org_id());

-- ── 2. TABLA: purchases ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS corivacore_purchases (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL,
  supplier_id     UUID REFERENCES corivacore_suppliers(id),
  purchase_number VARCHAR(50),
  status          VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending','received','partial','cancelled')),
  total           DECIMAL(10,2) DEFAULT 0,
  notes           TEXT,
  expected_at     DATE,
  received_at     TIMESTAMPTZ,
  created_by      VARCHAR(255),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_purchases_org ON corivacore_purchases(org_id, status);
ALTER TABLE corivacore_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_purchases" ON corivacore_purchases FOR ALL USING (org_id = get_user_org_id());

-- ── 3. TABLA: purchase_items ─────────────────────────────────
CREATE TABLE IF NOT EXISTS corivacore_purchase_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID NOT NULL REFERENCES corivacore_purchases(id) ON DELETE CASCADE,
  product_id  UUID REFERENCES corivacore_products(id),
  product_name VARCHAR(255) NOT NULL,
  quantity    INTEGER NOT NULL,
  unit_cost   DECIMAL(10,2) NOT NULL,
  subtotal    DECIMAL(10,2) NOT NULL,
  received_qty INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_purchase_items_purchase ON corivacore_purchase_items(purchase_id);
ALTER TABLE corivacore_purchase_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_purchase_items" ON corivacore_purchase_items FOR ALL
  USING (purchase_id IN (SELECT id FROM corivacore_purchases WHERE org_id = get_user_org_id()));

-- ── 4. FUNCIÓN: receive_purchase ────────────────────────────
-- Al recibir una compra, actualiza stock automáticamente
CREATE OR REPLACE FUNCTION receive_purchase(p_purchase_id UUID, p_received_by VARCHAR DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_item RECORD;
  v_org_id UUID;
BEGIN
  SELECT org_id INTO v_org_id FROM corivacore_purchases WHERE id = p_purchase_id;

  FOR v_item IN
    SELECT product_id, quantity FROM corivacore_purchase_items
    WHERE purchase_id = p_purchase_id AND product_id IS NOT NULL
  LOOP
    UPDATE corivacore_products
    SET stock = stock + v_item.quantity, updated_at = NOW()
    WHERE id = v_item.product_id;

    INSERT INTO corivacore_inventory_movements
      (org_id, product_id, type, quantity, reference_type, reference_id, created_by)
    SELECT v_org_id, v_item.product_id, 'purchase', v_item.quantity, 'purchase', p_purchase_id, p_received_by
    WHERE v_item.product_id IS NOT NULL;
  END LOOP;

  UPDATE corivacore_purchases
  SET status = 'received', received_at = NOW()
  WHERE id = p_purchase_id;
END;
$$;

-- ── 5. Número correlativo de compra ─────────────────────────
CREATE OR REPLACE FUNCTION generate_purchase_number(p_org_id UUID)
RETURNS VARCHAR
LANGUAGE plpgsql
AS $$
DECLARE v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM corivacore_purchases WHERE org_id = p_org_id;
  RETURN 'OC-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD((v_count + 1)::TEXT, 4, '0');
END;
$$;
