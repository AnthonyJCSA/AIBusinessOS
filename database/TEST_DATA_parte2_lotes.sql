-- ============================================================
-- CORRECCIÓN PARTE 2 — Lotes, Kardex, Series, Automatizaciones
-- Las tablas 009_pharma usan org_id UUID, no TEXT
-- Ejecutar DESPUÉS del script principal (partes 1-6)
-- ============================================================

-- ── 7. Lotes farmacia ────────────────────────────────────────
-- Usamos el UUID real de org_id desde corivacore_products
-- (que sí acepta TEXT en org_id según el schema original)

-- Lote crítico (vence en 6 días) — MED011 Azitromicina
INSERT INTO corivacore_product_batches (org_id, product_id, batch_number, expiry_date, quantity, cost_price)
SELECT p.org_id::UUID, p.id, 'AZI-2024-001', CURRENT_DATE + 6, 15, 11.50
FROM corivacore_products p
WHERE p.org_id = 'org_1772836382137' AND p.code = 'MED011'
LIMIT 1
ON CONFLICT (org_id, product_id, batch_number) DO NOTHING;

-- Lote vencido — MED010 Diclofenaco
INSERT INTO corivacore_product_batches (org_id, product_id, batch_number, expiry_date, quantity, cost_price)
SELECT p.org_id::UUID, p.id, 'DIC-2023-005', CURRENT_DATE - 3, 8, 2.90
FROM corivacore_products p
WHERE p.org_id = 'org_1772836382137' AND p.code = 'MED010'
LIMIT 1
ON CONFLICT (org_id, product_id, batch_number) DO NOTHING;

-- Lote warning (20 días) — MED006 Metformina
INSERT INTO corivacore_product_batches (org_id, product_id, batch_number, expiry_date, quantity, cost_price)
SELECT p.org_id::UUID, p.id, 'MET-2024-012', CURRENT_DATE + 20, 45, 7.50
FROM corivacore_products p
WHERE p.org_id = 'org_1772836382137' AND p.code = 'MED006'
LIMIT 1
ON CONFLICT (org_id, product_id, batch_number) DO NOTHING;

-- Lote OK — MED001 Paracetamol
INSERT INTO corivacore_product_batches (org_id, product_id, batch_number, expiry_date, quantity, cost_price)
SELECT p.org_id::UUID, p.id, 'PAR-2024-088', CURRENT_DATE + 270, 120, 4.20
FROM corivacore_products p
WHERE p.org_id = 'org_1772836382137' AND p.code = 'MED001'
LIMIT 1
ON CONFLICT (org_id, product_id, batch_number) DO NOTHING;

-- Lote OK — MED003 Amoxicilina
INSERT INTO corivacore_product_batches (org_id, product_id, batch_number, expiry_date, quantity, cost_price)
SELECT p.org_id::UUID, p.id, 'AMO-2024-034', CURRENT_DATE + 90, 60, 6.80
FROM corivacore_products p
WHERE p.org_id = 'org_1772836382137' AND p.code = 'MED003'
LIMIT 1
ON CONFLICT (org_id, product_id, batch_number) DO NOTHING;

-- ── 8. Kardex ────────────────────────────────────────────────
INSERT INTO corivacore_inventory_kardex (org_id, product_id, movement_type, quantity, balance_after, reference_type, notes, created_at)
SELECT p.org_id::UUID, p.id, 'ENTRADA', 200, 200, 'PURCHASE',   'Compra inicial de stock',      NOW()-INTERVAL '30 days'
FROM corivacore_products p WHERE p.org_id='org_1772836382137' AND p.code='MED001' LIMIT 1;

INSERT INTO corivacore_inventory_kardex (org_id, product_id, movement_type, quantity, balance_after, reference_type, notes, created_at)
SELECT p.org_id::UUID, p.id, 'SALIDA',   15, 185, 'SALE',       'Ventas del día',               NOW()-INTERVAL '25 days'
FROM corivacore_products p WHERE p.org_id='org_1772836382137' AND p.code='MED001' LIMIT 1;

INSERT INTO corivacore_inventory_kardex (org_id, product_id, movement_type, quantity, balance_after, reference_type, notes, created_at)
SELECT p.org_id::UUID, p.id, 'SALIDA',   22, 163, 'SALE',       'Ventas del día',               NOW()-INTERVAL '20 days'
FROM corivacore_products p WHERE p.org_id='org_1772836382137' AND p.code='MED001' LIMIT 1;

INSERT INTO corivacore_inventory_kardex (org_id, product_id, movement_type, quantity, balance_after, reference_type, notes, created_at)
SELECT p.org_id::UUID, p.id, 'ENTRADA',  50, 213, 'PURCHASE',   'Reposición de stock',          NOW()-INTERVAL '15 days'
FROM corivacore_products p WHERE p.org_id='org_1772836382137' AND p.code='MED001' LIMIT 1;

INSERT INTO corivacore_inventory_kardex (org_id, product_id, movement_type, quantity, balance_after, reference_type, notes, created_at)
SELECT p.org_id::UUID, p.id, 'AJUSTE',    5, 178, 'ADJUSTMENT', 'Ajuste por inventario físico', NOW()-INTERVAL '5 days'
FROM corivacore_products p WHERE p.org_id='org_1772836382137' AND p.code='MED001' LIMIT 1;

-- ── 9. Series de facturación ─────────────────────────────────
INSERT INTO corivacore_invoice_series (org_id, type, series, last_number, is_active)
VALUES
  ('org_1772836382137','BOLETA',      'BBB1',0,true),
  ('org_1772836382137','FACTURA',     'FFF1',0,true),
  ('org_1772836382137','NOTA_CREDITO','BBB1',0,true),
  ('org_1772836382137','NOTA_DEBITO', 'BBB1',0,true)
ON CONFLICT (org_id, type, series) DO NOTHING;

-- ── 10. Automatizaciones ─────────────────────────────────────
INSERT INTO corivacore_automations (org_id, name, trigger_type, action_type, config, is_active)
VALUES
  ('org_1772836382137','Alerta stock bajo',        'stock_low',      'notification','{"threshold":10,"channel":"whatsapp"}',true),
  ('org_1772836382137','Recordatorio vencimiento', 'expiry_alert',   'notification','{"days_before":30,"channel":"email"}', true),
  ('org_1772836382137','Bienvenida cliente nuevo', 'customer_new',   'whatsapp',    '{"template":"bienvenida_farmacia"}',   true),
  ('org_1772836382137','Reporte diario ventas',    'daily_schedule', 'email',       '{"hour":20,"recipients":["admin"]}',   false)
ON CONFLICT DO NOTHING;

-- ── Verificación ─────────────────────────────────────────────
SELECT 'Lotes'           AS tabla, COUNT(*)::TEXT AS total FROM corivacore_product_batches  WHERE org_id::TEXT LIKE '%'
UNION ALL
SELECT 'Kardex',                   COUNT(*)::TEXT          FROM corivacore_inventory_kardex WHERE org_id::TEXT LIKE '%'
UNION ALL
SELECT 'Series',                   COUNT(*)::TEXT          FROM corivacore_invoice_series   WHERE org_id = 'org_1772836382137'
UNION ALL
SELECT 'Automatizaciones',         COUNT(*)::TEXT          FROM corivacore_automations      WHERE org_id = 'org_1772836382137';
