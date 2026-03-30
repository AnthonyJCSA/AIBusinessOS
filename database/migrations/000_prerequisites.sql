-- ============================================================
-- MIGRACIÓN 000: Funciones prerequisito
-- EJECUTAR PRIMERO antes de cualquier otra migración
-- ============================================================

-- ── get_user_org_id() ────────────────────────────────────────
-- El sistema usa autenticación custom (corivacore_users),
-- NO Supabase Auth. Esta función es un stub que permite que
-- las políticas RLS compilen correctamente.
-- Las políticas reales usan USING (true) porque el aislamiento
-- multi-tenant se hace a nivel de aplicación (filtro por org_id).
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS UUID
LANGUAGE sql STABLE
AS $$
  -- Stub: retorna NULL cuando no hay sesión Supabase Auth activa.
  -- El aislamiento real se hace en la capa de servicio (org_id en queries).
  SELECT NULLIF(current_setting('app.current_org_id', true), '')::UUID;
$$;

-- ── update_updated_at() ──────────────────────────────────────
-- Trigger genérico para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;
