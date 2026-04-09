package com.chemreg.chemreg.chemical;

import java.util.UUID;

/**
 * Temporary integration constants for the chemical module.
 */
public final class ChemicalIntegrationStubs {

    private ChemicalIntegrationStubs() {
    }

    /**
     * Single-tenant stub until the tenant/auth workstream provides a resolved tenant (e.g. JWT, {@code SecurityContext}).
     * <p>
     * The corresponding {@code tenants} row is created idempotently at runtime by {@link StubTenantProvisioner}
     * before stub-tenant chemical writes. Replace usages with the current tenant from your security layer when that ships.
     */
    public static final UUID STUB_TENANT_ID = UUID.fromString("c0000000-0000-4000-8000-000000000001");
}
