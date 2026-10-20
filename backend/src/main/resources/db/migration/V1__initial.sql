CREATE TABLE catalog_items (
  id BIGSERIAL PRIMARY KEY,
  type VARCHAR(12) NOT NULL CHECK (type IN ('PRODUCT','SERVICE')),
  name VARCHAR(180) NOT NULL,
  sku VARCHAR(80) UNIQUE,
  summary VARCHAR(500) NOT NULL,
  category VARCHAR(100) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE quotation_requests (
  id UUID PRIMARY KEY,
  code VARCHAR(40) NOT NULL UNIQUE,
  idempotency_key UUID NOT NULL UNIQUE,
  contact_name VARCHAR(120) NOT NULL,
  contact_phone VARCHAR(24) NOT NULL,
  contact_email VARCHAR(160),
  company_name VARCHAR(180),
  location VARCHAR(240),
  notes VARCHAR(2000),
  preferred_contact VARCHAR(24) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'REGISTERED',
  created_at TIMESTAMPTZ NOT NULL,
  tracking_hash VARCHAR(64) NOT NULL UNIQUE,
  tracking_expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE quotation_request_lines (
  id UUID PRIMARY KEY,
  quotation_request_id UUID NOT NULL REFERENCES quotation_requests(id) ON DELETE RESTRICT,
  catalog_item_id BIGINT NOT NULL REFERENCES catalog_items(id) ON DELETE RESTRICT,
  type VARCHAR(12) NOT NULL,
  item_name VARCHAR(180) NOT NULL,
  sku VARCHAR(80),
  quantity INT NOT NULL CHECK (quantity BETWEEN 1 AND 999)
);

CREATE INDEX idx_quotation_request_lines_request ON quotation_request_lines(quotation_request_id);

-- SOLAMENTE DATOS FICTICIOS para desarrollo. HVAC validará sus productos reales.
INSERT INTO catalog_items (type,name,sku,summary,category) VALUES
('PRODUCT','Termostato programable','DEMO-TH-01','Equipo de control térmico. Referencia ficticia para pruebas.','Climatización'),
('PRODUCT','Actuador para compuerta','DEMO-AC-01','Componente para sistemas de control. Referencia ficticia para pruebas.','Automatización'),
('SERVICE','Diagnóstico técnico HVAC',NULL,'Visita técnica pagada, tarifa y condiciones sujetas a aprobación de HVAC.','Diagnóstico'),
('SERVICE','Mantenimiento preventivo',NULL,'Servicio técnico sujeto a evaluación y cotización personalizada.','Mantenimiento');
