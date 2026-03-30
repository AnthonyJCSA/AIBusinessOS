-- ============================================================
-- MIGRACIÓN 007: Facturación electrónica
-- ============================================================

-- ── 1. Series de comprobantes ────────────────────────────────
CREATE TABLE IF NOT EXISTS corivacore_invoice_series (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL,
  type        VARCHAR(20) NOT NULL CHECK (type IN ('FACTURA','BOLETA','NOTA_CREDITO','NOTA_DEBITO')),
  series      VARCHAR(10) NOT NULL,
  last_number INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, type, series)
);

ALTER TABLE corivacore_invoice_series ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org_invoice_series" ON corivacore_invoice_series;
CREATE POLICY "org_invoice_series" ON corivacore_invoice_series
  FOR ALL USING (true);

-- ── 2. Comprobantes emitidos ─────────────────────────────────
CREATE TABLE IF NOT EXISTS corivacore_invoices (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id           UUID NOT NULL,
  sale_id          UUID NOT NULL,
  invoice_number   VARCHAR(50) NOT NULL,
  series           VARCHAR(10) NOT NULL,
  correlative      INTEGER NOT NULL,
  type             VARCHAR(20) NOT NULL,
  client_name      VARCHAR(255),
  client_doc_type  VARCHAR(20),
  client_doc       VARCHAR(20),
  client_address   TEXT,
  client_email     VARCHAR(255),
  subtotal         DECIMAL(10,2) NOT NULL DEFAULT 0,
  igv              DECIMAL(10,2) NOT NULL DEFAULT 0,
  total            DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency         VARCHAR(5) DEFAULT 'PEN',
  status           VARCHAR(20) DEFAULT 'PENDIENTE',
  sunat_status     VARCHAR(20) DEFAULT 'PENDIENTE',
  sunat_response   JSONB,
  pdf_url          TEXT,
  xml_url          TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_org    ON corivacore_invoices(org_id);
CREATE INDEX IF NOT EXISTS idx_invoices_sale   ON corivacore_invoices(sale_id);
CREATE INDEX IF NOT EXISTS idx_invoices_org_created
  ON corivacore_invoices(org_id, created_at DESC);

ALTER TABLE corivacore_invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org_invoices" ON corivacore_invoices;
CREATE POLICY "org_invoices" ON corivacore_invoices
  FOR ALL USING (true);
