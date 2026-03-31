-- ============================================================
-- MIGRACIÓN 015: Hacer password_hash nullable
-- Ya no usamos password_hash porque Supabase Auth maneja passwords
-- ============================================================

-- Hacer password_hash nullable
ALTER TABLE corivacore_users 
ALTER COLUMN password_hash DROP NOT NULL;

-- Agregar valor default para compatibilidad
ALTER TABLE corivacore_users 
ALTER COLUMN password_hash SET DEFAULT NULL;

-- Comentario
COMMENT ON COLUMN corivacore_users.password_hash IS 
'DEPRECATED - No usar. Supabase Auth maneja las contraseñas. Campo mantenido solo para compatibilidad.';
