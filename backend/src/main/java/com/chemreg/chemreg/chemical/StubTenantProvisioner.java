package com.chemreg.chemreg.chemical;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Idempotently ensures the dev/stub tenant row exists before chemical product writes that reference
 * {@link ChemicalIntegrationStubs#STUB_TENANT_ID}.
 */
@Component
public class StubTenantProvisioner {

    private static final String STUB_TENANT_NAME = "ChemReg dev stub tenant";

    private final JdbcTemplate jdbcTemplate;

    public StubTenantProvisioner(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void ensureStubTenantExists() {
        jdbcTemplate.update(
                """
                INSERT INTO tenants (id, name, plan, settings_json, created_at, updated_at)
                VALUES (?, ?, ?, ?::jsonb, now(), now())
                ON CONFLICT (id) DO NOTHING
                """,
                ChemicalIntegrationStubs.STUB_TENANT_ID,
                STUB_TENANT_NAME,
                "mvp",
                "{}");
    }
}
