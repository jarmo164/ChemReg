package com.chemreg.chemreg.common.security;

public final class AuthorizationRules {

    public static final String MVP_READ_ROLES = "hasAnyRole('ORG_ADMIN','EHS_MANAGER','SITE_MANAGER','USER','AUDITOR','SUPPLIER')";
    public static final String MVP_MANAGE_ROLES = "hasAnyRole('ORG_ADMIN','EHS_MANAGER','SITE_MANAGER')";
    public static final String SDS_AUTHOR_ROLES = "hasAnyRole('ORG_ADMIN','EHS_MANAGER','SITE_MANAGER','USER')";
    public static final String ORG_ADMIN_ONLY = "hasRole('ORG_ADMIN')";

    private AuthorizationRules() {
    }
}
