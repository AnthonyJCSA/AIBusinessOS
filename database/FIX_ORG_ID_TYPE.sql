-- ============================================
-- CORREGIR TIPO DE org_id DE UUID A TEXT
-- Ejecutar ANTES de INSERT_TEST_DATA.sql
-- ============================================

-- Deshabilitar RLS temporalmente
ALTER TABLE corivacore_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE corivacore_customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE corivacore_sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE corivacore_cash_movements DISABLE ROW LEVEL SECURITY;

-- Eliminar constraints que dependen de org_id
ALTER TABLE corivacore_products DROP CONSTRAINT IF EXISTS corivacore_products_org_code_unique;

-- Cambiar tipo de org_id en products
ALTER TABLE corivacore_products ALTER COLUMN org_id TYPE TEXT;

-- Cambiar tipo de org_id en customers
ALTER TABLE corivacore_customers ALTER COLUMN org_id TYPE TEXT;

-- Cambiar tipo de org_id en sales
ALTER TABLE corivacore_sales ALTER COLUMN org_id TYPE TEXT;

-- Cambiar tipo de org_id en cash_movements
ALTER TABLE corivacore_cash_movements ALTER COLUMN org_id TYPE TEXT;

-- Recrear constraint
ALTER TABLE corivacore_products ADD CONSTRAINT corivacore_products_org_code_unique UNIQUE(org_id, code);

-- Rehabilitar RLS
ALTER TABLE corivacore_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE corivacore_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE corivacore_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE corivacore_cash_movements ENABLE ROW LEVEL SECURITY;

-- Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE '✅ Tipo de org_id corregido a TEXT en todas las tablas';
END $$;
