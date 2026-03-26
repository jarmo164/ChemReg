CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_tenants_set_updated_at
BEFORE UPDATE ON tenants
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_user_credentials_set_updated_at
BEFORE UPDATE ON user_credentials
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_sites_set_updated_at
BEFORE UPDATE ON sites
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_locations_set_updated_at
BEFORE UPDATE ON locations
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_sds_documents_set_updated_at
BEFORE UPDATE ON sds_documents
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_chemical_products_set_updated_at
BEFORE UPDATE ON chemical_products
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_substances_set_updated_at
BEFORE UPDATE ON substances
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_inventory_items_set_updated_at
BEFORE UPDATE ON inventory_items
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_asset_templates_set_updated_at
BEFORE UPDATE ON asset_templates
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_risk_assessment_templates_set_updated_at
BEFORE UPDATE ON risk_assessment_templates
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_risk_assessments_set_updated_at
BEFORE UPDATE ON risk_assessments
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_control_measures_set_updated_at
BEFORE UPDATE ON control_measures
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_incidents_set_updated_at
BEFORE UPDATE ON incidents
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_suppliers_set_updated_at
BEFORE UPDATE ON suppliers
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
