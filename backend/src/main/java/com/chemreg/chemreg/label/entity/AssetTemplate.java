package com.chemreg.chemreg.label.entity;

import com.chemreg.chemreg.common.enums.AssetLabelType;
import com.chemreg.chemreg.common.persistence.entity.BaseAuditableEntity;
import com.chemreg.chemreg.tenant.entity.Tenant;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "asset_templates")
public class AssetTemplate extends BaseAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "label_type", nullable = false, length = 50)
    private AssetLabelType labelType;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "template_json", nullable = false, columnDefinition = "jsonb")
    private JsonNode templateJson;

    @Column(name = "is_active", nullable = false)
    private Boolean active;

    public Tenant getTenant() {
        return tenant;
    }

    public void setTenant(Tenant tenant) {
        this.tenant = tenant;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public AssetLabelType getLabelType() {
        return labelType;
    }

    public void setLabelType(AssetLabelType labelType) {
        this.labelType = labelType;
    }

    public JsonNode getTemplateJson() {
        return templateJson;
    }

    public void setTemplateJson(JsonNode templateJson) {
        this.templateJson = templateJson;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
