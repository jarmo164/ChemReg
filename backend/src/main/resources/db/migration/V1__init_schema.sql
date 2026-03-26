CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE tenants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    plan varchar(50) NOT NULL DEFAULT 'mvp',
    settings_json jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT chk_tenants_plan CHECK (plan IN ('mvp', 'enterprise'))
);

CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name varchar(255) NOT NULL,
    email varchar(255) NOT NULL,
    role varchar(50) NOT NULL,
    status varchar(20) NOT NULL DEFAULT 'active',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT chk_users_role CHECK (role IN ('org_admin', 'ehs_manager', 'site_manager', 'user', 'auditor', 'supplier')),
    CONSTRAINT chk_users_status CHECK (status IN ('active', 'inactive', 'invited'))
);

CREATE TABLE user_credentials (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    password_hash varchar(255) NOT NULL,
    password_updated_at timestamptz NOT NULL DEFAULT now(),
    last_login_at timestamptz,
    failed_login_attempts int NOT NULL DEFAULT 0,
    locked_until timestamptz,
    email_verified_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT chk_user_credentials_failed_login_attempts CHECK (failed_login_attempts >= 0)
);

CREATE TABLE password_reset_tokens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash varchar(255) NOT NULL,
    expires_at timestamptz NOT NULL,
    used_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT chk_password_reset_tokens_expiry CHECK (expires_at > created_at)
);

CREATE TABLE sites (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name varchar(255) NOT NULL,
    timezone varchar(100) NOT NULL DEFAULT 'UTC',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE locations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    parent_id uuid REFERENCES locations(id) ON DELETE RESTRICT,
    name varchar(255) NOT NULL,
    type varchar(50) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT chk_locations_type CHECK (type IN ('building', 'floor', 'room', 'cabinet', 'shelf')),
    CONSTRAINT chk_locations_parent_not_self CHECK (parent_id IS NULL OR parent_id <> id)
);

CREATE TABLE sds_documents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_name varchar(255) NOT NULL,
    supplier_name_raw varchar(255),
    language varchar(10) NOT NULL DEFAULT 'et',
    country_format varchar(10) NOT NULL DEFAULT 'EE',
    revision_date date,
    expiry_date date,
    status varchar(20) NOT NULL DEFAULT 'active',
    created_by uuid REFERENCES users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT chk_sds_documents_status CHECK (status IN ('active', 'archived', 'pending_review')),
    CONSTRAINT chk_sds_documents_expiry_after_revision CHECK (expiry_date IS NULL OR revision_date IS NULL OR expiry_date >= revision_date)
);

CREATE TABLE sds_files (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sds_id uuid NOT NULL REFERENCES sds_documents(id) ON DELETE CASCADE,
    s3_key varchar(500) NOT NULL,
    file_size_bytes int,
    extracted_text text,
    is_current boolean NOT NULL DEFAULT true,
    uploaded_by uuid REFERENCES users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT chk_sds_files_file_size_bytes CHECK (file_size_bytes IS NULL OR file_size_bytes >= 0)
);

CREATE TABLE sds_sections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sds_id uuid NOT NULL REFERENCES sds_documents(id) ON DELETE CASCADE,
    section_number int NOT NULL,
    title varchar(255) NOT NULL,
    content text,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT chk_sds_sections_number CHECK (section_number BETWEEN 1 AND 16)
);

CREATE TABLE chemical_products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    sds_id uuid REFERENCES sds_documents(id) ON DELETE SET NULL,
    name varchar(255) NOT NULL,
    cas_number varchar(50),
    ec_number varchar(50),
    signal_word varchar(50),
    physical_state varchar(50),
    is_restricted boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT chk_chemical_products_signal_word CHECK (signal_word IS NULL OR signal_word IN ('Danger', 'Warning')),
    CONSTRAINT chk_chemical_products_physical_state CHECK (physical_state IS NULL OR physical_state IN ('solid', 'liquid', 'gas', 'aerosol'))
);

CREATE TABLE ghs_properties (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid NOT NULL REFERENCES chemical_products(id) ON DELETE CASCADE,
    pictogram_code varchar(10) NOT NULL,
    h_class varchar(255),
    CONSTRAINT chk_ghs_properties_pictogram_code CHECK (pictogram_code IN ('GHS01', 'GHS02', 'GHS03', 'GHS04', 'GHS05', 'GHS06', 'GHS07', 'GHS08', 'GHS09'))
);

CREATE TABLE substances (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name varchar(255) NOT NULL,
    cas_number varchar(50),
    ec_number varchar(50),
    is_svhc boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE product_substances (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid NOT NULL REFERENCES chemical_products(id) ON DELETE CASCADE,
    substance_id uuid REFERENCES substances(id) ON DELETE SET NULL,
    substance_name_raw varchar(255),
    concentration_min numeric(5,2),
    concentration_max numeric(5,2),
    CONSTRAINT chk_product_substances_concentration_min CHECK (concentration_min IS NULL OR concentration_min >= 0),
    CONSTRAINT chk_product_substances_concentration_max CHECK (concentration_max IS NULL OR concentration_max >= 0),
    CONSTRAINT chk_product_substances_concentration_order CHECK (
        concentration_min IS NULL OR concentration_max IS NULL OR concentration_min <= concentration_max
    ),
    CONSTRAINT chk_product_substances_presence CHECK (substance_id IS NOT NULL OR substance_name_raw IS NOT NULL)
);

CREATE TABLE inventory_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES chemical_products(id) ON DELETE RESTRICT,
    location_id uuid NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
    quantity numeric(10,3) NOT NULL,
    unit varchar(20) NOT NULL,
    container_type varchar(100),
    barcode varchar(100),
    qr_code varchar(100),
    lot_number varchar(100),
    status varchar(30) NOT NULL DEFAULT 'in_stock',
    opened_at timestamptz,
    expiry_date date,
    min_stock numeric(10,3),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT chk_inventory_items_quantity CHECK (quantity >= 0),
    CONSTRAINT chk_inventory_items_min_stock CHECK (min_stock IS NULL OR min_stock >= 0),
    CONSTRAINT chk_inventory_items_unit CHECK (unit IN ('kg', 'L', 'g', 'mL', 'pcs')),
    CONSTRAINT chk_inventory_items_status CHECK (status IN ('in_stock', 'reserved', 'disposed', 'expired'))
);

CREATE TABLE asset_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name varchar(255) NOT NULL,
    label_type varchar(50) NOT NULL,
    template_json jsonb NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT chk_asset_templates_label_type CHECK (label_type IN ('ghs', 'secondary', 'storage'))
);

CREATE TABLE risk_assessment_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name varchar(255) NOT NULL,
    description text,
    template_data jsonb NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE risk_assessments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title varchar(255) NOT NULL,
    location_id uuid REFERENCES locations(id) ON DELETE SET NULL,
    description text,
    status varchar(30) NOT NULL DEFAULT 'draft',
    template_id uuid REFERENCES risk_assessment_templates(id) ON DELETE SET NULL,
    created_by uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT chk_risk_assessments_status CHECK (status IN ('draft', 'under_review', 'approved', 'archived'))
);

CREATE TABLE risk_chemicals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id uuid NOT NULL REFERENCES risk_assessments(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES chemical_products(id) ON DELETE RESTRICT,
    quantity numeric(10,3),
    unit varchar(20),
    CONSTRAINT chk_risk_chemicals_quantity CHECK (quantity IS NULL OR quantity >= 0)
);

CREATE TABLE exposure_scenarios (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id uuid NOT NULL REFERENCES risk_assessments(id) ON DELETE CASCADE,
    scenario_type varchar(100) NOT NULL,
    description text,
    frequency varchar(100),
    duration varchar(100),
    ventilation varchar(100),
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT chk_exposure_scenarios_type CHECK (scenario_type IN ('storage', 'handling', 'decanting', 'applying', 'spill', 'disposal'))
);

CREATE TABLE control_measures (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id uuid NOT NULL REFERENCES exposure_scenarios(id) ON DELETE CASCADE,
    type varchar(50) NOT NULL,
    description varchar(500) NOT NULL,
    is_implemented boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT chk_control_measures_type CHECK (type IN ('engineering', 'administrative', 'ppe'))
);

CREATE TABLE risk_ratings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id uuid NOT NULL REFERENCES risk_assessments(id) ON DELETE CASCADE,
    scenario_id uuid REFERENCES exposure_scenarios(id) ON DELETE CASCADE,
    rating_type varchar(20) NOT NULL,
    likelihood int NOT NULL,
    consequence int NOT NULL,
    score int NOT NULL,
    level varchar(20) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT chk_risk_ratings_type CHECK (rating_type IN ('inherent', 'residual')),
    CONSTRAINT chk_risk_ratings_likelihood CHECK (likelihood BETWEEN 1 AND 5),
    CONSTRAINT chk_risk_ratings_consequence CHECK (consequence BETWEEN 1 AND 5),
    CONSTRAINT chk_risk_ratings_score CHECK (score >= 1 AND score <= 25),
    CONSTRAINT chk_risk_ratings_level CHECK (level IN ('low', 'medium', 'high', 'unacceptable'))
);

CREATE TABLE approvals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    entity_type varchar(50) NOT NULL,
    entity_id uuid NOT NULL,
    step_order int NOT NULL,
    assigned_to uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status varchar(20) NOT NULL DEFAULT 'pending',
    comment text,
    decided_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT chk_approvals_entity_type CHECK (entity_type IN ('risk_assessment', 'sds_document')),
    CONSTRAINT chk_approvals_status CHECK (status IN ('pending', 'approved', 'rejected')),
    CONSTRAINT chk_approvals_step_order CHECK (step_order >= 1)
);

CREATE TABLE label_print_jobs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    item_id uuid NOT NULL REFERENCES inventory_items(id) ON DELETE RESTRICT,
    template_id uuid REFERENCES asset_templates(id) ON DELETE SET NULL,
    created_by uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    printed_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    action varchar(100) NOT NULL,
    entity_type varchar(100) NOT NULL,
    entity_id uuid,
    changes_json jsonb,
    ip_address varchar(45),
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type varchar(100) NOT NULL,
    title varchar(255) NOT NULL,
    body text,
    is_read boolean NOT NULL DEFAULT false,
    entity_type varchar(100),
    entity_id uuid,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT chk_notifications_type CHECK (type IN ('sds_expiring', 'approval_needed', 'incident_reported', 'stock_low'))
);

CREATE TABLE incidents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    location_id uuid REFERENCES locations(id) ON DELETE SET NULL,
    reported_by uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    title varchar(255) NOT NULL,
    description text NOT NULL,
    severity varchar(20) NOT NULL,
    status varchar(30) NOT NULL DEFAULT 'open',
    occurred_at timestamptz NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT chk_incidents_severity CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    CONSTRAINT chk_incidents_status CHECK (status IN ('open', 'under_review', 'closed'))
);

CREATE TABLE incident_chemicals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id uuid NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES chemical_products(id) ON DELETE RESTRICT
);

CREATE TABLE suppliers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name varchar(255) NOT NULL,
    contact_name varchar(255),
    email varchar(255),
    phone varchar(50),
    country varchar(100),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE sds_supplier_links (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sds_id uuid NOT NULL REFERENCES sds_documents(id) ON DELETE CASCADE,
    supplier_id uuid NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE
);
