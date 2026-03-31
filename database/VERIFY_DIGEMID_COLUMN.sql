-- Verificar estructura de la tabla
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'corivacore_organizations'
ORDER BY ordinal_position;

-- Ver datos actuales de tu organización
SELECT id, name, business_type, digemid_establishment_code, ruc
FROM corivacore_organizations;
