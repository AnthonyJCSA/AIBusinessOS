-- Migración 014: Agregar imagen a productos
-- Fecha: 2026-03-30

-- Agregar columna image_url a productos
ALTER TABLE corivacore_products 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Agregar índice para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_products_image 
ON corivacore_products(image_url) 
WHERE image_url IS NOT NULL;

-- Comentario
COMMENT ON COLUMN corivacore_products.image_url IS 'URL de la imagen del producto (Supabase Storage o base64)';
