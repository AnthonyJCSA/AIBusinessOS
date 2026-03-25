-- ============================================================
-- FIX: Insertar organización y usuario demo para pruebas
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. Insertar organización demo
INSERT INTO corivacore_organizations (id, name, slug, business_type, ruc, phone, settings, is_active)
VALUES (
  'org_1772836382137',
  'Coriva Demo',
  'coriva-demo',
  'retail',
  '20123456789',
  '913916967',
  '{"currency": "S/", "tax_rate": 0.18, "plan": "pro", "theme_color": "#6366F1"}'::jsonb,
  true
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  settings = EXCLUDED.settings;

-- 2. Insertar usuario demo (password: demo123)
INSERT INTO corivacore_users (id, org_id, username, password_hash, email, full_name, role, is_active)
VALUES (
  'user_demo',
  'org_1772836382137',
  'demo',
  'demo123',
  'demo@coriva.com',
  'Usuario Demo',
  'ADMIN',
  true
)
ON CONFLICT (username) DO UPDATE SET
  password_hash = 'demo123',
  is_active = true,
  org_id = 'org_1772836382137';

-- 3. Verificar
SELECT
  u.username,
  u.password_hash,
  u.role,
  u.is_active,
  o.name AS org_name,
  o.slug
FROM corivacore_users u
JOIN corivacore_organizations o ON o.id = u.org_id
WHERE u.username = 'demo';
