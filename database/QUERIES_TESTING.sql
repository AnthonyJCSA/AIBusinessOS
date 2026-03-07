-- ============================================
-- CORIVA CORE - QUERIES PARA TESTING
-- Consultas para verificar datos de pruebas
-- ============================================

-- ============================================
-- 1. ORGANIZACIONES
-- ============================================

-- Ver todas las organizaciones
SELECT * FROM corivacore_organizations ORDER BY created_at DESC;

-- Contar organizaciones por tipo de negocio
SELECT business_type, COUNT(*) as total 
FROM corivacore_organizations 
GROUP BY business_type;

-- Ver organizaciones creadas hoy
SELECT id, name, slug, business_type, created_at 
FROM corivacore_organizations 
WHERE DATE(created_at) = CURRENT_DATE
ORDER BY created_at DESC;

-- ============================================
-- 2. USUARIOS
-- ============================================

-- Ver todos los usuarios con su organización
SELECT 
  u.id,
  u.username,
  u.full_name,
  u.email,
  u.role,
  u.is_active,
  o.name as organization_name,
  u.created_at
FROM corivacore_users u
JOIN corivacore_organizations o ON u.org_id = o.id
ORDER BY u.created_at DESC;

-- Contar usuarios por rol
SELECT role, COUNT(*) as total 
FROM corivacore_users 
GROUP BY role;

-- Ver usuarios activos por organización
SELECT 
  o.name as organization,
  COUNT(u.id) as total_users,
  SUM(CASE WHEN u.is_active THEN 1 ELSE 0 END) as active_users
FROM corivacore_organizations o
LEFT JOIN corivacore_users u ON o.id = u.org_id
GROUP BY o.id, o.name;

-- ============================================
-- 3. PRODUCTOS
-- ============================================

-- Ver todos los productos con su organización
SELECT 
  p.id,
  p.code,
  p.name,
  p.category,
  p.price,
  p.stock,
  p.min_stock,
  o.name as organization_name,
  p.created_at
FROM corivacore_products p
JOIN corivacore_organizations o ON p.org_id = o.id
ORDER BY p.created_at DESC
LIMIT 50;

-- Contar productos por organización
SELECT 
  o.name as organization,
  COUNT(p.id) as total_products,
  SUM(p.stock) as total_stock,
  AVG(p.price) as avg_price
FROM corivacore_organizations o
LEFT JOIN corivacore_products p ON o.id = p.org_id
GROUP BY o.id, o.name;

-- Productos con stock bajo
SELECT 
  o.name as organization,
  p.code,
  p.name,
  p.stock,
  p.min_stock,
  (p.min_stock - p.stock) as deficit
FROM corivacore_products p
JOIN corivacore_organizations o ON p.org_id = o.id
WHERE p.stock < p.min_stock
ORDER BY deficit DESC;

-- Productos más caros por organización
SELECT 
  o.name as organization,
  p.code,
  p.name,
  p.price,
  p.stock
FROM corivacore_products p
JOIN corivacore_organizations o ON p.org_id = o.id
ORDER BY p.price DESC
LIMIT 20;

-- ============================================
-- 4. VENTAS
-- ============================================

-- Ver todas las ventas con detalles
SELECT 
  s.id,
  s.sale_number,
  o.name as organization,
  s.customer_name,
  s.receipt_type,
  s.payment_method,
  s.total,
  s.status,
  s.created_at,
  s.created_by
FROM corivacore_sales s
JOIN corivacore_organizations o ON s.org_id = o.id
ORDER BY s.created_at DESC
LIMIT 50;

-- Resumen de ventas por organización
SELECT 
  o.name as organization,
  COUNT(s.id) as total_sales,
  SUM(s.total) as total_revenue,
  AVG(s.total) as avg_sale,
  MIN(s.total) as min_sale,
  MAX(s.total) as max_sale
FROM corivacore_organizations o
LEFT JOIN corivacore_sales s ON o.id = s.org_id
GROUP BY o.id, o.name;

-- Ventas por método de pago
SELECT 
  payment_method,
  COUNT(*) as total_sales,
  SUM(total) as total_amount
FROM corivacore_sales
GROUP BY payment_method
ORDER BY total_amount DESC;

-- Ventas por tipo de comprobante
SELECT 
  receipt_type,
  COUNT(*) as total_sales,
  SUM(total) as total_amount
FROM corivacore_sales
GROUP BY receipt_type;

-- Ventas de hoy
SELECT 
  o.name as organization,
  s.sale_number,
  s.customer_name,
  s.total,
  s.payment_method,
  s.created_at
FROM corivacore_sales s
JOIN corivacore_organizations o ON s.org_id = o.id
WHERE DATE(s.created_at) = CURRENT_DATE
ORDER BY s.created_at DESC;

-- ============================================
-- 5. ITEMS DE VENTA
-- ============================================

-- Ver items de ventas recientes
SELECT 
  s.sale_number,
  o.name as organization,
  si.product_name,
  si.quantity,
  si.unit_price,
  si.subtotal,
  s.created_at
FROM corivacore_sale_items si
JOIN corivacore_sales s ON si.sale_id = s.id
JOIN corivacore_organizations o ON s.org_id = o.id
ORDER BY s.created_at DESC
LIMIT 50;

-- Productos más vendidos
SELECT 
  si.product_name,
  COUNT(*) as times_sold,
  SUM(si.quantity) as total_quantity,
  SUM(si.subtotal) as total_revenue
FROM corivacore_sale_items si
GROUP BY si.product_name
ORDER BY total_quantity DESC
LIMIT 20;

-- ============================================
-- 6. MOVIMIENTOS DE CAJA
-- ============================================

-- Ver todos los movimientos de caja
SELECT 
  cm.id,
  o.name as organization,
  cm.type,
  cm.amount,
  cm.balance,
  cm.description,
  cm.created_at,
  cm.created_by
FROM corivacore_cash_movements cm
JOIN corivacore_organizations o ON cm.org_id = o.id
ORDER BY cm.created_at DESC
LIMIT 50;

-- Resumen de caja por organización
SELECT 
  o.name as organization,
  COUNT(cm.id) as total_movements,
  SUM(CASE WHEN cm.type = 'opening' THEN cm.amount ELSE 0 END) as total_openings,
  SUM(CASE WHEN cm.type = 'closing' THEN cm.amount ELSE 0 END) as total_closings,
  SUM(CASE WHEN cm.type = 'sale' THEN cm.amount ELSE 0 END) as total_sales
FROM corivacore_organizations o
LEFT JOIN corivacore_cash_movements cm ON o.id = cm.org_id
GROUP BY o.id, o.name;

-- Movimientos de caja de hoy
SELECT 
  o.name as organization,
  cm.type,
  cm.amount,
  cm.balance,
  cm.created_at,
  cm.created_by
FROM corivacore_cash_movements cm
JOIN corivacore_organizations o ON cm.org_id = o.id
WHERE DATE(cm.created_at) = CURRENT_DATE
ORDER BY cm.created_at DESC;

-- ============================================
-- 7. CLIENTES
-- ============================================

-- Ver todos los clientes
SELECT 
  c.id,
  o.name as organization,
  c.name,
  c.document_type,
  c.document_number,
  c.phone,
  c.email,
  c.is_active,
  c.created_at
FROM corivacore_customers c
JOIN corivacore_organizations o ON c.org_id = o.id
ORDER BY c.created_at DESC
LIMIT 50;

-- Contar clientes por organización
SELECT 
  o.name as organization,
  COUNT(c.id) as total_customers,
  SUM(CASE WHEN c.is_active THEN 1 ELSE 0 END) as active_customers
FROM corivacore_organizations o
LEFT JOIN corivacore_customers c ON o.id = c.org_id
GROUP BY o.id, o.name;

-- ============================================
-- 8. CONSULTAS COMBINADAS Y ANÁLISIS
-- ============================================

-- Dashboard completo por organización
SELECT 
  o.id,
  o.name as organization,
  o.business_type,
  COUNT(DISTINCT u.id) as total_users,
  COUNT(DISTINCT p.id) as total_products,
  COUNT(DISTINCT c.id) as total_customers,
  COUNT(DISTINCT s.id) as total_sales,
  COALESCE(SUM(s.total), 0) as total_revenue,
  o.created_at
FROM corivacore_organizations o
LEFT JOIN corivacore_users u ON o.id = u.org_id
LEFT JOIN corivacore_products p ON o.id = p.org_id
LEFT JOIN corivacore_customers c ON o.id = c.org_id
LEFT JOIN corivacore_sales s ON o.id = s.org_id
GROUP BY o.id, o.name, o.business_type, o.created_at
ORDER BY o.created_at DESC;

-- Actividad reciente (últimas 24 horas)
SELECT 
  'Organization' as type,
  name as description,
  created_at
FROM corivacore_organizations
WHERE created_at > NOW() - INTERVAL '24 hours'
UNION ALL
SELECT 
  'User' as type,
  username || ' (' || full_name || ')' as description,
  created_at
FROM corivacore_users
WHERE created_at > NOW() - INTERVAL '24 hours'
UNION ALL
SELECT 
  'Sale' as type,
  sale_number || ' - $' || total as description,
  created_at
FROM corivacore_sales
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- ============================================
-- 9. LIMPIEZA Y MANTENIMIENTO
-- ============================================

-- Eliminar organización de prueba específica (CUIDADO!)
-- DELETE FROM corivacore_organizations WHERE slug LIKE '%-test-%';

-- Eliminar todas las organizaciones creadas hoy (CUIDADO!)
-- DELETE FROM corivacore_organizations WHERE DATE(created_at) = CURRENT_DATE;

-- Ver tamaño de las tablas
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE tablename LIKE 'corivacore_%'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ============================================
-- 10. VERIFICACIÓN DE INTEGRIDAD
-- ============================================

-- Verificar productos sin organización
SELECT COUNT(*) as orphan_products
FROM corivacore_products p
LEFT JOIN corivacore_organizations o ON p.org_id = o.id
WHERE o.id IS NULL;

-- Verificar usuarios sin organización
SELECT COUNT(*) as orphan_users
FROM corivacore_users u
LEFT JOIN corivacore_organizations o ON u.org_id = o.id
WHERE o.id IS NULL;

-- Verificar ventas sin items
SELECT s.id, s.sale_number, s.total
FROM corivacore_sales s
LEFT JOIN corivacore_sale_items si ON s.id = si.sale_id
WHERE si.id IS NULL;

-- Verificar consistencia de stock
SELECT 
  p.code,
  p.name,
  p.stock as current_stock,
  COALESCE(SUM(si.quantity), 0) as total_sold
FROM corivacore_products p
LEFT JOIN corivacore_sale_items si ON p.id::text = si.product_id
GROUP BY p.id, p.code, p.name, p.stock
HAVING p.stock < 0;
