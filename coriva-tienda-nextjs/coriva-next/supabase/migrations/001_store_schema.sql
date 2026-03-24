-- ============================================================
-- CORIVA CORE — Esquema de Tienda Virtual
-- ============================================================

-- Tabla de tiendas (una por negocio/tenant)
CREATE TABLE stores (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,           -- URL: /tienda/mi-bodega
  name        TEXT NOT NULL,
  tagline     TEXT,
  whatsapp    TEXT NOT NULL,                  -- Ej: "51913916967"
  currency    TEXT NOT NULL DEFAULT 'S/',
  logo_emoji  TEXT DEFAULT '🏪',
  banner_title      TEXT DEFAULT 'Tu tienda de confianza,',
  banner_subtitle   TEXT DEFAULT 'siempre disponible.',
  banner_desc       TEXT DEFAULT 'Explora el catálogo y haz tu pedido por WhatsApp',
  delivery_info     TEXT DEFAULT 'Consulta cobertura por WhatsApp',
  payment_methods   TEXT DEFAULT 'Efectivo · Yape · Plin · Transferencia',
  hours             TEXT DEFAULT 'Lun–Sáb: 8am–8pm · Dom: 9am–2pm',
  active      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de categorías
CREATE TABLE store_categories (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  name     TEXT NOT NULL,
  emoji    TEXT DEFAULT '📦',
  sort_order INT DEFAULT 0
);

-- Tabla de productos
CREATE TABLE products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id    UUID REFERENCES stores(id) ON DELETE CASCADE,
  category_id UUID REFERENCES store_categories(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  description TEXT,
  price       NUMERIC(10,2) NOT NULL,
  price_old   NUMERIC(10,2),                  -- Precio tachado (opcional)
  emoji       TEXT DEFAULT '📦',
  badge       TEXT CHECK (badge IN ('new','hot','promo') OR badge IS NULL),
  active      BOOLEAN DEFAULT TRUE,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_products_store_id ON products(store_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_active ON products(store_id, active);
CREATE INDEX idx_stores_slug ON stores(slug);

-- RLS (Row Level Security)
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_categories ENABLE ROW LEVEL SECURITY;

-- Política pública: cualquiera puede leer tiendas activas
CREATE POLICY "Public read active stores"
  ON stores FOR SELECT USING (active = TRUE);

CREATE POLICY "Public read active products"
  ON products FOR SELECT USING (active = TRUE);

CREATE POLICY "Public read categories"
  ON store_categories FOR SELECT USING (TRUE);

-- ============================================================
-- DATOS DE EJEMPLO
-- ============================================================
INSERT INTO stores (slug, name, tagline, whatsapp, currency, logo_emoji)
VALUES ('coriva', 'Coriva', '10 productos disponibles', '51913916967', 'S/', '🏪');

-- Obtener el ID para insertar categorías y productos
DO $$
DECLARE
  store_id UUID;
  cat_higiene UUID;
  cat_primeros UUID;
  cat_proteccion UUID;
  cat_medicamentos UUID;
  cat_equipos UUID;
  cat_suplementos UUID;
BEGIN
  SELECT id INTO store_id FROM stores WHERE slug = 'coriva';

  INSERT INTO store_categories (store_id, name, emoji, sort_order) VALUES
    (store_id, 'Higiene', '🧴', 1),
    (store_id, 'Primeros Auxilios', '🩹', 2),
    (store_id, 'Protección', '🧤', 3),
    (store_id, 'Medicamentos', '💊', 4),
    (store_id, 'Equipos', '🌡️', 5),
    (store_id, 'Suplementos', '🍊', 6)
  RETURNING id INTO cat_higiene;

  SELECT id INTO cat_higiene FROM store_categories WHERE store_id = store_id AND name = 'Higiene';
  SELECT id INTO cat_primeros FROM store_categories WHERE store_id = store_id AND name = 'Primeros Auxilios';
  SELECT id INTO cat_proteccion FROM store_categories WHERE store_id = store_id AND name = 'Protección';
  SELECT id INTO cat_medicamentos FROM store_categories WHERE store_id = store_id AND name = 'Medicamentos';
  SELECT id INTO cat_equipos FROM store_categories WHERE store_id = store_id AND name = 'Equipos';
  SELECT id INTO cat_suplementos FROM store_categories WHERE store_id = store_id AND name = 'Suplementos';

  INSERT INTO products (store_id, category_id, name, description, price, price_old, emoji, badge, sort_order) VALUES
    (store_id, cat_higiene, 'Alcohol 70%', 'Solución antiséptica de alta concentración. Ideal para desinfección de superficies y manos. Presentación 250ml.', 12.00, NULL, '🧴', 'hot', 1),
    (store_id, cat_primeros, 'Curitas (Paquete)', 'Paquete de 40 curitas hipoalergénicas de diferentes tamaños. Adhesivo resistente al agua.', 6.00, NULL, '🩹', 'new', 2),
    (store_id, cat_higiene, 'Gel Antibacterial 500ml', 'Gel antibacterial al 70% de alcohol con vitamina E. No reseca las manos.', 15.00, 20.00, '🧼', NULL, 3),
    (store_id, cat_proteccion, 'Guantes Látex (Caja)', 'Caja de 100 guantes desechables de látex. Talla M. Ideales para uso médico y limpieza.', 35.00, NULL, '🧤', NULL, 4),
    (store_id, cat_medicamentos, 'Ibuprofeno 400mg', 'Analgésico y antiinflamatorio. Caja de 20 tabletas. Uso bajo prescripción médica.', 8.00, NULL, '💊', NULL, 5),
    (store_id, cat_medicamentos, 'Jarabe para la Tos', 'Jarabe expectorante natural con extracto de eucalipto y miel. Frasco de 150ml.', 18.50, 22.00, '🫙', 'hot', 6),
    (store_id, cat_proteccion, 'Mascarilla KN95', 'Mascarilla de alta filtración KN95. Protección de 5 capas. 1 unidad.', 3.50, NULL, '😷', NULL, 7),
    (store_id, cat_medicamentos, 'Paracetamol 500mg', 'Analgésico y antipirético. Caja de 20 tabletas de 500mg. Alivia el dolor y la fiebre.', 5.50, NULL, '💊', 'new', 8),
    (store_id, cat_equipos, 'Termómetro Digital', 'Termómetro digital de lectura rápida (10 segundos). Pantalla LCD. Incluye estuche.', 28.00, 35.00, '🌡️', NULL, 9),
    (store_id, cat_suplementos, 'Vitamina C 1000mg', 'Suplemento vitamínico de alta potencia. Frasco de 60 cápsulas. Refuerza el sistema inmune.', 24.00, NULL, '🍊', 'hot', 10);
END $$;
