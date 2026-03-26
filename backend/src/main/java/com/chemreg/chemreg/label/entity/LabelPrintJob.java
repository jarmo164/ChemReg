package com.chemreg.chemreg.label.entity;

import com.chemreg.chemreg.common.persistence.entity.BaseCreatedEntity;
import com.chemreg.chemreg.inventory.entity.InventoryItem;
import com.chemreg.chemreg.tenant.entity.Tenant;
import com.chemreg.chemreg.user.entity.User;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;

@Entity
@Table(name = "label_print_jobs")
public class LabelPrintJob extends BaseCreatedEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "item_id", nullable = false)
    private InventoryItem item;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id")
    private AssetTemplate template;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @jakarta.persistence.Column(name = "printed_at")
    private OffsetDateTime printedAt;

    public Tenant getTenant() {
        return tenant;
    }

    public void setTenant(Tenant tenant) {
        this.tenant = tenant;
    }

    public InventoryItem getItem() {
        return item;
    }

    public void setItem(InventoryItem item) {
        this.item = item;
    }

    public AssetTemplate getTemplate() {
        return template;
    }

    public void setTemplate(AssetTemplate template) {
        this.template = template;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public OffsetDateTime getPrintedAt() {
        return printedAt;
    }

    public void setPrintedAt(OffsetDateTime printedAt) {
        this.printedAt = printedAt;
    }
}
