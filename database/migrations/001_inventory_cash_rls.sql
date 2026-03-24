-- ============================================================
-- MIGRACIÓN 001: Movimientos de inventario + Sesiones de caja
-- + RLS real por organización
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- ── 1. TABLA: inventory_movements ───────────────────────────
CREATE TABLE IF NOT EXISTS corivacore_inventory_movements (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID NOT NULL,
  product_id   UUID NOT NULL REFERENCES corivacore_products(id) ON DELETE CASCADE,
  type         VARCHAR(20) NOT NULL
    CHECK (type IN ('sale','purchase','adjustment','return','initial')),
  quantity     INTEGER NOT NULL, -- positivo = entrada, negativo = salida
  stock_before INTEGER,
  stock_after  INTEGER,
  reference_type VARCHAR(20), -- 'sale' | 'purchase' | 'manual'
  reference_id UUID,
  notes        TEXT,
  created_by   VARCHAR(255),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inv_mov_org_product
  ON corivacore_inventory_movements(org_id, product_id);
CREATE INDEX IF NOT EXISTS idx_inv_mov_org_date
  ON corivacore_inventory_movements(org_id, created_at DESC);

ALTER TABLE corivacore_inventory_movements ENABLE ROW LEVEL SECURITY;

-- ── 2. TABLA: cash_sessions ──────────────────────────────────
CREATE TABLE IF NOT EXISTS corivacore_cash_sessions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id           UUID NOT NULL,
  opened_by        VARCHAR(255),
  closed_by        VARCHAR(255),
  opening_amount   DECIMAL(10,2) NOT NULL DEFAULT 0,
  expected_amount  DECIMAL(10,2),
  counted_amount   DECIMAL(10,2),
  difference       DECIMAL(10,2) GENERATED ALWAYS AS (counted_amount - expected_amount) STORED,
  status           VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open','closed')),
  notes            TEXT,
  opened_at        TIMESTAMPTZ DEFAULT NOW(),
  closed_at        TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_cash_sessions_org
  ON corivacore_cash_sessions(org_id, status);

ALTER TABLE corivacore_cash_sessions ENABLE ROW LEVEL SECURITY;

-- ── 3. TABLA: ai_insights ────────────────────────────────────
CREATE TABLE IF NOT EXISTS corivacore_ai_insights (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     UUID NOT NULL,
  type       VARCHAR(50) NOT NULL,
  title      VARCHAR(255) NOT NULL,
  body       TEXT NOT NULL,
  data       JSONB,
  severity   VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info','warning','critical')),
  is_read    BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_insights_org_unread
  ON corivacore_ai_insights(org_id, is_read, created_at DESC);

ALTER TABLE corivacore_ai_insights ENABLE ROW LEVEL SECURITY;

-- ── 4. COLUMNAS ADICIONALES en organizations ─────────────────
ALTER TABLE corivacore_organizations
  ADD COLUMN IF NOT EXISTS plan      VARCHAR(20) DEFAULT 'starter',
  ADD COLUMN IF NOT EXISTS country   VARCHAR(2)  DEFAULT 'PE',
  ADD COLUMN IF NOT EXISTS currency  VARCHAR(3)  DEFAULT 'PEN',
  ADD COLUMN IF NOT EXISTS timezone  VARCHAR(50) DEFAULT 'America/Lima';

-- ── 5. FUNCIÓN: get_user_org_id ──────────────────────────────
-- Obtiene el org_id del usuario autenticado para RLS
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT org_id
  FROM corivacore_users
  WHERE id = auth.uid()
  LIMIT 1;
$$;

-- ── 6. RLS REAL POR ORGANIZACIÓN ────────────────────────────
-- Eliminar políticas permisivas anteriores
DROP POLICY IF EXISTS "Enable all for products"       ON corivacore_products;
DROP POLICY IF EXISTS "Enable all for customers"      ON corivacore_customers;
DROP POLICY IF EXISTS "Enable all for sales"          ON corivacore_sales;
DROP POLICY IF EXISTS "Enable all for sale_items"     ON corivacore_sale_items;
DROP POLICY IF EXISTS "Enable all for cash_movements" ON corivacore_cash_movements;

-- Políticas reales: cada org solo ve sus datos
CREATE POLICY "org_products"
  ON corivacore_products FOR ALL
  USING (org_id = get_user_org_id());

CREATE POLICY "org_customers"
  ON corivacore_customers FOR ALL
  USING (org_id = get_user_org_id());

CREATE POLICY "org_sales"
  ON corivacore_sales FOR ALL
  USING (org_id = get_user_org_id());

CREATE POLICY "org_sale_items"
  ON corivacore_sale_items FOR ALL
  USING (
    sale_id IN (
      SELECT id FROM corivacore_sales
      WHERE org_id = get_user_org_id()
    )
  );

CREATE POLICY "org_cash_movements"
  ON corivacore_cash_movements FOR ALL
  USING (org_id = get_user_org_id());

CREATE POLICY "org_inventory_movements"
  ON corivacore_inventory_movements FOR ALL
  USING (org_id = get_user_org_id());

CREATE POLICY "org_cash_sessions"
  ON corivacore_cash_sessions FOR ALL
  USING (org_id = get_user_org_id());

CREATE POLICY "org_ai_insights"
  ON corivacore_ai_insights FOR ALL
  USING (org_id = get_user_org_id());

-- ── 7. RPC: decrement_product_stock (con movimiento) ────────
CREATE OR REPLACE FUNCTION decrement_product_stock(
  p_product_id UUID,
  p_quantity   INTEGER,
  p_sale_id    UUID DEFAULT NULL,
  p_created_by VARCHAR DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_stock_before INTEGER;
  v_stock_after  INTEGER;
  v_org_id       UUID;
BEGIN
  SELECT stock, org_id INTO v_stock_before, v_org_id
  FROM corivacore_products
  WHERE id = p_product_id
  FOR UPDATE;

  v_stock_after := GREATEST(0, v_stock_before - p_quantity);

  UPDATE corivacore_products
  SET stock = v_stock_after, updated_at = NOW()
  WHERE id = p_product_id;

  INSERT INTO corivacore_inventory_movements
    (org_id, product_id, type, quantity, stock_before, stock_after, reference_type, reference_id, created_by)
  VALUES
    (v_org_id, p_product_id, 'sale', -p_quantity, v_stock_before, v_stock_after, 'sale', p_sale_id, p_created_by);
END;
$$;

-- ── 8. RPC: adjust_product_stock ────────────────────────────
CREATE OR REPLACE FUNCTION adjust_product_stock(
  p_product_id  UUID,
  p_new_stock   INTEGER,
  p_reason      TEXT,
  p_created_by  VARCHAR DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_stock_before INTEGER;
  v_org_id       UUID;
BEGIN
  SELECT stock, org_id INTO v_stock_before, v_org_id
  FROM corivacore_products
  WHERE id = p_product_id
  FOR UPDATE;

  UPDATE corivacore_products
  SET stock = p_new_stock, updated_at = NOW()
  WHERE id = p_product_id;

  INSERT INTO corivacore_inventory_movements
    (org_id, product_id, type, quantity, stock_before, stock_after, notes, created_by)
  VALUES
    (v_org_id, p_product_id, 'adjustment',
     p_new_stock - v_stock_before, v_stock_before, p_new_stock,
     p_reason, p_created_by);
END;
$$;
