-- ============================================================
-- DATOS DE PRUEBA — Organización org_1772836382137
-- Farmacia San Martín — Plan PREMIUM
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- ── 0. Actualizar org a plan PREMIUM ────────────────────────
UPDATE corivacore_organizations
SET settings = jsonb_set(
  COALESCE(settings, '{}'),
  '{plan}',
  '"premium"'
)
WHERE id = 'org_1772836382137';

-- ── 1. Productos farmacia ────────────────────────────────────
INSERT INTO corivacore_products
  (id, org_id, code, name, category, price, cost, stock, min_stock, unit,
   laboratory, active_ingredient, brand, expiry_date,
   requires_prescription, is_controlled, is_active)
VALUES
  (gen_random_uuid(), 'org_1772836382137', 'MED001', 'Paracetamol 500mg x 100 tab', 'Analgésicos',    8.50,  4.20,  120, 20, 'caja',   'Medifarma',   'Paracetamol 500mg',      'Medifarma',   '2026-12-31', false, false, true),
  (gen_random_uuid(), 'org_1772836382137', 'MED002', 'Ibuprofeno 400mg x 20 tab',   'Analgésicos',    6.90,  3.10,   85, 15, 'caja',   'Farmindustria','Ibuprofeno 400mg',       'Farmindustria','2026-09-30', false, false, true),
  (gen_random_uuid(), 'org_1772836382137', 'MED003', 'Amoxicilina 500mg x 21 cap',  'Antibióticos',  12.50,  6.80,   60, 10, 'caja',   'Medifarma',   'Amoxicilina 500mg',      'Medifarma',   '2026-06-30', true,  false, true),
  (gen_random_uuid(), 'org_1772836382137', 'MED004', 'Omeprazol 20mg x 14 cap',     'Digestivos',     9.80,  4.90,   75, 10, 'caja',   'Farmindustria','Omeprazol 20mg',         'Farmindustria','2026-11-30', false, false, true),
  (gen_random_uuid(), 'org_1772836382137', 'MED005', 'Loratadina 10mg x 10 tab',    'Antialérgicos',  5.50,  2.40,   90, 15, 'caja',   'Medifarma',   'Loratadina 10mg',        'Medifarma',   '2027-03-31', false, false, true),
  (gen_random_uuid(), 'org_1772836382137', 'MED006', 'Metformina 850mg x 30 tab',   'Antidiabéticos', 14.90,  7.50,   45, 10, 'caja',   'Farmindustria','Metformina 850mg',       'Farmindustria','2026-08-31', true,  false, true),
  (gen_random_uuid(), 'org_1772836382137', 'MED007', 'Atorvastatina 20mg x 30 tab', 'Cardiovascular', 18.50,  9.20,   38, 10, 'caja',   'Medifarma',   'Atorvastatina 20mg',     'Medifarma',   '2026-10-31', true,  false, true),
  (gen_random_uuid(), 'org_1772836382137', 'MED008', 'Vitamina C 1g x 10 efervesc', 'Vitaminas',      7.20,  3.10,  150, 20, 'caja',   'Bayer',       'Ácido Ascórbico 1000mg', 'Redoxon',     '2027-06-30', false, false, true),
  (gen_random_uuid(), 'org_1772836382137', 'MED009', 'Alcohol 70° x 1L',            'Antisépticos',   8.90,  4.50,   55, 10, 'frasco', 'Farmindustria','Alcohol Etílico 70°',    'Farmindustria','2028-01-31', false, false, true),
  (gen_random_uuid(), 'org_1772836382137', 'MED010', 'Diclofenaco 50mg x 20 tab',   'Analgésicos',    6.50,  2.90,   70, 15, 'caja',   'Medifarma',   'Diclofenaco Sódico 50mg','Medifarma',   '2026-07-31', false, false, true),
  (gen_random_uuid(), 'org_1772836382137', 'MED011', 'Azitromicina 500mg x 3 tab',  'Antibióticos',  22.00, 11.50,   30, 8,  'caja',   'Farmindustria','Azitromicina 500mg',     'Farmindustria','2026-05-31', true,  false, true),
  (gen_random_uuid(), 'org_1772836382137', 'MED012', 'Clonazepam 0.5mg x 30 tab',   'Neurológicos',  28.00, 14.00,   20, 5,  'caja',   'Roche',       'Clonazepam 0.5mg',       'Rivotril',    '2026-12-31', true,  true,  true),
  (gen_random_uuid(), 'org_1772836382137', 'MED013', 'Suero Oral x 1L',             'Hidratación',    3.50,  1.60,  200, 30, 'frasco', 'Medifarma',   'Sales de Rehidratación', 'Medifarma',   '2027-09-30', false, false, true),
  (gen_random_uuid(), 'org_1772836382137', 'MED014', 'Termómetro Digital',          'Equipos',       18.00,  9.00,   25, 5,  'unidad', NULL,          NULL,                     'Omron',       NULL,         false, false, true),
  (gen_random_uuid(), 'org_1772836382137', 'MED015', 'Mascarilla KN95 x 10 und',    'Protección',    12.00,  5.50,   80, 15, 'caja',   NULL,          NULL,                     'Genérico',    '2027-12-31', false, false, true)
ON CONFLICT (org_id, code) DO NOTHING;

-- ── 2. Clientes ──────────────────────────────────────────────
INSERT INTO corivacore_customers
  (id, org_id, name, document_type, document_number, phone, email, segment, total_purchases, total_spent, is_active)
VALUES
  (gen_random_uuid(), 'org_1772836382137', 'María García López',      'DNI', '45678901', '987654321', 'maria.garcia@gmail.com',   'vip',       24, 580.50, true),
  (gen_random_uuid(), 'org_1772836382137', 'Carlos Mendoza Ríos',     'DNI', '32145678', '976543210', 'carlos.mendoza@gmail.com', 'frecuente', 12, 245.80, true),
  (gen_random_uuid(), 'org_1772836382137', 'Ana Torres Vega',         'DNI', '56789012', '965432109', 'ana.torres@hotmail.com',   'regular',    6, 128.40, true),
  (gen_random_uuid(), 'org_1772836382137', 'Luis Ramírez Castro',     'DNI', '67890123', '954321098', NULL,                       'nuevo',      2,  45.20, true),
  (gen_random_uuid(), 'org_1772836382137', 'Farmacia El Sol SAC',     'RUC', '20512345678', '01-4567890', 'compras@farmaciaelsol.com', 'vip',   18, 1240.00, true),
  (gen_random_uuid(), 'org_1772836382137', 'Rosa Huanca Mamani',      'DNI', '78901234', '943210987', NULL,                       'regular',    5,  98.60, true),
  (gen_random_uuid(), 'org_1772836382137', 'Pedro Quispe Flores',     'DNI', '89012345', '932109876', 'pedro.quispe@gmail.com',   'frecuente',  9, 187.30, true),
  (gen_random_uuid(), 'org_1772836382137', 'Distribuidora Salud EIRL','RUC', '20698765432', '01-3456789', 'admin@distsalud.com',   'vip',       15, 2180.00, true)
ON CONFLICT DO NOTHING;

-- ── 3. Ventas (últimos 30 días) ──────────────────────────────
DO $$
DECLARE
  v_sale_id   UUID;
  v_prod_id   UUID;
  v_cust_id   UUID;
  v_sale_num  TEXT;
  v_day       INTEGER;
BEGIN
  -- Obtener IDs de productos y clientes
  SELECT id INTO v_prod_id FROM corivacore_products WHERE org_id = 'org_1772836382137' AND code = 'MED001' LIMIT 1;
  SELECT id INTO v_cust_id FROM corivacore_customers WHERE org_id = 'org_1772836382137' AND document_number = '45678901' LIMIT 1;

  FOR v_day IN 1..28 LOOP
    v_sale_id  := gen_random_uuid();
    v_sale_num := 'V-' || TO_CHAR(CURRENT_DATE - v_day, 'YYYYMMDD') || '-' || LPAD(v_day::TEXT, 4, '0');

    INSERT INTO corivacore_sales
      (id, org_id, sale_number, customer_name, receipt_type, payment_method,
       subtotal, tax, total, status, created_at)
    VALUES (
      v_sale_id,
      'org_1772836382137',
      v_sale_num,
      CASE WHEN v_day % 4 = 0 THEN 'María García López'
           WHEN v_day % 4 = 1 THEN 'Carlos Mendoza Ríos'
           WHEN v_day % 4 = 2 THEN 'Cliente General'
           ELSE 'Ana Torres Vega' END,
      CASE WHEN v_day % 5 = 0 THEN 'FACTURA' ELSE 'BOLETA' END,
      CASE WHEN v_day % 3 = 0 THEN 'EFECTIVO'
           WHEN v_day % 3 = 1 THEN 'YAPE'
           ELSE 'TARJETA' END,
      ROUND((15 + (v_day % 8) * 4.5)::NUMERIC, 2),
      ROUND(((15 + (v_day % 8) * 4.5) * 0.18 / 1.18)::NUMERIC, 2),
      ROUND((15 + (v_day % 8) * 4.5)::NUMERIC, 2),
      'completed',
      (CURRENT_TIMESTAMP - (v_day || ' days')::INTERVAL - ((v_day % 8) || ' hours')::INTERVAL)
    ) ON CONFLICT DO NOTHING;

    -- Item de la venta
    IF v_prod_id IS NOT NULL THEN
      INSERT INTO corivacore_sale_items
        (id, sale_id, product_id, product_code, product_name, quantity, unit_price, subtotal)
      VALUES (
        gen_random_uuid(), v_sale_id, v_prod_id, 'MED001', 'Paracetamol 500mg x 100 tab',
        1 + (v_day % 3), 8.50, 8.50 * (1 + (v_day % 3))
      ) ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END $$;

-- ── 4. Proveedor ─────────────────────────────────────────────
INSERT INTO corivacore_suppliers
  (id, org_id, name, contact_name, phone, email, ruc, is_active)
VALUES
  (gen_random_uuid(), 'org_1772836382137', 'Medifarma S.A.',        'Juan Pérez',    '01-3456789', 'ventas@medifarma.com.pe',    '20100077162', true),
  (gen_random_uuid(), 'org_1772836382137', 'Farmindustria S.A.C.',  'Rosa Salinas',  '01-4567890', 'pedidos@farmindustria.com',  '20100182628', true),
  (gen_random_uuid(), 'org_1772836382137', 'Distribuidora Bayer',   'Carlos Ruiz',   '01-5678901', 'distribuciones@bayer.com.pe','20100030798', true)
ON CONFLICT DO NOTHING;

-- ── 5. Orden de compra ───────────────────────────────────────
DO $$
DECLARE
  v_supplier_id UUID;
  v_purchase_id UUID;
  v_prod_id     UUID;
BEGIN
  SELECT id INTO v_supplier_id FROM corivacore_suppliers WHERE org_id = 'org_1772836382137' LIMIT 1;
  SELECT id INTO v_prod_id     FROM corivacore_products   WHERE org_id = 'org_1772836382137' AND code = 'MED003' LIMIT 1;

  IF v_supplier_id IS NOT NULL THEN
    v_purchase_id := gen_random_uuid();
    INSERT INTO corivacore_purchases
      (id, org_id, supplier_id, purchase_number, status, total, expected_at, created_at)
    VALUES
      (v_purchase_id, 'org_1772836382137', v_supplier_id, 'OC-26-0001', 'pending', 450.00, CURRENT_DATE + 5, NOW() - INTERVAL '2 days'),
      (gen_random_uuid(), 'org_1772836382137', v_supplier_id, 'OC-26-0002', 'received', 280.00, CURRENT_DATE - 3, NOW() - INTERVAL '7 days')
    ON CONFLICT DO NOTHING;

    IF v_prod_id IS NOT NULL THEN
      INSERT INTO corivacore_purchase_items
        (id, purchase_id, product_id, product_name, quantity, unit_cost, subtotal)
      VALUES
        (gen_random_uuid(), v_purchase_id, v_prod_id, 'Amoxicilina 500mg x 21 cap', 50, 6.80, 340.00)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
END $$;

-- ── 6. Leads & Pipeline ──────────────────────────────────────
INSERT INTO corivacore_leads
  (id, org_id, name, phone, email, source, status, estimated_value, notes, created_at)
VALUES
  (gen_random_uuid(), 'org_1772836382137', 'Clínica San Pablo',       '01-2345678', 'compras@clinicasanpablo.com', 'referido',  'qualified', 2500.00, 'Interesados en convenio mensual de medicamentos', NOW() - INTERVAL '5 days'),
  (gen_random_uuid(), 'org_1772836382137', 'Centro Médico Los Olivos','01-3456789', 'admin@cmlosolivos.com',       'web',       'proposal',  1800.00, 'Solicitan cotización de antibióticos y analgésicos', NOW() - INTERVAL '3 days'),
  (gen_random_uuid(), 'org_1772836382137', 'Dr. Roberto Sánchez',     '987123456',  'dr.sanchez@gmail.com',        'directo',   'contacted', 500.00,  'Médico independiente, compras frecuentes', NOW() - INTERVAL '8 days'),
  (gen_random_uuid(), 'org_1772836382137', 'Farmacia Popular SAC',    '01-5678901', 'gerencia@farmaciapopular.pe', 'referido',  'new',       3200.00, 'Cadena de 3 locales, buscan proveedor', NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), 'org_1772836382137', 'Policlínico Miraflores',  '01-4567890', 'logistica@policlinico.com',   'web',       'won',       4500.00, 'Contrato firmado — entrega mensual', NOW() - INTERVAL '15 days'),
  (gen_random_uuid(), 'org_1772836382137', 'Botica Familiar',         '976543210',  NULL,                          'directo',   'lost',      800.00,  'Eligió otro proveedor por precio', NOW() - INTERVAL '20 days')
ON CONFLICT DO NOTHING;

-- ── 7. Lotes farmacia (product_batches) ──────────────────────
DO $$
DECLARE
  v_prod_id UUID;
BEGIN
  -- Lote próximo a vencer (6 días) — crítico
  SELECT id INTO v_prod_id FROM corivacore_products WHERE org_id = 'org_1772836382137' AND code = 'MED011' LIMIT 1;
  IF v_prod_id IS NOT NULL THEN
    INSERT INTO corivacore_product_batches
      (id, org_id, product_id, batch_number, expiry_date, quantity, cost_price)
    VALUES
      (gen_random_uuid(), 'org_1772836382137', v_prod_id, 'AZI-2024-001', CURRENT_DATE + 6,  15, 11.50)
    ON CONFLICT (org_id, product_id, batch_number) DO NOTHING;
  END IF;

  -- Lote vencido
  SELECT id INTO v_prod_id FROM corivacore_products WHERE org_id = 'org_1772836382137' AND code = 'MED010' LIMIT 1;
  IF v_prod_id IS NOT NULL THEN
    INSERT INTO corivacore_product_batches
      (id, org_id, product_id, batch_number, expiry_date, quantity, cost_price)
    VALUES
      (gen_random_uuid(), 'org_1772836382137', v_prod_id, 'DIC-2023-005', CURRENT_DATE - 3,  8, 2.90)
    ON CONFLICT (org_id, product_id, batch_number) DO NOTHING;
  END IF;

  -- Lote warning (20 días)
  SELECT id INTO v_prod_id FROM corivacore_products WHERE org_id = 'org_1772836382137' AND code = 'MED006' LIMIT 1;
  IF v_prod_id IS NOT NULL THEN
    INSERT INTO corivacore_product_batches
      (id, org_id, product_id, batch_number, expiry_date, quantity, cost_price)
    VALUES
      (gen_random_uuid(), 'org_1772836382137', v_prod_id, 'MET-2024-012', CURRENT_DATE + 20, 45, 7.50)
    ON CONFLICT (org_id, product_id, batch_number) DO NOTHING;
  END IF;

  -- Lotes OK
  SELECT id INTO v_prod_id FROM corivacore_products WHERE org_id = 'org_1772836382137' AND code = 'MED001' LIMIT 1;
  IF v_prod_id IS NOT NULL THEN
    INSERT INTO corivacore_product_batches
      (id, org_id, product_id, batch_number, expiry_date, quantity, cost_price)
    VALUES
      (gen_random_uuid(), 'org_1772836382137', v_prod_id, 'PAR-2024-088', CURRENT_DATE + 270, 120, 4.20)
    ON CONFLICT (org_id, product_id, batch_number) DO NOTHING;
  END IF;

  SELECT id INTO v_prod_id FROM corivacore_products WHERE org_id = 'org_1772836382137' AND code = 'MED003' LIMIT 1;
  IF v_prod_id IS NOT NULL THEN
    INSERT INTO corivacore_product_batches
      (id, org_id, product_id, batch_number, expiry_date, quantity, cost_price)
    VALUES
      (gen_random_uuid(), 'org_1772836382137', v_prod_id, 'AMO-2024-034', CURRENT_DATE + 90,  60, 6.80)
    ON CONFLICT (org_id, product_id, batch_number) DO NOTHING;
  END IF;
END $$;

-- ── 8. Kardex de movimientos ─────────────────────────────────
DO $$
DECLARE
  v_prod_id UUID;
BEGIN
  SELECT id INTO v_prod_id FROM corivacore_products WHERE org_id = 'org_1772836382137' AND code = 'MED001' LIMIT 1;
  IF v_prod_id IS NOT NULL THEN
    INSERT INTO corivacore_inventory_kardex
      (id, org_id, product_id, movement_type, quantity, balance_after, reference_type, notes, created_at)
    VALUES
      (gen_random_uuid(), 'org_1772836382137', v_prod_id, 'ENTRADA',  200, 200, 'PURCHASE',    'Compra inicial de stock',          NOW() - INTERVAL '30 days'),
      (gen_random_uuid(), 'org_1772836382137', v_prod_id, 'SALIDA',    15, 185, 'SALE',        'Ventas del día',                   NOW() - INTERVAL '25 days'),
      (gen_random_uuid(), 'org_1772836382137', v_prod_id, 'SALIDA',    22, 163, 'SALE',        'Ventas del día',                   NOW() - INTERVAL '20 days'),
      (gen_random_uuid(), 'org_1772836382137', v_prod_id, 'ENTRADA',   50, 213, 'PURCHASE',    'Reposición de stock',              NOW() - INTERVAL '15 days'),
      (gen_random_uuid(), 'org_1772836382137', v_prod_id, 'SALIDA',    30, 183, 'SALE',        'Ventas del día',                   NOW() - INTERVAL '10 days'),
      (gen_random_uuid(), 'org_1772836382137', v_prod_id, 'AJUSTE',    -5, 178, 'ADJUSTMENT',  'Ajuste por inventario físico',     NOW() - INTERVAL '5 days'),
      (gen_random_uuid(), 'org_1772836382137', v_prod_id, 'SALIDA',    58, 120, 'SALE',        'Ventas acumuladas',                NOW() - INTERVAL '1 day')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ── 9. Series de facturación (BBB1 y FFF1) ───────────────────
INSERT INTO corivacore_invoice_series (org_id, type, series, last_number, is_active)
VALUES
  ('org_1772836382137', 'BOLETA',       'BBB1', 0, true),
  ('org_1772836382137', 'FACTURA',      'FFF1', 0, true),
  ('org_1772836382137', 'NOTA_CREDITO', 'BBB1', 0, true),
  ('org_1772836382137', 'NOTA_DEBITO',  'BBB1', 0, true)
ON CONFLICT (org_id, type, series) DO NOTHING;

-- ── 10. Automatizaciones ─────────────────────────────────────
INSERT INTO corivacore_automations
  (id, org_id, name, trigger_type, action_type, config, is_active)
VALUES
  (gen_random_uuid(), 'org_1772836382137', 'Alerta stock bajo',        'stock_low',      'notification', '{"threshold": 10, "channel": "whatsapp"}', true),
  (gen_random_uuid(), 'org_1772836382137', 'Recordatorio vencimiento', 'expiry_alert',   'notification', '{"days_before": 30, "channel": "email"}',  true),
  (gen_random_uuid(), 'org_1772836382137', 'Bienvenida cliente nuevo', 'customer_new',   'whatsapp',     '{"template": "bienvenida_farmacia"}',       true),
  (gen_random_uuid(), 'org_1772836382137', 'Reporte diario ventas',    'daily_schedule', 'email',        '{"hour": 20, "recipients": ["admin"]}',     false)
ON CONFLICT DO NOTHING;

-- ── 11. Verificación final ───────────────────────────────────
SELECT 'Organización' AS tabla, COUNT(*)::TEXT AS registros FROM corivacore_organizations WHERE id = 'org_1772836382137'
UNION ALL SELECT 'Productos',     COUNT(*)::TEXT FROM corivacore_products     WHERE org_id = 'org_1772836382137'
UNION ALL SELECT 'Clientes',      COUNT(*)::TEXT FROM corivacore_customers    WHERE org_id = 'org_1772836382137'
UNION ALL SELECT 'Ventas',        COUNT(*)::TEXT FROM corivacore_sales        WHERE org_id = 'org_1772836382137'
UNION ALL SELECT 'Proveedores',   COUNT(*)::TEXT FROM corivacore_suppliers    WHERE org_id = 'org_1772836382137'
UNION ALL SELECT 'Compras',       COUNT(*)::TEXT FROM corivacore_purchases    WHERE org_id = 'org_1772836382137'
UNION ALL SELECT 'Leads',         COUNT(*)::TEXT FROM corivacore_leads        WHERE org_id = 'org_1772836382137'
UNION ALL SELECT 'Lotes',         COUNT(*)::TEXT FROM corivacore_product_batches WHERE org_id = 'org_1772836382137'
UNION ALL SELECT 'Kardex',        COUNT(*)::TEXT FROM corivacore_inventory_kardex WHERE org_id = 'org_1772836382137'
UNION ALL SELECT 'Series factura',COUNT(*)::TEXT FROM corivacore_invoice_series   WHERE org_id = 'org_1772836382137'
UNION ALL SELECT 'Automatizaciones',COUNT(*)::TEXT FROM corivacore_automations    WHERE org_id = 'org_1772836382137';
