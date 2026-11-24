-- Plantillas de permisos reutilizables dentro de cada empresa.
CREATE TABLE worker_subroles (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT NOT NULL REFERENCES companies(id),
  name VARCHAR(100) NOT NULL,
  UNIQUE(company_id,name)
);
CREATE TABLE subrole_permissions (
  subrole_id BIGINT NOT NULL REFERENCES worker_subroles(id) ON DELETE CASCADE,
  permission VARCHAR(35) NOT NULL,
  PRIMARY KEY(subrole_id,permission)
);
ALTER TABLE app_users ADD COLUMN subrole_id BIGINT REFERENCES worker_subroles(id);
CREATE INDEX idx_worker_subroles_company ON worker_subroles(company_id);
