-- ============================================================
-- MIGRACIÓN 008: Columnas pharma en productos
-- No requiere get_user_org_id() — solo ALTER TABLE
-- ============================================================

ALTER TABLE corivacore_products
  ADD COLUMN IF NOT EXISTS requires_prescription BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_controlled         BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS digemid_code          VARCHAR(50);
