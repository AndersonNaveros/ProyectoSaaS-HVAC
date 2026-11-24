-- Stock gestionado por empresa, con movimientos auditables.
ALTER TABLE catalog_items DROP CONSTRAINT IF EXISTS catalog_items_sku_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_catalog_sku_tenant ON catalog_items(company_id,sku) WHERE sku IS NOT NULL;
CREATE TABLE stock_movements (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT NOT NULL REFERENCES companies(id),
  item_id BIGINT NOT NULL REFERENCES catalog_items(id),
  actor_id UUID REFERENCES app_users(id),
  delta INT NOT NULL CHECK(delta <> 0),
  reason VARCHAR(40) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_stock_tenant ON stock_movements(company_id,created_at);
