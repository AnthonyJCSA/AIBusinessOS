-- ============================================================
-- MIGRACIÓN 011: Corregir RPCs pharma — p_org_id TEXT
-- Las tablas usan org_id TEXT, no UUID
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- ── RPC: lotes próximos a vencer ────────────────────────────
CREATE OR REPLACE FUNCTION get_expiring_batches(
  p_org_id TEXT,
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

-- ── RPC: kardex por producto ─────────────────────────────────
CREATE OR REPLACE FUNCTION get_product_kardex(
  p_org_id     TEXT,
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
