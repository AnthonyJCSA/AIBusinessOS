-- ================================================================
-- CORIVA OS — SCRIPT MAESTRO COMPLETO
-- Estado verificado: 25/03/2026
--
-- TABLAS YA EXISTENTES (no se tocan):
--   corivacore_organizations ✅
--   corivacore_users ✅
--   corivacore_products ✅ (con brand, laboratory, barcode, etc.)
--   corivacore_customers ✅ (con segment, total_spent, birth_date)
--   corivacore_sales ✅ (con discount, cancelled_at, cancel_reason)
--   corivacore_sale_items ✅
--   corivacore_cash_movements ✅ (con category)
--   corivacore_invoices ✅
--   corivacore_invoice_series ✅
--
-- TABLAS FALTANTES QUE SE CREAN AQUÍ:
--   corivacore_inventory_movements ❌ → crear
--   corivacore_cash_sessions ❌ → crear
--   corivacore_suppliers ❌ → crear
--   corivacore_purchases ❌ → crear
--   corivacore_purchase_items ❌ → crear
--   corivacore_leads ❌ → crear
--   corivacore_pipeline_stages ❌ → crear
--   corivacore_pipeline_deals ❌ → crear
--   corivacore_automations ❌ → crear
--
-- RPCs/FUNCIONES QUE SE CREAN AQUÍ:
--   update_updated_at() — trigger genérico
--   generate_sale_number()
--   generate_purchase_number()
--   decrement_product_stock()
--   adjust_product_stock()
--   receive_purchase()
--   get_customer_stats()
--   get_sales_last_7_days()
--   get_top_products()
--   get_cash_summary()
--   get_expiring_products()
--
-- COLUMNAS FALTANTES EN TABLAS EXISTENTES:
--   corivacore_organizations: plan en settings (ya es JSONB, ok)
--   corivacore_sales: discount, cancelled_at, cancelled_by, cancel_reason (ya existen ✅)
--
-- INSTRUCCIONES:
--   1. Ir a Supabase Dashboard → SQL Editor
--   2. Pegar TODO este script
--   3. Ejecutar (Run)
--   4. Verificar que no haya errores en rojo
-- ================================================================


-- ================================================================
-- PASO 1: FUNCIÓN TRIGGER update_updated_at
-- ================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


-- ================================================================
-- PASO 2: corivacore_inventory_movements
-- ================================================================

CREATE TABLE IF NOT EXISTS corivacore_inventory_movements (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id         TEXT NOT NULL,
  product_id     UUID NOT NULL,
  movement_type  VARCHAR(20) NOT NULL CHECK (movement_type IN ('IN','OUT','ADJUSTMENT')),
  quantity       INTEGER NOT NULL,
  previous_stock INTEGER,
  new_stock      INTEGER,
  reason         VARCHAR(100),
  reference_type VARCHAR(50),
  reference_id   UUID,
  user_id        TEXT,
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inv_mov_org     ON corivacore_inventory_movements(org_id);
CREATE INDEX IF NOT EXISTS idx_inv_mov_product ON corivacore_inventory_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_inv_mov_date    ON corivacore_inventory_movements(org_id, created_at DESC);

ALTER TABLE corivacore_inventory_movements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_inventory_movements" ON corivacore_inventory_movements;
CREATE POLICY "allow_all_inventory_movements" ON corivacore_inventory_movements FOR ALL USING (true);


-- ================================================================
-- PASO 3: corivacore_cash_sessions
-- ================================================================

CREATE TABLE IF NOT EXISTS corivacore_cash_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          TEXT NOT NULL,
  opened_by       TEXT NOT NULL,
  closed_by       TEXT,
  opening_amount  DECIMAL(10,2) NOT NULL DEFAULT 0,
  closing_amount  DECIMAL(10,2),
  expected_amount DECIMAL(10,2),
  difference      DECIMAL(10,2),
  status          VARCHAR(10) NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
  notes           TEXT,
  opened_at       TIMESTAMPTZ DEFAULT NOW(),
  closed_at       TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_cash_sessions_org_status ON corivacore_cash_sessions(org_id, status);

ALTER TABLE corivacore_cash_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_cash_sessions" ON corivacore_cash_sessions;
CREATE POLICY "allow_all_cash_sessions" ON corivacore_cash_sessions FOR ALL USING (true);


-- ================================================================
-- PASO 4: corivacore_suppliers
-- ================================================================

CREATE TABLE IF NOT EXISTS corivacore_suppliers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       TEXT NOT NULL,
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

CREATE INDEX IF NOT EXISTS idx_suppliers_org ON corivacore_suppliers(org_id);

ALTER TABLE corivacore_suppliers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_suppliers" ON corivacore_suppliers;
CREATE POLICY "allow_all_suppliers" ON corivacore_suppliers FOR ALL USING (true);

DROP TRIGGER IF EXISTS suppliers_updated_at ON corivacore_suppliers;
CREATE TRIGGER suppliers_updated_at
  BEFORE UPDATE ON corivacore_suppliers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ================================================================
-- PASO 5: corivacore_purchases + corivacore_purchase_items
-- ================================================================

CREATE TABLE IF NOT EXISTS corivacore_purchases (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id           TEXT NOT NULL,
  supplier_id      UUID REFERENCES corivacore_suppliers(id) ON DELETE SET NULL,
  purchase_number  VARCHAR(50),
  status           VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','received','partial','cancelled')),
  total            DECIMAL(10,2) NOT NULL DEFAULT 0,
  notes            TEXT,
  expected_at      DATE,
  received_at      TIMESTAMPTZ,
  created_by       TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_purchases_org        ON corivacore_purchases(org_id);
CREATE INDEX IF NOT EXISTS idx_purchases_org_status ON corivacore_purchases(org_id, status);

ALTER TABLE corivacore_purchases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_purchases" ON corivacore_purchases;
CREATE POLICY "allow_all_purchases" ON corivacore_purchases FOR ALL USING (true);

DROP TRIGGER IF EXISTS purchases_updated_at ON corivacore_purchases;
CREATE TRIGGER purchases_updated_at
  BEFORE UPDATE ON corivacore_purchases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Items de compra
CREATE TABLE IF NOT EXISTS corivacore_purchase_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id  UUID NOT NULL REFERENCES corivacore_purchases(id) ON DELETE CASCADE,
  product_id   UUID,
  product_name VARCHAR(255) NOT NULL,
  quantity     INTEGER NOT NULL DEFAULT 1,
  unit_cost    DECIMAL(10,2) NOT NULL DEFAULT 0,
  subtotal     DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_purchase_items_purchase ON corivacore_purchase_items(purchase_id);

ALTER TABLE corivacore_purchase_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_purchase_items" ON corivacore_purchase_items;
CREATE POLICY "allow_all_purchase_items" ON corivacore_purchase_items FOR ALL USING (true);


-- ================================================================
-- PASO 6: corivacore_leads
-- ================================================================

CREATE TABLE IF NOT EXISTS corivacore_leads (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       TEXT NOT NULL,
  name         VARCHAR(255) NOT NULL,
  phone        VARCHAR(50),
  email        VARCHAR(255),
  source       VARCHAR(50) DEFAULT 'otro',
  stage        VARCHAR(50) DEFAULT 'Nuevo',
  status       VARCHAR(20) DEFAULT 'new'
    CHECK (status IN ('new','contacted','qualified','proposal','won','lost')),
  estimated_value DECIMAL(10,2) DEFAULT 0,
  assigned_to  TEXT,
  notes        TEXT,
  converted_customer_id UUID,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_org        ON corivacore_leads(org_id);
CREATE INDEX IF NOT EXISTS idx_leads_org_status ON corivacore_leads(org_id, status);

ALTER TABLE corivacore_leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_leads" ON corivacore_leads;
CREATE POLICY "allow_all_leads" ON corivacore_leads FOR ALL USING (true);

DROP TRIGGER IF EXISTS leads_updated_at ON corivacore_leads;
CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON corivacore_leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ================================================================
-- PASO 7: corivacore_pipeline_stages + corivacore_pipeline_deals
-- ================================================================

CREATE TABLE IF NOT EXISTS corivacore_pipeline_stages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      TEXT NOT NULL,
  name        VARCHAR(100) NOT NULL,
  color       VARCHAR(20) DEFAULT '#6366f1',
  order_index INTEGER NOT NULL DEFAULT 0,
  is_default  BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE corivacore_pipeline_stages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_pipeline_stages" ON corivacore_pipeline_stages;
CREATE POLICY "allow_all_pipeline_stages" ON corivacore_pipeline_stages FOR ALL USING (true);

CREATE TABLE IF NOT EXISTS corivacore_pipeline_deals (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id         TEXT NOT NULL,
  lead_id        UUID REFERENCES corivacore_leads(id) ON DELETE SET NULL,
  customer_id    UUID,
  stage_id       UUID REFERENCES corivacore_pipeline_stages(id) ON DELETE SET NULL,
  title          VARCHAR(255) NOT NULL,
  value          DECIMAL(10,2) DEFAULT 0,
  probability    INTEGER DEFAULT 50,
  expected_close DATE,
  assigned_to    TEXT,
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deals_org_stage ON corivacore_pipeline_deals(org_id, stage_id);

ALTER TABLE corivacore_pipeline_deals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_pipeline_deals" ON corivacore_pipeline_deals;
CREATE POLICY "allow_all_pipeline_deals" ON corivacore_pipeline_deals FOR ALL USING (true);

DROP TRIGGER IF EXISTS deals_updated_at ON corivacore_pipeline_deals;
CREATE TRIGGER deals_updated_at
  BEFORE UPDATE ON corivacore_pipeline_deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ================================================================
-- PASO 8: corivacore_automations
-- ================================================================

CREATE TABLE IF NOT EXISTS corivacore_automations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       TEXT NOT NULL,
  name         VARCHAR(255) NOT NULL,
  trigger_type VARCHAR(50) NOT NULL,
  action_type  VARCHAR(50) NOT NULL,
  config       JSONB DEFAULT '{}',
  is_active    BOOLEAN DEFAULT true,
  run_count    INTEGER DEFAULT 0,
  last_run_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_automations_org_active ON corivacore_automations(org_id, is_active);

ALTER TABLE corivacore_automations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_automations" ON corivacore_automations;
CREATE POLICY "allow_all_automations" ON corivacore_automations FOR ALL USING (true);

DROP TRIGGER IF EXISTS automations_updated_at ON corivacore_automations;
CREATE TRIGGER automations_updated_at
  BEFORE UPDATE ON corivacore_automations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ================================================================
-- PASO 9: COLUMNAS FALTANTES EN TABLAS EXISTENTES
-- ================================================================

-- corivacore_organizations: agregar plan como columna directa (opcional, ya está en settings JSONB)
-- No se necesita alterar — settings JSONB ya soporta plan

-- corivacore_customers: full_name alias (ya tiene 'name')
-- Agregar full_name como alias si algún servicio lo usa
ALTER TABLE corivacore_customers ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
UPDATE corivacore_customers SET full_name = name WHERE full_name IS NULL;

-- corivacore_sale_items: agregar org_id para queries directas
ALTER TABLE corivacore_sale_items ADD COLUMN IF NOT EXISTS org_id TEXT;
UPDATE corivacore_sale_items si
SET org_id = s.org_id
FROM corivacore_sales s
WHERE si.sale_id = s.id AND si.org_id IS NULL;


-- ================================================================
-- PASO 10: RPCs — generate_sale_number
-- ================================================================

CREATE OR REPLACE FUNCTION generate_sale_number(p_org_id TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_count INTEGER;
  v_year  TEXT;
BEGIN
  v_year := TO_CHAR(NOW(), 'YY');
  SELECT COUNT(*) + 1 INTO v_count
  FROM corivacore_sales
  WHERE org_id = p_org_id
    AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  RETURN 'V-' || v_year || '-' || LPAD(v_count::TEXT, 5, '0');
END;
$$;


-- ================================================================
-- PASO 11: RPCs — generate_purchase_number
-- ================================================================

CREATE OR REPLACE FUNCTION generate_purchase_number(p_org_id TEXT)
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


-- ================================================================
-- PASO 12: RPCs — decrement_product_stock
-- ================================================================

CREATE OR REPLACE FUNCTION decrement_product_stock(p_product_id TEXT, p_quantity INTEGER)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_prev_stock INTEGER;
BEGIN
  SELECT stock INTO v_prev_stock
  FROM corivacore_products
  WHERE id::TEXT = p_product_id;

  UPDATE corivacore_products
  SET stock = GREATEST(0, stock - p_quantity),
      updated_at = NOW()
  WHERE id::TEXT = p_product_id;

  -- Log del movimiento
  INSERT INTO corivacore_inventory_movements
    (org_id, product_id, movement_type, quantity, previous_stock, new_stock, reason, reference_type)
  SELECT
    org_id,
    id,
    'OUT',
    p_quantity,
    v_prev_stock,
    GREATEST(0, v_prev_stock - p_quantity),
    'Venta',
    'sale'
  FROM corivacore_products
  WHERE id::TEXT = p_product_id;
END;
$$;


-- ================================================================
-- PASO 13: RPCs — adjust_product_stock
-- ================================================================

CREATE OR REPLACE FUNCTION adjust_product_stock(
  p_org_id     TEXT,
  p_product_id TEXT,
  p_new_stock  INTEGER,
  p_reason     TEXT,
  p_user_id    TEXT
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_prev_stock INTEGER;
  v_movement   VARCHAR(20);
BEGIN
  SELECT stock INTO v_prev_stock
  FROM corivacore_products
  WHERE id::TEXT = p_product_id AND org_id = p_org_id;

  v_movement := CASE
    WHEN p_new_stock > v_prev_stock THEN 'IN'
    WHEN p_new_stock < v_prev_stock THEN 'OUT'
    ELSE 'ADJUSTMENT'
  END;

  UPDATE corivacore_products
  SET stock = p_new_stock, updated_at = NOW()
  WHERE id::TEXT = p_product_id AND org_id = p_org_id;

  INSERT INTO corivacore_inventory_movements
    (org_id, product_id, movement_type, quantity, previous_stock, new_stock, reason, user_id)
  VALUES (
    p_org_id,
    p_product_id::UUID,
    'ADJUSTMENT',
    ABS(p_new_stock - v_prev_stock),
    v_prev_stock,
    p_new_stock,
    p_reason,
    p_user_id
  );
END;
$$;


-- ================================================================
-- PASO 14: RPCs — receive_purchase
-- ================================================================

CREATE OR REPLACE FUNCTION receive_purchase(
  p_purchase_id TEXT,
  p_received_by TEXT
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_item RECORD;
  v_org_id TEXT;
BEGIN
  SELECT org_id INTO v_org_id
  FROM corivacore_purchases
  WHERE id::TEXT = p_purchase_id;

  -- Actualizar stock por cada item
  FOR v_item IN
    SELECT pi.product_id, pi.quantity, pi.product_name
    FROM corivacore_purchase_items pi
    WHERE pi.purchase_id::TEXT = p_purchase_id
      AND pi.product_id IS NOT NULL
  LOOP
    UPDATE corivacore_products
    SET stock = stock + v_item.quantity, updated_at = NOW()
    WHERE id = v_item.product_id;

    INSERT INTO corivacore_inventory_movements
      (org_id, product_id, movement_type, quantity, reason, reference_type, reference_id, user_id)
    VALUES (
      v_org_id,
      v_item.product_id,
      'IN',
      v_item.quantity,
      'Recepción de compra',
      'purchase',
      p_purchase_id::UUID,
      p_received_by
    );
  END LOOP;

  -- Marcar compra como recibida
  UPDATE corivacore_purchases
  SET status = 'received',
      received_at = NOW(),
      updated_at = NOW()
  WHERE id::TEXT = p_purchase_id;
END;
$$;


-- ================================================================
-- PASO 15: RPCs — get_customer_stats
-- ================================================================

CREATE OR REPLACE FUNCTION get_customer_stats(p_customer_id UUID, p_org_id TEXT)
RETURNS TABLE (
  total_purchases BIGINT,
  total_spent     NUMERIC,
  avg_ticket      NUMERIC,
  last_purchase   TIMESTAMPTZ,
  first_purchase  TIMESTAMPTZ
)
LANGUAGE sql STABLE
AS $$
  SELECT
    COUNT(*)                 AS total_purchases,
    COALESCE(SUM(total), 0)  AS total_spent,
    COALESCE(AVG(total), 0)  AS avg_ticket,
    MAX(created_at)          AS last_purchase,
    MIN(created_at)          AS first_purchase
  FROM corivacore_sales
  WHERE customer_id = p_customer_id
    AND org_id = p_org_id
    AND status != 'cancelled';
$$;


-- ================================================================
-- PASO 16: RPCs — get_sales_last_7_days
-- ================================================================

CREATE OR REPLACE FUNCTION get_sales_last_7_days(p_org_id TEXT)
RETURNS TABLE (
  sale_date    DATE,
  total_amount NUMERIC,
  sale_count   BIGINT
)
LANGUAGE sql STABLE
AS $$
  SELECT
    DATE(created_at)         AS sale_date,
    COALESCE(SUM(total), 0)  AS total_amount,
    COUNT(*)                 AS sale_count
  FROM corivacore_sales
  WHERE org_id = p_org_id
    AND created_at >= NOW() - INTERVAL '7 days'
    AND status != 'cancelled'
  GROUP BY DATE(created_at)
  ORDER BY sale_date ASC;
$$;


-- ================================================================
-- PASO 17: RPCs — get_top_products
-- ================================================================

CREATE OR REPLACE FUNCTION get_top_products(p_org_id TEXT, p_limit INTEGER DEFAULT 5)
RETURNS TABLE (
  product_id    TEXT,
  product_name  TEXT,
  total_qty     BIGINT,
  total_revenue NUMERIC
)
LANGUAGE sql STABLE
AS $$
  SELECT
    si.product_id::TEXT,
    si.product_name,
    SUM(si.quantity)::BIGINT  AS total_qty,
    SUM(si.subtotal)          AS total_revenue
  FROM corivacore_sale_items si
  JOIN corivacore_sales s ON s.id = si.sale_id
  WHERE s.org_id = p_org_id
    AND s.status != 'cancelled'
    AND s.created_at >= NOW() - INTERVAL '30 days'
  GROUP BY si.product_id, si.product_name
  ORDER BY total_qty DESC
  LIMIT p_limit;
$$;


-- ================================================================
-- PASO 18: RPCs — get_cash_summary
-- ================================================================

CREATE OR REPLACE FUNCTION get_cash_summary(p_org_id TEXT)
RETURNS TABLE (
  opening_amount  NUMERIC,
  sales_amount    NUMERIC,
  expenses_amount NUMERIC,
  refunds_amount  NUMERIC,
  current_balance NUMERIC
)
LANGUAGE sql STABLE
AS $$
  SELECT
    COALESCE(SUM(CASE WHEN type = 'opening'  THEN amount ELSE 0 END), 0) AS opening_amount,
    COALESCE(SUM(CASE WHEN type = 'sale'     THEN amount ELSE 0 END), 0) AS sales_amount,
    COALESCE(SUM(CASE WHEN type = 'expense'  THEN amount ELSE 0 END), 0) AS expenses_amount,
    COALESCE(SUM(CASE WHEN type = 'refund'   THEN amount ELSE 0 END), 0) AS refunds_amount,
    COALESCE(
      SUM(CASE WHEN type IN ('opening','sale') THEN amount
               WHEN type IN ('expense','refund','closing') THEN -amount
               ELSE 0 END), 0
    ) AS current_balance
  FROM corivacore_cash_movements
  WHERE org_id = p_org_id
    AND DATE(created_at) = CURRENT_DATE;
$$;


-- ================================================================
-- PASO 19: RPCs — get_expiring_products
-- ================================================================

CREATE OR REPLACE FUNCTION get_expiring_products(p_org_id TEXT, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  id          UUID,
  name        TEXT,
  expiry_date DATE,
  stock       INTEGER,
  days_left   INTEGER
)
LANGUAGE sql STABLE
AS $$
  SELECT
    id,
    name::TEXT,
    expiry_date::DATE,
    stock,
    (expiry_date::DATE - CURRENT_DATE)::INTEGER AS days_left
  FROM corivacore_products
  WHERE org_id = p_org_id
    AND is_active = true
    AND expiry_date IS NOT NULL
    AND expiry_date::DATE <= CURRENT_DATE + (p_days || ' days')::INTERVAL
    AND stock > 0
  ORDER BY expiry_date ASC;
$$;


-- ================================================================
-- PASO 20: DATOS INICIALES — Series de facturación para orgs existentes
-- ================================================================

-- Insertar series B001 y F001 para todas las organizaciones que no las tengan
INSERT INTO corivacore_invoice_series (org_id, type, series, last_number, is_active)
SELECT o.id, 'BOLETA', 'B001', 0, true
FROM corivacore_organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM corivacore_invoice_series s
  WHERE s.org_id = o.id AND s.type = 'BOLETA'
)
ON CONFLICT DO NOTHING;

INSERT INTO corivacore_invoice_series (org_id, type, series, last_number, is_active)
SELECT o.id, 'FACTURA', 'F001', 0, true
FROM corivacore_organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM corivacore_invoice_series s
  WHERE s.org_id = o.id AND s.type = 'FACTURA'
)
ON CONFLICT DO NOTHING;


-- ================================================================
-- PASO 21: VERIFICACIÓN FINAL
-- ================================================================

SELECT
  tablename,
  CASE WHEN tablename IN (
    'corivacore_organizations','corivacore_users','corivacore_products',
    'corivacore_customers','corivacore_sales','corivacore_sale_items',
    'corivacore_cash_movements','corivacore_invoices','corivacore_invoice_series',
    'corivacore_inventory_movements','corivacore_cash_sessions',
    'corivacore_suppliers','corivacore_purchases','corivacore_purchase_items',
    'corivacore_leads','corivacore_pipeline_stages','corivacore_pipeline_deals',
    'corivacore_automations'
  ) THEN '✅ OK' ELSE '⚠️ Extra' END AS estado
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'corivacore%'
ORDER BY tablename;

-- Verificar funciones creadas
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'generate_sale_number','generate_purchase_number',
    'decrement_product_stock','adjust_product_stock',
    'receive_purchase','get_customer_stats',
    'get_sales_last_7_days','get_top_products',
    'get_cash_summary','get_expiring_products',
    'update_updated_at'
  )
ORDER BY routine_name;
