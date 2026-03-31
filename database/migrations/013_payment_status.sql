-- Migración: Agregar campos de pago y suscripción
-- Fecha: 2025-01-XX
-- Descripción: Agrega payment_status, subscription_id y trial_ends_at a organizations

-- 1. Agregar columnas de pago
ALTER TABLE corivacore_organizations
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'active', 'cancelled', 'trial')),
ADD COLUMN IF NOT EXISTS subscription_id TEXT,
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;

-- 2. Crear índice para búsquedas por subscription_id
CREATE INDEX IF NOT EXISTS idx_organizations_subscription_id 
ON corivacore_organizations(subscription_id);

-- 3. Actualizar organizaciones existentes a 'active' (para no bloquear usuarios actuales)
UPDATE corivacore_organizations
SET payment_status = 'active'
WHERE payment_status IS NULL OR payment_status = 'pending';

-- 4. Comentarios
COMMENT ON COLUMN corivacore_organizations.payment_status IS 'Estado del pago: pending (sin pagar), active (pagado), cancelled (cancelado), trial (prueba)';
COMMENT ON COLUMN corivacore_organizations.subscription_id IS 'ID de suscripción de Stripe';
COMMENT ON COLUMN corivacore_organizations.trial_ends_at IS 'Fecha de fin del período de prueba';
