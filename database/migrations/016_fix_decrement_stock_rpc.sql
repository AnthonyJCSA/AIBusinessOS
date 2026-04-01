-- Migración 016: Asegurar RPC decrement_product_stock
-- Ejecutar en Supabase SQL Editor si el stock no se descuenta al vender

CREATE OR REPLACE FUNCTION decrement_product_stock(p_product_id TEXT, p_quantity INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE corivacore_products
  SET stock = GREATEST(0, stock - p_quantity),
      updated_at = NOW()
  WHERE id::TEXT = p_product_id;
END;
$$;

-- Dar permisos de ejecución
GRANT EXECUTE ON FUNCTION decrement_product_stock(TEXT, INTEGER) TO anon, authenticated, service_role;
