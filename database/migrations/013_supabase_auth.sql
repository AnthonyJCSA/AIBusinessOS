-- ============================================================
-- MIGRACIÓN 013: Supabase Auth Integration
-- Migra autenticación custom a Supabase Auth
-- ============================================================

-- ── Paso 1: Agregar columna auth_user_id ────────────────────
-- Vincula usuarios de nuestra tabla con Supabase Auth
ALTER TABLE corivacore_users
ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE;

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id 
ON corivacore_users(auth_user_id);

-- ── Paso 2: Comentarios ─────────────────────────────────────
COMMENT ON COLUMN corivacore_users.auth_user_id IS 'UUID del usuario en Supabase Auth (auth.users)';
COMMENT ON COLUMN corivacore_users.password_hash IS 'DEPRECATED - Usar Supabase Auth. Mantener para migración.';

-- ── Paso 3: Función para crear usuario en Supabase Auth ────
-- Esta función debe ejecutarse MANUALMENTE para cada usuario existente
-- Ejemplo de uso:
-- 
-- 1. Crear usuario en Supabase Auth Dashboard o via API
-- 2. Obtener el UUID del usuario creado
-- 3. Actualizar la tabla:
--    UPDATE corivacore_users 
--    SET auth_user_id = '<uuid-de-supabase-auth>'
--    WHERE username = 'admin';

-- ── Paso 4: Trigger para validar auth_user_id ──────────────
-- Asegura que nuevos usuarios tengan auth_user_id
CREATE OR REPLACE FUNCTION validate_auth_user_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.auth_user_id IS NULL THEN
    RAISE EXCEPTION 'auth_user_id no puede ser NULL. Crear usuario en Supabase Auth primero.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger solo a nuevos usuarios (no afecta existentes)
DROP TRIGGER IF EXISTS ensure_auth_user_id ON corivacore_users;
CREATE TRIGGER ensure_auth_user_id
  BEFORE INSERT ON corivacore_users
  FOR EACH ROW
  EXECUTE FUNCTION validate_auth_user_id();

-- ── Paso 5: Vista para debugging ────────────────────────────
CREATE OR REPLACE VIEW v_users_auth_status AS
SELECT 
  u.id,
  u.username,
  u.email,
  u.full_name,
  u.role,
  u.auth_user_id,
  CASE 
    WHEN u.auth_user_id IS NULL THEN '❌ Pendiente migración'
    ELSE '✅ Migrado'
  END as migration_status,
  u.is_active,
  u.created_at
FROM corivacore_users u
ORDER BY u.created_at DESC;

-- ── Paso 6: Instrucciones de migración ─────────────────────
/*
INSTRUCCIONES PARA MIGRAR USUARIOS EXISTENTES:

1. Listar usuarios pendientes de migración:
   SELECT * FROM v_users_auth_status WHERE migration_status = '❌ Pendiente migración';

2. Para cada usuario:
   a) Crear en Supabase Auth Dashboard:
      - Email: usar el email del usuario
      - Password: generar temporal o usar el actual
      - Confirmar email automáticamente
   
   b) Obtener el UUID del usuario creado
   
   c) Actualizar la tabla:
      UPDATE corivacore_users 
      SET auth_user_id = '<uuid-de-supabase-auth>'
      WHERE id = '<id-del-usuario>';

3. Verificar migración:
   SELECT * FROM v_users_auth_status;

4. Una vez todos migrados, hacer obligatorio el campo:
   ALTER TABLE corivacore_users 
   ALTER COLUMN auth_user_id SET NOT NULL;

NOTA: El campo password_hash se mantiene temporalmente para referencia
pero ya no se usa. Supabase Auth maneja las contraseñas.
*/

-- ── Paso 7: RLS para auth_user_id ──────────────────────────
-- Actualizar políticas RLS para usar auth_user_id
-- (Mantener políticas actuales por compatibilidad)

-- ── Paso 8: Función helper para obtener org_id del usuario autenticado ──
CREATE OR REPLACE FUNCTION get_current_user_org_id()
RETURNS TEXT AS $$
DECLARE
  v_org_id TEXT;
BEGIN
  SELECT org_id INTO v_org_id
  FROM corivacore_users
  WHERE auth_user_id = auth.uid()
  AND is_active = true;
  
  RETURN v_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_current_user_org_id IS 'Retorna org_id del usuario autenticado via Supabase Auth';
