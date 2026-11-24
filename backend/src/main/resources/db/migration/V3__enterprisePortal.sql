-- V1.4: datos persistentes para acceso por roles y operaciones internas.
-- El sitio publico de HVAC corresponde, por ahora, a la empresa 1.
CREATE TABLE companies (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO companies(id,name,slug) VALUES(1,'HVAC CONTROLS S.A.C.','hvac-controls');
SELECT setval(pg_get_serial_sequence('companies','id'), (SELECT max(id) FROM companies));
ALTER TABLE catalog_items ADD COLUMN company_id BIGINT NOT NULL DEFAULT 1 REFERENCES companies(id);
ALTER TABLE catalog_items ADD COLUMN stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0);
ALTER TABLE catalog_items
ADD COLUMN IF NOT EXISTS brand_name VARCHAR(140);
CREATE INDEX idx_catalog_company ON catalog_items(company_id);

CREATE TABLE app_users (
  id UUID PRIMARY KEY,
  company_id BIGINT NOT NULL REFERENCES companies(id),
  name VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  password_hash VARCHAR(100) NOT NULL,
  role VARCHAR(16) NOT NULL CHECK(role IN ('CLIENT','WORKER','ADMIN','DEVELOPER')),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  phone VARCHAR(30),
  organization VARCHAR(160),
  failed_logins INT NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_users_company ON app_users(company_id,role);
CREATE TABLE auth_sessions (
  token_hash CHAR(64) PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_auth_sessions_user ON auth_sessions(user_id);
CREATE TABLE worker_permissions (
  user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  permission VARCHAR(35) NOT NULL,
  PRIMARY KEY(user_id,permission)
);
CREATE TABLE brands (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT NOT NULL REFERENCES companies(id),
  name VARCHAR(140) NOT NULL,
  UNIQUE(company_id,name)
);
CREATE TABLE suppliers (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT NOT NULL REFERENCES companies(id),
  name VARCHAR(160) NOT NULL,
  phone VARCHAR(30),
  email VARCHAR(180),
  contact VARCHAR(140),
  notes VARCHAR(500)
);
CREATE TABLE appointments (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT NOT NULL REFERENCES companies(id),
  title VARCHAR(160) NOT NULL,
  address VARCHAR(240),
  starts_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  customer_id UUID REFERENCES app_users(id),
  worker_id UUID REFERENCES app_users(id),
  notes VARCHAR(700)
);
CREATE TABLE work_orders (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT NOT NULL REFERENCES companies(id),
  title VARCHAR(180) NOT NULL,
  description VARCHAR(1000),
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  customer_id UUID REFERENCES app_users(id),
  worker_id UUID REFERENCES app_users(id),
  quoted_amount NUMERIC(12,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE sales_orders (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT NOT NULL REFERENCES companies(id),
  customer_id UUID NOT NULL REFERENCES app_users(id),
  item_id BIGINT NOT NULL REFERENCES catalog_items(id),
  quantity INT NOT NULL CHECK (quantity BETWEEN 1 AND 999),
  unit_price NUMERIC(12,2) NOT NULL CHECK(unit_price >= 0),
  total NUMERIC(12,2) NOT NULL CHECK(total >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'REGISTERED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE quotation_requests ADD COLUMN company_id BIGINT NOT NULL DEFAULT 1 REFERENCES companies(id);
ALTER TABLE quotation_requests ADD COLUMN customer_id UUID REFERENCES app_users(id);
CREATE INDEX idx_quotes_company ON quotation_requests(company_id,created_at);

CREATE TABLE audit_events (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT NOT NULL REFERENCES companies(id),
  actor_id UUID REFERENCES app_users(id),
  action VARCHAR(70) NOT NULL,
  detail VARCHAR(300),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_appointments_tenant ON appointments(company_id,starts_at);
CREATE INDEX idx_orders_tenant ON sales_orders(company_id,created_at);
CREATE INDEX idx_jobs_tenant ON work_orders(company_id,created_at);
CREATE INDEX idx_audit_tenant ON audit_events(company_id,created_at);
