-- ============================================================
-- MIGRACIÓN 009: Módulo Pharma — Lotes, Kardex
-- Requiere: 008 ejecutado primero
-- ============================================================

-- ── 1. Lotes por producto ────────────────────────────────────
CREATE TABLE IF NOT EXISTS corivacore_product_batches (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID NOT NULL,
  product_id   UUID NOT NULL,
  batch_number VARCHAR(100) NOT NULL,
  expiry_date  DATE NOT NULL,
  quantity     INTEGER NOT NULL DEFAULT 0,
  cost_price   DECIMAL(10,2),
  received_at  TIMESTAMPTZ DEFAULT NOW(),
  supplier_id  UUID,
  created_by   UUID,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, product_id, batch_number)
);

CREATE INDEX IF NOT EXISTS idx_batches_org_product ON corivacore_product_batches(org_id, product_id);
CREATE INDEX IF NOT EXISTS idx_batches_expiry      ON corivacore_product_batches(expiry_date);

ALTER TABLE corivacore_product_batches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org_batches" ON corivacore_product_batches;
CREATE POLICY "org_batches" ON corivacore_product_batches
  FOR ALL USING (true);

-- ── 2. Kardex de movimientos ─────────────────────────────────
CREATE TABLE IF NOT EXISTS corivacore_inventory_kardex (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id         UUID NOT NULL,
  product_id     UUID NOT NULL,
  batch_id       UUID REFERENCES corivacore_product_batches(id) ON DELETE SET NULL,
  movement_type  VARCHAR(20) NOT NULL
    CHECK (movement_type IN ('ENTRADA','SALIDA','AJUSTE','VENCIMIENTO','DEVOLUCION')),
  quantity       INTEGER NOT NULL,
  balance_after  INTEGER NOT NULL,
  reference_type VARCHAR(30),
  reference_id   UUID,
  notes          TEXT,
  created_by     UUID,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kardex_org_product ON corivacore_inventory_kardex(org_id, product_id);
CREATE INDEX IF NOT EXISTS idx_kardex_created     ON corivacore_inventory_kardex(created_at DESC);

ALTER TABLE corivacore_inventory_kardex ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org_kardex" ON corivacore_inventory_kardex;
CREATE POLICY "org_kardex" ON corivacore_inventory_kardex
  FOR ALL USING (true);

-- ── 3. RPC: lotes próximos a vencer ─────────────────────────
CREATE OR REPLACE FUNCTION get_expiring_batches(
  p_org_id UUID,
  p_days   INTEGER DEFAULT 30
)
RETURNS TABLE (
  batch_id     UUID,
  product_id   UUID,
  product_name TEXT,
  batch_number TEXT,
  expiry_date  DATE,
  quantity     INTEGER,
  days_left    INTEGER
)
LANGUAGE sql STABLE AS $$
  SELECT
    b.id,
    b.product_id,
    p.name::TEXT,
    b.batch_number::TEXT,
    b.expiry_date,
    b.quantity,
    (b.expiry_date - CURRENT_DATE)::INTEGER AS days_left
  FROM corivacore_product_batches b
  JOIN corivacore_products p ON p.id = b.product_id
  WHERE b.org_id = p_org_id
    AND b.quantity > 0
    AND b.expiry_date <= CURRENT_DATE + p_days
  ORDER BY b.expiry_date ASC;
$$;

-- ── 4. RPC: kardex por producto ──────────────────────────────
CREATE OR REPLACE FUNCTION get_product_kardex(
  p_org_id     UUID,
  p_product_id UUID,
  p_limit      INTEGER DEFAULT 50
)
RETURNS TABLE (
  id             UUID,
  movement_type  TEXT,
  quantity       INTEGER,
  balance_after  INTEGER,
  reference_type TEXT,
  notes          TEXT,
  batch_number   TEXT,
  created_at     TIMESTAMPTZ
)
LANGUAGE sql STABLE AS $$
  SELECT
    k.id,
    k.movement_type::TEXT,
    k.quantity,
    k.balance_after,
    k.reference_type::TEXT,
    k.notes,
    b.batch_number::TEXT,
    k.created_at
  FROM corivacore_inventory_kardex k
  LEFT JOIN corivacore_product_batches b ON b.id = k.batch_id
  WHERE k.org_id = p_org_id AND k.product_id = p_product_id
  ORDER BY k.created_at DESC
  LIMIT p_limit;
$$;
