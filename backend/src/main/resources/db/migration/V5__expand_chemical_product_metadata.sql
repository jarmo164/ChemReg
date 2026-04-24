ALTER TABLE chemical_products
    ADD COLUMN product_code varchar(100),
    ADD COLUMN supplier_name varchar(255),
    ADD COLUMN default_unit varchar(20),
    ADD COLUMN storage_class varchar(100),
    ADD COLUMN use_description varchar(500);

ALTER TABLE chemical_products
    ADD CONSTRAINT chk_chemical_products_default_unit
        CHECK (default_unit IS NULL OR default_unit IN ('kg', 'L', 'g', 'mL', 'pcs'));

CREATE INDEX idx_chemical_products_product_code ON chemical_products(product_code);
CREATE INDEX idx_chemical_products_supplier_name ON chemical_products(supplier_name);
CREATE INDEX idx_chemical_products_default_unit ON chemical_products(default_unit);
CREATE INDEX idx_chemical_products_storage_class ON chemical_products(storage_class);
CREATE UNIQUE INDEX uq_chemical_products_tenant_product_code_not_null
    ON chemical_products(tenant_id, product_code)
    WHERE product_code IS NOT NULL;
