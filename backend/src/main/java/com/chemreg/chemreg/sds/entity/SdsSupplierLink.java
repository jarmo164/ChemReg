package com.chemreg.chemreg.sds.entity;

import com.chemreg.chemreg.common.persistence.entity.BaseUuidEntity;
import com.chemreg.chemreg.supplier.entity.Supplier;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "sds_supplier_links")
public class SdsSupplierLink extends BaseUuidEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sds_id", nullable = false)
    private SdsDocument sdsDocument;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    public SdsDocument getSdsDocument() {
        return sdsDocument;
    }

    public void setSdsDocument(SdsDocument sdsDocument) {
        this.sdsDocument = sdsDocument;
    }

    public Supplier getSupplier() {
        return supplier;
    }

    public void setSupplier(Supplier supplier) {
        this.supplier = supplier;
    }
}
