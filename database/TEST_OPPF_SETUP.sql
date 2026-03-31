-- ============================================================
-- SCRIPT DE PRUEBA: Configurar datos para OPPF/SNIPPF
-- Ejecutar después de la migración 012_oppf_snippf.sql
-- ============================================================

-- 1. Actualizar organización con código DIGEMID y tipo farmacia
-- REEMPLAZA 'TU_ORG_ID' con el ID real de tu organización
UPDATE corivacore_organizations
SET 
  business_type = 'pharmacy',
  digemid_establishment_code = '12345678'
WHERE id = 'TU_ORG_ID';

-- 2. Actualizar algunos productos con códigos DIGEMID
-- REEMPLAZA 'TU_ORG_ID' con el ID real de tu organización
UPDATE corivacore_products
SET 
  digemid_code = 'MED-' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 6, '0'),
  unit_price = price * 0.1,
  allows_fractionation = (stock % 2 = 0)
WHERE org_id = 'TU_ORG_ID'
  AND stock > 0
LIMIT 10;

-- 3. Verificar configuración
SELECT 
  o.name,
  o.business_type,
  o.digemid_establishment_code,
  COUNT(p.id) as total_productos,
  COUNT(p.digemid_code) as productos_con_digemid
FROM corivacore_organizations o
LEFT JOIN corivacore_products p ON p.org_id = o.id
WHERE o.id = 'TU_ORG_ID'
GROUP BY o.id, o.name, o.business_type, o.digemid_establishment_code;

-- 4. Probar RPC
SELECT * FROM generate_oppf_report('TU_ORG_ID'::UUID);
