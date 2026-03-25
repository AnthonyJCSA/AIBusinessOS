-- ============================================================
-- SETUP: Series de facturación para org demo
-- Ejecutar DESPUÉS de 007_invoices.sql
-- ============================================================

-- Primero obtén el UUID real de tu organización:
-- SELECT id, name FROM corivacore_organizations;

-- Luego reemplaza el UUID en las líneas de abajo.
-- Si usas la org demo (id TEXT = 'org_1772836382137'), 
-- necesitas castear a UUID o cambiar el tipo de columna.

-- OPCIÓN A: Si org_id en invoice_series es TEXT
-- INSERT INTO corivacore_invoice_series (org_id, type, series, last_number, is_active)
-- VALUES
--   ('org_1772836382137', 'BOLETA',  'B001', 0, true),
--   ('org_1772836382137', 'FACTURA', 'F001', 0, true)
-- ON CONFLICT (org_id, type, series) DO NOTHING;

-- OPCIÓN B: Si org_id en invoice_series es UUID
-- Primero busca el UUID real:
-- SELECT id FROM corivacore_organizations WHERE slug = 'coriva-demo';
-- Luego inserta con ese UUID.

-- ── Verificar series existentes ──────────────────────────────
SELECT * FROM corivacore_invoice_series ORDER BY created_at DESC;
