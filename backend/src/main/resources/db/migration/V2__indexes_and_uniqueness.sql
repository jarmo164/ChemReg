CREATE INDEX idx_tenants_name ON tenants(name);

CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE UNIQUE INDEX uq_users_tenant_email_lower ON users(tenant_id, lower(email));
CREATE INDEX idx_users_tenant_role ON users(tenant_id, role);
CREATE INDEX idx_users_tenant_status ON users(tenant_id, status);

CREATE UNIQUE INDEX uq_user_credentials_user_id ON user_credentials(user_id);
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE UNIQUE INDEX uq_password_reset_tokens_token_hash ON password_reset_tokens(token_hash);
CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

CREATE INDEX idx_sites_tenant_id ON sites(tenant_id);
CREATE UNIQUE INDEX uq_sites_tenant_name ON sites(tenant_id, name);

CREATE INDEX idx_locations_site_id ON locations(site_id);
CREATE INDEX idx_locations_parent_id ON locations(parent_id);
CREATE UNIQUE INDEX uq_locations_site_parent_name ON locations(site_id, parent_id, name);
CREATE INDEX idx_locations_site_type ON locations(site_id, type);

CREATE INDEX idx_sds_documents_tenant_id ON sds_documents(tenant_id);
CREATE INDEX idx_sds_documents_created_by ON sds_documents(created_by);
CREATE INDEX idx_sds_documents_status ON sds_documents(status);
CREATE INDEX idx_sds_documents_product_name ON sds_documents(product_name);
CREATE INDEX idx_sds_documents_revision_date ON sds_documents(revision_date);
CREATE INDEX idx_sds_documents_expiry_date ON sds_documents(expiry_date);
CREATE INDEX idx_sds_documents_tenant_product_name ON sds_documents(tenant_id, product_name);

CREATE INDEX idx_sds_files_sds_id ON sds_files(sds_id);
CREATE INDEX idx_sds_files_uploaded_by ON sds_files(uploaded_by);
CREATE UNIQUE INDEX uq_sds_files_s3_key ON sds_files(s3_key);
CREATE UNIQUE INDEX uq_sds_files_one_current_per_sds ON sds_files(sds_id) WHERE is_current = true;

CREATE INDEX idx_sds_sections_sds_id ON sds_sections(sds_id);
CREATE UNIQUE INDEX uq_sds_sections_sds_section_number ON sds_sections(sds_id, section_number);

CREATE INDEX idx_chemical_products_tenant_id ON chemical_products(tenant_id);
CREATE INDEX idx_chemical_products_sds_id ON chemical_products(sds_id);
CREATE INDEX idx_chemical_products_name ON chemical_products(name);
CREATE INDEX idx_chemical_products_cas_number ON chemical_products(cas_number);
CREATE INDEX idx_chemical_products_ec_number ON chemical_products(ec_number);
CREATE INDEX idx_chemical_products_tenant_name ON chemical_products(tenant_id, name);
CREATE UNIQUE INDEX uq_chemical_products_tenant_cas_number_not_null ON chemical_products(tenant_id, cas_number) WHERE cas_number IS NOT NULL;

CREATE INDEX idx_ghs_properties_product_id ON ghs_properties(product_id);
CREATE UNIQUE INDEX uq_ghs_properties_product_pictogram_code ON ghs_properties(product_id, pictogram_code);

CREATE INDEX idx_substances_tenant_id ON substances(tenant_id);
CREATE INDEX idx_substances_name ON substances(name);
CREATE INDEX idx_substances_cas_number ON substances(cas_number);
CREATE INDEX idx_substances_ec_number ON substances(ec_number);
CREATE INDEX idx_substances_tenant_name ON substances(tenant_id, name);
CREATE UNIQUE INDEX uq_substances_tenant_cas_number_not_null ON substances(tenant_id, cas_number) WHERE cas_number IS NOT NULL;

CREATE INDEX idx_product_substances_product_id ON product_substances(product_id);
CREATE INDEX idx_product_substances_substance_id ON product_substances(substance_id);
CREATE UNIQUE INDEX uq_product_substances_product_substance_id_not_null ON product_substances(product_id, substance_id) WHERE substance_id IS NOT NULL;
CREATE UNIQUE INDEX uq_product_substances_product_substance_name_raw_not_null ON product_substances(product_id, substance_name_raw) WHERE substance_name_raw IS NOT NULL;

CREATE INDEX idx_inventory_items_tenant_id ON inventory_items(tenant_id);
CREATE INDEX idx_inventory_items_product_id ON inventory_items(product_id);
CREATE INDEX idx_inventory_items_location_id ON inventory_items(location_id);
CREATE UNIQUE INDEX uq_inventory_items_barcode ON inventory_items(barcode) WHERE barcode IS NOT NULL;
CREATE UNIQUE INDEX uq_inventory_items_qr_code ON inventory_items(qr_code) WHERE qr_code IS NOT NULL;
CREATE INDEX idx_inventory_items_lot_number ON inventory_items(lot_number);
CREATE INDEX idx_inventory_items_status ON inventory_items(status);
CREATE INDEX idx_inventory_items_expiry_date ON inventory_items(expiry_date);
CREATE INDEX idx_inventory_items_tenant_status ON inventory_items(tenant_id, status);
CREATE INDEX idx_inventory_items_tenant_location ON inventory_items(tenant_id, location_id);
CREATE INDEX idx_inventory_items_tenant_product ON inventory_items(tenant_id, product_id);

CREATE INDEX idx_asset_templates_tenant_id ON asset_templates(tenant_id);
CREATE UNIQUE INDEX uq_asset_templates_tenant_label_type_name ON asset_templates(tenant_id, label_type, name);

CREATE INDEX idx_risk_assessment_templates_tenant_id ON risk_assessment_templates(tenant_id);
CREATE UNIQUE INDEX uq_risk_assessment_templates_tenant_name ON risk_assessment_templates(tenant_id, name);
CREATE INDEX idx_risk_assessment_templates_tenant_is_active ON risk_assessment_templates(tenant_id, is_active);

CREATE INDEX idx_risk_assessments_tenant_id ON risk_assessments(tenant_id);
CREATE INDEX idx_risk_assessments_location_id ON risk_assessments(location_id);
CREATE INDEX idx_risk_assessments_template_id ON risk_assessments(template_id);
CREATE INDEX idx_risk_assessments_created_by ON risk_assessments(created_by);
CREATE INDEX idx_risk_assessments_status ON risk_assessments(status);
CREATE INDEX idx_risk_assessments_tenant_status ON risk_assessments(tenant_id, status);
CREATE INDEX idx_risk_assessments_tenant_created_at ON risk_assessments(tenant_id, created_at);

CREATE INDEX idx_risk_chemicals_assessment_id ON risk_chemicals(assessment_id);
CREATE INDEX idx_risk_chemicals_product_id ON risk_chemicals(product_id);
CREATE UNIQUE INDEX uq_risk_chemicals_assessment_product ON risk_chemicals(assessment_id, product_id);

CREATE INDEX idx_exposure_scenarios_assessment_id ON exposure_scenarios(assessment_id);
CREATE INDEX idx_exposure_scenarios_assessment_type ON exposure_scenarios(assessment_id, scenario_type);

CREATE INDEX idx_control_measures_scenario_id ON control_measures(scenario_id);
CREATE INDEX idx_control_measures_scenario_type ON control_measures(scenario_id, type);

CREATE INDEX idx_risk_ratings_assessment_id ON risk_ratings(assessment_id);
CREATE INDEX idx_risk_ratings_scenario_id ON risk_ratings(scenario_id);
CREATE UNIQUE INDEX uq_risk_ratings_assessment_scenario_type ON risk_ratings(assessment_id, scenario_id, rating_type);

CREATE INDEX idx_approvals_tenant_id ON approvals(tenant_id);
CREATE INDEX idx_approvals_assigned_to ON approvals(assigned_to);
CREATE INDEX idx_approvals_status ON approvals(status);
CREATE INDEX idx_approvals_tenant_entity ON approvals(tenant_id, entity_type, entity_id);
CREATE UNIQUE INDEX uq_approvals_tenant_entity_step_order ON approvals(tenant_id, entity_type, entity_id, step_order);

CREATE INDEX idx_label_print_jobs_tenant_id ON label_print_jobs(tenant_id);
CREATE INDEX idx_label_print_jobs_item_id ON label_print_jobs(item_id);
CREATE INDEX idx_label_print_jobs_template_id ON label_print_jobs(template_id);
CREATE INDEX idx_label_print_jobs_created_by ON label_print_jobs(created_by);
CREATE INDEX idx_label_print_jobs_printed_at ON label_print_jobs(printed_at);

CREATE INDEX idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_tenant_entity ON audit_logs(tenant_id, entity_type, entity_id);

CREATE INDEX idx_notifications_tenant_id ON notifications(tenant_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_user_is_read ON notifications(user_id, is_read);

CREATE INDEX idx_incidents_tenant_id ON incidents(tenant_id);
CREATE INDEX idx_incidents_location_id ON incidents(location_id);
CREATE INDEX idx_incidents_reported_by ON incidents(reported_by);
CREATE INDEX idx_incidents_severity ON incidents(severity);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_occurred_at ON incidents(occurred_at);
CREATE INDEX idx_incidents_tenant_status ON incidents(tenant_id, status);
CREATE INDEX idx_incidents_tenant_occurred_at ON incidents(tenant_id, occurred_at);

CREATE INDEX idx_incident_chemicals_incident_id ON incident_chemicals(incident_id);
CREATE INDEX idx_incident_chemicals_product_id ON incident_chemicals(product_id);
CREATE UNIQUE INDEX uq_incident_chemicals_incident_product ON incident_chemicals(incident_id, product_id);

CREATE INDEX idx_suppliers_tenant_id ON suppliers(tenant_id);
CREATE INDEX idx_suppliers_email ON suppliers(email);
CREATE UNIQUE INDEX uq_suppliers_tenant_name ON suppliers(tenant_id, name);

CREATE INDEX idx_sds_supplier_links_sds_id ON sds_supplier_links(sds_id);
CREATE INDEX idx_sds_supplier_links_supplier_id ON sds_supplier_links(supplier_id);
CREATE UNIQUE INDEX uq_sds_supplier_links_sds_supplier ON sds_supplier_links(sds_id, supplier_id);
