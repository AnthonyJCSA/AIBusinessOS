-- ============================================================
-- MIGRACIÓN 012: OPPF/SNIPPF - Reporte de Precios DIGEMID
-- Sistema Nacional de Información de Precios de Productos Farmacéuticos
-- Base legal: D.S. N° 014-2011-SA, R.M. N° 040-2010/MINSA
-- ============================================================

-- ── Extensión de corivacore_products ────────────────────────
-- Agregar campos específicos para reporte DIGEMID
ALTER TABLE corivacore_products
ADD COLUMN IF NOT EXISTS digemid_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS allows_fractionation BOOLEAN DEFAULT false;

-- Índice para búsquedas por código DIGEMID
CREATE INDEX IF NOT EXISTS idx_products_digemid_code 
ON corivacore_products(org_id, digemid_code) 
WHERE digemid_code IS NOT NULL;

-- ── Extensión de corivacore_organizations ───────────────────
-- Código de establecimiento DIGEMID
ALTER TABLE corivacore_organizations
ADD COLUMN IF NOT EXISTS digemid_establishment_code VARCHAR(50);

-- ── RPC: Generar Reporte OPPF ───────────────────────────────
-- Retorna productos con stock para el reporte mensual
CREATE OR REPLACE FUNCTION generate_oppf_report(
  p_org_id UUID,
  p_month INTEGER DEFAULT EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER,
  p_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
)
RETURNS TABLE (
  cod_estab VARCHAR,
  cod_prod VARCHAR,
  precio_1 DECIMAL,
  precio_2 DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.digemid_establishment_code AS cod_estab,
    p.digemid_code AS cod_prod,
    p.price AS precio_1,
    CASE 
      WHEN p.allows_fractionation THEN p.unit_price
      ELSE NULL
    END AS precio_2
  FROM corivacore_products p
  INNER JOIN corivacore_organizations o ON p.org_id = o.id
  WHERE p.org_id = p_org_id
    AND p.stock > 0
    AND p.is_active = true
    AND p.digemid_code IS NOT NULL
    AND o.digemid_establishment_code IS NOT NULL
  ORDER BY p.digemid_code;
END;
$$ LANGUAGE plpgsql STABLE;

-- ── Comentarios ─────────────────────────────────────────────
COMMENT ON COLUMN corivacore_products.digemid_code IS 'Código del producto en el registro DIGEMID';
COMMENT ON COLUMN corivacore_products.unit_price IS 'Precio unitario para productos con fraccionamiento';
COMMENT ON COLUMN corivacore_products.allows_fractionation IS 'Indica si el producto permite venta fraccionada';
COMMENT ON COLUMN corivacore_organizations.digemid_establishment_code IS 'Código del establecimiento farmacéutico en DIGEMID';
COMMENT ON FUNCTION generate_oppf_report IS 'Genera reporte mensual de precios para OPPF/SNIPPF según normativa DIGEMID';
