package com.chemreg.chemreg.common.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;

import java.time.OffsetDateTime;

@MappedSuperclass
public abstract class BaseAuditableEntity extends BaseCreatedEntity {

    @Column(name = "updated_at", nullable = false, insertable = false, updatable = false)
    private OffsetDateTime updatedAt;

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(OffsetDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
