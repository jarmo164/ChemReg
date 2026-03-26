package com.chemreg.chemreg.tenant.entity;

import com.chemreg.chemreg.common.enums.TenantPlan;
import com.chemreg.chemreg.common.persistence.entity.BaseAuditableEntity;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "tenants")
public class Tenant extends BaseAuditableEntity {

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "plan", nullable = false, length = 50)
    private TenantPlan plan;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "settings_json", nullable = false, columnDefinition = "jsonb")
    private JsonNode settingsJson;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public TenantPlan getPlan() {
        return plan;
    }

    public void setPlan(TenantPlan plan) {
        this.plan = plan;
    }

    public JsonNode getSettingsJson() {
        return settingsJson;
    }

    public void setSettingsJson(JsonNode settingsJson) {
        this.settingsJson = settingsJson;
    }
}
